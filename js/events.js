// events.js - 事件列表页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件列表页面
    initializeEventsPage();
    
    // 监听事件添加/更新，实时刷新列表
    document.addEventListener('event-added', function(e) {
        initializeEventsPage();
    });
});

// 分页相关变量
let currentPage = 1;
const eventsPerPage = 10; // 每页显示的事件数量
let totalPages = 1;

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
    
    // 计算总页数
    totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
    if (totalPages === 0) totalPages = 1;
    
    // 确保当前页在有效范围内
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    // 按日期分组事件
    const groupedEvents = groupEventsByDate(sortedEvents);
    
    // 渲染事件列表
    renderEventsList(groupedEvents);
    renderEventsCards(groupedEvents);
    
    // 渲染分页控件
    renderPagination();
    
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
    
    // 计算当前页的起始和结束索引
    let totalRendered = 0;
    let startIndex = (currentPage - 1) * eventsPerPage;
    let endIndex = startIndex + eventsPerPage;
    
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
            
            // 渲染该组的事件，但只渲染当前页应该显示的部分
            const eventsContainer = document.getElementById(`${group.key}-events`);
            
            for (let i = 0; i < events.length; i++) {
                // 如果已经渲染了足够的事件，跳出循环
                if (totalRendered >= eventsPerPage) break;
                
                // 如果当前事件索引在当前页范围内，渲染它
                if (totalRendered + i >= startIndex && totalRendered + i < endIndex) {
                    const eventElement = createEventElement(events[i]);
                    eventsContainer.appendChild(eventElement);
                }
            }
            
            // 更新已渲染的事件总数
            totalRendered += Math.min(events.length, endIndex - startIndex - totalRendered);
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
    
    // 计算当前页的事件
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = Math.min(startIndex + eventsPerPage, allEvents.length);
    const pageEvents = allEvents.slice(startIndex, endIndex);
    
    // 创建卡片网格
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    // 渲染当前页的事件卡片
    pageEvents.forEach(event => {
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
    // 如果是记录类型，默认设置为已完成状态，但标题保持正常显示
    const isCompleted = event.eventType === 'record' || event.status === 'completed';
    // 移除已完成计划的标题划线和灰色样式
    const titleClass = '';
    // 记录类型的描述不使用划线
    const descClass = event.eventType === 'record' ? 'text-gray-600' : (isCompleted ? 'text-gray-400 line-through' : 'text-gray-600');
    
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
    
    // 根据事件类型确定复选框颜色和样式
    const checkboxClass = event.eventType === 'record' 
        ? 'bg-purple-100 rounded-full flex items-center justify-center cursor-pointer event-checkbox' 
        : 'rounded-full flex items-center justify-center cursor-pointer event-checkbox';
    
    const checkIconClass = event.eventType === 'record'
        ? 'fas fa-check text-purple-600 text-xs'
        : 'fas fa-check text-blue-600 text-xs';
    
    const checkboxBg = event.eventType === 'record'
        ? 'bg-purple-100'
        : (isCompleted ? 'bg-blue-100' : 'border-2 border-blue-600');
    
    const checkIconVisibility = event.eventType === 'record' || isCompleted ? '' : 'opacity-0';
    
    // 构建HTML
    eventDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="h-5 w-5 ${checkboxBg} ${checkboxClass} ${isCompleted ? 'checked' : ''}">
                    <i class="${checkIconClass} ${checkIconVisibility}"></i>
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
    // 如果是记录类型，默认设置为已完成状态，但标题保持正常显示
    const isCompleted = event.eventType === 'record' || event.status === 'completed';
    // 移除已完成计划的标题划线和灰色样式
    const titleClass = 'text-gray-800';
    // 记录类型的描述不使用划线
    const descClass = event.eventType === 'record' ? 'text-gray-600' : (isCompleted ? 'text-gray-400 line-through' : 'text-gray-600');
    
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
    
    // 根据事件类型确定复选框颜色和样式
    const checkboxClass = event.eventType === 'record' 
        ? 'bg-purple-100 rounded-full flex items-center justify-center cursor-pointer event-checkbox' 
        : 'rounded-full flex items-center justify-center cursor-pointer event-checkbox';
    
    const checkIconClass = event.eventType === 'record'
        ? 'fas fa-check text-purple-600 text-xs'
        : 'fas fa-check text-blue-600 text-xs';
    
    const checkboxBg = event.eventType === 'record'
        ? 'bg-purple-100'
        : (isCompleted ? 'bg-blue-100' : 'border-2 border-blue-600');
    
    const checkIconVisibility = event.eventType === 'record' || isCompleted ? '' : 'opacity-0';
    
    // 构建HTML
    cardDiv.innerHTML = `
        <div class="h-2 ${categoryColor}"></div>
        <div class="p-4">
            <div class="flex justify-between items-start">
                <h3 class="font-medium ${titleClass}">${event.title}</h3>
                <div class="h-6 w-6 ${checkboxBg} ${checkboxClass} ${isCompleted ? 'checked' : ''}">
                    <i class="${checkIconClass} ${checkIconVisibility}"></i>
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
 * 渲染分页控件
 */
function renderPagination() {
    // 检查是否已存在分页容器，如果不存在则创建
    let paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'flex justify-center items-center mt-6 space-x-2';
        
        // 将分页容器添加到列表视图和卡片视图之后
        const listView = document.getElementById('listView');
        if (listView) {
            listView.parentNode.insertBefore(paginationContainer, listView.nextSibling);
        }
    } else {
        // 清空现有分页内容
        paginationContainer.innerHTML = '';
    }
    
    // 如果总页数小于等于1，不显示分页
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'flex';
    }
    
    // 添加上一页按钮
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            initializeEventsPage();
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // 确定要显示的页码范围
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 调整起始页以确保显示5个页码（如果有足够的页数）
    if (endPage - startPage < 4 && totalPages > 5) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加第一页按钮（如果不在显示范围内）
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            initializeEventsPage();
        });
        paginationContainer.appendChild(firstPageButton);
        
        // 如果第一页和起始页之间有间隔，添加省略号
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => {
            currentPage = i;
            initializeEventsPage();
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // 添加最后一页按钮（如果不在显示范围内）
    if (endPage < totalPages) {
        // 如果结束页和最后一页之间有间隔，添加省略号
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        lastPageButton.textContent = totalPages.toString();
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            initializeEventsPage();
        });
        paginationContainer.appendChild(lastPageButton);
    }
    
    // 添加下一页按钮
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            initializeEventsPage();
        }
    });
    paginationContainer.appendChild(nextButton);
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 筛选和排序事件监听
    document.getElementById('filterType').addEventListener('change', function() {
        currentPage = 1; // 重置到第一页
        initializeEventsPage();
    });
    document.getElementById('filterStatus').addEventListener('change', function() {
        currentPage = 1; // 重置到第一页
        initializeEventsPage();
    });
    document.getElementById('filterCategory').addEventListener('change', function() {
        currentPage = 1; // 重置到第一页
        initializeEventsPage();
    });
    document.getElementById('sortEvents').addEventListener('change', function() {
        currentPage = 1; // 重置到第一页
        initializeEventsPage();
    });
    
    // 搜索框事件监听
    const searchInput = document.querySelector('input[placeholder="搜索事件..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1; // 重置到第一页
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
        const eventDesc = eventElement.querySelectorAll('p');
        
        // 根据事件类型确定复选框样式
        if (event.eventType === 'record') {
            // 记录类型事件使用紫色图标样式
            if (isCompleted) {
                // 取消选中 - 对于记录类型，我们保持紫色样式但可能需要调整某些状态
                checkIcon.className = 'fas fa-check text-purple-600 text-xs';
                checkbox.className = 'h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer event-checkbox';
            } else {
                // 选中 - 对于记录类型，我们保持紫色样式
                checkIcon.className = 'fas fa-check text-purple-600 text-xs';
                checkbox.className = 'h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer event-checkbox checked';
            }
            
            // 记录类型事件不改变标题和描述样式
            eventDesc.forEach(el => {
                el.classList.remove('line-through', 'text-gray-400');
                el.classList.add('text-gray-600');
            });
            
            // 显示通知
            showNotification(`事件"${event.title}"状态已更新`, 'info');
        } else {
            // 计划类型事件使用浅蓝色图标样式
            if (isCompleted) {
                // 取消选中
                checkbox.classList.remove('checked', 'bg-blue-100');
                checkbox.classList.add('border-2', 'border-blue-600');
                checkIcon.classList.add('opacity-0');
                checkIcon.className = 'fas fa-check text-blue-600 text-xs opacity-0';
                
                // 对于计划类型，只修改描述的样式，标题保持正常
                eventDesc.forEach(el => {
                    el.classList.remove('line-through', 'text-gray-400');
                    el.classList.add('text-gray-600');
                });
                
                // 显示通知
                showNotification(`事件"${event.title}"已标记为未完成`, 'info');
            } else {
                // 选中
                checkbox.classList.add('checked', 'bg-blue-100');
                checkbox.classList.remove('border-2', 'border-blue-600');
                checkIcon.classList.remove('opacity-0');
                checkIcon.className = 'fas fa-check text-blue-600 text-xs';
                
                // 对于计划类型，只修改描述的样式，标题保持正常
                eventDesc.forEach(el => {
                    el.classList.add('line-through', 'text-gray-400');
                    el.classList.remove('text-gray-600');
                });
                
                // 显示通知
                showNotification(`事件"${event.title}"已标记为完成！`, 'success');
            }
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