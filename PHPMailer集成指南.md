# PHPMailer 邮件发送系统集成指南

## 📋 概述

本指南将帮助您在事件记录系统中集成PHPMailer，实现真实的邮件验证码发送功能。系统支持Gmail、QQ邮箱、163邮箱等主流SMTP服务商。

## 🏗️ 系统架构

```
前端 (JavaScript)  ←→  PHP后端API  ←→  SMTP服务器  ←→  用户邮箱
     ↓                    ↓              ↓
  用户界面           验证码生成        邮件发送
  邮箱跳转           数据存储          HTML模板
```

## 📦 安装步骤

### 1. 安装 Composer 和 PHPMailer

在项目根目录运行以下命令：

```bash
# 如果还没有安装 Composer，请先安装
# macOS: brew install composer
# Windows: 下载并安装 https://getcomposer.org/

# 安装 PHPMailer
composer install
```

### 2. 配置 SMTP 邮箱设置

编辑 `api/config.php` 文件中的邮箱配置：

```php
// 在 getDefaultConfig() 方法中修改以下配置
'smtp_provider' => 'gmail',              // 选择服务商: gmail, qq, 163, outlook
'smtp_username' => 'your-email@gmail.com', // 替换为您的邮箱
'smtp_password' => 'your-app-password',    // 替换为应用专用密码
'from_name' => '事件记录系统',               // 发送方名称
```

### 3. 设置邮箱应用专用密码

#### Gmail 设置：
1. 登录 Google 账户
2. 前往 [Google 账户安全设置](https://myaccount.google.com/security)
3. 启用"两步验证"
4. 在"应用专用密码"中生成新密码
5. 将生成的16位密码填入 `smtp_password`

#### QQ邮箱设置：
1. 登录 QQ 邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"
4. 获取授权码，填入 `smtp_password`

#### 163邮箱设置：
1. 登录 163 邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启"SMTP服务"
4. 获取授权码，填入 `smtp_password`

## 🚀 部署配置

### 开发环境

1. **启动本地服务器**：
   ```bash
   # 使用 PHP 内置服务器
   php -S localhost:8000
   
   # 或使用 XAMPP/WAMP/MAMP
   ```

2. **测试邮件配置**：
   ```bash
   # 在项目根目录运行
   php -f api/test-email.php
   ```

### 生产环境

1. **文件权限设置**：
   ```bash
   chmod 755 api/
   chmod 644 api/*.php
   chmod 666 api/*.json  # 数据文件需要写权限
   ```

2. **安全配置**：
   - 确保 `api/` 目录在 Web 根目录内
   - 设置适当的 `.htaccess` 规则
   - 使用 HTTPS 协议

## 📧 支持的邮箱服务商

| 服务商 | 配置名称 | SMTP地址 | 端口 | 加密方式 |
|--------|----------|----------|------|----------|
| Gmail | `gmail` | smtp.gmail.com | 587 | TLS |
| QQ邮箱 | `qq` | smtp.qq.com | 587 | TLS |
| 163邮箱 | `163` | smtp.163.com | 25 | TLS |
| Outlook | `outlook` | smtp-mail.outlook.com | 587 | TLS |

## 🔧 API 接口说明

### 发送验证码接口

**URL**: `api/send-verification.php`  
**方法**: POST  
**Content-Type**: application/json

**请求参数**:
```json
{
    "email": "user@example.com",
    "type": "register"  // 或 "reset"
}
```

**成功响应**:
```json
{
    "success": true,
    "message": "验证码发送成功，请查收邮件",
    "data": {
        "email": "user@example.com",
        "type": "register",
        "expires_in": 300,
        "provider": "Gmail"
    }
}
```

### 验证码验证接口

**URL**: `api/verify-code.php`  
**方法**: POST  
**Content-Type**: application/json

**请求参数**:
```json
{
    "email": "user@example.com",
    "code": "123456",
    "type": "register"
}
```

**成功响应**:
```json
{
    "success": true,
    "message": "验证码验证成功",
    "data": {
        "email": "user@example.com",
        "type": "register",
        "verified_at": 1640995200
    }
}
```

## 🔐 安全特性

### 1. 验证码安全
- 6位随机数字验证码
- 5分钟有效期
- 最多尝试5次
- 使用后立即失效

### 2. 发送频率限制
- 60秒内不能重复发送同一邮箱
- 每小时最多发送10封邮件
- 自动清理过期记录

### 3. 输入验证
- 邮箱格式验证
- 验证码格式检查
- 防止SQL注入和XSS攻击

### 4. 错误处理
- 详细的错误日志记录
- 标准化的错误响应
- 敏感信息隐藏

## 📝 日志和监控

### 日志文件位置
- 邮件发送日志: `api/email.log`
- 发送频率记录: `api/rate_limit.json`
- 验证码数据: `api/verifications.json`

### 日志格式
```
[2024-12-23 10:30:45] [INFO] 验证码发送成功: user@example.com (register), 使用服务商: Gmail
[2024-12-23 10:31:20] [WARNING] 验证码错误: user@example.com (register), 剩余尝试次数: 3
[2024-12-23 10:32:15] [ERROR] PHPMailer错误: SMTP connect() failed
```

## 🐛 故障排除

### 常见问题

1. **PHPMailer 未安装**
   ```
   错误: PHPMailer未安装。请运行: composer install
   解决: 在项目根目录运行 composer install
   ```

2. **SMTP 认证失败**
   ```
   错误: SMTP connect() failed
   解决: 检查邮箱设置和应用专用密码
   ```

3. **权限不足**
   ```
   错误: 无法写入文件
   解决: 设置正确的文件权限 chmod 666 api/*.json
   ```

4. **发送频率过高**
   ```
   错误: 发送过于频繁，请稍后再试
   解决: 等待60秒或清理 rate_limit.json 文件
   ```

### 调试模式

在 `api/config.php` 中启用调试：

```php
'enable_debug' => true,  // 启用 SMTP 调试输出
'log_emails' => true,    // 启用邮件日志记录
```

## 🔄 备用方案

系统具有智能回退机制：
- 当PHP后端不可用时，自动切换到前端模拟模式
- 保持用户体验的连续性
- 开发环境下的无缝切换

## 📚 测试指南

### 手动测试步骤

1. **注册流程测试**：
   - 访问 `auth/register.html`
   - 填写表单并提交
   - 检查邮箱是否收到验证码
   - 输入验证码完成注册

2. **密码重置测试**：
   - 访问 `auth/forgot-password.html`
   - 输入邮箱地址
   - 检查邮箱验证码
   - 完成密码重置

### 自动化测试

创建测试脚本 `api/test-email.php`：

```php
<?php
require_once 'config.php';

// 测试配置验证
$validation = MailConfig::validateConfig();
if ($validation['valid']) {
    echo "✅ 邮件配置验证通过\n";
} else {
    echo "❌ 配置错误: " . implode(', ', $validation['errors']) . "\n";
}

// 测试SMTP连接
try {
    $smtpConfig = MailConfig::getSmtpConfig();
    echo "✅ SMTP配置获取成功: {$smtpConfig['provider_name']}\n";
} catch (Exception $e) {
    echo "❌ SMTP配置错误: " . $e->getMessage() . "\n";
}
?>
```

## 🚀 性能优化

### 1. 缓存优化
- 使用文件缓存存储验证码
- 定期清理过期数据
- 优化JSON文件读写

### 2. 并发处理
- 文件锁机制防止竞态条件
- 原子操作保证数据一致性

### 3. 资源管理
- 连接池复用SMTP连接
- 内存使用优化
- 错误恢复机制

## 📈 升级建议

### 数据库集成
生产环境建议使用数据库替代文件存储：

```sql
CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('register', 'reset') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    INDEX idx_email_type (email, type),
    INDEX idx_expires (expires_at)
);
```

### 队列系统
对于高并发场景，建议使用队列系统：
- Redis 队列
- RabbitMQ
- 数据库队列

## 📞 技术支持

如果您在集成过程中遇到问题，请：

1. 检查日志文件 `api/email.log`
2. 验证邮箱配置是否正确
3. 确认网络连接和防火墙设置
4. 参考本文档的故障排除部分

---

**注意**: 请确保在生产环境中使用HTTPS协议，并妥善保管SMTP密码等敏感信息。 