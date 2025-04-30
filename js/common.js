// 通用按钮功能
document.addEventListener('DOMContentLoaded', function() {
    // 监听组件加载完成事件
    document.addEventListener('component-loaded', function(e) {
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
            // 移除可能存在的旧事件监听器
            btnNewPlan.removeEventListener('click', openPlanModal);
            // 添加新的事件监听器
            btnNewPlan.addEventListener('click', openPlanModal);
        }
        
        // 记录事项按钮
        const btnNewRecord = document.getElementById('btn-new-record');
        if (btnNewRecord) {
            // 移除可能存在的旧事件监听器
            btnNewRecord.removeEventListener('click', openRecordModal);
            // 添加新的事件监听器
            btnNewRecord.addEventListener('click', openRecordModal);
        }
        
        // 函数用于打开计划模态框
        function openPlanModal() {
            if (planModal) {
                planModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                showNotification('错误：计划模态框不存在', 'error');
            }
        }
        
        // 函数用于打开记录模态框
        function openRecordModal() {
            if (recordModal) {
                recordModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
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
                
                // 保存事件
                saveEvent(newPlan);
                
                // 重置表单并关闭模态框
                resetPlanForm(this);
                document.getElementById('modal-new-plan').classList.add('hidden');
                document.body.style.overflow = '';
                
                showNotification('计划已成功保存！');
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
                const tagsHidden = document.getElementById('tags-hidden');
                let recordTags = [];
                
                if (tagsHidden && tagsHidden.value) {
                    try {
                        recordTags = JSON.parse(tagsHidden.value);
                    } catch (e) {
                        recordTags = [];
                    }
                }
                
                // 添加类型作为标签
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
                
                // 保存事件
                saveEvent(newRecord);
                
                // 重置表单并关闭模态框
                resetRecordForm(this);
                document.getElementById('modal-new-record').classList.add('hidden');
                document.body.style.overflow = '';
                
                showNotification('记录已成功保存！');
            });
        }
    }
    
    // 保存事件到 localStorage
    function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        
        // 事件添加后触发自定义事件，以便其他组件可以响应
        document.dispatchEvent(new CustomEvent('event-added', { detail: { event } }));
    }
    
    // 重置计划表单
    function resetPlanForm(form) {
        form.reset();
        
        // 设置默认日期
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10);
        document.getElementById('plan-due-date').value = formattedDate;
        
        // 重置类型和优先级
        document.getElementById('type-work').checked = true;
        document.getElementById('priority-medium').checked = true;
    }
    
    // 重置记录表单
    function resetRecordForm(form) {
        form.reset();
        
        // 设置默认日期
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10);
        document.getElementById('record-date').value = formattedDate;
        
        // 重置类型
        document.getElementById('rec-type-study').checked = true;
        
        // 清空标签
        const tagsContainer = document.getElementById('tags-container');
        const tagsHidden = document.getElementById('tags-hidden');
        
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }
        
        if (tagsHidden) {
            tagsHidden.value = '[]';
        }
    }
    
    // 显示通知
    function showNotification(message, type = 'success') {
        // 检查是否已存在通知元素
        let notification = document.getElementById('notification');
        
        // 如果不存在，创建一个
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '9999';
            notification.style.minWidth = '250px';
            notification.style.padding = '16px';
            notification.style.borderRadius = '6px';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            notification.style.transition = 'all 0.3s ease';
            document.body.appendChild(notification);
        }
        
        // 设置通知类型样式
        if (type === 'success') {
            notification.style.backgroundColor = '#10B981';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#EF4444';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#F59E0B';
            notification.style.color = 'white';
        } else if (type === 'info') {
            notification.style.backgroundColor = '#3B82F6';
            notification.style.color = 'white';
        }
        
        // 设置通知内容
        notification.textContent = message;
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.transform = 'translateY(20px)';
            notification.style.opacity = '0';
            
            // 完全消失后从DOM移除
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}); 