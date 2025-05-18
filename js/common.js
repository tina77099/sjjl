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
        
        // 表单提交处理
        initializeFormHandlers();
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
            // 添加一个表单提交状态标志，防止重复提交
            let isSubmitting = false;
            
            newRecordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // 如果表单正在提交中，直接返回
                if (isSubmitting) {
                    console.log('表单正在提交中，忽略重复请求');
                    return;
                }
                
                // 设置提交状态为true
                isSubmitting = true;
                
                // 获取表单数据
                const recordTitle = document.getElementById('record-title').value.trim();
                const recordDesc = document.getElementById('record-desc').value.trim();
                const recordDate = document.getElementById('record-date').value;
                const recordTypeEl = document.querySelector('input[name="record-type"]:checked');
                
                if (!recordTypeEl) {
                    showNotification('请选择记录类型', 'error');
                    isSubmitting = false; // 重置提交状态
                    return;
                }
                
                const recordType = recordTypeEl.value;
                
                // 检查是否是编辑模式
                const isEditMode = this.dataset.mode === 'edit';
                const eventId = isEditMode ? this.dataset.eventId : null;
                
                // 创建记录对象 - 只使用分类作为标签
                const newRecord = {
                    id: isEditMode ? eventId : 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    title: recordTitle || '(无标题记录)',  // 为空标题提供一个更明确的默认值
                    description: recordDesc,
                    eventType: 'record',
                    startTime: new Date(recordDate).toISOString(),
                    isAllDay: true,
                    category: recordType,
                    tags: [recordType], // 只使用分类作为标签
                    updatedAt: new Date().toISOString()
                };
                
                // 如果是编辑模式，保留原有的创建时间
                if (isEditMode) {
                    // 获取原有的事件数据
                    const events = JSON.parse(localStorage.getItem('events')) || [];
                    const originalEvent = events.find(event => event.id === eventId);
                    
                    if (originalEvent && originalEvent.createdAt) {
                        newRecord.createdAt = originalEvent.createdAt;
                    } else {
                        newRecord.createdAt = new Date().toISOString();
                    }
                } else {
                    // 新建模式，设置创建时间
                    newRecord.createdAt = new Date().toISOString();
                }
                
                // 保存事件
                saveEvent(newRecord);
                console.log(`${isEditMode ? '更新' : '保存'}记录:`, newRecord.title, '分类:', newRecord.category);
                
                // 重置表单并关闭模态框
                resetRecordForm(this);
                document.getElementById('modal-new-record').classList.add('hidden');
                document.body.style.overflow = '';
                
                // 显示通知
                const message = isEditMode ? '记录已成功更新！' : '记录已成功保存！';
                showNotification(message);
                
                // 延迟重置提交状态，防止快速重复点击
                setTimeout(() => {
                    isSubmitting = false;
                }, 500);
            });
        }
    }
    
    // 保存事件到 localStorage
    function saveEvent(event) {
        console.log(`准备保存事件: ${event.title || '(无标题)'}, 类型: ${event.eventType}, ID: ${event.id}`);
        
        // 确保事件有所有必要的属性
        if (event.eventType === 'record') {
            // 确保分类有效
            const validCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
            if (!validCategories.includes(event.category)) {
                event.category = 'study'; // 默认设置为学习成长
                console.log(`修复记录: ${event.title || '(无标题)'} - 设置默认分类为 study`);
            }
            
            // 确保标签是数组并且只包含分类值
            event.tags = [event.category];
            console.log(`保存记录: ${event.title || '(无标题)'} - 设置标签为 [${event.category}]`);
            
            // 确保标题不为空
            if (!event.title || event.title.trim() === '') {
                const categories = {
                    'study': '学习记录',
                    'experience': '体验记录',
                    'leisure': '休闲记录',
                    'family': '家庭记录',
                    'work': '工作记录',
                    'social': '社交记录'
                };
                // 根据分类给出更具体的默认标题
                event.title = categories[event.category] || '未分类记录';
                console.log(`修复记录: 设置默认标题为 "${event.title}"`);
            }
            
            // 确保时间戳存在
            if (!event.createdAt) {
                event.createdAt = new Date().toISOString();
            }
            if (!event.updatedAt) {
                event.updatedAt = new Date().toISOString();
            }
        }
        
        // 从localStorage获取现有事件
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        
        // 检查ID是否已存在，避免重复添加
        const existingIndex = events.findIndex(e => e.id === event.id);
        const isUpdate = existingIndex >= 0;
        
        if (existingIndex >= 0) {
            console.log(`发现重复ID: ${event.id}, 将更新而不是添加新记录`);
            events[existingIndex] = event; // 替换现有记录
        } else {
            events.push(event); // 添加新记录
        }
        
        // 保存更新后的事件数组
        localStorage.setItem('events', JSON.stringify(events));
        console.log(`事件已保存，当前共有 ${events.length} 条事件`);
        
        // 事件添加后触发自定义事件，以便其他组件可以响应
        document.dispatchEvent(new CustomEvent('event-added', { detail: { event } }));
        
        // 如果存在initializeDashboard函数，刷新仪表盘
        if (typeof initializeDashboard === 'function') {
            setTimeout(() => {
                initializeDashboard();
            }, 100);
        }
        
        return true;
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
        // 清除表单值
        form.reset();
        
        // 重置表单模式和事件ID
        form.dataset.mode = 'add';
        delete form.dataset.eventId;
        
        // 隐藏删除按钮
        const deleteBtn = document.getElementById('delete-record-btn');
        if (deleteBtn) {
            deleteBtn.classList.add('hidden');
        }
        
        // 设置提交按钮文本始终为"保存记录"
        const submitBtn = document.getElementById('submit-record-btn');
        if (submitBtn) {
            submitBtn.textContent = '保存记录';
        }
        
        // 设置默认日期
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10);
        document.getElementById('record-date').value = formattedDate;
        
        // 重置类型
        document.getElementById('rec-type-study').checked = true;
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