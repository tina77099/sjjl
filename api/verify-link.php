<?php
/**
 * 验证链接接口
 * 处理邮件中的验证链接点击
 */

// 定义API访问标识
define('API_ACCESS', true);

// 引入配置文件
require_once 'config.php';

// 设置响应头
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只允许GET请求
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => '仅支持GET请求']);
    exit;
}

try {
    // 获取GET参数
    $token = $_GET['token'] ?? '';
    $email = $_GET['email'] ?? '';
    $type = $_GET['type'] ?? 'register';
    
    if (empty($token)) {
        throw new Exception('缺少验证令牌');
    }
    
    if (empty($email)) {
        throw new Exception('缺少邮箱地址');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('邮箱地址格式不正确');
    }
    
    if (!in_array($type, ['register', 'reset'])) {
        throw new Exception('无效的验证类型');
    }
    
    // 读取验证数据
    $verificationFile = __DIR__ . '/verifications.json';
    if (!file_exists($verificationFile)) {
        throw new Exception('验证记录不存在');
    }
    
    $verifications = json_decode(file_get_contents($verificationFile), true);
    if (!$verifications) {
        throw new Exception('验证记录读取失败');
    }
    
    $key = $email . '_' . $type;
    if (!isset($verifications[$key])) {
        throw new Exception('验证记录不存在或已过期');
    }
    
    $verification = $verifications[$key];
    $now = time();
    
    // 检查令牌是否匹配
    if ($verification['token'] !== $token) {
        logEmail("验证失败: 令牌不匹配 - $email ($type)", 'ERROR');
        throw new Exception('验证令牌无效');
    }
    
    // 检查是否已使用
    if ($verification['used']) {
        throw new Exception('验证链接已使用，请重新获取');
    }
    
    // 检查是否过期
    if ($now > $verification['expires_at']) {
        // 清理过期记录
        unset($verifications[$key]);
        file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
        throw new Exception('验证链接已过期，请重新获取');
    }
    
    // 标记为已使用
    $verifications[$key]['used'] = true;
    $verifications[$key]['used_at'] = $now;
    file_put_contents($verificationFile, json_encode($verifications, JSON_PRETTY_PRINT), LOCK_EX);
    
    // 根据验证类型执行相应操作
    if ($type === 'register') {
        // 完成注册
        $result = completeRegistration($email);
        if ($result['success']) {
            logEmail("注册验证成功: $email");
            echo json_encode([
                'success' => true,
                'message' => '邮箱验证成功，账户已创建',
                'data' => [
                    'email' => $email,
                    'type' => $type,
                    'user' => $result['user'],
                    'token' => $result['token'],
                    'verified_at' => date('Y-m-d H:i:s', $now)
                ]
            ]);
        } else {
            throw new Exception($result['message']);
        }
    } else if ($type === 'reset') {
        // 密码重置验证
        logEmail("密码重置验证成功: $email");
        echo json_encode([
            'success' => true,
            'message' => '邮箱验证成功，可以重置密码',
            'data' => [
                'email' => $email,
                'type' => $type,
                'reset_token' => $token,
                'verified_at' => date('Y-m-d H:i:s', $now)
            ]
        ]);
    }
    
} catch (Exception $e) {
    logEmail("链接验证失败: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * 完成用户注册
 */
function completeRegistration($email) {
    try {
        // 用户数据文件位置
        $usersFile = __DIR__ . '/../data/users.json';
        
        // 确保目录存在
        $dataDir = dirname($usersFile);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        // 读取现有用户数据
        $userData = [];
        if (file_exists($usersFile)) {
            $content = file_get_contents($usersFile);
            $userData = json_decode($content, true) ?: [];
        }
        
        // 确保users数组存在
        if (!isset($userData['users'])) {
            $userData['users'] = [];
        }
        
        // 查找是否已存在用户
        foreach ($userData['users'] as $user) {
            if ($user['email'] === $email) {
                return ['success' => false, 'message' => '该邮箱已注册'];
            }
        }
        
        // 从临时注册数据中获取用户信息
        $tempDataFile = __DIR__ . '/temp_registrations.json';
        $tempData = [];
        if (file_exists($tempDataFile)) {
            $tempData = json_decode(file_get_contents($tempDataFile), true) ?: [];
        }
        
        // 查找临时注册数据
        $registerData = null;
        foreach ($tempData as $data) {
            if ($data['email'] === $email) {
                $registerData = $data;
                break;
            }
        }
        
        // 如果没有找到临时数据，使用默认值
        if (!$registerData) {
            $registerData = [
                'phone' => '',
                'email' => $email,
                'password' => 'defaultpass123' // 临时密码，用户需要重置
            ];
        }
        
        // 创建新用户
        $userId = 'user_' . time() . '_' . substr(md5($email), 0, 8);
        $now = date('Y-m-d H:i:s');
        
        // 使用与前端一致的密码哈希方法
        $passwordHash = base64_encode($registerData['password'] . 'salt_key_2024');
        
        $newUser = [
            'user_id' => $userId,
            'email' => $email,
            'phone' => $registerData['phone'],
            'password_hash' => $passwordHash,
            'is_verified' => true,
            'created_at' => $now,
            'last_login' => null
        ];
        
        $userData['users'][] = $newUser;
        
        // 保存用户数据
        $result = file_put_contents($usersFile, json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        if ($result === false) {
            throw new Exception('保存用户数据失败');
        }
        
        // 生成登录令牌
        $loginToken = 'jwt_' . time() . '_' . bin2hex(random_bytes(16));
        
        // 清理临时注册数据
        if ($registerData && file_exists($tempDataFile)) {
            $filteredTempData = array_filter($tempData, function($data) use ($email) {
                return $data['email'] !== $email;
            });
            file_put_contents($tempDataFile, json_encode(array_values($filteredTempData), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        
        return [
            'success' => true,
            'user' => [
                'user_id' => $userId,
                'email' => $email,
                'phone' => $registerData['phone'],
                'is_verified' => true,
                'created_at' => $now
            ],
            'token' => $loginToken
        ];
        
    } catch (Exception $e) {
        return ['success' => false, 'message' => '注册完成失败: ' . $e->getMessage()];
    }
}
?> 