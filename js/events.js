// events.js - 事件列表页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件列表页面
    initializeEventsPage();
    
    // 监听事件添加/更新，实时刷新列表
    document.addEventListener('event-added', function(e) {
        initializeEventsPage();
    });
});

/**
 * 初始化事件列表页面
 */
function initializeEventsPage() {
    // 从localStorage加载事件数据
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    
    // 获取筛选和排序选项
    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const sortOption = document.getElementById('sortEvents').value;
    
    // 应用筛选和排序
    const filteredEvents = filterEvents(events, filterType, filterStatus, filterCategory);
    const sortedEvents = sortEvents(filteredEvents, sortOption);
    
    // 按日期分组事件
    const groupedEvents = groupEventsByDate(sortedEvents);
    
    // 渲染事件列表
    renderEventsList(groupedEvents);
    renderEventsCards(groupedEvents);
    
    // 添加事件监听器
    setupEventListeners();
}

/**
 * 筛选事件
 */
function filterEvents(events, typeFilter, statusFilter, categoryFilter) {
    return events.filter(event => {
        // 类型筛选
        if (typeFilter !== 'all' && event.eventType !== typeFilter) {
            return false;
        }
        
        // 状态筛选
        if (statusFilter !== 'all') {
            if (statusFilter === 'completed' && event.status !== 'completed') {
                return false;
            }
            if (statusFilter === 'in-progress' && event.status !== 'in-progress') {
                return false;
            }
            if (statusFilter === 'pending' && event.status !== 'pending') {
                return false;
            }
            if (statusFilter === 'overdue' && event.status !== 'overdue') {
                return false;
            }
        }
        
        // 分类筛选
        if (categoryFilter !== 'all' && event.category !== categoryFilter) {
            return false;
        }
        
        return true;
    });
}

/**
 * 排序事件
 */
function sortEvents(events, sortOption) {
    const sortedEvents = [...events];
    
    switch (sortOption) {
        case 'date-desc':
            sortedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            break;
        case 'date-asc':
            sortedEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            break;
        case 'priority-desc':
            sortedEvents.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
            break;
        case 'priority-asc':
            sortedEvents.sort((a, b) => {
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            break;
        case 'name-asc':
            sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            sortedEvents.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    return sortedEvents;
}

/**
 * 按日期分组事件
 */
function groupEventsByDate(events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const groups = {
        today: [],
        tomorrow: [],
        thisWeek: [],
        future: [],
        past: []
    };
    
    events.forEach(event => {
        const eventDate = new Date(event.startTime);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate.getTime() === today.getTime()) {
            groups.today.push(event);
        } else if (eventDate.getTime() === tomorrow.getTime()) {
            groups.tomorrow.push(event);
        } else if (eventDate > today && eventDate < nextWeek) {
            groups.thisWeek.push(event);
        } else if (eventDate > today) {
            groups.future.push(event);
        } else {
            groups.past.push(event);
        }
    });
    
    return groups;
}

/**
 * 渲染列表视图
 */
function renderEventsList(groupedEvents) {
    const listView = document.getElementById('listView');
    if (!listView) return;
    
    // 清空现有内容
    listView.innerHTML = '';
    
    // 定义要渲染的组
    const groupsToRender = [
        { key: 'today', title: '今日', icon: 'calendar-day' },
        { key: 'tomorrow', title: '明日', icon: 'calendar-alt' },
        { key: 'thisWeek', title: '本周', icon: 'calendar-week' },
        { key: 'future', title: '未来', icon: 'calendar-plus' },
        { key: 'past', title: '过去', icon: 'calendar-minus' }
    ];
    
    // 渲染每个组
    groupsToRender.forEach(group => {
        const events = groupedEvents[group.key];
        
        // 只渲染有事件的组
        if (events && events.length > 0) {
            // 创建组标题
            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `
                <h3 class="text-lg font-medium text-gray-700 mb-3 flex items-center">
                    <i class="fas fa-${group.icon} text-indigo-500 mr-2"></i>
                    ${group.title}
                    <span class="ml-2 text-sm text-gray-500">(${events.length}项)</span>
                </h3>
                <div class="space-y-3" id="${group.key}-events"></div>
            `;
            listView.appendChild(groupDiv);
            
            // 渲染该组的所有事件
            const eventsContainer = document.getElementById(`${group.key}-events`);
            events.forEach(event => {
                const eventElement = createEventElement(event);
                eventsContainer.appendChild(eventElement);
            });
        }
    });
}

/**
 * 渲染卡片视图
 */
function renderEventsCards(groupedEvents) {
    const cardView = document.getElementById('cardView');
    if (!cardView) return;
    
    // 清空现有内容
    cardView.innerHTML = '';
    
    // 合并所有事件
    const allEvents = [
        ...groupedEvents.today,
        ...groupedEvents.tomorrow,
        ...groupedEvents.thisWeek,
        ...groupedEvents.future,
        ...groupedEvents.past
    ];
    
    // 创建卡片网格
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    // 渲染所有事件卡片
    allEvents.forEach(event => {
        const cardElement = createEventCardElement(event);
        gridDiv.appendChild(cardElement);
    });
    
    cardView.appendChild(gridDiv);
}

/**
 * 创建事件列表项元素
 */
function createEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow';
    eventDiv.dataset.eventId = event.id;
    
    // 确定事件状态样式
    // 如果是记录类型，默认设置为已完成状态
    const isCompleted = event.eventType === 'record' || event.status === 'completed';
    const titleClass = isCompleted ? 'line-through text-gray-400' : '';
    const descClass = isCompleted ? 'text-gray-400 line-through' : 'text-gray-600';
    
    // 格式化日期和时间
    const eventDate = new Date(event.startTime);
    let timeStr = '';
    
    if (event.isAllDay) {
        timeStr = '全天';
    } else {
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const minutes = eventDate.getMinutes().toString().padStart(2, '0');
        
        if (event.dueDate) {
            const endDate = new Date(event.dueDate);
            const endHours = endDate.getHours().toString().padStart(2, '0');
            const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
            timeStr = `${hours}:${minutes} - ${endHours}:${endMinutes}`;
        } else {
            timeStr = `${hours}:${minutes}`;
        }
    }
    
    // 获取星期几
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[eventDate.getDay()];
    
    // 获取日期字符串
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    eventDate.setHours(0, 0, 0, 0);
    let dateStr = '';
    
    if (eventDate.getTime() === today.getTime()) {
        dateStr = '今天';
    } else if (eventDate.getTime() === tomorrow.getTime()) {
        dateStr = '明天';
    } else {
        const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
        const day = eventDate.getDate().toString().padStart(2, '0');
        dateStr = `${month}/${day}`;
    }
    
    // 确定优先级样式
    let priorityBadge = '';
    if (event.priority === 'high') {
        priorityBadge = '<span class="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">紧急</span>';
    } else if (event.priority === 'medium') {
        priorityBadge = '<span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">高优先级</span>';
    }
    
    // 确定分类样式
    let categoryBadge = '';
    const categoryStyles = {
        'work': 'bg-blue-100 text-blue-800',
        'study': 'bg-green-100 text-green-800',
        'health': 'bg-yellow-100 text-yellow-800',
        'life': 'bg-purple-100 text-purple-800',
        'family': 'bg-pink-100 text-pink-800',
        'social': 'bg-indigo-100 text-indigo-800',
        'experience': 'bg-pink-100 text-pink-800',
        'leisure': 'bg-purple-100 text-purple-800'
    };
    
    const categoryNames = {
        'work': '工作',
        'study': '学习',
        'health': '健康',
        'life': '生活',
        'family': '家庭',
        'social': '社交',
        'experience': '体验',
        'leisure': '休闲'
    };
    
    const categoryStyle = categoryStyles[event.category] || 'bg-gray-100 text-gray-800';
    const categoryName = categoryNames[event.category] || event.category;
    categoryBadge = `<span class="ml-2 px-2 py-0.5 ${categoryStyle} text-xs rounded-full">${categoryName}</span>`;
    
    // 确定事件类型样式
    const typeBadge = event.eventType === 'plan' 
        ? '<span class="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">计划</span>'
        : '<span class="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">记录</span>';
    
    // 构建HTML
    eventDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="h-5 w-5 rounded-full ${isCompleted ? 'bg-green-500' : 'border-2 border-green-500'} flex items-center justify-center cursor-pointer event-checkbox ${isCompleted ? 'checked' : ''}">
                    <i class="fas fa-check text-white text-xs ${isCompleted ? '' : 'opacity-0'}"></i>
                </div>
                <span class="ml-3 font-medium ${titleClass}">${event.title}</span>
                ${categoryBadge}
                ${priorityBadge}
                ${typeBadge}
            </div>
            <div class="flex items-center">
                <span class="text-sm text-gray-500 mr-4">${dateStr} ${weekday} ${timeStr}</span>
                <div class="flex space-x-2">
                    <button class="text-gray-400 hover:text-indigo-600 edit-event-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-gray-400 hover:text-red-600 delete-event-btn">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="mt-2 pl-8">
            ${event.description ? `<p class="text-sm ${descClass}">${event.description}</p>` : ''}
            ${event.location ? `
                <div class="mt-2 flex items-center">
                    <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                    <span class="text-sm text-gray-500">${event.location}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    return eventDiv;
}

/**
 * 创建事件卡片元素
 */
function createEventCardElement(event) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden';
    cardDiv.dataset.eventId = event.id;
    
    // 确定事件状态样式
    // 如果是记录类型，默认设置为已完成状态
    const isCompleted = event.eventType === 'record' || event.status === 'completed';
    const titleClass = isCompleted ? 'line-through text-gray-400' : 'text-gray-800';
    const descClass = isCompleted ? 'text-gray-400 line-through' : 'text-gray-600';
    
    // 确定分类样式
    const categoryColors = {
        'work': 'bg-blue-500',
        'study': 'bg-green-500',
        'health': 'bg-yellow-500',
        'life': 'bg-purple-500',
        'family': 'bg-pink-500',
        'social': 'bg-indigo-500',
        'experience': 'bg-pink-500',
        'leisure': 'bg-purple-500'
    };
    
    // 分类中文名称
    const categoryNames = {
        'work': '工作',
        'study': '学习',
        'health': '健康',
        'life': '生活',
        'family': '家庭',
        'social': '社交',
        'experience': '体验',
        'leisure': '休闲'
    };
    
    const categoryColor = categoryColors[event.category] || 'bg-gray-500';
    
    // 格式化日期和时间
    const eventDate = new Date(event.startTime);
    const month = (eventDate.getMonth() + 1).toString().padStart(2, '0');
    const day = eventDate.getDate().toString().padStart(2, '0');
    
    let timeStr = '';
    if (event.isAllDay) {
        timeStr = '全天';
    } else {
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const minutes = eventDate.getMinutes().toString().padStart(2, '0');
        timeStr = `${hours}:${minutes}`;
    }
    
    // 构建HTML
    cardDiv.innerHTML = `
        <div class="h-2 ${categoryColor}"></div>
        <div class="p-4">
            <div class="flex justify-between items-start">
                <h3 class="font-medium ${titleClass}">${event.title}</h3>
                <div class="h-6 w-6 rounded-full ${isCompleted ? 'bg-green-500' : 'border-2 border-green-500'} flex items-center justify-center cursor-pointer event-checkbox ${isCompleted ? 'checked' : ''}">
                    <i class="fas fa-check text-white text-xs ${isCompleted ? '' : 'opacity-0'}"></i>
                </div>
            </div>
            ${event.description ? `<p class="mt-2 text-sm ${descClass} line-clamp-2">${event.description}</p>` : ''}
            <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-calendar-alt text-gray-400 mr-1"></i>
                    <span class="text-sm text-gray-500">${month}/${day} ${timeStr}</span>
                </div>
                <div class="flex space-x-2">
                    <button class="text-gray-400 hover:text-indigo-600 edit-event-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-gray-400 hover:text-red-600 delete-event-btn">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return cardDiv;
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 筛选和排序事件监听
    document.getElementById('filterType').addEventListener('change', initializeEventsPage);
    document.getElementById('filterStatus').addEventListener('change', initializeEventsPage);
    document.getElementById('filterCategory').addEventListener('change', initializeEventsPage);
    document.getElementById('sortEvents').addEventListener('change', initializeEventsPage);
    
    // 搜索框事件监听
    const searchInput = document.querySelector('input[placeholder="搜索事件..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const eventItems = document.querySelectorAll('[data-event-id]');
            
            eventItems.forEach(item => {
                const eventId = item.dataset.eventId;
                const events = JSON.parse(localStorage.getItem('events') || '[]');
                const event = events.find(e => e.id === eventId);
                
                if (event) {
                    const title = event.title.toLowerCase();
                    const description = (event.description || '').toLowerCase();
                    const tags = (event.tags || []).join(' ').toLowerCase();
                    
                    if (title.includes(searchTerm) || description.includes(searchTerm) || tags.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    }
    
    // 事件复选框点击事件
    document.querySelectorAll('.event-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const eventId = this.closest('[data-event-id]').dataset.eventId;
            toggleEventStatus(eventId, this);
        });
    });
    
    // 编辑事件按钮
    document.querySelectorAll('.edit-event-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.closest('[data-event-id]').dataset.eventId;
            editEvent(eventId);
        });
    });
    
    // 删除事件按钮
    document.querySelectorAll('.delete-event-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.closest('[data-event-id]').dataset.eventId;
            deleteEvent(eventId);
        });
    });
}

/**
 * 切换事件状态
 */
function toggleEventStatus(eventId, checkbox) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        const event = events[eventIndex];
        const isCompleted = event.status === 'completed';
        
        // 更新状态
        event.status = isCompleted ? 'pending' : 'completed';
        event.updatedAt = new Date().toISOString();
        
        // 保存到localStorage
        localStorage.setItem('events', JSON.stringify(events));
        
        // 更新UI
        const eventElement = checkbox.closest('[data-event-id]');
        const checkIcon = checkbox.querySelector('i');
        const eventTitle = eventElement.querySelector('.font-medium');
        const eventDesc = eventElement.querySelectorAll('p, .text-sm.text-gray-500, .px-2.py-0.5');
        
        if (isCompleted) {
            // 取消选中
            checkbox.classList.remove('checked', 'bg-green-500');
            checkbox.classList.add('border-2', 'border-green-500');
            checkIcon.classList.add('opacity-0');
            eventTitle.classList.remove('line-through', 'text-gray-400');
            eventDesc.forEach(el => el.classList.remove('line-through', 'text-gray-400'));
            
            // 显示通知
            showNotification(`事件"${event.title}"已标记为未完成`, 'info');
        } else {
            // 选中
            checkbox.classList.add('checked', 'bg-green-500');
            checkbox.classList.remove('border-2', 'border-green-500');
            checkIcon.classList.remove('opacity-0');
            eventTitle.classList.add('line-through', 'text-gray-400');
            eventDesc.forEach(el => el.classList.add('line-through', 'text-gray-400'));
            
            // 显示通知
            showNotification(`事件"${event.title}"已标记为完成！`, 'success');
        }
    }
}

/**
 * 编辑事件
 */
function editEvent(eventId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (event) {
        if (event.eventType === 'plan') {
            // 打开计划编辑模态框
            const planModal = document.getElementById('modal-new-plan');
            if (planModal) {
                // 填充表单
                document.getElementById('plan-title').value = event.title;
                document.getElementById('plan-desc').value = event.description || '';
                
                // 设置日期
                const dueDate = new Date(event.dueDate || event.startTime);
                document.getElementById('plan-due-date').value = dueDate.toISOString().split('T')[0];
                
                // 设置类型
                const typeRadio = document.getElementById(`type-${event.category}`);
                if (typeRadio) {
                    typeRadio.checked = true;
                }
                
                // 设置优先级
                const priorityRadio = document.getElementById(`priority-${event.priority}`);
                if (priorityRadio) {
                    priorityRadio.checked = true;
                }
                
                // 设置表单为编辑模式
                const form = document.getElementById('new-plan-form');
                form.dataset.mode = 'edit';
                form.dataset.eventId = event.id;
                
                // 显示删除按钮
                const deleteButton = document.getElementById('delete-plan-btn');
                if (deleteButton) {
                    deleteButton.classList.remove('hidden');
                }
                
                // 打开模态框
                planModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        } else {
            // 打开记录编辑模态框
            const recordModal = document.getElementById('modal-new-record');
            if (recordModal) {
                // 填充表单
                document.getElementById('record-title').value = event.title;
                document.getElementById('record-desc').value = event.description || '';
                
                // 设置日期和时间
                const startDate = new Date(event.startTime);
                document.getElementById('record-date').value = startDate.toISOString().split('T')[0];
                
                const hours = startDate.getHours().toString().padStart(2, '0');
                const minutes = startDate.getMinutes().toString().padStart(2, '0');
                document.getElementById('record-time').value = `${hours}:${minutes}`;
                
                // 设置类型
                const typeRadio = document.getElementById(`rec-type-${event.category}`);
                if (typeRadio) {
                    typeRadio.checked = true;
                }
                
                // 设置表单为编辑模式
                const form = document.getElementById('new-record-form');
                form.dataset.mode = 'edit';
                form.dataset.eventId = event.id;
                
                // 显示删除按钮
                const deleteButton = document.getElementById('delete-record-btn');
                if (deleteButton) {
                    deleteButton.classList.remove('hidden');
                }
                
                // 打开模态框
                recordModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
    }
}

/**
 * 删除事件
 */
function deleteEvent(eventId) {
    if (confirm('确定要删除这个事件吗？此操作不可撤销。')) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const eventIndex = events.findIndex(e => e.id === eventId);
        
        if (eventIndex !== -1) {
            const deletedEvent = events.splice(eventIndex, 1)[0];
            
            // 保存到localStorage
            localStorage.setItem('events', JSON.stringify(events));
            
            // 刷新页面
            initializeEventsPage();
            
            // 显示通知
            showNotification(`事件"${deletedEvent.title}"已删除`, 'info');
        }
    }
} 