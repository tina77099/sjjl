/**
 * 认证配置文件
 * 管理OAuth配置和安全设置
 */

class AuthConfig {
    constructor() {
        // OAuth配置 - 客户端ID可以公开，密钥需要在服务器端处理
        this.GOOGLE_CLIENT_ID = '446464935711-883hos046jodoqh8kvn0g0cak1t0k3id.apps.googleusercontent.com';
        
        // 重定向URI配置
        this.REDIRECT_URI = this.getRedirectUri();
        
        // OAuth作用域 - 我们只需要基本的用户信息
        this.OAUTH_SCOPES = [
            'openid',
            'email',
            'profile'
        ];
        
        // 本地存储键名
        this.STORAGE_KEYS = {
            ACCESS_TOKEN: 'auth_access_token',
            USER_INFO: 'auth_user_info',
            LOGIN_STATE: 'auth_login_state',
            USER_DATA_PREFIX: 'user_data_'
        };
        
        // 认证状态
        this.AUTH_STATES = {
            LOGGED_OUT: 'logged_out',
            LOGGING_IN: 'logging_in', 
            LOGGED_IN: 'logged_in',
            ERROR: 'error'
        };
        
        // 调试模式
        this.DEBUG_MODE = true;
        
        // 初始化时验证配置
        this.validateConfiguration();
    }
    
    /**
     * 验证OAuth配置
     */
    validateConfiguration() {
        const issues = [];
        
        // 检查客户端ID
        if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
            issues.push('Google客户端ID未配置');
        }
        
        // 检查重定向URI
        if (!this.REDIRECT_URI) {
            issues.push('重定向URI未配置');
        }
        
        // 检查作用域
        if (!this.OAUTH_SCOPES || this.OAUTH_SCOPES.length === 0) {
            issues.push('OAuth作用域未配置');
        }
        
        if (issues.length > 0) {
            console.warn('OAuth配置问题:', issues);
            this.configurationIssues = issues;
        } else {
            console.log('OAuth配置验证通过');
            this.configurationIssues = [];
        }
        
        // 输出调试信息
        if (this.DEBUG_MODE) {
            this.logConfiguration();
        }
    }
    
    /**
     * 输出配置调试信息
     */
    logConfiguration() {
        console.group('OAuth配置调试信息');
        console.log('客户端ID:', this.GOOGLE_CLIENT_ID);
        console.log('重定向URI:', this.REDIRECT_URI);
        console.log('作用域:', this.OAUTH_SCOPES.join(', '));
        console.log('当前URL:', window.location.href);
        console.log('协议:', window.location.protocol);
        console.log('主机:', window.location.host);
        console.groupEnd();
    }
    
    /**
     * 根据当前环境确定重定向URI
     */
    getRedirectUri() {
        const currentHost = window.location.host;
        const protocol = window.location.protocol;
        const pathname = window.location.pathname;
        
        // 获取基础路径（去除文件名）
        const basePath = pathname.substring(0, pathname.lastIndexOf('/'));
        
        let redirectUri;
        
        // 开发环境
        if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
            redirectUri = `${protocol}//${currentHost}${basePath}/auth/callback.html`;
        } else {
            // 生产环境
            redirectUri = `${protocol}//${currentHost}${basePath}/auth/callback.html`;
        }
        
        if (this.DEBUG_MODE) {
            console.log('生成的重定向URI:', redirectUri);
        }
        
        return redirectUri;
    }
    
    /**
     * 获取OAuth授权URL
     */
    getAuthUrl() {
        // 检查配置是否有效
        if (this.configurationIssues && this.configurationIssues.length > 0) {
            throw new Error('OAuth配置存在问题: ' + this.configurationIssues.join(', '));
        }
        
        const state = this.generateState();
        
        const params = new URLSearchParams({
            client_id: this.GOOGLE_CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'code',
            scope: this.OAUTH_SCOPES.join(' '),
            access_type: 'offline',
            prompt: 'consent',
            state: state
        });
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        
        if (this.DEBUG_MODE) {
            console.group('OAuth授权URL构建');
            console.log('完整URL:', authUrl);
            console.log('参数详情:');
            for (const [key, value] of params.entries()) {
                console.log(`  ${key}:`, value);
            }
            console.groupEnd();
        }
        
        return authUrl;
    }
    
    /**
     * 生成随机状态码用于安全验证
     */
    generateState() {
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        localStorage.setItem('oauth_state', state);
        
        if (this.DEBUG_MODE) {
            console.log('生成OAuth状态码:', state);
        }
        
        return state;
    }
    
    /**
     * 验证OAuth状态码
     */
    validateState(receivedState) {
        const storedState = localStorage.getItem('oauth_state');
        localStorage.removeItem('oauth_state');
        
        const isValid = storedState === receivedState;
        
        if (this.DEBUG_MODE) {
            console.group('OAuth状态码验证');
            console.log('存储的状态码:', storedState);
            console.log('接收的状态码:', receivedState);
            console.log('验证结果:', isValid ? '通过' : '失败');
            console.groupEnd();
        }
        
        return isValid;
    }
    
    /**
     * 获取配置问题列表
     */
    getConfigurationIssues() {
        return this.configurationIssues || [];
    }
    
    /**
     * 检查配置是否有效
     */
    isConfigurationValid() {
        return !this.configurationIssues || this.configurationIssues.length === 0;
    }
    
    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            clientId: this.GOOGLE_CLIENT_ID,
            redirectUri: this.REDIRECT_URI,
            scopes: this.OAUTH_SCOPES,
            currentUrl: window.location.href,
            protocol: window.location.protocol,
            host: window.location.host,
            pathname: window.location.pathname,
            configurationIssues: this.configurationIssues,
            isValid: this.isConfigurationValid()
        };
    }
}

// 导出单例
window.AuthConfig = new AuthConfig(); 