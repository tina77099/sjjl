/**
 * 认证守卫 - 页面访问权限控制
 * 检查用户登录状态并管理页面访问权限
 */

class AuthGuard {
    constructor() {
        this.authSystem = window.AuthSystem || null;
        this.currentPath = window.location.pathname;
        this.publicPages = [
            '/auth/login.html',
            '/auth/register.html', 
            '/auth/verify-email.html',
            '/auth/forgot-password.html',
            '/login.html',
            '/register.html'
        ];
        this.init();
    }

    init() {
        // 检查页面访问权限
        this.checkPageAccess();
        
        // 初始化用户界面
        this.initUserInterface();
        
        // 监听登录状态变化
        this.watchAuthState();
    }

    // 检查页面访问权限
    checkPageAccess() {
        const isPublicPage = this.isPublicPage();
        const isLoggedIn = this.isUserLoggedIn();

        // 如果是受保护页面且用户未登录，重定向到登录页面
        if (!isPublicPage && !isLoggedIn) {
            this.redirectToLogin();
            return;
        }

        // 如果是认证页面但用户已登录，重定向到主页
        if (isPublicPage && isLoggedIn && !this.currentPath.includes('verify-email')) {
            this.redirectToHome();
            return;
        }

        // 验证页面特殊处理
        if (this.currentPath.includes('verify-email')) {
            this.handleVerificationPage();
        }
    }

    // 检查是否为公开页面
    isPublicPage() {
        return this.publicPages.some(page => 
            this.currentPath.endsWith(page) || this.currentPath.includes(page)
        );
    }

    // 检查用户是否已登录
    isUserLoggedIn() {
        const userData = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        const guestMode = localStorage.getItem('auth_mode') === 'guest';

        return (userData && token) || guestMode;
    }

    // 获取当前用户信息
    getCurrentUser() {
        const userData = localStorage.getItem('auth_user');
        return userData ? JSON.parse(userData) : null;
    }

    // 重定向到登录页面
    redirectToLogin() {
        // 保存当前页面URL，登录后可以返回
        sessionStorage.setItem('redirect_after_login', window.location.href);
        
        // 显示重定向提示
        this.showRedirectMessage('请先登录后访问');
        
        setTimeout(() => {
            if (this.currentPath.includes('/auth/')) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'auth/login.html';
            }
        }, 1500);
    }

    // 重定向到主页
    redirectToHome() {
        // 检查是否有保存的重定向URL
        const redirectUrl = sessionStorage.getItem('redirect_after_login');
        sessionStorage.removeItem('redirect_after_login');

        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            if (this.currentPath.includes('/auth/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    }

    // 处理验证页面访问
    handleVerificationPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const type = urlParams.get('type');

        // 验证页面需要邮箱参数
        if (!email || !type) {
            this.showRedirectMessage('验证页面参数错误');
            setTimeout(() => {
                if (type === 'register') {
                    window.location.href = 'register.html';
                } else {
                    window.location.href = 'login.html';
                }
            }, 2000);
        }
    }

    // 初始化用户界面
    initUserInterface() {
        const user = this.getCurrentUser();
        console.log('🔄 初始化用户界面，当前用户:', user?.email || user?.phone || '未登录');
        
        // 添加页面加载后的强制清理
        setTimeout(() => {
            this.forceCleanupLoginStatus();
        }, 100);
        
        if (user) {
            this.updateUserDisplay(user);
            this.displayUserStatus(user); // 确保调用状态显示函数
            this.setupLogoutButton();
            this.setupUserDropdown();
        } else {
            // 清理用户界面
            this.updateUserDisplay(null);
            this.displayUserStatus({ is_guest: false }); // 传入非游客用户来隐藏状态
        }
    }

    // 更新用户显示
    updateUserDisplay(user) {
        // 控制用户菜单和登录链接的显示
        const userMenuContainer = document.getElementById('user-menu-container');
        const authLinks = document.getElementById('auth-links');
        
        if (user) {
            // 已登录，显示用户菜单，隐藏登录链接
            if (userMenuContainer) userMenuContainer.style.display = 'block';
            if (authLinks) authLinks.style.display = 'none';
        } else {
            // 未登录，隐藏用户菜单，显示登录链接
            if (userMenuContainer) userMenuContainer.style.display = 'none';
            if (authLinks) authLinks.style.display = 'flex';
            return;
        }

        // 更新用户名显示
        const userElements = document.querySelectorAll('[data-user-display]');
        userElements.forEach(element => {
            if (user.is_guest) {
                element.textContent = '游客模式';
                element.title = '当前使用游客模式，数据仅保存在本地';
                element.classList.remove('hidden');
            } else {
                // 优先使用用户设置的显示名称
                const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
                const displayName = userProfile.display_name || user.display_name || user.email || user.phone || '用户';
                
                element.textContent = displayName;
                element.title = `${user.email || user.phone}`;
                element.classList.remove('hidden');
            }
        });

        // 更新用户头像
        const avatarElements = document.querySelectorAll('[data-user-avatar]');
        avatarElements.forEach(element => {
            if (user.is_guest) {
                element.innerHTML = '<i class="fas fa-user-secret"></i>';
                element.className = 'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer bg-gray-200 text-gray-600';
            } else {
                // 检查是否有自定义头像
                const savedAvatar = localStorage.getItem('user_avatar');
                if (savedAvatar) {
                    element.innerHTML = `<img src="${savedAvatar}" alt="用户头像" class="w-full h-full rounded-full object-cover">`;
                } else {
                    element.innerHTML = '<i class="fas fa-user-circle"></i>';
                }
                element.className = 'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer bg-indigo-200 text-indigo-600';
            }
        });
    }

    // 设置退出登录按钮和用户菜单
    setupLogoutButton() {
        // 设置专门的退出登录按钮
        const logoutButtons = document.querySelectorAll('[data-logout-btn], #dropdown-logout');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // 设置用户下拉菜单
        this.setupUserDropdown();
    }

    // 设置用户下拉菜单
    setupUserDropdown() {
        const userMenuButton = document.getElementById('user-menu-button');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (!userMenuButton || !userDropdown) return;

        // 点击用户头像显示/隐藏菜单
        userMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isHidden = userDropdown.classList.contains('hidden');
            if (isHidden) {
                userDropdown.classList.remove('hidden');
                userMenuButton.setAttribute('aria-expanded', 'true');
            } else {
                userDropdown.classList.add('hidden');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });

        // 点击页面其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });

        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                userDropdown.classList.add('hidden');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 处理退出登录
    handleLogout() {
        const user = this.getCurrentUser();
        
        // 清除认证数据
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_mode');
        localStorage.removeItem('remember_login');

        // 如果是游客模式，询问是否保留数据
        if (user && user.is_guest) {
            const keepData = confirm('是否保留游客模式下的数据？\n点击"确定"保留数据，点击"取消"清除所有数据');
            if (!keepData) {
                this.clearGuestData();
            }
        }

        this.showRedirectMessage('已退出登录');
        
        setTimeout(() => {
            window.location.href = this.currentPath.includes('/auth/') ? 'login.html' : 'auth/login.html';
        }, 1500);
    }

    // 清除游客数据
    clearGuestData() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('events_') || 
                key.startsWith('categories_') || 
                key.startsWith('tags_') ||
                key.startsWith('weekly_reports_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // 显示用户状态
    displayUserStatus(user) {
        const statusElements = document.querySelectorAll('[data-user-status]');
        console.log(`🔍 找到 ${statusElements.length} 个用户状态元素`);
        
        statusElements.forEach((element, index) => {
            if (user.is_guest) {
                // 游客模式显示警告提示
                element.innerHTML = `
                    <div class="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        游客模式：数据仅保存在本地
                    </div>
                `;
                element.style.display = 'block';
                console.log(`✅ 状态元素 [${index}] 显示游客模式提示`);
            } else {
                // 正常登录用户完全隐藏状态信息
                element.innerHTML = '';
                element.style.display = 'none';
                console.log(`✅ 状态元素 [${index}] 已隐藏正常用户状态`);
            }
        });
        
        // 强制清理所有可能的状态显示元素
        console.log('🧹 开始强力清理所有可能的登录状态显示');
        
        // 清理绿色文本的状态显示
        const greenTexts = document.querySelectorAll('.text-green-600, .text-green-700, .text-green-800');
        greenTexts.forEach((el, index) => {
            if (el.textContent && (el.textContent.includes('已登录') || el.textContent.includes('ziyunweier') || el.textContent.includes('@gmail.com'))) {
                el.style.display = 'none';
                el.innerHTML = '';
                console.log(`🧹 清理了绿色文本状态显示 [${index}]:`, el.textContent);
            }
        });
        
        // 清理绿色背景的状态显示
        const greenBgs = document.querySelectorAll('.bg-green-50, .bg-green-100, .bg-green-200');
        greenBgs.forEach((el, index) => {
            if (el.textContent && (el.textContent.includes('已登录') || el.textContent.includes('@'))) {
                el.style.display = 'none';
                el.innerHTML = '';
                console.log(`🧹 清理了绿色背景状态显示 [${index}]:`, el.textContent);
            }
        });
        
        // 清理任何包含"已登录"文本的元素
        const allElements = document.querySelectorAll('*');
        allElements.forEach((el, index) => {
            if (el.textContent && el.textContent.includes('已登录') && el.textContent.includes('@')) {
                console.log(`🔍 发现包含登录状态的元素 [${index}]:`, el.textContent, el.className);
                el.style.display = 'none';
                el.innerHTML = '';
                console.log(`🧹 强制清理了状态元素 [${index}]`);
            }
        });
        
        console.log('✅ 强力清理完成');
    }

    // 监听认证状态变化
    watchAuthState() {
        // 监听localStorage变化
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_user' || e.key === 'auth_token' || e.key === 'auth_mode') {
                this.checkPageAccess();
                this.initUserInterface();
            }
            // 监听头像变化
            if (e.key === 'user_avatar') {
                this.handleAvatarUpdate();
            }
        });

        // 监听自定义头像更新事件
        window.addEventListener('avatarUpdated', (e) => {
            this.handleAvatarUpdate();
        });

        // 定期检查令牌有效性（每5分钟）
        setInterval(() => {
            this.validateAuthState();
        }, 5 * 60 * 1000);
    }

    // 处理头像更新
    handleAvatarUpdate() {
        console.log('🔄 AuthGuard检测到头像更新，正在同步...');
        const user = this.getCurrentUser();
        if (user) {
            console.log('👤 当前用户:', user.email || user.phone || '游客');
            this.updateUserDisplay(user);
            console.log('✅ AuthGuard头像同步完成');
            
            // 额外确保头像元素被正确更新
            const savedAvatar = localStorage.getItem('user_avatar');
            if (savedAvatar) {
                const avatarElements = document.querySelectorAll('[data-user-avatar]');
                console.log(`🔍 AuthGuard找到 ${avatarElements.length} 个头像元素需要更新`);
                
                avatarElements.forEach((element, index) => {
                    element.innerHTML = `<img src="${savedAvatar}" alt="用户头像" class="w-full h-full rounded-full object-cover">`;
                    console.log(`✅ AuthGuard更新头像元素 [${index}]`);
                });
            }
        } else {
            console.warn('⚠️ AuthGuard: getCurrentUser返回空值，无法同步头像');
        }
    }

    // 验证认证状态
    async validateAuthState() {
        const token = localStorage.getItem('auth_token');
        const user = this.getCurrentUser();

        if (!user) return;

        // 游客模式不需要验证令牌
        if (user.is_guest) return;

        if (token && this.authSystem) {
            const isValid = await this.authSystem.validateToken(token);
            if (!isValid) {
                this.handleAuthExpired();
            }
        }
    }

    // 处理认证过期
    handleAuthExpired() {
        this.showRedirectMessage('登录已过期，请重新登录');
        
        // 清除认证数据
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_mode');

        setTimeout(() => {
            this.redirectToLogin();
        }, 2000);
    }

    // 显示重定向消息
    showRedirectMessage(message) {
        // 创建临时提示元素
        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // 3秒后移除提示
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }

    // 添加登录链接到页面
    addLoginPrompt() {
        if (this.isPublicPage()) return;

        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'fixed top-0 left-0 w-full bg-yellow-50 border-b border-yellow-200 p-4 z-40';
        loginPrompt.innerHTML = `
            <div class="container mx-auto flex items-center justify-between">
                <div class="flex items-center text-yellow-800">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <span>您还未登录，部分功能可能受限</span>
                </div>
                <div class="flex space-x-2">
                    <a href="auth/login.html" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm">
                        登录
                    </a>
                    <a href="auth/register.html" class="bg-transparent border border-yellow-600 text-yellow-600 px-4 py-2 rounded hover:bg-yellow-600 hover:text-white text-sm">
                        注册
                    </a>
                </div>
            </div>
        `;

        document.body.insertBefore(loginPrompt, document.body.firstChild);
    }

    // 检查特定权限
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // 游客模式有基本权限但无高级权限
        if (user.is_guest) {
            const guestPermissions = ['read', 'create', 'edit_own'];
            return guestPermissions.includes(permission);
        }

        // 注册用户有所有基本权限
        const userPermissions = ['read', 'create', 'edit_own', 'delete_own', 'export'];
        return userPermissions.includes(permission);
    }

    // 权限检查装饰器
    requireAuth(callback) {
        return (...args) => {
            if (this.isUserLoggedIn()) {
                return callback.apply(this, args);
            } else {
                this.showRedirectMessage('此操作需要登录');
                this.redirectToLogin();
            }
        };
    }

    // 权限检查装饰器（特定权限）
    requirePermission(permission, callback) {
        return (...args) => {
            if (this.hasPermission(permission)) {
                return callback.apply(this, args);
            } else {
                this.showRedirectMessage('您没有执行此操作的权限');
            }
        };
    }

    // 强制清理登录状态显示
    forceCleanupLoginStatus() {
        console.log('🧹 执行强制登录状态清理');
        
        // 查找所有可能包含登录状态的元素
        const selectors = [
            '.text-green-600', '.text-green-700', '.text-green-800',
            '.bg-green-50', '.bg-green-100', '.bg-green-200',
            '[class*="green"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                if (el.textContent && (
                    el.textContent.includes('已登录') || 
                    el.textContent.includes('ziyunweier') || 
                    el.textContent.includes('@gmail.com') ||
                    el.textContent.match(/已登录.*@.*\.com/)
                )) {
                    console.log(`🔍 发现需要清理的元素 ${selector}[${index}]:`, el.textContent);
                    el.style.display = 'none';
                    el.innerHTML = '';
                    console.log(`🧹 已清理元素 ${selector}[${index}]`);
                }
            });
        });
        
        // 清理所有侧边栏中的用户状态区域
        const sidebarStatusAreas = document.querySelectorAll('.px-6.py-3.border-b, .border-b.border-gray-200');
        sidebarStatusAreas.forEach((area, index) => {
            const statusDiv = area.querySelector('[data-user-status]');
            if (statusDiv && !statusDiv.style.display) {
                statusDiv.style.display = 'none';
                console.log(`🧹 强制隐藏侧边栏状态区域 [${index}]`);
            }
        });
        
        console.log('✅ 强制清理完成');
    }
}

// 页面加载完成后初始化认证守卫
document.addEventListener('DOMContentLoaded', function() {
    // 确保在AuthSystem加载后初始化
    if (window.AuthSystem) {
        window.authGuard = new AuthGuard();
    } else {
        // 等待AuthSystem加载
        const checkAuthSystem = setInterval(() => {
            if (window.AuthSystem) {
                window.authGuard = new AuthGuard();
                clearInterval(checkAuthSystem);
            }
        }, 100);
    }
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthGuard;
} else {
    window.AuthGuard = AuthGuard;
} 