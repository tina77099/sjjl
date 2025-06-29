/**
 * 事件记录系统 - 认证管理器
 * 支持手机号+邮箱验证的用户认证系统
 */

class AuthSystem {
    constructor() {
        this.apiBase = 'http://localhost:3001/api'; // 认证服务器地址
        this.currentUser = null;
        this.initUserState();
        
        // 邮箱服务商映射规则
        this.emailProviders = [
            {
                match: /@(qq|foxmail)\.com$/,
                name: 'QQ邮箱',
                url: 'https://mail.qq.com/'
            },
            {
                match: /@gmail\.com$/,
                name: 'Gmail',
                url: 'https://mail.google.com/'
            },
            {
                match: /@163\.com$/,
                name: '163邮箱',
                url: 'https://mail.163.com/'
            },
            {
                match: /@126\.com$/,
                name: '126邮箱',
                url: 'https://mail.126.com/'
            },
            {
                match: /@yeah\.net$/,
                name: 'Yeah邮箱',
                url: 'https://mail.yeah.net/'
            },
            {
                match: /@sina\.(com|cn)$/,
                name: '新浪邮箱',
                url: 'https://mail.sina.com.cn/'
            },
            {
                match: /@sohu\.com$/,
                name: '搜狐邮箱',
                url: 'https://mail.sohu.com/'
            },
            {
                match: /@(outlook|hotmail)\.com$/,
                name: 'Outlook邮箱',
                url: 'https://outlook.live.com/'
            },
            {
                match: /@yahoo\.com$/,
                name: 'Yahoo邮箱',
                url: 'https://mail.yahoo.com/'
            },
            {
                match: /@139\.com$/,
                name: '139邮箱',
                url: 'https://mail.10086.cn/'
            },
            {
                match: /@aliyun\.com$/,
                name: '阿里云邮箱',
                url: 'https://mail.aliyun.com/'
            },
            {
                match: /@tom\.com$/,
                name: 'Tom邮箱',
                url: 'https://mail.tom.com/'
            }
        ];
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
            // 发送验证码，包含注册数据
            await this.sendVerificationCode(email, 'register', {
                phone: phone,
                password: password
            });
            
            // 保存注册数据到临时存储（作为备用）
            const registerData = { phone, email, password };
            sessionStorage.setItem('register_data', JSON.stringify(registerData));
            
            // 跳转到验证页面（使用链接验证模式）
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
        ['username-error', 'password-error'].forEach(id => {
            this.hideError(id);
        });

        let hasError = false;

        // 验证用户名
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

        this.setButtonLoading('login-btn', true);

        try {
            // 用户认证
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
                this.showStatus(result.error || '用户名或密码错误', true);
                // 记录登录失败尝试
                this.recordLoginAttempt(username);
            }
            
        } catch (error) {
            console.error('❌ 登录过程中发生错误:', error);
            
            // 处理需要邮箱验证的情况
            if (error.needVerification && error.email) {
                this.showStatus('账户未验证，即将跳转到验证页面...', true);
                
                // 3秒后跳转到邮箱验证页面
                setTimeout(() => {
                    window.location.href = `verify-email.html?email=${encodeURIComponent(error.email)}&type=register`;
                }, 3000);
            } else {
                this.showStatus('登录失败：' + error.message, true);
                // 记录登录失败尝试
                this.recordLoginAttempt(username);
            }
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
        const openEmailBtn = document.getElementById('open-email-btn');
        const verifyBtn = document.getElementById('verify-btn');
        const resendBtn = document.getElementById('resend-btn');
        const changeEmailBtn = document.getElementById('change-email-btn');

        // 从URL获取邮箱地址
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const type = urlParams.get('type') || 'register';

        if (email) {
            document.getElementById('email-display').textContent = email;
            
            // 显示邮箱服务商信息
            const provider = this.getEmailProvider(email);
            const providerDisplay = document.getElementById('provider-display');
            if (providerDisplay && provider) {
                providerDisplay.textContent = provider.name;
            }
            
            // 更新打开邮箱按钮文本
            if (openEmailBtn && provider) {
                const btnText = openEmailBtn.querySelector('#open-email-btn-text');
                if (btnText) {
                    btnText.textContent = `打开 ${provider.name}`;
                }
            }
        }

        // 启动倒计时
        this.startVerificationCountdown();

        // 打开邮箱按钮事件
        if (openEmailBtn) {
            openEmailBtn.addEventListener('click', () => {
                if (email) {
                    const success = this.openEmailProvider(email);
                    if (success) {
                        this.showStatus(`已为您打开${this.getEmailProvider(email).name}，请查看验证码`);
                    }
                }
            });
        }

        // 验证表单提交（仅验证验证码）
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
    
    async sendVerificationCode(email, type, additionalData = null) {
        console.log(`📧 开始发送验证码到 ${email}，类型: ${type}`);
        
        try {
            // 构建请求数据
            const requestData = {
                email: email,
                type: type
            };
            
            // 如果是注册类型且有额外数据，包含注册信息
            if (type === 'register' && additionalData) {
                requestData.phone = additionalData.phone || '';
                requestData.password = additionalData.password || '';
            }
            
            // 调用PHP后端API发送验证码
            const response = await fetch('../api/send-verification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || '发送失败');
            }
            
            if (result.success) {
                console.log(`✅ 验证码发送成功: ${email}`);
                console.log(`📧 邮件服务商: ${result.data.provider}`);
                console.log(`⏰ 有效期: ${result.data.expires_in} 秒`);
                
                // 获取邮箱服务商信息用于前端显示
                const provider = this.getEmailProvider(email);
                console.log(`🔗 邮箱服务商: ${provider.name}`);
                
                return true;
            } else {
                throw new Error(result.error || '发送失败');
            }
            
        } catch (error) {
            console.error('❌ 发送验证码失败:', error);
            
            // 如果是网络错误或服务器不可用，回退到模拟模式
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                console.warn('⚠️ 后端服务不可用，回退到模拟模式');
                return this.sendVerificationCodeFallback(email, type);
            }
            
            throw error;
        }
    }
    
    // 备用的模拟发送方法（当后端不可用时使用）
    async sendVerificationCodeFallback(email, type) {
        console.log('🔄 使用模拟模式发送验证码');
        
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
        
        // 获取邮箱服务商信息
        const provider = this.getEmailProvider(email);
        
        // 开发调试信息
        console.log(`📧 验证码发送详情 (模拟模式):`);
        console.log(`   邮箱: ${email}`);
        console.log(`   服务商: ${provider.name}`);
        console.log(`   验证码: ${code}`);
        console.log(`   类型: ${type}`);
        console.log(`   有效期: ${expiry.toLocaleString()}`);
        
        return true;
    }

    async verifyCode(email, code, type) {
        console.log(`🔍 开始验证验证码: ${email}, 类型: ${type}`);
        
        try {
            // 调用PHP后端API验证验证码
            const response = await fetch('../api/verify-code.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: code,
                    type: type
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                console.warn(`⚠️ 验证失败: ${result.error}`);
                return false;
            }
            
            if (result.success) {
                console.log(`✅ 验证码验证成功: ${email}`);
                return true;
            } else {
                console.warn(`❌ 验证码验证失败: ${result.error}`);
                return false;
            }
            
        } catch (error) {
            console.error('❌ 验证码验证出错:', error);
            
            // 如果是网络错误或服务器不可用，回退到模拟模式
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                console.warn('⚠️ 后端服务不可用，回退到模拟模式');
                return this.verifyCodeFallback(email, code, type);
            }
            
            return false;
        }
    }
    
    // 备用的模拟验证方法（当后端不可用时使用）
    async verifyCodeFallback(email, code, type) {
        console.log('🔄 使用模拟模式验证验证码');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storedData = localStorage.getItem(`verification_${email}_${type}`);
        if (!storedData) {
            console.warn('❌ 验证码不存在');
            return false;
        }
        
        const verificationData = JSON.parse(storedData);
        const now = new Date();
        const expiry = new Date(verificationData.expiry);
        
        // 检查过期
        if (now > expiry) {
            console.warn('❌ 验证码已过期');
            localStorage.removeItem(`verification_${email}_${type}`);
            return false;
        }
        
        // 检查验证码
        if (verificationData.code === code) {
            console.log('✅ 验证码验证成功 (模拟模式)');
            localStorage.removeItem(`verification_${email}_${type}`);
            return true;
        }
        
        // 增加尝试次数
        verificationData.attempts++;
        if (verificationData.attempts >= 5) {
            console.warn('❌ 验证码尝试次数过多');
            localStorage.removeItem(`verification_${email}_${type}`);
            return false;
        }
        
        localStorage.setItem(`verification_${email}_${type}`, JSON.stringify(verificationData));
        console.warn(`❌ 验证码错误，剩余尝试次数: ${5 - verificationData.attempts}`);
        return false;
    }

    async authenticateUser(username, password) {
        console.log('🔄 开始用户认证（通过API）...');
        console.log('👤 用户名:', username);
        console.log('🔐 密码长度:', password.length);
        
        try {
            // 调用PHP登录API
            const response = await fetch('../api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            console.log('📡 API响应状态:', response.status);
            
            const result = await response.json();
            console.log('📦 API响应数据:', result);
            
            if (result.success) {
                console.log('✅ 用户认证成功');
                return {
                    success: true,
                    user: result.user,
                    token: result.token
                };
            } else {
                console.error('❌ 用户认证失败:', result.error);
                
                // 如果需要邮箱验证，抛出特殊错误
                if (result.need_verification) {
                    const error = new Error(result.error);
                    error.needVerification = true;
                    error.email = result.email;
                    throw error;
                }
                
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            console.error('❌ API调用失败:', error);
            
            // 如果是需要验证的错误，重新抛出
            if (error.needVerification) {
                throw error;
            }
            
            // 网络错误或其他错误，降级到本地验证
            console.log('🔄 API调用失败，尝试本地验证...');
            return await this.authenticateUserLocal(username, password);
        }
    }
    
    // 保留原有的本地认证逻辑作为备用
    async authenticateUserLocal(username, password) {
        console.log('🔄 开始本地用户认证...');
        console.log('👤 用户名:', username);
        console.log('🔐 密码长度:', password.length);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟用户数据库查询
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        console.log('👥 本地数据库中的用户总数:', users.length);
        console.log('📋 本地用户列表:', users.map(u => ({ email: u.email, phone: u.phone, user_id: u.user_id, is_verified: u.is_verified })));
        
        // 计算输入密码的哈希值
        const inputPasswordHash = this.hashPassword(password);
        console.log('🔐 输入密码的哈希值:', inputPasswordHash);
        
        // 查找匹配的用户
        const matchingUsers = users.filter(u => u.phone === username || u.email === username);
        console.log('🔍 匹配用户名的用户数量:', matchingUsers.length);
        console.log('🔍 匹配的用户:', matchingUsers.map(u => ({ 
            email: u.email, 
            phone: u.phone, 
            password_hash: u.password_hash,
            is_verified: u.is_verified 
        })));
        
        const user = users.find(u => 
            (u.phone === username || u.email === username) && u.password_hash === inputPasswordHash
        );
        
        console.log('🔍 最终找到的用户:', user ? { 
            user_id: user.user_id, 
            email: user.email, 
            phone: user.phone,
            is_verified: user.is_verified,
            password_matches: user.password_hash === inputPasswordHash
        } : 'null');
        
        if (user && user.is_verified) {
            console.log('✅ 本地用户认证成功');
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
        
        console.error('❌ 本地用户认证失败');
        if (!user) {
            console.error('❌ 失败原因: 用户名或密码错误');
        } else if (!user.is_verified) {
            console.error('❌ 失败原因: 用户未验证');
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
        console.log('🔄 开始更新用户密码...');
        console.log('📧 邮箱:', email);
        console.log('🔐 新密码长度:', newPassword.length);
        
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        console.log('👥 数据库中的用户总数:', users.length);
        console.log('📋 用户列表:', users.map(u => ({ email: u.email, phone: u.phone, user_id: u.user_id })));
        
        const userIndex = users.findIndex(u => u.email === email);
        console.log('🔍 查找用户索引:', userIndex);
        
        if (userIndex !== -1) {
            const oldPasswordHash = users[userIndex].password_hash;
            const newPasswordHash = this.hashPassword(newPassword);
            
            console.log('🔐 旧密码哈希:', oldPasswordHash);
            console.log('🔐 新密码哈希:', newPasswordHash);
            
            users[userIndex].password_hash = newPasswordHash;
            localStorage.setItem('registered_users', JSON.stringify(users));
            
            console.log('✅ 密码更新成功');
            
            // 验证更新后的数据
            const updatedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const updatedUser = updatedUsers.find(u => u.email === email);
            console.log('✅ 验证更新后的用户密码哈希:', updatedUser?.password_hash);
            
            return true;
        }
        
        console.error('❌ 未找到对应邮箱的用户');
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

    // ==================== 调试和修复工具 ====================
    
    // 数据验证和诊断工具
    validateUserData() {
        console.log('🔍 开始验证用户数据...');
        
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        console.log('👥 数据库中的用户总数:', users.length);
        
        if (users.length === 0) {
            console.warn('⚠️ 用户数据库为空');
            return { valid: false, issue: 'empty_database' };
        }
        
        // 检查每个用户的数据完整性
        const issues = [];
        users.forEach((user, index) => {
            console.log(`🔍 检查用户 ${index + 1}:`, {
                user_id: user.user_id,
                email: user.email,
                phone: user.phone,
                has_password_hash: !!user.password_hash,
                is_verified: user.is_verified
            });
            
            if (!user.password_hash) {
                issues.push(`用户 ${user.email || user.phone} 缺少密码哈希`);
            }
            if (!user.is_verified) {
                issues.push(`用户 ${user.email || user.phone} 未验证`);
            }
            if (!user.email && !user.phone) {
                issues.push(`用户 ${user.user_id} 缺少联系方式`);
            }
        });
        
        if (issues.length > 0) {
            console.warn('⚠️ 发现数据问题:', issues);
            return { valid: false, issues, users };
        }
        
        console.log('✅ 用户数据验证通过');
        return { valid: true, users };
    }
    
    // 密码测试工具
    testPassword(email, password) {
        console.log('🧪 测试密码功能...');
        console.log('📧 邮箱:', email);
        console.log('🔐 密码:', password);
        
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            console.error('❌ 未找到用户');
            return { success: false, reason: 'user_not_found' };
        }
        
        const inputHash = this.hashPassword(password);
        const storedHash = user.password_hash;
        
        console.log('🔐 输入密码哈希:', inputHash);
        console.log('🔐 存储密码哈希:', storedHash);
        console.log('🔐 密码匹配:', inputHash === storedHash);
        
        return {
            success: inputHash === storedHash,
            user_found: true,
            password_matches: inputHash === storedHash,
            user_verified: user.is_verified
        };
    }
    
    // 清理和重置用户数据（开发用）
    resetUserData() {
        console.warn('🗑️ 清理用户数据...');
        localStorage.removeItem('registered_users');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_mode');
        console.log('✅ 用户数据已清理');
    }

    // 根据邮箱地址获取邮箱服务商信息
    getEmailProvider(email) {
        if (!email) return null;
        
        for (const provider of this.emailProviders) {
            if (provider.match.test(email)) {
                return provider;
            }
        }
        
        // 默认返回通用邮箱信息
        return {
            name: '邮箱',
            url: 'mailto:' + email
        };
    }

    // 打开邮箱服务商页面
    openEmailProvider(email) {
        const provider = this.getEmailProvider(email);
        
        if (provider) {
            try {
                // 在新标签页打开邮箱
                const newWindow = window.open(provider.url, '_blank');
                
                // 检查是否被弹窗阻止
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    throw new Error('弹窗被阻止');
                }
                
                console.log(`✅ 已打开 ${provider.name}: ${provider.url}`);
                return true;
            } catch (error) {
                console.error('❌ 打开邮箱失败:', error);
                
                // 如果弹窗被阻止，提供备用方案
                if (error.message.includes('弹窗被阻止')) {
                    const userConfirm = confirm(`无法自动打开${provider.name}，是否手动访问？\n\n点击"确定"复制邮箱地址到剪贴板`);
                    if (userConfirm) {
                        // 尝试复制URL到剪贴板
                        this.copyToClipboard(provider.url);
                        alert(`${provider.name}地址已复制到剪贴板，请手动打开浏览器访问`);
                    }
                }
                return false;
            }
        }
        
        return false;
    }

    // 复制文本到剪贴板
    copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text);
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            return true;
        } catch (error) {
            console.error('复制到剪贴板失败:', error);
            return false;
        }
    }

    // ==================== 登录尝试管理 ====================
    
    // 记录登录失败尝试
    recordLoginAttempt(username) {
        if (!username) return;
        
        const key = `login_attempts_${username}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        
        // 添加当前尝试时间
        attempts.push(now);
        
        // 清理5分钟前的尝试记录
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        const recentAttempts = attempts.filter(time => time > fiveMinutesAgo);
        
        localStorage.setItem(key, JSON.stringify(recentAttempts));
        
        // 检查是否需要显示锁定警告
        this.checkLoginLockout(username, recentAttempts.length);
    }
    
    // 清除登录失败记录
    clearLoginAttempts(username) {
        if (!username) return;
        
        const key = `login_attempts_${username}`;
        localStorage.removeItem(key);
        
        // 隐藏锁定警告
        const lockoutMessage = document.getElementById('lockout-message');
        if (lockoutMessage) {
            lockoutMessage.classList.add('hidden');
        }
    }
    
    // 检查登录锁定状态
    checkLoginLockout(username, attemptCount) {
        const maxAttempts = 5;
        const lockoutMessage = document.getElementById('lockout-message');
        const lockoutText = document.getElementById('lockout-text');
        
        if (attemptCount >= maxAttempts) {
            if (lockoutMessage && lockoutText) {
                lockoutText.textContent = `登录失败次数过多，请5分钟后再试。当前失败次数：${attemptCount}`;
                lockoutMessage.classList.remove('hidden');
            }
        } else if (attemptCount >= 3) {
            if (lockoutMessage && lockoutText) {
                lockoutText.textContent = `连续登录失败 ${attemptCount} 次，再失败 ${maxAttempts - attemptCount} 次将被临时锁定`;
                lockoutMessage.classList.remove('hidden');
            }
        }
    }
    
    // 获取登录尝试次数
    getLoginAttemptCount(username) {
        if (!username) return 0;
        
        const key = `login_attempts_${username}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);
        
        // 返回5分钟内的尝试次数
        return attempts.filter(time => time > fiveMinutesAgo).length;
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