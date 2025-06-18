// 组件加载函数
document.addEventListener('DOMContentLoaded', function() {
    // 定义所有可用的组件模板
    const componentTemplates = {
        header: `<!-- 顶部导航栏组件 -->
<header class="bg-white shadow-sm">
    <div class="flex items-center justify-between p-4">
        <button class="md:hidden text-gray-600">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="flex items-center">
            <div class="relative">
                <input type="text" placeholder="搜索事件..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64">
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div class="ml-4 flex space-x-2">
                <button id="btn-new-plan" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                    <i class="fas fa-calendar-plus mr-2"></i>新建计划
                </button>
                <button id="btn-new-record" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                    <i class="fas fa-bookmark mr-2"></i>记录事项
                </button>
            </div>
        </div>
        <div class="flex items-center">
            <a href="settings.html#profile-section" class="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-medium hover:bg-indigo-300 transition-colors cursor-pointer" title="个人设置">
                <i class="fas fa-user-circle"></i>
            </a>
        </div>
    </div>
</header>`,
        // 添加新的包含弹框的头部组件模板
        headerWithModals: `<!-- 包含弹框的头部组件 -->
<!-- 顶部导航栏组件，包含弹框 -->
<header class="bg-white shadow-sm">
    <div class="flex items-center justify-between p-4">
        <button class="md:hidden text-gray-600">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="flex items-center">
            <div class="relative">
                <input type="text" placeholder="搜索事件..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64">
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div class="ml-4 flex space-x-2">
                <button id="btn-new-plan" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                    <i class="fas fa-calendar-plus mr-2"></i>新建计划
                </button>
                <button id="btn-new-record" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                    <i class="fas fa-bookmark mr-2"></i>记录事项
                </button>
            </div>
        </div>
        <div class="flex items-center">
            <a href="settings.html#profile-section" class="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-medium hover:bg-indigo-300 transition-colors cursor-pointer" title="个人设置">
                <i class="fas fa-user-circle"></i>
            </a>
        </div>
    </div>
</header>

<!-- 弹出窗口 - 新建计划 -->
<div id="modal-new-plan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">新建计划</h2>
            <button id="close-plan-modal" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="new-plan-form">
                <!-- 计划标题 -->
                <div class="mb-4">
                    <label for="plan-title" class="block text-gray-700 font-medium mb-2">计划标题</label>
                    <input type="text" id="plan-title" name="title" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        placeholder="输入计划名称" required>
                </div>

                <!-- 计划类型 -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">计划类型</label>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-work" class="mr-2" value="work" checked>
                            <label for="type-work" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                工作职业
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-study" class="mr-2" value="study">
                            <label for="type-study" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                学习成长
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-exp" class="mr-2" value="experience">
                            <label for="type-exp" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                体验突破
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-leisure" class="mr-2" value="leisure">
                            <label for="type-leisure" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                休闲放松
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-family" class="mr-2" value="family">
                            <label for="type-family" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                家庭生活
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-social" class="mr-2" value="social">
                            <label for="type-social" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                人际社群
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 标签选择 -->
                <div class="mb-6" style="display: block !important; visibility: visible !important;">
                    <label class="block text-gray-700 font-medium mb-2">选择标签</label>
                    <div id="plan-tag-selector" class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]" style="display: block !important; visibility: visible !important;">
                        <p class="text-gray-500 text-center">标签选择器将在这里显示</p>
                    </div>
                </div>

                <!-- 计划描述 -->
                <div class="mb-4">
                    <label for="plan-desc" class="block text-gray-700 font-medium mb-2">计划详情描述</label>
                    <textarea id="plan-desc" name="description" rows="3" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        placeholder="输入计划的详细描述"></textarea>
                </div>

                <!-- 截止日期 -->
                <div class="mb-4">
                    <label for="plan-due-date" class="block text-gray-700 font-medium mb-2">截止日期</label>
                    <input type="date" id="plan-due-date" name="due-date" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                </div>

                <!-- 优先级 -->
                <div class="mb-6">
                    <label class="block text-gray-700 font-medium mb-2">优先级</label>
                    <div class="flex space-x-4">
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-low" class="mr-2" value="low">
                            <label for="priority-low" class="text-green-600">低</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-medium" class="mr-2" value="medium" checked>
                            <label for="priority-medium" class="text-yellow-600">中</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-high" class="mr-2" value="high">
                            <label for="priority-high" class="text-red-600">高</label>
                        </div>
                    </div>
                </div>
                
                <!-- 按钮 -->
                <div class="flex justify-end space-x-3">
                    <button type="button" id="cancel-plan-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        取消
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        保存计划
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- 弹出窗口 - 记录事项 -->
<div id="modal-new-record" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">记录事项</h2>
            <button id="close-record-modal" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="new-record-form">
                <!-- 事项标题 -->
                <div class="mb-4">
                    <label for="record-title" class="block text-gray-700 font-medium mb-2">事项标题</label>
                    <input type="text" id="record-title" name="title" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                        placeholder="输入事项名称" required>
                </div>

                <!-- 事项分类 -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">事项分类</label>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-study" class="mr-2" value="study" checked>
                            <label for="rec-type-study" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                学习成长
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-exp" class="mr-2" value="experience">
                            <label for="rec-type-exp" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                体验突破
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-leisure" class="mr-2" value="leisure">
                            <label for="rec-type-leisure" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                休闲放松
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-family" class="mr-2" value="family">
                            <label for="rec-type-family" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                家庭生活
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-work" class="mr-2" value="work">
                            <label for="rec-type-work" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                工作职业
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-social" class="mr-2" value="social">
                            <label for="rec-type-social" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                人际社群
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 标签选择 -->
                <div class="mb-4" style="display: block !important; visibility: visible !important;">
                    <label class="block text-gray-700 font-medium mb-2">选择标签</label>
                    <div id="record-tag-selector" class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]" style="display: block !important; visibility: visible !important;">
                        <p class="text-gray-500 text-center">标签选择器将在这里显示</p>
                    </div>
                </div>

                <!-- 完成日期 -->
                <div class="mb-4">
                    <label for="record-date" class="block text-gray-700 font-medium mb-2">完成日期</label>
                    <input type="date" id="record-date" name="completion-date" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" required>
                </div>

                <!-- 事项描述 -->
                <div class="mb-4">
                    <label for="record-desc" class="block text-gray-700 font-medium mb-2">事项详情</label>
                    <textarea id="record-desc" name="description" rows="3" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                        placeholder="输入事项的详细描述或感想"></textarea>
                </div>

                <!-- 按钮 -->
                <div class="flex justify-end space-x-3">
                    <button type="button" id="cancel-record-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        取消
                    </button>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        保存记录
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>`
    };
    
    // 加载头部组件
    loadComponentInline('headerWithModals', '#header-container');
    
    // 添加成功提示
    console.log('组件系统已初始化');
});

// 使用内联方式加载组件的函数
function loadComponentInline(componentName, targetSelector) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.error(`目标元素 ${targetSelector} 不存在`);
        return;
    }
    
    console.log(`正在加载组件: ${componentName}`);
    
    // 添加加载状态指示器
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'absolute top-2 right-2 text-xs text-gray-500';
    loadingIndicator.textContent = '正在加载组件...';
    loadingIndicator.id = 'component-loading-indicator';
    targetElement.style.position = 'relative';
    targetElement.appendChild(loadingIndicator);
    
    try {
        // 从模板对象中获取组件HTML
        const componentTemplates = window.componentTemplates || {
            header: `<!-- 顶部导航栏组件 -->
<header class="bg-white shadow-sm">
    <div class="flex items-center justify-between p-4">
        <button class="md:hidden text-gray-600">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="flex items-center">
            <div class="relative">
                <input type="text" placeholder="搜索事件..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64">
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div class="ml-4 flex space-x-2">
                <button id="btn-new-plan" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                    <i class="fas fa-calendar-plus mr-2"></i>新建计划
                </button>
                <button id="btn-new-record" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                    <i class="fas fa-bookmark mr-2"></i>记录事项
                </button>
            </div>
        </div>
        <div class="flex items-center">
            <a href="settings.html#profile-section" class="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-medium hover:bg-indigo-300 transition-colors cursor-pointer" title="个人设置">
                <i class="fas fa-user-circle"></i>
            </a>
        </div>
    </div>
</header>`,
            headerWithModals: `<!-- 包含弹框的头部组件 -->
<!-- 顶部导航栏组件，包含弹框 -->
<header class="bg-white shadow-sm">
    <div class="flex items-center justify-between p-4">
        <button class="md:hidden text-gray-600">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <div class="flex items-center">
            <div class="relative">
                <input type="text" placeholder="搜索事件..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64">
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <div class="ml-4 flex space-x-2">
                <button id="btn-new-plan" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                    <i class="fas fa-calendar-plus mr-2"></i>新建计划
                </button>
                <button id="btn-new-record" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center">
                    <i class="fas fa-bookmark mr-2"></i>记录事项
                </button>
            </div>
        </div>
        <div class="flex items-center">
            <a href="settings.html#profile-section" class="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-medium hover:bg-indigo-300 transition-colors cursor-pointer" title="个人设置">
                <i class="fas fa-user-circle"></i>
            </a>
        </div>
    </div>
</header>

<!-- 弹出窗口 - 新建计划 -->
<div id="modal-new-plan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">新建计划</h2>
            <button id="close-plan-modal" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="new-plan-form">
                <!-- 计划标题 -->
                <div class="mb-4">
                    <label for="plan-title" class="block text-gray-700 font-medium mb-2">计划标题</label>
                    <input type="text" id="plan-title" name="title" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        placeholder="输入计划名称" required>
                </div>

                <!-- 计划类型 -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">计划类型</label>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-work" class="mr-2" value="work" checked>
                            <label for="type-work" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                工作职业
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-study" class="mr-2" value="study">
                            <label for="type-study" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                学习成长
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-exp" class="mr-2" value="experience">
                            <label for="type-exp" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                体验突破
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-leisure" class="mr-2" value="leisure">
                            <label for="type-leisure" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                休闲放松
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-family" class="mr-2" value="family">
                            <label for="type-family" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                家庭生活
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer plan-type-option">
                            <input type="radio" name="plan-type" id="type-social" class="mr-2" value="social">
                            <label for="type-social" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                人际社群
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 标签选择 -->
                <div class="mb-6" style="display: block !important; visibility: visible !important;">
                    <label class="block text-gray-700 font-medium mb-2">选择标签</label>
                    <div id="plan-tag-selector" class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]" style="display: block !important; visibility: visible !important;">
                        <p class="text-gray-500 text-center">标签选择器将在这里显示</p>
                    </div>
                </div>

                <!-- 计划描述 -->
                <div class="mb-4">
                    <label for="plan-desc" class="block text-gray-700 font-medium mb-2">计划详情描述</label>
                    <textarea id="plan-desc" name="description" rows="3" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
                        placeholder="输入计划的详细描述"></textarea>
                </div>

                <!-- 截止日期 -->
                <div class="mb-4">
                    <label for="plan-due-date" class="block text-gray-700 font-medium mb-2">截止日期</label>
                    <input type="date" id="plan-due-date" name="due-date" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                </div>

                <!-- 优先级 -->
                <div class="mb-6">
                    <label class="block text-gray-700 font-medium mb-2">优先级</label>
                    <div class="flex space-x-4">
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-low" class="mr-2" value="low">
                            <label for="priority-low" class="text-green-600">低</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-medium" class="mr-2" value="medium" checked>
                            <label for="priority-medium" class="text-yellow-600">中</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" name="priority" id="priority-high" class="mr-2" value="high">
                            <label for="priority-high" class="text-red-600">高</label>
                        </div>
                    </div>
                </div>
                
                <!-- 按钮 -->
                <div class="flex justify-end space-x-3">
                    <button type="button" id="cancel-plan-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        取消
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        保存计划
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- 弹出窗口 - 记录事项 -->
<div id="modal-new-record" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center p-6 border-b">
            <h2 class="text-2xl font-bold text-gray-800">记录事项</h2>
            <button id="close-record-modal" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">
            <form id="new-record-form">
                <!-- 事项标题 -->
                <div class="mb-4">
                    <label for="record-title" class="block text-gray-700 font-medium mb-2">事项标题</label>
                    <input type="text" id="record-title" name="title" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                        placeholder="输入事项名称" required>
                </div>

                <!-- 事项分类 -->
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">事项分类</label>
                    <div class="grid grid-cols-3 gap-3">
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-study" class="mr-2" value="study" checked>
                            <label for="rec-type-study" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                学习成长
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-exp" class="mr-2" value="experience">
                            <label for="rec-type-exp" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                体验突破
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-leisure" class="mr-2" value="leisure">
                            <label for="rec-type-leisure" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                休闲放松
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-family" class="mr-2" value="family">
                            <label for="rec-type-family" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                家庭生活
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-work" class="mr-2" value="work">
                            <label for="rec-type-work" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                工作职业
                            </label>
                        </div>
                        <div class="flex items-center p-3 border rounded-lg hover:bg-purple-50 cursor-pointer record-type-option">
                            <input type="radio" name="record-type" id="rec-type-social" class="mr-2" value="social">
                            <label for="rec-type-social" class="flex items-center cursor-pointer">
                                <span class="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                                人际社群
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 标签选择 -->
                <div class="mb-4" style="display: block !important; visibility: visible !important;">
                    <label class="block text-gray-700 font-medium mb-2">选择标签</label>
                    <div id="record-tag-selector" class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[100px]" style="display: block !important; visibility: visible !important;">
                        <p class="text-gray-500 text-center">标签选择器将在这里显示</p>
                    </div>
                </div>

                <!-- 完成日期 -->
                <div class="mb-4">
                    <label for="record-date" class="block text-gray-700 font-medium mb-2">完成日期</label>
                    <input type="date" id="record-date" name="completion-date" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" required>
                </div>

                <!-- 事项描述 -->
                <div class="mb-4">
                    <label for="record-desc" class="block text-gray-700 font-medium mb-2">事项详情</label>
                    <textarea id="record-desc" name="description" rows="3" 
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" 
                        placeholder="输入事项的详细描述或感想"></textarea>
                </div>

                <!-- 按钮 -->
                <div class="flex justify-end space-x-3">
                    <button type="button" id="cancel-record-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        取消
                    </button>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        保存记录
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>`
        };
        
        const html = componentTemplates[componentName];
        
        if (!html) {
            throw new Error(`组件 ${componentName} 模板不存在`);
        }
        
        // 清除加载指示器
        const indicator = document.getElementById('component-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // 插入组件HTML
        targetElement.innerHTML = html;
        console.log(`组件 ${componentName} 加载成功`);
        
        // 触发组件加载完成事件
        const event = new CustomEvent('component-loaded', { 
            detail: { componentName: componentName } 
        });
        document.dispatchEvent(event);
        
        // 显示成功提示
        showSuccessIndicator(targetElement, componentName);
    } catch (error) {
        console.error(`加载组件 ${componentName} 时发生错误:`, error);
        
        // 移除加载指示器
        const indicator = document.getElementById('component-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // 显示失败提示，但不替换原有内容
        showFailedIndicator(targetElement, componentName);
    }
}

// 显示成功提示
function showSuccessIndicator(targetElement, componentName) {
    const successIndicator = document.createElement('div');
    successIndicator.className = 'absolute top-2 right-2 px-2 py-1 bg-green-50 text-green-600 text-xs rounded border border-green-200';
    successIndicator.textContent = `组件加载成功`;
    successIndicator.style.zIndex = '10';
    targetElement.style.position = 'relative';
    targetElement.appendChild(successIndicator);
    
    // 2秒后自动移除提示
    setTimeout(() => {
        successIndicator.style.opacity = '0';
        successIndicator.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            successIndicator.remove();
        }, 500);
    }, 2000);
}

// 显示加载失败的小提示
function showFailedIndicator(targetElement, componentName) {
    const failIndicator = document.createElement('div');
    failIndicator.className = 'absolute top-2 right-2 px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200';
    failIndicator.textContent = `组件加载失败，使用备用版本`;
    failIndicator.style.zIndex = '10';
    targetElement.style.position = 'relative';
    targetElement.appendChild(failIndicator);
    
    // 3秒后自动移除提示
    setTimeout(() => {
        failIndicator.style.opacity = '0';
        failIndicator.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            failIndicator.remove();
        }, 500);
    }, 3000);
}

/**
 * 标签选择器自动初始化管理器
 */
class TagSelectorAutoInitializer {
    constructor() {
        this.initializeEventListeners();
        this.planTagSelector = null;
        this.recordTagSelector = null;
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 监听组件加载完成事件
        document.addEventListener('component-loaded', (e) => {
            this.handleComponentLoaded(e.detail.componentName);
        });

        // 监听弹框显示事件
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-new-plan' || e.target.closest('#btn-new-plan')) {
                setTimeout(() => this.initializePlanTagSelector(), 100);
            }
            if (e.target.id === 'btn-new-record' || e.target.closest('#btn-new-record')) {
                setTimeout(() => this.initializeRecordTagSelector(), 100);
            }
        });

        // 监听弹框打开事件（通过MutationObserver）
        this.observeModalChanges();
    }

    /**
     * 处理组件加载完成事件
     */
    handleComponentLoaded(componentName) {
        console.log(`组件加载完成: ${componentName}`);
        
        // 延迟初始化，确保DOM完全渲染
        setTimeout(() => {
            if (componentName === 'header-with-modals' || componentName === 'modals') {
                this.tryInitializeTagSelectors();
            }
        }, 200);
    }

    /**
     * 监听弹框变化
     */
    observeModalChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    // 检查计划弹框是否显示
                    if (target.id === 'modal-new-plan' && !target.classList.contains('hidden')) {
                        this.initializePlanTagSelector();
                    }
                    
                    // 检查记录弹框是否显示
                    if (target.id === 'modal-new-record' && !target.classList.contains('hidden')) {
                        this.initializeRecordTagSelector();
                    }
                }
            });
        });

        // 观察现有的弹框
        const planModal = document.getElementById('modal-new-plan');
        const recordModal = document.getElementById('modal-new-record');
        
        if (planModal) observer.observe(planModal, { attributes: true });
        if (recordModal) observer.observe(recordModal, { attributes: true });
        
        // 观察整个文档，以防弹框是动态添加的
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id']
        });
    }

    /**
     * 尝试初始化所有标签选择器
     */
    tryInitializeTagSelectors() {
        this.initializePlanTagSelector();
        this.initializeRecordTagSelector();
    }

    /**
     * 初始化计划标签选择器
     */
    initializePlanTagSelector() {
        const container = document.getElementById('plan-tag-selector');
        if (!container) {
            console.log('⏳ plan-tag-selector 容器未找到，稍后重试...');
            return;
        }

        // 检查是否已经初始化
        if (this.planTagSelector && container.querySelector('.tag-selector')) {
            console.log('✅ 计划标签选择器已存在，跳过初始化');
            return;
        }

        // 检查依赖
        if (!this.checkDependencies()) {
            console.log('⏳ 标签选择器依赖未就绪，稍后重试...');
            setTimeout(() => this.initializePlanTagSelector(), 500);
            return;
        }

        try {
            console.log('🚀 开始初始化计划标签选择器...');
            
            this.planTagSelector = new TagSelector('plan-tag-selector', {
                scope: 'plan',
                showSearch: false,
                showCategories: false,
                maxSelection: 5
            });
            
            console.log('✅ 计划标签选择器初始化成功');
            
            // 添加到全局，方便其他代码访问
            window.planTagSelector = this.planTagSelector;
            
        } catch (error) {
            console.error('❌ 计划标签选择器初始化失败:', error);
            this.showFallbackMessage('plan-tag-selector', '标签选择器初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化记录标签选择器
     */
    initializeRecordTagSelector() {
        const container = document.getElementById('record-tag-selector');
        if (!container) {
            console.log('⏳ record-tag-selector 容器未找到，稍后重试...');
            return;
        }

        // 检查是否已经初始化
        if (this.recordTagSelector && container.querySelector('.tag-selector')) {
            console.log('✅ 记录标签选择器已存在，跳过初始化');
            return;
        }

        // 检查依赖
        if (!this.checkDependencies()) {
            console.log('⏳ 标签选择器依赖未就绪，稍后重试...');
            setTimeout(() => this.initializeRecordTagSelector(), 500);
            return;
        }

        try {
            console.log('🚀 开始初始化记录标签选择器...');
            
            this.recordTagSelector = new TagSelector('record-tag-selector', {
                scope: 'event',
                showSearch: false,
                showCategories: false,
                maxSelection: 5
            });
            
            console.log('✅ 记录标签选择器初始化成功');
            
            // 添加到全局，方便其他代码访问
            window.recordTagSelector = this.recordTagSelector;
            
        } catch (error) {
            console.error('❌ 记录标签选择器初始化失败:', error);
            this.showFallbackMessage('record-tag-selector', '标签选择器初始化失败，请刷新页面重试');
        }
    }

    /**
     * 检查必要的依赖是否已加载
     */
    checkDependencies() {
        const hasTagSelector = typeof TagSelector !== 'undefined';
        const hasTagsManager = window.tagsManager && typeof window.tagsManager.getTags === 'function';
        
        if (!hasTagSelector) {
            console.log('❌ TagSelector 类未加载');
            return false;
        }
        
        if (!hasTagsManager) {
            console.log('❌ TagsManager 未初始化');
            // 尝试初始化 TagsManager
            if (typeof TagsManager !== 'undefined') {
                window.tagsManager = new TagsManager();
                console.log('✅ TagsManager 自动初始化成功');
                return true;
            }
            return false;
        }
        
        return true;
    }

    /**
     * 显示降级消息
     */
    showFallbackMessage(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mb-2"></i>
                    <p class="text-sm">${message}</p>
                    <button onclick="location.reload()" class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                        刷新页面
                    </button>
                </div>
            `;
        }
    }
}

// 自动启动标签选择器初始化管理器
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 启动标签选择器自动初始化管理器...');
    window.tagSelectorAutoInitializer = new TagSelectorAutoInitializer();
});

// 兼容性：如果页面已经加载完成，立即启动
if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
} else {
    // DOM已经加载完成，立即启动
    console.log('🎯 页面已加载，立即启动标签选择器自动初始化管理器...');
    window.tagSelectorAutoInitializer = new TagSelectorAutoInitializer();
} 