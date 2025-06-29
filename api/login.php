<?php
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
    echo json_encode(['success' => false, 'error' => '只允许POST请求']);
    exit;
}

// 获取请求数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '无效的JSON数据']);
    exit;
}

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// 验证输入
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '用户名和密码不能为空']);
    exit;
}

// 读取用户数据
$users_file = '../data/users.json';
if (!file_exists($users_file)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '用户数据文件不存在']);
    exit;
}

$users_data = json_decode(file_get_contents($users_file), true);
if (!$users_data || !isset($users_data['users'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => '用户数据格式错误']);
    exit;
}

$users = $users_data['users'];

// 查找用户
$user = null;
foreach ($users as $u) {
    if (($u['email'] === $username || $u['phone'] === $username)) {
        $user = $u;
        break;
    }
}

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => '用户名或密码错误']);
    exit;
}

// 验证密码（使用简单的base64编码验证，与前端保持一致）
$input_password_hash = base64_encode($password . 'salt_key_2024');
if ($user['password_hash'] !== $input_password_hash) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => '用户名或密码错误']);
    exit;
}

// 检查用户是否已验证
if (!$user['is_verified']) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'error' => '账户未验证，请先完成邮箱验证',
        'need_verification' => true,
        'email' => $user['email']
    ]);
    exit;
}

// 生成简单的token
$token = 'jwt_' . time() . '_' . bin2hex(random_bytes(16));

// 记录登录时间
$user['last_login'] = date('Y-m-d H:i:s');

// 更新用户数据
foreach ($users_data['users'] as $key => $u) {
    if ($u['user_id'] === $user['user_id']) {
        $users_data['users'][$key] = $user;
        break;
    }
}

file_put_contents($users_file, json_encode($users_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// 返回成功结果
echo json_encode([
    'success' => true,
    'user' => [
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'is_verified' => $user['is_verified'],
        'created_at' => $user['created_at'],
        'last_login' => $user['last_login']
    ],
    'token' => $token
]);
?> 