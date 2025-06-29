<?php
/**
 * 验证码验证接口
 * 验证用户输入的验证码是否正确
 */

// 定义API访问标识
define('API_ACCESS', true);

// 引入配置文件
require_once 'config.php';

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
    // 获取POST数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('无效的JSON数据');
    }
    
    // 验证必需参数
    $email = $input['email'] ?? '';
    $code = $input['code'] ?? '';
    $type = $input['type'] ?? 'register';
    
    if (empty($email)) {
        throw new Exception('邮箱地址不能为空');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('邮箱地址格式不正确');
    }
    
    if (empty($code)) {
        throw new Exception('验证码不能为空');
    }
    
    if (!preg_match('/^\d{6}$/', $code)) {
        throw new Exception('验证码必须是6位数字');
    }
    
    if (!in_array($type, ['register', 'reset'])) {
        throw new Exception('无效的验证类型');
    }
    
    // 读取验证码数据
    $verificationFile = __DIR__ . '/verifications.json';
    
    if (!file_exists($verificationFile)) {
        throw new Exception('验证码不存在或已过期');
    }
    
    $verifications = json_decode(file_get_contents($verificationFile), true);
    if (!$verifications) {
        throw new Exception('验证码数据读取失败');
    }
    
    $key = $email . '_' . $type;
    
    if (!isset($verifications[$key])) {
        throw new Exception('验证码不存在或已过期');
    }
    
    $verificationData = $verifications[$key];
    $now = time();
    
    // 检查验证码是否过期
    if ($now > $verificationData['expires_at']) {
        // 删除过期的验证码
        unset($verifications[$key]);
        file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
        
        logEmail("验证码已过期: $email ($type)", 'WARNING');
        throw new Exception('验证码已过期，请重新获取');
    }
    
    // 检查尝试次数
    if ($verificationData['attempts'] >= $verificationData['max_attempts']) {
        // 删除超过尝试次数的验证码
        unset($verifications[$key]);
        file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
        
        logEmail("验证码尝试次数超限: $email ($type)", 'WARNING');
        throw new Exception('验证码尝试次数过多，请重新获取');
    }
    
    // 验证验证码
    if ($code !== $verificationData['code']) {
        // 增加尝试次数
        $verifications[$key]['attempts']++;
        file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
        
        $remainingAttempts = $verificationData['max_attempts'] - $verifications[$key]['attempts'];
        
        logEmail("验证码错误: $email ($type), 剩余尝试次数: $remainingAttempts", 'WARNING');
        
        if ($remainingAttempts <= 0) {
            throw new Exception('验证码错误次数过多，请重新获取');
        } else {
            throw new Exception("验证码错误，还可尝试 $remainingAttempts 次");
        }
    }
    
    // 验证成功，删除验证码记录
    unset($verifications[$key]);
    file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
    
    // 记录成功日志
    logEmail("验证码验证成功: $email ($type)");
    
    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '验证码验证成功',
        'data' => [
            'email' => $email,
            'type' => $type,
            'verified_at' => $now
        ]
    ]);
    
} catch (Exception $e) {
    logEmail("验证码验证失败: " . $e->getMessage(), 'ERROR');
    
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