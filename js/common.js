// 通用按钮功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('通用功能脚本已加载');
    
    // 监听组件加载完成事件
    document.addEventListener('component-loaded', function(e) {
        console.log(`组件 ${e.detail.componentName} 加载完成，初始化相关功能`);
        initializeFunctions();
    });
    
    // 无论组件是否加载，都尝试初始化一次功能（可能使用的是内联备用组件）
    setTimeout(initializeFunctions, 500);
    
    function initializeFunctions() {
        // 模态框元素
        const planModal = document.getElementById('modal-new-plan');
        const recordModal = document.getElementById('modal-new-record');
        
        // 新建计划按钮
        const btnNewPlan = document.getElementById('btn-new-plan');
        if (btnNewPlan) {
            console.log('找到新建计划按钮，绑定点击事件');
            // 移除可能存在的旧事件监听器
            btnNewPlan.removeEventListener('click', openPlanModal);
            // 添加新的事件监听器
            btnNewPlan.addEventListener('click', openPlanModal);
        } else {
            console.warn('未找到新建计划按钮');
        }
        
        // 记录事项按钮
        const btnNewRecord = document.getElementById('btn-new-record');
        if (btnNewRecord) {
            console.log('找到记录事项按钮，绑定点击事件');
            // 移除可能存在的旧事件监听器
            btnNewRecord.removeEventListener('click', openRecordModal);
            // 添加新的事件监听器
            btnNewRecord.addEventListener('click', openRecordModal);
        } else {
            console.warn('未找到记录事项按钮');
        }
        
        // 函数用于打开计划模态框
        function openPlanModal() {
            if (planModal) {
                planModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                console.error('计划模态框不存在');
                showNotification('错误：计划模态框不存在', 'error');
            }
        }
        
        // 函数用于打开记录模态框
        function openRecordModal() {
            if (recordModal) {
                recordModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                console.error('记录模态框不存在');
                showNotification('错误：记录模态框不存在', 'error');
            }
        }
        
        // 关闭模态框按钮
        const closeButtons = {
            'close-plan-modal': planModal,
            'cancel-plan-btn': planModal,
            'close-record-modal': recordModal,
            'cancel-record-btn': recordModal
        };
        
        Object.entries(closeButtons).forEach(([id, modal]) => {
            const button = document.getElementById(id);
            if (button && modal) {
                button.addEventListener('click', function() {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                });
            }
        });
        
        // 点击模态框外部关闭
        [planModal, recordModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                        document.body.style.overflow = '';
                    }
                });
            }
        });
        
        // 设置日期默认值为今天
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10);
        
        const dateInputs = {
            'plan-due-date': formattedDate,
            'record-date': formattedDate
        };
        
        Object.entries(dateInputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        });
        
        // 计划和记录表单的类型选择
        ['plan-type-option', 'record-type-option'].forEach(className => {
            const options = document.querySelectorAll('.' + className);
            options.forEach(option => {
                option.addEventListener('click', function() {
                    const radio = this.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                    }
                });
            });
        });
        
        // 标签功能
        initializeTagsSystem();
        
        // 表单提交处理
        initializeFormHandlers();
    }
    
    // 初始化标签系统
    function initializeTagsSystem() {
        const tagsInput = document.getElementById('record-tags');
        const tagsContainer = document.getElementById('tags-container');
        const tagsHidden = document.getElementById('tags-hidden');
        let tags = [];
        
        if (tagsInput && tagsContainer && tagsHidden) {
            // 添加标签
            tagsInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const tagText = this.value.trim();
                    
                    if (tagText && !tags.includes(tagText)) {
                        tags.push(tagText);
                        updateTags();
                    }
                    
                    this.value = '';
                }
            });
        }
        
        // 更新标签显示和隐藏字段
        function updateTags() {
            if (!tagsContainer || !tagsHidden) return;
            
            tagsContainer.innerHTML = '';
            tagsHidden.value = JSON.stringify(tags);
            
            tags.forEach((tag, index) => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'bg-purple-100 text-purple-800 text-sm rounded-full px-3 py-1 m-1 flex items-center';
                
                tagSpan.innerHTML = `
                    ${tag}
                    <button type="button" class="ml-2 text-purple-600 hover:text-purple-800" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                tagsContainer.appendChild(tagSpan);
            });
            
            // 添加删除标签的事件
            document.querySelectorAll('#tags-container button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    tags.splice(index, 1);
                    updateTags();
                });
            });
        }
    }
    
    // 初始化表单处理程序
    function initializeFormHandlers() {
        const newPlanForm = document.getElementById('new-plan-form');
        if (newPlanForm) {
            newPlanForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 获取表单数据
                const planTitle = document.getElementById('plan-title').value;
                const planDesc = document.getElementById('plan-desc').value;
                const planDueDate = document.getElementById('plan-due-date').value;
                const planTypeEl = document.querySelector('input[name="plan-type"]:checked');
                const planPriorityEl = document.querySelector('input[name="priority"]:checked');
                
                if (!planTypeEl || !planPriorityEl) {
                    showNotification('请选择计划类型和优先级', 'error');
                    return;
                }
                
                const planType = planTypeEl.value;
                const planPriority = planPriorityEl.value;
                
                // 创建计划对象
                const newPlan = {
                    id: 'plan_' + Date.now(),
                    title: planTitle,
                    description: planDesc,
                    eventType: 'plan',
                    startTime: new Date(planDueDate).toISOString(),
                    isAllDay: true,
                    category: planType,
                    priority: planPriority,
                    status: 'pending',
                    tags: [planType],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // 保存到 localStorage
                saveEvent(newPlan);
                
                // 重置表单和关闭模态框
                resetPlanForm(this);
            });
        }
        
        const newRecordForm = document.getElementById('new-record-form');
        if (newRecordForm) {
            newRecordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 获取表单数据
                const recordTitle = document.getElementById('record-title').value;
                const recordDesc = document.getElementById('record-desc').value;
                const recordDate = document.getElementById('record-date').value;
                const recordTypeEl = document.querySelector('input[name="record-type"]:checked');
                
                if (!recordTypeEl) {
                    showNotification('请选择记录类型', 'error');
                    return;
                }
                
                const recordType = recordTypeEl.value;
                
                // 获取标签
                const tagsHidden = document.getElementById('tags-hidden');
                let recordTags = [];
                
                if (tagsHidden && tagsHidden.value) {
                    try {
                        recordTags = JSON.parse(tagsHidden.value);
                    } catch (error) {
                        console.error('解析标签时出错:', error);
                        recordTags = [];
                    }
                }
                
                if (!recordTags.includes(recordType)) {
                    recordTags.push(recordType);
                }
                
                // 创建记录对象
                const newRecord = {
                    id: 'record_' + Date.now(),
                    title: recordTitle,
                    description: recordDesc,
                    eventType: 'record',
                    startTime: new Date(recordDate).toISOString(),
                    isAllDay: true,
                    category: recordType,
                    tags: recordTags,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // 保存到 localStorage
                saveEvent(newRecord);
                
                // 重置表单和关闭模态框
                resetRecordForm(this);
            });
        }
    }
});

// 辅助函数
function saveEvent(event) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));
    
    // 显示成功消息
    showNotification('保存成功！');
}

function resetPlanForm(form) {
    form.reset();
    const dueDateInput = document.getElementById('plan-due-date');
    if (dueDateInput) {
        dueDateInput.value = new Date().toISOString().substring(0, 10);
    }
    
    const typeWorkInput = document.getElementById('type-work');
    if (typeWorkInput) {
        typeWorkInput.checked = true;
    }
    
    const priorityMediumInput = document.getElementById('priority-medium');
    if (priorityMediumInput) {
        priorityMediumInput.checked = true;
    }
    
    const planModal = document.getElementById('modal-new-plan');
    if (planModal) {
        planModal.classList.add('hidden');
    }
    
    document.body.style.overflow = '';
}

function resetRecordForm(form) {
    form.reset();
    
    const recordDateInput = document.getElementById('record-date');
    if (recordDateInput) {
        recordDateInput.value = new Date().toISOString().substring(0, 10);
    }
    
    const typeWorkInput = document.getElementById('type-work');
    if (typeWorkInput) {
        typeWorkInput.checked = true;
    }
    
    const tagsContainer = document.getElementById('tags-container');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
    }
    
    const tagsHidden = document.getElementById('tags-hidden');
    if (tagsHidden) {
        tagsHidden.value = '[]';
    }
    
    const recordModal = document.getElementById('modal-new-record');
    if (recordModal) {
        recordModal.classList.add('hidden');
    }
    
    document.body.style.overflow = '';
}

function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    
    // 根据类型设置样式
    let bgColor, textColor;
    if (type === 'error') {
        bgColor = 'bg-red-500';
        textColor = 'text-white';
    } else if (type === 'warning') {
        bgColor = 'bg-yellow-500';
        textColor = 'text-gray-900';
    } else {
        bgColor = 'bg-green-500';
        textColor = 'text-white';
    }
    
    notification.className = `fixed top-4 right-4 ${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
} 