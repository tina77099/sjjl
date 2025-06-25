/**
 * 事件记录系统 - 认证管理器
 * 支持手机号+邮箱验证的用户认证系统
 */

class AuthSystem {
    constructor() {
        this.apiBase = 'http://localhost:3001/api'; // 认证服务器地址
        this.currentUser = null;
        this.initUserState();
    }

    // 初始化用户状态
    initUserState() {
        const userData = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
            this.validateToken(token);
        }
    }

    // ==================== 表单验证工具 ====================
    
    // 验证手机号
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    // 验证邮箱
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 验证密码强度
    validatePassword(password) {
        const minLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        return {
            valid: minLength && hasLetter && hasNumber,
            minLength,
            hasLetter,
            hasNumber
        };
    }

    // 显示错误信息
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    // 隐藏错误信息
    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    // 显示状态消息
    showStatus(message, isError = false) {
        const statusElement = document.getElementById(isError ? 'error-message' : 'status-message');
        const textElement = document.getElementById(isError ? 'error-text' : 'status-text');
        
        if (statusElement && textElement) {
            textElement.textContent = message;
            statusElement.classList.remove('hidden');
            
            // 3秒后自动隐藏成功消息
            if (!isError) {
                setTimeout(() => {
                    statusElement.classList.add('hidden');
                }, 3000);
            }
        }
    }

    // ==================== 注册功能 ====================
    
    initRegister() {
        const form = document.getElementById('register-form');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const togglePassword = document.getElementById('toggle-password');

        // 密码显示/隐藏切换
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                const icon = togglePassword.querySelector('i');
                icon.className = type === 'password' ? 'fas fa-eye text-gray-400 hover:text-gray-600' : 'fas fa-eye-slash text-gray-400 hover:text-gray-600';
            });
        }

        // 实时密码强度检查
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                const validation = this.validatePassword(passwordInput.value);
                
                // 更新长度检查
                const lengthCheck = document.getElementById('length-check');
                if (lengthCheck) {
                    const icon = lengthCheck.querySelector('i');
                    if (validation.minLength) {
                        icon.className = 'fas fa-check text-green-400 mr-1';
                        lengthCheck.classList.remove('text-red-400');
                        lengthCheck.classList.add('text-green-600');
                    } else {
                        icon.className = 'fas fa-times text-red-400 mr-1';
                        lengthCheck.classList.remove('text-green-600');
                        lengthCheck.classList.add('text-red-400');
                    }
                }
                
                // 更新字符检查
                const charCheck = document.getElementById('char-check');
                if (charCheck) {
                    const icon = charCheck.querySelector('i');
                    if (validation.hasLetter && validation.hasNumber) {
                        icon.className = 'fas fa-check text-green-400 mr-1';
                        charCheck.classList.remove('text-red-400');
                        charCheck.classList.add('text-green-600');
                    } else {
                        icon.className = 'fas fa-times text-red-400 mr-1';
                        charCheck.classList.remove('text-green-600');
                        charCheck.classList.add('text-red-400');
                    }
                }
            });
        }

        // 表单提交处理
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }
    }

    async handleRegister() {
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const agreeTerms = document.getElementById('agree-terms').checked;

        // 清除之前的错误信息
        ['phone-error', 'email-error', 'password-error', 'confirm-password-error'].forEach(id => {
            this.hideError(id);
        });

        let hasError = false;

        // 验证手机号
        if (!this.validatePhone(phone)) {
            this.showError('phone-error', '请输入正确的11位中国手机号');
            hasError = true;
        }

        // 验证邮箱
        if (!this.validateEmail(email)) {
            this.showError('email-error', '请输入正确的邮箱地址');
            hasError = true;
        }

        // 验证密码
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            this.showError('password-error', '密码必须至少8位且包含字母和数字');
            hasError = true;
        }

        // 验证确认密码
        if (password !== confirmPassword) {
            this.showError('confirm-password-error', '两次输入的密码不一致');
            hasError = true;
        }

        // 验证用户协议
        if (!agreeTerms) {
            this.showStatus('请先同意用户协议和隐私政策', true);
            hasError = true;
        }

        if (hasError) return;

        // 显示加载状态
        this.setButtonLoading('register-btn', true);

        try {
            // 模拟发送验证码（实际应该调用后端API）
            await this.sendVerificationCode(email, 'register');
            
            // 保存注册数据到临时存储
            const registerData = { phone, email, password };
            sessionStorage.setItem('register_data', JSON.stringify(registerData));
            
            // 跳转到验证页面
            window.location.href = 'verify-email.html?type=register&email=' + encodeURIComponent(email);
            
        } catch (error) {
            this.showStatus('注册失败：' + error.message, true);
        } finally {
            this.setButtonLoading('register-btn', false);
        }
    }

    // ==================== 登录功能 ====================
    
    initLogin() {
        const form = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        const guestBtn = document.getElementById('guest-login-btn');

        // 密码显示/隐藏切换
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                const icon = togglePassword.querySelector('i');
                icon.className = type === 'password' ? 'fas fa-eye text-gray-400 hover:text-gray-600' : 'fas fa-eye-slash text-gray-400 hover:text-gray-600';
            });
        }

        // 登录表单提交
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // 游客模式登录
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                this.loginAsGuest();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // 清除错误信息
        this.hideError('username-error');
        this.hideError('password-error');

        let hasError = false;

        // 验证用户名（手机号或邮箱）
        if (!username) {
            this.showError('username-error', '请输入手机号或邮箱');
            hasError = true;
        } else if (!this.validatePhone(username) && !this.validateEmail(username)) {
            this.showError('username-error', '请输入正确的手机号或邮箱格式');
            hasError = true;
        }

        // 验证密码
        if (!password) {
            this.showError('password-error', '请输入密码');
            hasError = true;
        }

        if (hasError) return;

        // 检查登录限制
        if (this.isLoginLocked(username)) {
            const lockoutTime = this.getLockoutTime(username);
            this.showLockoutMessage(lockoutTime);
            return;
        }

        this.setButtonLoading('login-btn', true);

        try {
            // 模拟登录API调用
            const result = await this.authenticateUser(username, password);
            
            if (result.success) {
                // 清除登录失败记录
                this.clearLoginAttempts(username);
                
                // 保存用户信息和令牌
                this.currentUser = result.user;
                localStorage.setItem('auth_user', JSON.stringify(result.user));
                localStorage.setItem('auth_token', result.token);
                
                if (rememberMe) {
                    localStorage.setItem('remember_login', 'true');
                }
                
                this.showStatus('登录成功，即将跳转...');
                
                // 跳转到主页
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
                
            } else {
                // 记录登录失败
                this.recordLoginAttempt(username);
                this.showStatus('用户名或密码错误', true);
            }
            
        } catch (error) {
            this.recordLoginAttempt(username);
            this.showStatus('登录失败：' + error.message, true);
        } finally {
            this.setButtonLoading('login-btn', false);
        }
    }

    // 游客模式登录
    loginAsGuest() {
        const guestUser = {
            user_id: 'guest_' + Date.now(),
            username: '游客用户',
            email: null,
            phone: null,
            is_guest: true,
            created_at: new Date().toISOString()
        };

        this.currentUser = guestUser;
        localStorage.setItem('auth_user', JSON.stringify(guestUser));
        localStorage.setItem('auth_mode', 'guest');

        this.showStatus('已进入游客模式，即将跳转...');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }

    // ==================== 邮箱验证功能 ====================
    
    initEmailVerification() {
        const form = document.getElementById('verify-form');
        const resendBtn = document.getElementById('resend-btn');
        const changeEmailBtn = document.getElementById('change-email-btn');

        // 从URL获取邮箱地址
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const type = urlParams.get('type') || 'register';

        if (email) {
            document.getElementById('email-display').textContent = email;
        }

        // 启动倒计时
        this.startVerificationCountdown();

        // 验证表单提交
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEmailVerification(email, type);
            });
        }

        // 重新发送验证码
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                await this.resendVerificationCode(email, type);
            });
        }

        // 更换邮箱
        if (changeEmailBtn) {
            changeEmailBtn.addEventListener('click', () => {
                if (type === 'register') {
                    window.location.href = 'register.html';
                } else {
                    window.location.href = 'forgot-password.html';
                }
            });
        }
    }

    async handleEmailVerification(email, type) {
        const code = document.getElementById('verification-code').value.trim();

        this.hideError('code-error');

        if (!code || code.length !== 6) {
            this.showError('code-error', '请输入6位验证码');
            return;
        }

        this.setButtonLoading('verify-btn', true);

        try {
            const isValid = await this.verifyCode(email, code, type);
            
            if (isValid) {
                if (type === 'register') {
                    // 完成注册
                    await this.completeRegistration(email);
                } else {
                    // 验证成功，可以重置密码
                    this.showStatus('验证成功！');
                }
                
                document.getElementById('success-message').classList.remove('hidden');
                
                setTimeout(() => {
                    if (type === 'register') {
                        window.location.href = 'login.html';
                    }
                }, 2000);
                
            } else {
                this.showError('code-error', '验证码错误或已过期');
            }
            
        } catch (error) {
            this.showStatus('验证失败：' + error.message, true);
        } finally {
            this.setButtonLoading('verify-btn', false);
        }
    }

    // ==================== 忘记密码功能 ====================
    
    initForgotPassword() {
        const forgotForm = document.getElementById('forgot-password-form');
        const resetForm = document.getElementById('reset-password-form');
        const resendBtn = document.getElementById('resend-reset-btn');
        const togglePassword = document.getElementById('toggle-new-password');

        // 密码显示/隐藏切换
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('new-password');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                const icon = togglePassword.querySelector('i');
                icon.className = type === 'password' ? 'fas fa-eye text-gray-400 hover:text-gray-600' : 'fas fa-eye-slash text-gray-400 hover:text-gray-600';
            });
        }

        // 发送重置邮件
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword();
            });
        }

        // 重置密码
        if (resetForm) {
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleResetPassword();
            });
        }

        // 重新发送验证码
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                const email = document.getElementById('email').value.trim();
                await this.resendVerificationCode(email, 'reset');
            });
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('email').value.trim();

        this.hideError('email-error');

        if (!this.validateEmail(email)) {
            this.showError('email-error', '请输入正确的邮箱地址');
            return;
        }

        this.setButtonLoading('send-reset-btn', true);

        try {
            await this.sendVerificationCode(email, 'reset');
            
            // 显示重置密码表单
            document.getElementById('forgot-password-form').classList.add('hidden');
            document.getElementById('reset-password-form').classList.remove('hidden');
            document.getElementById('resend-section').classList.remove('hidden');
            
            this.showStatus('重置邮件已发送，请检查您的邮箱');
            
        } catch (error) {
            this.showStatus('发送失败：' + error.message, true);
        } finally {
            this.setButtonLoading('send-reset-btn', false);
        }
    }

    async handleResetPassword() {
        const email = document.getElementById('email').value.trim();
        const code = document.getElementById('reset-code').value.trim();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        // 清除错误信息
        ['reset-code-error', 'new-password-error', 'confirm-new-password-error'].forEach(id => {
            this.hideError(id);
        });

        let hasError = false;

        // 验证验证码
        if (!code || code.length !== 6) {
            this.showError('reset-code-error', '请输入6位验证码');
            hasError = true;
        }

        // 验证新密码
        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.valid) {
            this.showError('new-password-error', '密码必须至少8位且包含字母和数字');
            hasError = true;
        }

        // 验证确认密码
        if (newPassword !== confirmPassword) {
            this.showError('confirm-new-password-error', '两次输入的密码不一致');
            hasError = true;
        }

        if (hasError) return;

        this.setButtonLoading('reset-password-btn', true);

        try {
            const isValid = await this.verifyCode(email, code, 'reset');
            
            if (isValid) {
                await this.updateUserPassword(email, newPassword);
                
                document.getElementById('success-message').classList.remove('hidden');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } else {
                this.showError('reset-code-error', '验证码错误或已过期');
            }
            
        } catch (error) {
            this.showStatus('重置失败：' + error.message, true);
        } finally {
            this.setButtonLoading('reset-password-btn', false);
        }
    }

    // ==================== API 调用模拟 ====================
    
    async sendVerificationCode(email, type) {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟验证码生成和发送
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期
        
        // 存储验证码（实际应该存储在服务器）
        const verificationData = {
            email,
            code,
            type,
            expiry: expiry.toISOString(),
            attempts: 0
        };
        localStorage.setItem(`verification_${email}_${type}`, JSON.stringify(verificationData));
        
        console.log(`验证码已发送到 ${email}: ${code}`); // 开发调试用
        return true;
    }

    async verifyCode(email, code, type) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storedData = localStorage.getItem(`verification_${email}_${type}`);
        if (!storedData) return false;
        
        const verificationData = JSON.parse(storedData);
        const now = new Date();
        const expiry = new Date(verificationData.expiry);
        
        // 检查过期
        if (now > expiry) {
            localStorage.removeItem(`verification_${email}_${type}`);
            return false;
        }
        
        // 检查验证码
        if (verificationData.code === code) {
            localStorage.removeItem(`verification_${email}_${type}`);
            return true;
        }
        
        // 增加尝试次数
        verificationData.attempts++;
        if (verificationData.attempts >= 5) {
            localStorage.removeItem(`verification_${email}_${type}`);
            return false;
        }
        
        localStorage.setItem(`verification_${email}_${type}`, JSON.stringify(verificationData));
        return false;
    }

    async authenticateUser(username, password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟用户数据库查询
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => 
            (u.phone === username || u.email === username) && u.password_hash === this.hashPassword(password)
        );
        
        if (user && user.is_verified) {
            // 生成JWT令牌（模拟）
            const token = 'jwt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            return {
                success: true,
                user: {
                    user_id: user.user_id,
                    phone: user.phone,
                    email: user.email,
                    is_verified: user.is_verified,
                    created_at: user.created_at
                },
                token
            };
        }
        
        return { success: false };
    }

    async completeRegistration(email) {
        const registerData = JSON.parse(sessionStorage.getItem('register_data') || '{}');
        
        const user = {
            user_id: 'user_' + Date.now(),
            phone: registerData.phone,
            email: registerData.email,
            password_hash: this.hashPassword(registerData.password),
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: null
        };
        
        // 保存到模拟数据库
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        users.push(user);
        localStorage.setItem('registered_users', JSON.stringify(users));
        
        // 清除临时数据
        sessionStorage.removeItem('register_data');
        
        return user;
    }

    async updateUserPassword(email, newPassword) {
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].password_hash = this.hashPassword(newPassword);
            localStorage.setItem('registered_users', JSON.stringify(users));
            return true;
        }
        
        return false;
    }

    // ==================== 工具函数 ====================
    
    // 简单密码哈希（实际应该使用bcrypt）
    hashPassword(password) {
        // 这里使用简单的哈希，实际项目应该使用bcrypt
        return btoa(password + 'salt_key_2024');
    }

    // 验证JWT令牌
    async validateToken(token) {
        // 模拟令牌验证
        if (token && token.startsWith('jwt_')) {
            return true;
        }
        
        // 令牌无效，清除登录状态
        this.logout();
        return false;
    }

    // 登录限制检查
    isLoginLocked(username) {
        const attempts = JSON.parse(localStorage.getItem(`login_attempts_${username}`) || '{}');
        const now = new Date();
        
        if (attempts.count >= 5 && attempts.lockUntil && new Date(attempts.lockUntil) > now) {
            return true;
        }
        
        return false;
    }

    getLockoutTime(username) {
        const attempts = JSON.parse(localStorage.getItem(`login_attempts_${username}`) || '{}');
        return attempts.lockUntil;
    }

    recordLoginAttempt(username) {
        const attempts = JSON.parse(localStorage.getItem(`login_attempts_${username}`) || '{ "count": 0 }');
        attempts.count++;
        attempts.lastAttempt = new Date().toISOString();
        
        if (attempts.count >= 5) {
            attempts.lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 锁定30分钟
        }
        
        localStorage.setItem(`login_attempts_${username}`, JSON.stringify(attempts));
    }

    clearLoginAttempts(username) {
        localStorage.removeItem(`login_attempts_${username}`);
    }

    showLockoutMessage(lockUntil) {
        const lockoutElement = document.getElementById('lockout-message');
        const lockoutText = document.getElementById('lockout-text');
        
        if (lockoutElement && lockoutText) {
            const remainingTime = Math.ceil((new Date(lockUntil) - new Date()) / 60000);
            lockoutText.textContent = `账户已被锁定，请在 ${remainingTime} 分钟后重试`;
            lockoutElement.classList.remove('hidden');
        }
    }

    // 按钮加载状态
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        const text = document.getElementById(buttonId + '-text');
        const spinner = document.getElementById(buttonId + '-loading');
        
        if (button && text && spinner) {
            button.disabled = loading;
            if (loading) {
                spinner.classList.remove('hidden');
            } else {
                spinner.classList.add('hidden');
            }
        }
    }

    // 启动验证码倒计时
    startVerificationCountdown() {
        let timeLeft = 300; // 5分钟
        
        const updateCountdown = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const countdownText = document.getElementById('countdown-text');
            
            if (countdownText) {
                if (timeLeft > 0) {
                    countdownText.textContent = `剩余时间：${minutes}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    countdownText.textContent = '验证码已过期，请重新发送';
                    countdownText.classList.add('text-red-600');
                }
            }
            
            if (timeLeft > 0) {
                timeLeft--;
                setTimeout(updateCountdown, 1000);
            }
        };
        
        updateCountdown();
    }

    // 重新发送验证码
    async resendVerificationCode(email, type) {
        const resendBtn = document.getElementById('resend-btn') || document.getElementById('resend-reset-btn');
        
        if (!resendBtn || resendBtn.disabled) return;
        
        try {
            await this.sendVerificationCode(email, type);
            this.showStatus('验证码已重新发送');
            
            // 60秒内禁止再次发送
            resendBtn.disabled = true;
            let countdown = 60;
            
            const updateButton = () => {
                const resendText = document.getElementById('resend-text') || document.getElementById('resend-reset-text');
                const resendCountdown = document.getElementById('resend-countdown') || document.getElementById('resend-reset-countdown');
                
                if (resendText && resendCountdown) {
                    resendText.classList.add('hidden');
                    resendCountdown.classList.remove('hidden');
                    resendCountdown.textContent = `(${countdown}s)`;
                }
                
                if (countdown > 0) {
                    countdown--;
                    setTimeout(updateButton, 1000);
                } else {
                    resendBtn.disabled = false;
                    if (resendText && resendCountdown) {
                        resendText.classList.remove('hidden');
                        resendCountdown.classList.add('hidden');
                    }
                }
            };
            
            updateButton();
            
        } catch (error) {
            this.showStatus('发送失败：' + error.message, true);
        }
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_mode');
        localStorage.removeItem('remember_login');
        
        // 重定向到登录页面
        window.location.href = 'auth/login.html';
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 检查是否是游客模式
    isGuestMode() {
        return this.currentUser && this.currentUser.is_guest === true;
    }
}

// 创建全局实例
console.log('🔄 开始创建 AuthSystem 实例...');
const authSystem = new AuthSystem();
console.log('✅ AuthSystem 实例创建完成');
console.log('✅ 实例类型:', typeof authSystem);
console.log('✅ 实例构造函数:', authSystem.constructor.name);
console.log('✅ 可用方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(authSystem)));

// 验证关键方法是否存在
const keyMethods = ['initRegister', 'initLogin', 'initEmailVerification', 'initForgotPassword'];
keyMethods.forEach(method => {
    if (typeof authSystem[method] === 'function') {
        console.log(`✅ 方法 ${method} 存在且为函数`);
    } else {
        console.error(`❌ 方法 ${method} 不存在或不是函数，类型:`, typeof authSystem[method]);
    }
});

// 导出给其他模块使用
console.log('🔄 开始导出 AuthSystem...');
if (typeof window !== 'undefined') {
    // 浏览器环境，导出实例
    window.AuthSystem = authSystem;
    console.log('✅ 在浏览器环境中导出实例到 window.AuthSystem');
    console.log('✅ window.AuthSystem 类型:', typeof window.AuthSystem);
    console.log('✅ window.AuthSystem 构造函数:', window.AuthSystem.constructor.name);
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境，导出类
    module.exports = AuthSystem;
    console.log('✅ 在 Node.js 环境中导出类');
} else {
    // 其他环境，导出实例
    this.AuthSystem = authSystem;
    console.log('✅ 在其他环境中导出实例');
}

console.log('✅ auth-system.js 加载完成'); 