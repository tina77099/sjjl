<?php
/**
 * 验证码发送接口
 * 使用PHPMailer通过SMTP发送邮件验证码
 */

// 定义API访问标识
define('API_ACCESS', true);

// 引入配置文件
require_once 'config.php';

// 引入PHPMailer自动加载
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// 引入PHPMailer类
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只允许POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => '仅支持POST请求']);
    exit;
}

try {
    // 检查PHPMailer是否已安装
    if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        throw new Exception('PHPMailer未安装。请运行: composer install');
    }
    
    // 获取POST数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('无效的JSON数据');
    }
    
    // 验证必需参数
    $email = $input['email'] ?? '';
    $type = $input['type'] ?? 'register';
    
    // 如果是注册类型，还需要保存用户注册数据
    $phone = $input['phone'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email)) {
        throw new Exception('邮箱地址不能为空');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('邮箱地址格式不正确');
    }
    
    if (!in_array($type, ['register', 'reset'])) {
        throw new Exception('无效的验证类型');
    }
    
    // 如果是注册类型，验证必需的注册数据
    if ($type === 'register') {
        if (empty($password)) {
            throw new Exception('密码不能为空');
        }
        if (strlen($password) < 6) {
            throw new Exception('密码长度不能少于6位');
        }
    }
    
    // 检查配置
    $configValidation = MailConfig::validateConfig();
    if (!$configValidation['valid']) {
        throw new Exception('邮件配置错误: ' . implode(', ', $configValidation['errors']));
    }
    
    // 检查发送频率限制
    if (!checkRateLimit($email)) {
        throw new Exception('发送过于频繁，请稍后再试');
    }
    
    // 检查重发间隔
    $lastSendFile = __DIR__ . '/last_send.json';
    $lastSendData = [];
    if (file_exists($lastSendFile)) {
        $lastSendData = json_decode(file_get_contents($lastSendFile), true) ?: [];
    }
    
    $config = MailConfig::getDefaultConfig();
    $resendInterval = $config['resend_interval'];
    $now = time();
    
    if (isset($lastSendData[$email]) && ($now - $lastSendData[$email]) < $resendInterval) {
        $remainingTime = $resendInterval - ($now - $lastSendData[$email]);
        throw new Exception("请等待 {$remainingTime} 秒后再重新发送");
    }
    
    // 生成32位验证令牌替代6位验证码
    $verificationToken = bin2hex(random_bytes(16)); // 生成32位随机令牌
    
    // 获取SMTP配置
    $smtpConfig = MailConfig::getSmtpConfig();
    
    // 创建PHPMailer实例
    $mail = new PHPMailer(true);
    
    try {
        // 服务器设置
        if ($config['enable_debug']) {
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        }
        
        $mail->isSMTP();
        $mail->Host = $smtpConfig['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $smtpConfig['username'];
        $mail->Password = $smtpConfig['password'];
        $mail->SMTPSecure = $smtpConfig['encryption'];
        $mail->Port = $smtpConfig['port'];
        $mail->CharSet = 'UTF-8';
        
        // 发送方
        $mail->setFrom($smtpConfig['username'], $smtpConfig['from_name']);
        
        // 接收方
        $mail->addAddress($email);
        
        // 构建验证链接
        $baseUrl = 'https://www.motiday.net'; // 使用实际域名地址
        $verifyUrl = $baseUrl . '/auth/verify-link.html?token=' . $verificationToken . '&email=' . urlencode($email) . '&type=' . $type;
        
        // 邮件内容
        $templateData = [
            'token' => $verificationToken,
            'verify_url' => $verifyUrl,
            'email' => $email,
            'type' => $type
        ];
        
        $template = MailConfig::getEmailTemplate('verification_link', $templateData);
        
        $mail->isHTML(true);
        $mail->Subject = $template['subject'];
        $mail->Body = $template['body'];
        
        // 发送邮件
        $mail->send();
        
        // 保存验证令牌到文件（实际项目中应该使用数据库）
        $verificationData = [
            'email' => $email,
            'token' => $verificationToken,
            'type' => $type,
            'created_at' => $now,
            'expires_at' => $now + $config['verification_validity'],
            'used' => false, // 标记令牌是否已使用
            'verify_url' => $verifyUrl
        ];
        
        $verificationFile = __DIR__ . '/verifications.json';
        $verifications = [];
        if (file_exists($verificationFile)) {
            $verifications = json_decode(file_get_contents($verificationFile), true) ?: [];
        }
        
        // 清理过期的验证令牌
        $verifications = array_filter($verifications, function($item) use ($now) {
            return $item['expires_at'] > $now;
        });
        
        // 保存新的验证令牌
        $key = $email . '_' . $type;
        $verifications[$key] = $verificationData;
        
        file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
        
        // 如果是注册类型，保存临时注册数据
        if ($type === 'register') {
            $tempDataFile = __DIR__ . '/temp_registrations.json';
            $tempData = [];
            if (file_exists($tempDataFile)) {
                $tempData = json_decode(file_get_contents($tempDataFile), true) ?: [];
            }
            
            // 清理已存在的同邮箱数据
            $tempData = array_filter($tempData, function($data) use ($email) {
                return $data['email'] !== $email;
            });
            
            // 添加新的注册数据
            $tempData[] = [
                'email' => $email,
                'phone' => $phone,
                'password' => $password,
                'created_at' => date('Y-m-d H:i:s', $now),
                'token' => $verificationToken
            ];
            
            file_put_contents($tempDataFile, json_encode($tempData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        
        // 记录发送时间
        $lastSendData[$email] = $now;
        file_put_contents($lastSendFile, json_encode($lastSendData), LOCK_EX);
        
        // 记录日志
        logEmail("验证链接发送成功: $email ($type), 使用服务商: {$smtpConfig['provider_name']}");
        
        // 返回成功响应
        echo json_encode([
            'success' => true,
            'message' => '验证邮件发送成功，请查收邮件并点击验证链接',
            'data' => [
                'email' => $email,
                'type' => $type,
                'expires_in' => $config['verification_validity'],
                'provider' => $smtpConfig['provider_name'],
                'verification_method' => 'link' // 标识使用链接验证
            ]
        ]);
        
    } catch (PHPMailerException $e) {
        logEmail("PHPMailer错误: " . $e->getMessage(), 'ERROR');
        throw new Exception('邮件发送失败: ' . $e->getMessage());
    }
    
} catch (Exception $e) {
    logEmail("发送验证码失败: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} catch (Error $e) {
    logEmail("系统错误: " . $e->getMessage(), 'FATAL');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => '系统内部错误，请稍后重试'
    ]);
}
?> 