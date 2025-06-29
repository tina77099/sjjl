<?php
/**
 * 邮件发送配置文件
 * 支持多种SMTP服务商和安全配置
 */

// 防止直接访问
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Access denied');
}

// 邮件配置
class MailConfig {
    // SMTP服务商配置
    public static $smtpProviders = [
        'gmail' => [
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'encryption' => 'tls',
            'name' => 'Gmail'
        ],
        'qq' => [
            'host' => 'smtp.qq.com',
            'port' => 587,
            'encryption' => 'tls',
            'name' => 'QQ邮箱'
        ],
        '163' => [
            'host' => 'smtp.163.com',
            'port' => 25,
            'encryption' => 'tls',
            'name' => '163邮箱'
        ],
        'outlook' => [
            'host' => 'smtp-mail.outlook.com',
            'port' => 587,
            'encryption' => 'tls',
            'name' => 'Outlook'
        ]
    ];
    
    // 获取默认配置
    public static function getDefaultConfig() {
        return [
            // SMTP服务商选择 (gmail, qq, 163, outlook)
            'smtp_provider' => 'qq',
            
            // SMTP服务器配置
            'smtp_username' => '6667268@qq.com',        // 发送方邮箱
            'smtp_password' => 'qunppkdytkhwcbbe',      // 应用专用密码或授权码
            'from_name' => '事件记录系统',               // 发送方名称
            
            // 验证码配置
            'verification_validity' => 300,            // 验证码有效期（秒）
            'max_attempts' => 5,                       // 最大尝试次数
            'resend_interval' => 60,                   // 重发间隔（秒）
            
            // 邮件模板配置
            'subject_prefix' => '[事件记录系统] ',      // 邮件主题前缀
            
            // 安全配置
            'enable_debug' => false,       // 是否开启调试模式
            'log_emails' => true,          // 是否记录邮件发送日志
            'rate_limit' => 10,            // 每小时最大发送数量
        ];
    }
    
    // 获取SMTP配置
    public static function getSmtpConfig($provider = null) {
        $config = self::getDefaultConfig();
        $provider = $provider ?: $config['smtp_provider'];
        
        if (!isset(self::$smtpProviders[$provider])) {
            throw new Exception("不支持的SMTP服务商: $provider");
        }
        
        $smtpConfig = self::$smtpProviders[$provider];
        
        return [
            'host' => $smtpConfig['host'],
            'port' => $smtpConfig['port'],
            'encryption' => $smtpConfig['encryption'],
            'username' => $config['smtp_username'],
            'password' => $config['smtp_password'],
            'from_name' => $config['from_name'],
            'provider_name' => $smtpConfig['name']
        ];
    }
    
    // 验证邮箱配置
    public static function validateConfig() {
        $config = self::getDefaultConfig();
        $errors = [];
        
        if (empty($config['smtp_username']) || $config['smtp_username'] === 'your-email@gmail.com') {
            $errors[] = '请设置SMTP用户名（发送方邮箱）';
        }
        
        if (empty($config['smtp_password']) || $config['smtp_password'] === 'your-app-password') {
            $errors[] = '请设置SMTP密码（应用专用密码）';
        }
        
        if (!filter_var($config['smtp_username'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'SMTP用户名必须是有效的邮箱地址';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * 获取邮件模板
     * @param string $type 模板类型 (verification, verification_link, reset_password)
     * @param array $data 模板数据
     * @return array
     */
    public static function getEmailTemplate($type, $data = []) {
        $templates = [
            'verification' => [
                'subject' => '【事件记录】邮箱验证码',
                'body' => self::getVerificationTemplate($data)
            ],
            'verification_link' => [
                'subject' => '【事件记录】邮箱验证',
                'body' => self::getVerificationLinkTemplate($data)
            ],
            'reset_password' => [
                'subject' => '【事件记录】密码重置',
                'body' => self::getResetPasswordTemplate($data)
            ]
        ];
        
        return $templates[$type] ?? $templates['verification'];
    }
    
    /**
     * 验证码邮件模板
     */
    private static function getVerificationTemplate($data) {
        $code = $data['code'] ?? '';
        $email = $data['email'] ?? '';
        $type = $data['type'] ?? 'register';
        $typeText = $type === 'register' ? '注册' : '密码重置';
        
        return "
        <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;'>
                <h1 style='margin: 0; font-size: 28px; font-weight: 300;'>事件记录</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Event Recording System</p>
            </div>
            
            <div style='background: #ffffff; padding: 40px; border-left: 4px solid #667eea;'>
                <h2 style='color: #667eea; margin-top: 0;'>邮箱验证</h2>
                <p>您好！</p>
                <p>感谢您使用事件记录系统。您正在进行<strong>{$typeText}</strong>操作，请使用以下验证码完成验证：</p>
                
                <div style='background: #f8f9ff; border: 2px dashed #667eea; padding: 20px; margin: 25px 0; text-align: center; border-radius: 8px;'>
                    <div style='font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: Monaco, Consolas, monospace;'>{$code}</div>
                    <p style='margin: 10px 0 0 0; color: #666; font-size: 14px;'>验证码有效期为5分钟</p>
                </div>
                
                <p style='color: #666; font-size: 14px; margin-top: 30px;'>
                    <strong>安全提示：</strong><br>
                    • 请勿将验证码告诉他人<br>
                    • 如果您没有进行此操作，请忽略此邮件<br>
                    • 验证码仅可使用一次，过期后需重新获取
                </p>
            </div>
            
            <div style='background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;'>
                <p>此邮件由系统自动发送，请勿回复。</p>
                <p>© 2024 事件记录系统 - 让记录更简单</p>
            </div>
        </div>";
    }
    
    /**
     * 验证链接邮件模板
     */
    private static function getVerificationLinkTemplate($data) {
        $token = $data['token'] ?? '';
        $verifyUrl = $data['verify_url'] ?? '';
        $email = $data['email'] ?? '';
        $type = $data['type'] ?? 'register';
        $typeText = $type === 'register' ? '注册' : '密码重置';
        
        return "
        <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;'>
                <h1 style='margin: 0; font-size: 28px; font-weight: 300;'>事件记录</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Event Recording System</p>
            </div>
            
            <div style='background: #ffffff; padding: 40px; border-left: 4px solid #667eea;'>
                <h2 style='color: #667eea; margin-top: 0;'>邮箱验证</h2>
                <p>您好！</p>
                <p>感谢您使用事件记录系统。您正在进行<strong>{$typeText}</strong>操作，请点击下方按钮完成邮箱验证：</p>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$verifyUrl}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;'>
                        ✓ 验证邮箱地址
                    </a>
                </div>
                
                <p style='color: #666; font-size: 14px; text-align: center; margin: 20px 0;'>
                    点击按钮后将自动完成验证并登录系统
                </p>
                
                <div style='background: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;'>
                    <p style='margin: 0; color: #666; font-size: 14px;'>
                        <strong>如果按钮无法点击，请复制以下链接到浏览器地址栏：</strong><br>
                        <span style='word-break: break-all; color: #667eea; font-family: Monaco, Consolas, monospace; font-size: 12px;'>{$verifyUrl}</span>
                    </p>
                </div>
                
                <p style='color: #666; font-size: 14px; margin-top: 30px;'>
                    <strong>安全提示：</strong><br>
                    • 验证链接有效期为5分钟<br>
                    • 链接仅可使用一次，验证后自动失效<br>
                    • 如果您没有进行此操作，请忽略此邮件<br>
                    • 请勿将此链接分享给他人
                </p>
            </div>
            
            <div style='background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;'>
                <p>此邮件由系统自动发送，请勿回复。</p>
                <p>© 2024 事件记录系统 - 让记录更简单</p>
            </div>
        </div>";
    }
    
    /**
     * 密码重置邮件模板
     */
    private static function getResetPasswordTemplate($data) {
        $token = $data['token'] ?? '';
        $email = $data['email'] ?? '';
        $resetUrl = $data['reset_url'] ?? '';
        
        return "
        <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;'>
                <h1 style='margin: 0; font-size: 28px; font-weight: 300;'>事件记录</h1>
                <p style='margin: 10px 0 0 0; opacity: 0.9;'>Event Recording System</p>
            </div>
            
            <div style='background: #ffffff; padding: 40px; border-left: 4px solid #667eea;'>
                <h2 style='color: #667eea; margin-top: 0;'>密码重置</h2>
                <p>您好！</p>
                <p>您正在进行密码重置操作，请点击下方按钮完成密码重置：</p>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$resetUrl}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;'>
                        重置密码
                    </a>
                </div>
                
                <p style='color: #666; font-size: 14px; text-align: center; margin: 20px 0;'>
                    点击按钮后将跳转到密码重置页面
                </p>
                
                <div style='background: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;'>
                    <p style='margin: 0; color: #666; font-size: 14px;'>
                        <strong>如果按钮无法点击，请复制以下链接到浏览器地址栏：</strong><br>
                        <span style='word-break: break-all; color: #667eea; font-family: Monaco, Consolas, monospace; font-size: 12px;'>{$resetUrl}</span>
                    </p>
                </div>
                
                <p style='color: #666; font-size: 14px; margin-top: 30px;'>
                    <strong>安全提示：</strong><br>
                    • 重置链接有效期为5分钟<br>
                    • 链接仅可使用一次，重置后自动失效<br>
                    • 如果您没有进行此操作，请忽略此邮件<br>
                    • 请勿将此链接分享给他人
                </p>
            </div>
            
            <div style='background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;'>
                <p>此邮件由系统自动发送，请勿回复。</p>
                <p>© 2024 事件记录系统 - 让记录更简单</p>
            </div>
        </div>";
    }
}

/**
 * 记录日志
 */
if (!function_exists('logEmail')) {
    function logEmail($message, $level = 'INFO') {
        if (!defined('API_ACCESS')) return;
        
        $logFile = __DIR__ . '/email.log';
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] [$level] $message" . PHP_EOL;
        
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
}

// 速率限制检查
function checkRateLimit($email) {
    $rateLimitFile = __DIR__ . '/rate_limit.json';
    $config = MailConfig::getDefaultConfig();
    $maxEmails = $config['rate_limit'];
    $timeWindow = 3600; // 1小时
    
    // 读取现有记录
    $rateLimits = [];
    if (file_exists($rateLimitFile)) {
        $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }
    
    // 清理过期记录
    $now = time();
    foreach ($rateLimits as $emailAddr => $records) {
        $rateLimits[$emailAddr] = array_filter($records, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        if (empty($rateLimits[$emailAddr])) {
            unset($rateLimits[$emailAddr]);
        }
    }
    
    // 检查当前邮箱的发送次数
    $emailRecords = $rateLimits[$email] ?? [];
    if (count($emailRecords) >= $maxEmails) {
        return false;
    }
    
    // 记录本次发送
    $rateLimits[$email][] = $now;
    file_put_contents($rateLimitFile, json_encode($rateLimits), LOCK_EX);
    
    return true;
}
?> 