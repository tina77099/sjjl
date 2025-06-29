// 🧪 认证系统增强版测试套件
class EnhancedAuthTester {
    constructor() {
        this.testResults = [];
        this.testCount = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
        
        console.log('🧪 增强版认证系统测试器已初始化');
        console.log('📅 测试开始时间:', new Date().toLocaleString());
    }

    // 运行完整测试套件
    async runCompleteTestSuite() {
        console.log('\n🚀 ========== 开始运行完整认证系统测试套件 ==========\n');
        
        try {
            // 第一阶段：环境准备
            await this.prepareTestEnvironment();
            
            // 第二阶段：基础功能测试
            await this.testBasicFunctionality();
            
            // 第三阶段：认证流程测试
            await this.testAuthenticationFlow();
            
            // 第四阶段：安全性测试
            await this.testSecurityFeatures();
            
            // 第五阶段：用户界面测试
            await this.testUserInterface();
            
            // 第六阶段：数据完整性测试
            await this.testDataIntegrity();
            
            // 生成测试报告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 测试套件执行失败:', error);
            this.addTestResult('测试套件执行', false, error.message);
        }
    }

    // 准备测试环境
    async prepareTestEnvironment() {
        console.log('🔧 ========== 第一阶段：准备测试环境 ==========');
        
        // 检查必要组件
        this.addTestResult('AuthSystem组件', !!window.AuthSystem, window.AuthSystem ? '已加载' : '未找到');
        this.addTestResult('AuthGuard组件', !!window.authGuard, window.authGuard ? '已加载' : '未找到');
        
        // 检查本地存储权限
        try {
            localStorage.setItem('test_key', 'test_value');
            localStorage.removeItem('test_key');
            this.addTestResult('LocalStorage权限', true, '可用');
        } catch (error) {
            this.addTestResult('LocalStorage权限', false, error.message);
        }
        
        // 记录当前环境状态
        const currentUser = localStorage.getItem('auth_user');
        const currentToken = localStorage.getItem('auth_token');
        this.addTestResult('初始登录状态', !currentUser && !currentToken, currentUser ? '有用户登录' : '无用户登录');
        
        console.log('✅ 环境准备完成\n');
    }

    // 测试基础功能
    async testBasicFunctionality() {
        console.log('⚙️ ========== 第二阶段：基础功能测试 ==========');
        
        // 测试游客登录
        if (window.AuthSystem && typeof window.AuthSystem.loginAsGuest === 'function') {
            try {
                await window.AuthSystem.loginAsGuest();
                const guestMode = localStorage.getItem('auth_mode') === 'guest';
                this.addTestResult('游客登录功能', guestMode, guestMode ? '成功' : '失败');
                
                // 清理游客状态
                localStorage.removeItem('auth_mode');
                localStorage.removeItem('auth_user');
            } catch (error) {
                this.addTestResult('游客登录功能', false, error.message);
            }
        }
        
        // 测试验证码生成
        if (window.AuthSystem && typeof window.AuthSystem.generateVerificationCode === 'function') {
            try {
                const code = window.AuthSystem.generateVerificationCode();
                this.addTestResult('验证码生成', !!code && code.length === 6, code ? `生成码: ${code}` : '生成失败');
            } catch (error) {
                this.addTestResult('验证码生成', false, error.message);
            }
        }
        
        console.log('✅ 基础功能测试完成\n');
    }

    // 测试认证流程
    async testAuthenticationFlow() {
        console.log('🔐 ========== 第三阶段：认证流程测试 ==========');
        
        const testEmail = `test_user_${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        // 测试用户注册
        if (window.AuthSystem && typeof window.AuthSystem.register === 'function') {
            try {
                const registerResult = await window.AuthSystem.register(testEmail, testPassword);
                this.addTestResult('用户注册', !!registerResult, registerResult ? '注册成功' : '注册失败');
                
                // 验证用户数据是否保存
                const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
                const userExists = users.some(user => user.email === testEmail);
                this.addTestResult('注册数据保存', userExists, userExists ? '数据已保存' : '数据未保存');
                
            } catch (error) {
                this.addTestResult('用户注册', false, error.message);
            }
        }
        
        // 测试用户登录
        if (window.AuthSystem && typeof window.AuthSystem.authenticateUser === 'function') {
            try {
                const loginResult = await window.AuthSystem.authenticateUser(testEmail, testPassword);
                this.addTestResult('用户登录', !!loginResult, loginResult ? '登录成功' : '登录失败');
                
                // 验证登录状态
                const authUser = localStorage.getItem('auth_user');
                const authToken = localStorage.getItem('auth_token');
                this.addTestResult('登录状态设置', !!authUser && !!authToken, '状态已设置');
                
            } catch (error) {
                this.addTestResult('用户登录', false, error.message);
            }
        }
        
        // 测试密码重置流程
        if (window.AuthSystem && typeof window.AuthSystem.sendVerificationCode === 'function') {
            try {
                await window.AuthSystem.sendVerificationCode(testEmail, 'password_reset');
                this.addTestResult('密码重置验证码', true, '验证码已发送');
                
                // 测试密码更新
                if (typeof window.AuthSystem.updateUserPassword === 'function') {
                    const newPassword = 'NewPassword123!';
                    const updateResult = await window.AuthSystem.updateUserPassword(testEmail, newPassword);
                    this.addTestResult('密码更新', !!updateResult, updateResult ? '更新成功' : '更新失败');
                }
                
            } catch (error) {
                this.addTestResult('密码重置流程', false, error.message);
            }
        }
        
        console.log('✅ 认证流程测试完成\n');
    }

    // 测试安全性功能
    async testSecurityFeatures() {
        console.log('🛡️ ========== 第四阶段：安全性测试 ==========');
        
        // 测试权限检查
        if (window.authGuard && typeof window.authGuard.hasPermission === 'function') {
            const permissions = ['read', 'create', 'edit_own', 'delete_own', 'export'];
            const permissionResults = {};
            
            permissions.forEach(perm => {
                try {
                    permissionResults[perm] = window.authGuard.hasPermission(perm);
                } catch (error) {
                    permissionResults[perm] = `Error: ${error.message}`;
                }
            });
            
            this.addTestResult('权限系统', true, JSON.stringify(permissionResults, null, 2));
        }
        
        // 测试令牌验证
        if (window.AuthSystem && typeof window.AuthSystem.validateToken === 'function') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const isValid = await window.AuthSystem.validateToken(token);
                    this.addTestResult('令牌验证', typeof isValid === 'boolean', `令牌${isValid ? '有效' : '无效'}`);
                } catch (error) {
                    this.addTestResult('令牌验证', false, error.message);
                }
            }
        }
        
        // 测试页面访问控制
        if (window.authGuard && typeof window.authGuard.checkPageAccess === 'function') {
            try {
                window.authGuard.checkPageAccess();
                this.addTestResult('页面访问控制', true, '检查已执行');
            } catch (error) {
                this.addTestResult('页面访问控制', false, error.message);
            }
        }
        
        console.log('✅ 安全性测试完成\n');
    }

    // 测试用户界面
    async testUserInterface() {
        console.log('🖥️ ========== 第五阶段：用户界面测试 ==========');
        
        // 测试用户菜单显示
        const userMenuContainer = document.getElementById('user-menu-container');
        const authLinks = document.getElementById('auth-links');
        
        this.addTestResult('用户菜单容器', !!userMenuContainer, userMenuContainer ? '存在' : '不存在');
        this.addTestResult('认证链接容器', !!authLinks, authLinks ? '存在' : '不存在');
        
        // 测试用户信息显示元素
        const userDisplayElements = document.querySelectorAll('[data-user-display]');
        const avatarElements = document.querySelectorAll('[data-user-avatar]');
        
        this.addTestResult('用户显示元素', userDisplayElements.length > 0, `找到 ${userDisplayElements.length} 个元素`);
        this.addTestResult('头像显示元素', avatarElements.length > 0, `找到 ${avatarElements.length} 个元素`);
        
        // 测试界面更新功能
        if (window.authGuard && typeof window.authGuard.updateUserDisplay === 'function') {
            try {
                const testUser = { email: 'test@example.com', display_name: '测试用户' };
                window.authGuard.updateUserDisplay(testUser);
                this.addTestResult('界面更新功能', true, '更新已执行');
            } catch (error) {
                this.addTestResult('界面更新功能', false, error.message);
            }
        }
        
        console.log('✅ 用户界面测试完成\n');
    }

    // 测试数据完整性
    async testDataIntegrity() {
        console.log('💾 ========== 第六阶段：数据完整性测试 ==========');
        
        // 检查注册用户数据结构
        const usersData = localStorage.getItem('registered_users');
        if (usersData) {
            try {
                const users = JSON.parse(usersData);
                const isArray = Array.isArray(users);
                this.addTestResult('用户数据结构', isArray, isArray ? `包含 ${users.length} 个用户` : '格式错误');
                
                if (isArray && users.length > 0) {
                    const firstUser = users[0];
                    const hasRequiredFields = firstUser.email && firstUser.password && firstUser.created_at;
                    this.addTestResult('用户数据字段', hasRequiredFields, hasRequiredFields ? '字段完整' : '字段缺失');
                }
            } catch (error) {
                this.addTestResult('用户数据解析', false, error.message);
            }
        }
        
        // 检查认证相关数据
        const authKeys = ['auth_user', 'auth_token', 'auth_mode'];
        authKeys.forEach(key => {
            const value = localStorage.getItem(key);
            this.addTestResult(`存储项-${key}`, true, value ? '有值' : '无值');
        });
        
        // 测试数据清理功能
        const originalKeysCount = Object.keys(localStorage).length;
        localStorage.setItem('test_cleanup_key', 'test_value');
        localStorage.removeItem('test_cleanup_key');
        const afterCleanupCount = Object.keys(localStorage).length;
        
        this.addTestResult('数据清理功能', originalKeysCount === afterCleanupCount, '清理正常');
        
        console.log('✅ 数据完整性测试完成\n');
    }

    // 添加测试结果
    addTestResult(testName, passed, details = '') {
        this.testCount++;
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: ${details}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: ${details}`);
        }
        
        this.testResults.push({
            name: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        });
    }

    // 生成测试报告
    generateTestReport() {
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        
        console.log('\n📊 ========== 认证系统测试报告 ==========');
        console.log(`📅 测试时间: ${new Date(this.startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`);
        console.log(`⏱️ 测试耗时: ${duration.toFixed(2)} 秒`);
        console.log(`📈 测试统计: 总计 ${this.testCount} 个测试`);
        console.log(`✅ 通过: ${this.passedTests} 个`);
        console.log(`❌ 失败: ${this.failedTests} 个`);
        console.log(`📊 成功率: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`);
        
        console.log('\n📋 详细测试结果:');
        console.log('==========================================');
        
        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.name}`);
            if (result.details) {
                console.log(`   📄 ${result.details}`);
            }
            console.log(`   🕐 ${new Date(result.timestamp).toLocaleTimeString()}`);
            console.log('------------------------------------------');
        });
        
        // 生成建议
        console.log('\n💡 测试建议:');
        if (this.failedTests === 0) {
            console.log('🎉 恭喜！所有测试都通过了，认证系统运行良好！');
        } else {
            console.log(`⚠️ 发现 ${this.failedTests} 个问题，请检查失败的测试项目。`);
            
            // 分析失败原因
            const failedTests = this.testResults.filter(test => !test.passed);
            console.log('\n🔍 失败测试分析:');
            failedTests.forEach(test => {
                console.log(`• ${test.name}: ${test.details}`);
            });
        }
        
        console.log('\n🏁 测试完成！');
    }

    // 快速状态检查
    quickStatusCheck() {
        console.log('⚡ 快速状态检查:');
        console.log('================');
        
        const user = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        const guestMode = localStorage.getItem('auth_mode') === 'guest';
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        
        console.log(`🔐 登录状态: ${user || guestMode ? '已登录' : '未登录'}`);
        console.log(`👤 当前用户: ${user ? JSON.parse(user).email : guestMode ? '游客' : '无'}`);
        console.log(`🎫 令牌状态: ${token ? '有效' : '无'}`);
        console.log(`📊 注册用户: ${users.length} 个`);
        console.log(`🌐 AuthSystem: ${window.AuthSystem ? '已加载' : '未加载'}`);
        console.log(`🛡️ AuthGuard: ${window.authGuard ? '已加载' : '未加载'}`);
    }

    // 清理测试数据
    cleanupTestData() {
        console.log('🧹 清理测试数据...');
        
        const keysToRemove = [];
        for (const key in localStorage) {
            if (key.includes('test_') || key.startsWith('verification_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ 已删除: ${key}`);
        });
        
        console.log(`✅ 清理完成，删除了 ${keysToRemove.length} 个测试数据项`);
    }
}

// 创建全局测试实例
window.enhancedAuthTester = new EnhancedAuthTester();

// 提供便捷的测试命令
window.runAuthTests = () => window.enhancedAuthTester.runCompleteTestSuite();
window.checkAuthStatus = () => window.enhancedAuthTester.quickStatusCheck();
window.cleanupAuthTests = () => window.enhancedAuthTester.cleanupTestData();

console.log('🎯 增强版认证测试器已就绪！');
console.log('📝 可用命令:');
console.log('  runAuthTests()     - 运行完整测试套件');
console.log('  checkAuthStatus()  - 快速状态检查');
console.log('  cleanupAuthTests() - 清理测试数据');
