// 周报功能核心脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('周报页面初始化...');
    initWeeklyReport();
});

// 初始化周报页面
function initWeeklyReport() {
    // 设置周选择器
    setupWeekSelector();
    
    // 加载当前周的报告
    loadWeeklyReport('current');
    
    // 设置按钮事件监听
    document.getElementById('generate-report').addEventListener('click', function() {
        const selectedWeek = document.getElementById('week-selector').value;
        loadWeeklyReport(selectedWeek);
    });
    
    document.getElementById('export-report').addEventListener('click', exportReport);
    document.getElementById('submit-feedback').addEventListener('click', submitFeedback);
    
    // 设置反思问题的交互功能
    setupReflectionInteractions();
}

// 设置周选择器
function setupWeekSelector() {
    // 添加最近4周的选项
    const weekSelector = document.getElementById('week-selector');
    weekSelector.addEventListener('change', function() {
        loadWeeklyReport(this.value);
    });
}

// 加载指定周的报告
function loadWeeklyReport(weekType) {
    console.log(`加载${weekType}周报告...`);
    
    // 获取指定周的日期范围
    const dateRange = getWeekDateRange(weekType);
    
    // 更新日期范围显示
    document.getElementById('report-date-range').textContent = 
        `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    
    // 获取该周的事件数据
    const events = getEventsInDateRange(dateRange.startDate, dateRange.endDate);
    
    // 更新统计数据
    updateStatistics(events, dateRange);
    
    // 生成分类总结
    generateCategorySummaries(events);
    
    // 生成MCC教练洞察
    generateCoachInsights(events, dateRange);
}

// 获取指定周的日期范围
function getWeekDateRange(weekType) {
    const today = new Date();
    let startDate, endDate;
    
    if (weekType === 'current') {
        startDate = getWeekStart(today);
    } else if (weekType === 'last') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        startDate = getWeekStart(lastWeek);
    } else {
        // 默认为本周
        startDate = getWeekStart(today);
    }
    
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return { startDate, endDate };
}

// 获取日期所在周的开始日期（周一）
function getWeekStart(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// 格式化日期为YYYY年MM月DD日
function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 获取日期范围内的事件
function getEventsInDateRange(startDate, endDate) {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    return allEvents.filter(event => {
        const eventDate = new Date(event.startTime || event.createdAt);
        return eventDate >= startDate && eventDate <= endDate;
    });
}

// 更新统计数据
function updateStatistics(events, dateRange) {
    // 简化版：仅更新基本统计数据
    document.getElementById('total-events').textContent = events.length;
    
    // 计算完成率
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const completionRate = events.length > 0 ? Math.round((completedEvents / events.length) * 100) : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    // 更新周概述
    document.getElementById('week-summary').textContent = 
        `本周您完成了${events.length}项事件，完成率为${completionRate}%。`;
}

// 生成分类总结
function generateCategorySummaries(events) {
    const summariesContainer = document.getElementById('category-summaries');
    summariesContainer.innerHTML = ''; // 清空现有内容
    
    // 按分类分组事件
    const categorizedEvents = {};
    events.forEach(event => {
        const category = event.category || 'uncategorized';
        if (!categorizedEvents[category]) {
            categorizedEvents[category] = [];
        }
        categorizedEvents[category].push(event);
    });
    
    // 分类名称映射
    const categoryNames = {
        'study': '学习成长',
        'work': '工作职业',
        'experience': '体验突破',
        'leisure': '休闲放松',
        'family': '家庭生活',
        'social': '人际社群',
        'uncategorized': '未分类'
    };
    
    // 分类颜色映射
    const categoryColors = {
        'study': 'blue',
        'work': 'red',
        'experience': 'purple',
        'leisure': 'green',
        'family': 'yellow',
        'social': 'pink',
        'uncategorized': 'gray'
    };
    
    // 生成每个分类的总结
    Object.keys(categorizedEvents).forEach(category => {
        const categoryEvents = categorizedEvents[category];
        const color = categoryColors[category] || 'gray';
        const categoryName = categoryNames[category] || category;
        
        const categorySummaryElement = document.createElement('div');
        categorySummaryElement.className = 'category-summary';
        categorySummaryElement.innerHTML = `
            <div class="flex items-center mb-3">
                <div class="w-4 h-4 rounded-full bg-${color}-500 mr-2"></div>
                <h4 class="text-lg font-medium">${categoryName}</h4>
                <span class="ml-2 text-sm text-gray-500">(${categoryEvents.length}项)</span>
            </div>
            <p class="text-gray-600 mb-3">
                在${categoryName}方面，您完成了${categoryEvents.length}项活动。
            </p>
        `;
        
        summariesContainer.appendChild(categorySummaryElement);
    });
}

// 生成MCC教练洞察
function generateCoachInsights(events, dateRange) {
    // 简化版：使用预设的洞察内容
    document.getElementById('coach-observations').textContent = 
        "基于您本周的记录，我注意到您在各个领域的时间分配和活动参与情况。这些数据反映了您当前的优先事项和关注点。";
    
    // 设置反思问题的交互功能
    setupReflectionInteractions();
}

// 设置反思问题的交互功能
function setupReflectionInteractions() {
    // 保存反思
    document.querySelectorAll('.save-reflection').forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('li');
            const textarea = container.querySelector('.reflection-response');
            const savedStatus = container.querySelector('.saved-status');
            
            // 保存反思内容（简化版：仅显示保存状态）
            console.log('保存反思:', textarea.value);
            
            // 显示保存状态
            savedStatus.classList.remove('hidden');
            setTimeout(() => {
                savedStatus.classList.add('hidden');
            }, 2000);
        });
    });
    
    // 获取AI反馈
    document.querySelectorAll('.get-ai-feedback').forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('li');
            const textarea = container.querySelector('.reflection-response');
            const feedbackContainer = container.querySelector('.ai-feedback');
            const feedbackText = container.querySelector('.ai-feedback-text');
            
            // 检查是否有反思内容
            if (!textarea.value.trim()) {
                alert('请先输入您的反思内容');
                return;
            }
            
            // 显示反馈（简化版：使用预设反馈）
            feedbackText.textContent = "您的反思很有深度。考虑进一步思考如何将这些见解应用到日常生活中，可能会带来更好的长期收益。";
            feedbackContainer.classList.remove('hidden');
        });
    });
    
    // 开始深度对话
    document.querySelectorAll('.start-conversation').forEach(button => {
        button.addEventListener('click', function() {
            const container = this.closest('li');
            const conversationHistory = container.querySelector('.conversation-history');
            
            // 切换对话历史显示状态
            if (conversationHistory.classList.contains('hidden')) {
                conversationHistory.classList.remove('hidden');
                this.innerHTML = '<i class="fas fa-chevron-up mr-1"></i>收起对话';
                
                // 如果是首次打开，初始化对话
                if (conversationHistory.querySelector('.conversation-items').children.length === 0) {
                    // 添加初始消息
                    const conversationItems = conversationHistory.querySelector('.conversation-items');
                    const messageElement = document.createElement('div');
                    messageElement.className = 'flex';
                    messageElement.innerHTML = `
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <i class="fas fa-user-tie text-indigo-600"></i>
                        </div>
                        <div class="bg-gray-100 rounded-lg p-2 max-w-[85%]">
                            <p class="text-sm text-gray-700">基于您的反思，您能具体说说这对您的生活产生了什么影响吗？</p>
                        </div>
                    `;
                    conversationItems.appendChild(messageElement);
                }
            } else {
                conversationHistory.classList.add('hidden');
                this.innerHTML = '<i class="fas fa-comments mr-1"></i>开始深度对话';
            }
        });
    });
    
    // 设置对话输入框事件
    document.querySelectorAll('.conversation-history input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const container = this.closest('.conversation-history');
                const conversationItems = container.querySelector('.conversation-items');
                
                // 添加用户消息
                const userMessage = document.createElement('div');
                userMessage.className = 'flex justify-end';
                userMessage.innerHTML = `
                    <div class="bg-indigo-100 rounded-lg p-2 max-w-[85%]">
                        <p class="text-sm text-gray-700">${this.value}</p>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-2">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                `;
                conversationItems.appendChild(userMessage);
                
                // 清空输入框
                const userInput = this.value;
                this.value = '';
                
                // 模拟AI回复
                setTimeout(() => {
                    const aiMessage = document.createElement('div');
                    aiMessage.className = 'flex';
                    aiMessage.innerHTML = `
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <i class="fas fa-user-tie text-indigo-600"></i>
                        </div>
                        <div class="bg-gray-100 rounded-lg p-2 max-w-[85%]">
                            <p class="text-sm text-gray-700">感谢您的分享。您提到的这一点很有洞察力，您认为在下周可以采取什么具体行动来改进这一方面？</p>
                        </div>
                    `;
                    conversationItems.appendChild(aiMessage);
                    
                    // 滚动到底部
                    conversationItems.scrollTop = conversationItems.scrollHeight;
                }, 1000);
                
                // 滚动到底部
                conversationItems.scrollTop = conversationItems.scrollHeight;
            }
        });
    });
}

// 导出报告
function exportReport() {
    alert('报告导出功能将在后续版本中提供');
}

// 提交用户反馈
function submitFeedback() {
    const feedbackType = document.querySelector('input[name="feedback"]:checked')?.value || 'no-selection';
    const comments = document.getElementById('report-comments').value;
    
    console.log('提交反馈:', { feedbackType, comments });
    alert('感谢您的反馈！');
    
    // 重置表单
    document.querySelectorAll('input[name="feedback"]').forEach(input => input.checked = false);
    document.getElementById('report-comments').value = '';
}