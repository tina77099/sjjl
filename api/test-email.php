<?php
/**
 * 邮件系统测试脚本
 * 用于验证PHPMailer安装和SMTP配置
 */

// 定义API访问标识
define('API_ACCESS', true);

echo "🔍 开始测试邮件系统...\n\n";

// 引入配置文件
require_once 'config.php';

// 引入PHPMailer类
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

// 1. 测试PHPMailer是否已安装
echo "1. 检查PHPMailer安装状态...\n";
try {
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        echo "   ✅ Composer autoload 文件存在\n";
    } else {
        throw new Exception('Composer autoload 文件不存在');
    }
    
    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        echo "   ✅ PHPMailer 类加载成功\n";
    } else {
        throw new Exception('PHPMailer 类未找到');
    }
} catch (Exception $e) {
    echo "   ❌ PHPMailer 安装检查失败: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. 测试配置验证
echo "\n2. 验证邮件配置...\n";
$validation = MailConfig::validateConfig();
if ($validation['valid']) {
    echo "   ✅ 邮件配置验证通过\n";
} else {
    echo "   ❌ 配置错误:\n";
    foreach ($validation['errors'] as $error) {
        echo "      - $error\n";
    }
    echo "\n   📝 请编辑 api/config.php 文件，设置正确的邮箱配置:\n";
    echo "      'smtp_username' => 'your-email@gmail.com',\n";
    echo "      'smtp_password' => 'your-app-password',\n";
    exit(1);
}

// 3. 测试SMTP配置获取
echo "\n3. 获取SMTP配置...\n";
try {
    $smtpConfig = MailConfig::getSmtpConfig();
    echo "   ✅ SMTP配置获取成功\n";
    echo "   📧 服务商: {$smtpConfig['provider_name']}\n";
    echo "   🌐 主机: {$smtpConfig['host']}:{$smtpConfig['port']}\n";
    echo "   🔐 用户: {$smtpConfig['username']}\n";
    echo "   🔒 加密: {$smtpConfig['encryption']}\n";
} catch (Exception $e) {
    echo "   ❌ SMTP配置错误: " . $e->getMessage() . "\n";
    exit(1);
}

// 4. 测试邮件模板生成
echo "\n4. 测试邮件模板...\n";
try {
    $templateData = [
        'code' => '123456',
        'email' => 'test@example.com',
        'type' => 'register'
    ];
    $template = MailConfig::getEmailTemplate('verification', $templateData);
    echo "   ✅ 邮件模板生成成功\n";
    echo "   📧 主题: {$template['subject']}\n";
    echo "   📄 内容长度: " . strlen($template['body']) . " 字符\n";
} catch (Exception $e) {
    echo "   ❌ 邮件模板生成失败: " . $e->getMessage() . "\n";
    exit(1);
}

// 5. 测试文件权限
echo "\n5. 检查文件权限...\n";
$requiredFiles = [
    'verifications.json',
    'rate_limit.json',
    'email.log',
    'last_send.json'
];

foreach ($requiredFiles as $file) {
    $filePath = __DIR__ . '/' . $file;
    if (file_exists($filePath)) {
        if (is_writable($filePath)) {
            echo "   ✅ $file 可写\n";
        } else {
            echo "   ⚠️  $file 不可写，请设置权限: chmod 666 api/$file\n";
        }
    } else {
        // 尝试创建文件
        if (file_put_contents($filePath, '{}') !== false) {
            echo "   ✅ $file 创建成功\n";
        } else {
            echo "   ❌ $file 创建失败，请检查目录权限\n";
        }
    }
}

// 6. 测试SMTP连接（可选）
echo "\n6. 测试SMTP连接...\n";
if (isset($argv[1]) && $argv[1] === '--test-smtp') {
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $smtpConfig['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $smtpConfig['username'];
        $mail->Password = $smtpConfig['password'];
        $mail->SMTPSecure = $smtpConfig['encryption'];
        $mail->Port = $smtpConfig['port'];
        
        // 只测试连接，不发送邮件
        $mail->SMTPDebug = 0;
        $mail->Timeout = 10;
        
        // 模拟发送测试
        $mail->setFrom($smtpConfig['username'], $smtpConfig['from_name']);
        $mail->addAddress($smtpConfig['username']); // 发送给自己
        $mail->Subject = 'SMTP 连接测试';
        $mail->Body = '这是一个SMTP连接测试邮件';
        
        if ($mail->send()) {
            echo "   ✅ SMTP连接测试成功，邮件已发送\n";
        } else {
            echo "   ❌ SMTP连接测试失败\n";
        }
        
    } catch (PHPMailerException $e) {
        echo "   ⚠️  SMTP连接测试失败: " . $e->getMessage() . "\n";
        echo "   💡 这可能是正常的，请检查邮箱设置和网络连接\n";
    } catch (Exception $e) {
        echo "   ⚠️  SMTP连接测试失败: " . $e->getMessage() . "\n";
        echo "   💡 这可能是正常的，请检查邮箱设置和网络连接\n";
    }
} else {
    echo "   ℹ️  跳过SMTP连接测试（使用 --test-smtp 参数启用）\n";
}

echo "\n🎉 邮件系统测试完成！\n";
echo "\n📝 下一步操作:\n";
echo "   1. 如果配置有误，请编辑 api/config.php 文件\n";
echo "   2. 设置您的邮箱和应用专用密码\n";
echo "   3. 运行 php api/test-email.php --test-smtp 测试实际发送\n";
echo "   4. 在浏览器中测试注册功能\n";
echo "\n📚 详细说明请查看 PHPMailer集成指南.md\n";
?> 