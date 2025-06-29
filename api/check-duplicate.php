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

$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';

// 验证输入
if (empty($email) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => '邮箱和手机号不能为空']);
    exit;
}

// 读取用户数据
$users_file = '../data/users.json';
if (!file_exists($users_file)) {
    // 如果用户文件不存在，说明还没有用户注册，不存在重复
    echo json_encode([
        'success' => true,
        'canRegister' => true,
        'email_exists' => false,
        'phone_exists' => false,
        'message' => '可以注册'
    ]);
    exit;
}

$users_data = json_decode(file_get_contents($users_file), true);
if (!$users_data || !isset($users_data['users'])) {
    echo json_encode([
        'success' => true,
        'canRegister' => true,
        'email_exists' => false,
        'phone_exists' => false,
        'message' => '可以注册'
    ]);
    exit;
}

$users = $users_data['users'];

// 检查邮箱和手机号是否已存在
$email_exists = false;
$phone_exists = false;
$existing_email_user = null;
$existing_phone_user = null;

foreach ($users as $user) {
    if ($user['email'] === $email) {
        $email_exists = true;
        $existing_email_user = $user;
    }
    if ($user['phone'] === $phone) {
        $phone_exists = true;
        $existing_phone_user = $user;
    }
}

// 构建响应
$response = [
    'success' => true,
    'email_exists' => $email_exists,
    'phone_exists' => $phone_exists,
    'canRegister' => !($email_exists || $phone_exists)  // 🆕 关键字段：如果有任何重复则不能注册
];

if ($email_exists && $phone_exists) {
    // 检查是否是同一个用户
    if ($existing_email_user['user_id'] === $existing_phone_user['user_id']) {
        $response['message'] = '该邮箱和手机号已被同一账户注册，请直接登录';
        $response['same_user'] = true;
    } else {
        $response['message'] = '该邮箱和手机号已被不同账户注册，请使用其他邮箱和手机号';
        $response['same_user'] = false;
    }
} else if ($email_exists) {
    $response['message'] = '该邮箱已被注册，请直接登录或使用其他邮箱';
    $response['existing_email'] = $existing_email_user['email'];
} else if ($phone_exists) {
    $response['message'] = '该手机号已被注册，请使用已注册的邮箱登录或使用其他手机号';
    $response['existing_phone'] = $existing_phone_user['phone'];
    $response['existing_email'] = $existing_phone_user['email'];
} else {
    $response['message'] = '可以注册';
}

echo json_encode($response);
?>
