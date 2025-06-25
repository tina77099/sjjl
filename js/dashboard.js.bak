// 仪表盘核心功能
console.log('Dashboard.js loaded successfully!');

// 声明全局变量，以便其他脚本可以调用
let initializeDashboard;
let debugLocalStorage;
let clearLocalStorage;
let fixPlanData;
let fixRecordData;
let hardResetDashboard;
let clearAllRecords;

// 记录初始化状态，防止重复初始化
let isDashboardInitialized = false;
let isEventListenersRegistered = false;

document.addEventListener('DOMContentLoaded', function() {
    // 清除所有记录，但保留计划
    clearAllRecords = function() {
        try {
            console.log('开始清除所有记录...');
            
            const eventsData = localStorage.getItem('events');
            if (!eventsData) {
                console.log('没有找到事件数据');
                return false;
            }
            
            const events = JSON.parse(eventsData);
            const originalCount = events.length;
            
            // 只保留计划类型的事件
            const filteredEvents = events.filter(event => event.eventType !== 'record');
            const removedCount = originalCount - filteredEvents.length;
            
            console.log(`共清除了 ${removedCount} 条记录`);
            
            // 保存回localStorage
            localStorage.setItem('events', JSON.stringify(filteredEvents));
            console.log('清除记录完成，剩余事件数量:', filteredEvents.length);
            
            return true;
        } catch (error) {
            console.error('清除记录时出错:', error);
            return false;
        }
    };

    // 清除localStorage数据
    clearLocalStorage = function() {
        try {
            console.log('清除localStorage数据...');
            
            // 清除所有事件数据
            localStorage.removeItem('events');
            console.log('事件数据已清除');
            
            // 清除所有计划数据
            localStorage.removeItem('plans');
            console.log('计划数据已清除');
            
            // 清除其他可能存在的相关数据
            localStorage.removeItem('lastUpdated');
            localStorage.removeItem('userPreferences');
            
            console.log('所有数据已清除');
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    };

    // 硬重置仪表盘，完全清除所有缓存和DOM元素，然后重新初始化
    hardResetDashboard = function() {
        try {
            console.log('执行仪表盘硬重置...');
            
            // 先修复记录数据
            fixRecordData();
            
            // 清除所有分类的内容
            const allCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
            const categoryNames = {
                'study': '学习成长',
                'experience': '体验突破',
                'leisure': '休闲放松',
                'family': '家庭生活',
                'work': '工作职业',
                'social': '人际社群'
            };
            
            // 首先清除所有分类的DOM元素
            allCategories.forEach(category => {
                const categoryTitle = categoryNames[category];
                console.log(`清除分类 ${categoryTitle} 的DOM元素`);
                
                // 查找分类容器
                let categoryContainer = null;
                const categoryTitleElements = document.querySelectorAll('h3.text-lg.font-semibold');
                
                for (const titleElement of categoryTitleElements) {
                    if (titleElement.textContent.trim() === categoryTitle) {
                        categoryContainer = titleElement.closest('.bg-white.rounded-lg.shadow');
                        break;
                    }
                }
                
                if (!categoryContainer) {
                    console.error(`未找到分类 ${categoryTitle} 的容器`);
                    return;
                }
                
                // 获取标题容器
                const titleContainer = categoryContainer.querySelector('.flex.items-center.justify-between.mb-2');
                if (!titleContainer) {
                    console.error(`未找到分类 ${categoryTitle} 的标题容器`);
                    return;
                }
                
                // 移除除了标题容器以外的所有子元素
                while (categoryContainer.lastChild && categoryContainer.lastChild !== titleContainer) {
                    categoryContainer.removeChild(categoryContainer.lastChild);
                }
                
                // 创建一个新的空状态
                const emptyState = document.createElement('div');
                emptyState.className = 'flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors';
                emptyState.innerHTML = '<p class="text-gray-400 text-sm">点击添加记录</p>';
                
                // 添加点击事件
                emptyState.addEventListener('click', function() {
                    // 打开记录模态框
                    const recordModal = document.getElementById('modal-new-record');
                    if (recordModal) {
                        // 设置对应的分类
                        const typeRadio = document.querySelector(`input[name="record-type"][value="${category}"]`);
                        if (typeRadio) {
                            typeRadio.checked = true;
                        }
                        
                        // 显示模态框
                        recordModal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                    }
                });
                
                titleContainer.insertAdjacentElement('afterend', emptyState);
            });
            
            // 清除本周计划列表
            const planListContainer = document.querySelector('.p-4.space-y-3');
            if (planListContainer) {
                planListContainer.innerHTML = '';
                
                // 创建一个新的空状态
                const emptyState = document.createElement('div');
                emptyState.className = 'flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors';
                emptyState.innerHTML = '<p class="text-gray-400 text-sm">暂无计划，点击添加计划</p>';
                
                // 添加点击事件
                emptyState.addEventListener('click', function() {
                    // 打开计划模态框
                    const planModal = document.getElementById('modal-new-plan');
                    if (planModal) {
                        planModal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                    }
                });
                
                planListContainer.appendChild(emptyState);
            }
            
            // 清除本周概览数据
            const planCountElement = document.querySelector('.rounded-full.bg-blue-100 + div .text-lg.font-bold');
            if (planCountElement) {
                planCountElement.textContent = '0 项';
            }
            
            const recordCountElement = document.querySelector('.rounded-full.bg-green-100 + div .text-lg.font-bold');
            if (recordCountElement) {
                recordCountElement.textContent = '0 项';
            }
            
            const trendElement = document.querySelector('.rounded-full.bg-purple-100 + div .text-lg.font-bold');
            if (trendElement) {
                trendElement.textContent = '-- 0%';
            }
            
            // 清除进度条
            const planProgressBar = document.querySelector('.rounded-full.bg-blue-100').closest('.bg-white').querySelector('.bg-blue-600');
            if (planProgressBar) {
                planProgressBar.style.width = '0%';
            }
            
            const recordProgressBar = document.querySelector('.rounded-full.bg-green-100').closest('.bg-white').querySelector('.bg-green-600');
            if (recordProgressBar) {
                recordProgressBar.style.width = '0%';
            }
            
            const trendProgressBar = document.querySelector('.rounded-full.bg-purple-100').closest('.bg-white').querySelector('.bg-purple-600');
            if (trendProgressBar) {
                trendProgressBar.style.width = '0%';
            }
            
            // 清除完成率文本
            const planCompletionText = document.querySelector('.rounded-full.bg-blue-100').closest('.bg-white').querySelector('.flex.justify-between.text-xs div + div');
            if (planCompletionText) {
                planCompletionText.textContent = '0/0 (0%)';
            }
            
            const recordCompletionText = document.querySelector('.rounded-full.bg-green-100').closest('.bg-white').querySelector('.flex.justify-between.text-xs div + div');
            if (recordCompletionText) {
                recordCompletionText.textContent = '0%';
            }
            
            // 清除计划列表标题
            const planListTitle = document.querySelector('.p-4.bg-blue-50 span');
            if (planListTitle) {
                planListTitle.textContent = '0/0 已完成';
            }
            
            console.log('仪表盘硬重置完成');
            
            // 重新初始化仪表盘
            return initializeDashboard();
        } catch (error) {
            console.error('仪表盘硬重置失败:', error);
            return false;
        }
    };

    // 修复记录数据，确保每条记录都有正确的分类
    fixRecordData = function() {
        try {
            const eventsData = localStorage.getItem('events');
            if (!eventsData) {
                console.log('没有找到事件数据');
                return false;
            }
            
            console.log('开始修复记录数据...');
            
            const events = JSON.parse(eventsData);
            let modified = false;
            
            const validCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
            
            // 先检查是否有重复ID的记录
            const recordIds = new Map();
            const duplicates = [];
            const validRecords = [];
            
            console.log(`正在检查 ${events.length} 条事件...`);
            
            // 第一遍：找出重复ID和有效ID
            events.forEach(event => {
                if (!event.id) {
                    event.id = 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    modified = true;
                    validRecords.push(event);
                    console.log(`为缺少ID的记录创建新ID: ${event.id}`);
                    return;
                }
                
                if (recordIds.has(event.id)) {
                    duplicates.push(event.id);
                    console.log(`发现重复ID: ${event.id}`);
                } else {
                    recordIds.set(event.id, event);
                    validRecords.push(event);
                }
            });
            
            // 如果有重复ID，重新生成新的ID
            if (duplicates.length > 0) {
                console.log(`发现 ${duplicates.length} 条重复ID的记录，正在修复...`);
                modified = true;
                
                // 收集所有ID
                const allIds = new Set(validRecords.map(r => r.id));
                
                // 处理重复ID的记录
                duplicates.forEach(dupId => {
                    // 获取所有使用这个ID的记录
                    const dupes = events.filter(e => e.id === dupId);
                    // 跳过第一个（已经在validRecords中），为其余的生成新ID
                    for (let i = 1; i < dupes.length; i++) {
                        let newId;
                        do {
                            newId = 'fixed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        } while (allIds.has(newId)); // 确保新ID不与现有ID冲突
                        
                        dupes[i].id = newId;
                        allIds.add(newId);
                        validRecords.push(dupes[i]);
                        console.log(`为重复ID的记录生成新ID: ${newId}`);
                    }
                });
            }
            
            // 修复每条记录的数据
            validRecords.forEach(event => {
                if (event.eventType === 'record') {
                    let recordModified = false;
                    
                    // 确保分类正确
                    if (!event.category || !validCategories.includes(event.category)) {
                        event.category = 'study'; // 默认设置为学习成长
                        console.log(`修复记录: ${event.title || '无标题'} (ID: ${event.id}) - 设置默认分类为 study`);
                        recordModified = true;
                    }
                    
                    // 严格限制标签只包含分类值
                    if (!event.tags || !Array.isArray(event.tags) || event.tags.length !== 1 || event.tags[0] !== event.category) {
                        event.tags = [event.category];
                        console.log(`修复记录: ${event.title || '无标题'} (ID: ${event.id}) - 重置标签为 [${event.category}]`);
                        recordModified = true;
                    }
                    
                    // 确保有标题
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
                        recordModified = true;
                        console.log(`修复记录ID ${event.id}: 设置默认标题为 "${event.title}"`);
                    }
                    
                    // 确保有日期
                    if (!event.startTime) {
                        event.startTime = new Date().toISOString();
                        recordModified = true;
                        console.log(`修复记录: ${event.title} (ID: ${event.id}) - 设置默认日期`);
                    }
                    
                    // 确保有创建和更新时间
                    if (!event.createdAt) {
                        event.createdAt = new Date().toISOString();
                        recordModified = true;
                        console.log(`修复记录: ${event.title} (ID: ${event.id}) - 设置默认创建时间`);
                    }
                    
                    if (!event.updatedAt) {
                        event.updatedAt = new Date().toISOString();
                        recordModified = true;
                        console.log(`修复记录: ${event.title} (ID: ${event.id}) - 设置默认更新时间`);
                    }
                    
                    if (recordModified) {
                        modified = true;
                    }
                }
            });
            
            if (modified) {
                // 保存修复后的数据
                localStorage.setItem('events', JSON.stringify(validRecords));
                console.log('记录数据已修复并保存，新的事件总数:', validRecords.length);
                return true;
            }
            
            console.log('没有需要修复的记录数据');
            return false;
        } catch (error) {
            console.error('修复记录数据时出错:', error);
            return false;
        }
    };

    // 修复计划数据，为没有dueDate的计划添加dueDate属性
    fixPlanData = function() {
        try {
            const eventsData = localStorage.getItem('events');
            if (!eventsData) return false;
            
            const events = JSON.parse(eventsData);
            let modified = false;
            
            events.forEach(event => {
                if (event.eventType === 'plan' && !event.dueDate && event.startTime) {
                    event.dueDate = event.startTime;
                    modified = true;
                    console.log(`Fixed plan: ${event.title} - added dueDate`);
                }
            });
            
            if (modified) {
                localStorage.setItem('events', JSON.stringify(events));
                console.log('Plan data fixed and saved');
                return true;
            }
            
            console.log('No plan data needed fixing');
            return false;
        } catch (error) {
            console.error('Error fixing plan data:', error);
            return false;
        }
    };

    // 调试函数，用于检查localStorage中的数据
    debugLocalStorage = function() {
        try {
            const eventsData = localStorage.getItem('events');
            const events = eventsData ? JSON.parse(eventsData) : [];
            console.log('===== localStorage Debug =====');
            console.log('Raw localStorage data:', eventsData);
            console.log('Parsed events:', events);
            console.log('Total events count:', events.length);
            console.log('Events by type:');
            const plans = events.filter(e => e.eventType === 'plan');
            const records = events.filter(e => e.eventType === 'record');
            console.log('- Plans:', plans.length);
            console.log('- Records:', records.length);
            
            // 获取本周日期范围
            const { firstDay, lastDay } = getWeekRange();
            console.log('Current week range:', 
                firstDay.toISOString().split('T')[0], 'to', 
                lastDay.toISOString().split('T')[0]);
            
            // 检查本周计划
            const weeklyPlans = plans.filter(plan => 
                new Date(plan.dueDate) >= firstDay && 
                new Date(plan.dueDate) <= lastDay
            );
            console.log('Weekly plans count:', weeklyPlans.length);
            
            if (weeklyPlans.length > 0) {
                console.log('Weekly plans details:');
                weeklyPlans.forEach((plan, index) => {
                    console.log(`Plan ${index + 1}:`, {
                        title: plan.title,
                        dueDate: plan.dueDate,
                        startTime: plan.startTime,
                        category: plan.category,
                        status: plan.status
                    });
                });
            } else {
                console.log('No plans for this week');
            }
            
            console.log('===== End Debug =====');
            return events;
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return [];
        }
    };

    // 获取本周日期范围
    function getWeekRange() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 是周日，1-6 是周一到周六
        
        // 计算本周的第一天（周一）
        const firstDay = new Date(today);
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果今天是周日，往前推6天；否则，往前推 (dayOfWeek - 1) 天
        firstDay.setDate(today.getDate() + mondayOffset);
        firstDay.setHours(0, 0, 0, 0); // 设置为当天的 00:00:00
        
        // 计算本周的最后一天（周日）
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        lastDay.setHours(23, 59, 59, 999); // 设置为当天的 23:59:59.999
        
        return { firstDay, lastDay };
    }

    // 初始化仪表盘
    initializeDashboard = function() {
        console.log('初始化仪表盘...');
        try {
            // 只有第一次初始化时注册事件监听器
            if (!isEventListenersRegistered) {
                registerEventListeners();
            }
            
            // 先修复可能存在的数据问题
            fixPlanData();
            fixRecordData();
            
            // 清除现有分类记录容器内容，确保不会残留旧数据
            clearCategoryContainers();
            
            // 从localStorage获取事件数据
            const eventsData = localStorage.getItem('events');
            const events = eventsData ? JSON.parse(eventsData) : [];
            console.log(`从localStorage加载了 ${events.length} 个事件`);
            
            // 获取本周日期范围
            const { firstDay, lastDay } = getWeekRange();
            console.log(`本周日期范围: ${firstDay.toISOString().split('T')[0]} 至 ${lastDay.toISOString().split('T')[0]}`);
            
            // 过滤出本周的计划和记录
            const weeklyPlans = events.filter(event => 
                event.eventType === 'plan' && 
                new Date(event.dueDate) >= firstDay && 
                new Date(event.dueDate) <= lastDay
            );
            
            const weeklyRecords = events.filter(event => 
                event.eventType === 'record' && 
                new Date(event.startTime) >= firstDay && 
                new Date(event.startTime) <= lastDay
            );
            
            console.log(`本周计划: ${weeklyPlans.length} 个`);
            console.log(`本周记录: ${weeklyRecords.length} 个`);
            
            // 打印记录的分类信息，用于调试
            if (weeklyRecords.length > 0) {
                console.log('记录分类详情:');
                weeklyRecords.forEach(record => {
                    console.log(`记录 "${record.title || '无标题'}" (ID: ${record.id}) - 分类: ${record.category}, 标签: [${record.tags ? record.tags.join(', ') : '无标签'}]`);
                });
            }
            
            // 更新仪表盘各部分
            updateWeeklyOverview(weeklyPlans, weeklyRecords);
            updateWeeklyPlans(weeklyPlans);
            updateCategoryRecords(weeklyRecords);
            
            isDashboardInitialized = true;
            console.log('仪表盘初始化完成');
            return true;
        } catch (error) {
            console.error('初始化仪表盘时出错:', error);
            return false;
        }
    };
    
    // 清除所有分类记录容器的内容
    function clearCategoryContainers() {
        const allCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
        const categoryNames = {
            'study': '学习成长',
            'experience': '体验突破',
            'leisure': '休闲放松',
            'family': '家庭生活',
            'work': '工作职业',
            'social': '人际社群'
        };
        
        allCategories.forEach(category => {
            const categoryTitle = categoryNames[category];
            
            // 查找分类容器
            let categoryContainer = null;
            const categoryTitleElements = document.querySelectorAll('h3.text-lg.font-semibold');
            
            for (const titleElement of categoryTitleElements) {
                if (titleElement.textContent.trim().includes(categoryTitle)) {
                    categoryContainer = titleElement.closest('.bg-white.rounded-lg.shadow');
                    break;
                }
            }
            
            if (!categoryContainer) {
                console.warn(`未找到分类 ${categoryTitle} 的容器，无法清除内容`);
                return;
            }
            
            // 获取标题容器
            const titleContainer = categoryContainer.querySelector('.flex.items-center.justify-between.mb-2');
            if (!titleContainer) {
                console.warn(`未找到分类 ${categoryTitle} 的标题容器，无法清除内容`);
                return;
            }
            
            // 移除标题中的记录数量标记
            const countBadge = titleContainer.querySelector('.ml-2.text-xs.bg-purple-100');
            if (countBadge) {
                countBadge.remove();
            }
            
            // 移除除了标题容器以外的所有子元素
            Array.from(categoryContainer.children).forEach(child => {
                if (child !== titleContainer) {
                    child.remove();
                }
            });
            
            console.log(`已清除分类 ${categoryTitle} 容器的内容`);
        });
    }
    
    // 立即初始化仪表盘
    initializeDashboard();
    
    // 防抖函数 - 避免短时间内多次触发同一个函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // 使用防抖处理仪表盘初始化 - 避免短时间内多次刷新
    const debouncedInitDashboard = debounce(function() {
        // 确保仪表盘只被刷新一次
        console.log('开始防抖刷新仪表盘...');
        initializeDashboard();
        console.log('仪表盘已通过防抖机制刷新');
    }, 300);
    
    // 只注册一次事件监听器
    function registerEventListeners() {
        if (isEventListenersRegistered) {
            console.log('事件监听器已注册，跳过重复注册');
            return;
        }
        
        console.log('首次注册事件监听器');
        
        // 监听新事件添加事件，使用防抖机制避免频繁刷新仪表盘
        document.addEventListener('event-added', function(e) {
            console.log('检测到新事件添加:', e.detail.event);
            // 使用防抖机制刷新仪表盘
            debouncedInitDashboard();
        });
        
        // 为刷新数据按钮添加事件监听
        const refreshButton = document.querySelector('.text-indigo-600.hover\\:text-indigo-800.flex.items-center.text-sm.font-medium');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                debouncedInitDashboard();
                showNotification('数据已刷新', 'success');
            });
        }
        
        isEventListenersRegistered = true;
    }
    
    // 从localStorage加载事件数据
    function loadEvents() {
        try {
            const eventsData = localStorage.getItem('events');
            return eventsData ? JSON.parse(eventsData) : [];
        } catch (error) {
            console.error('加载事件数据失败:', error);
            return [];
        }
    }
    
    // 更新本周概览
    function updateWeeklyOverview(weeklyPlans, weeklyRecords) {
        console.log(`更新本周概览，计划: ${weeklyPlans.length} 个，记录: ${weeklyRecords.length} 个`);
        
        try {
            // 计算计划完成情况
            const completedPlans = weeklyPlans.filter(plan => plan.status === 'completed');
            const completedPlansCount = completedPlans.length;
            const totalPlansCount = weeklyPlans.length;
            const planCompletionRate = totalPlansCount > 0 ? Math.round((completedPlansCount / totalPlansCount) * 100) : 0;
            
            console.log(`计划完成情况: ${completedPlansCount}/${totalPlansCount} (${planCompletionRate}%)`);
            
            // 更新本周待办卡片
            const planCountElement = document.querySelector('.rounded-full.bg-blue-100 + div .text-lg.font-bold');
            if (planCountElement) {
                planCountElement.textContent = `${totalPlansCount} 项`;
            } else {
                console.error('未找到计划数量显示元素');
            }
            
            const planProgressBar = document.querySelector('.rounded-full.bg-blue-100').closest('.bg-white').querySelector('.bg-blue-600');
            if (planProgressBar) {
                planProgressBar.style.width = `${planCompletionRate}%`;
            } else {
                console.error('未找到计划进度条元素');
            }
            
            const planCompletionText = document.querySelector('.rounded-full.bg-blue-100').closest('.bg-white').querySelector('.flex.justify-between.text-xs div + div');
            if (planCompletionText) {
                planCompletionText.textContent = `${completedPlansCount}/${totalPlansCount} (${planCompletionRate}%)`;
            } else {
                console.error('未找到计划完成率文本元素');
            }
            
            // 计算记录完成情况（这里我们假设所有记录都是已完成的）
            const recordsCount = weeklyRecords.length;
            console.log(`记录完成情况: ${recordsCount} 个`);
            
            // 更新本周完成卡片
            const recordCountElement = document.querySelector('.rounded-full.bg-green-100 + div .text-lg.font-bold');
            if (recordCountElement) {
                recordCountElement.textContent = `${recordsCount} 项`;
            } else {
                console.error('未找到记录数量显示元素');
            }
            
            // 计算完成率（这里我们假设目标是每周10条记录）
            const weeklyRecordTarget = 10;
            const recordCompletionRate = Math.min(Math.round((recordsCount / weeklyRecordTarget) * 100), 100);
            
            const recordProgressBar = document.querySelector('.rounded-full.bg-green-100').closest('.bg-white').querySelector('.bg-green-600');
            if (recordProgressBar) {
                recordProgressBar.style.width = `${recordCompletionRate}%`;
            } else {
                console.error('未找到记录进度条元素');
            }
            
            const recordCompletionText = document.querySelector('.rounded-full.bg-green-100').closest('.bg-white').querySelector('.flex.justify-between.text-xs div + div');
            if (recordCompletionText) {
                recordCompletionText.textContent = `${recordCompletionRate}%`;
            } else {
                console.error('未找到记录完成率文本元素');
            }
            
            // 更新效率趋势（这里我们假设上周的完成率是固定的，用于比较）
            const lastWeekRate = 60; // 假设上周完成率是60%
            const currentWeekRate = (planCompletionRate + recordCompletionRate) / 2;
            const trendDiff = currentWeekRate - lastWeekRate;
            const trendDirection = trendDiff >= 0 ? '↑' : '↓';
            const trendText = `${trendDirection} ${Math.abs(trendDiff)}%`;
            
            console.log(`效率趋势: ${trendText} (当前: ${currentWeekRate}%, 上周: ${lastWeekRate}%)`);
            
            const trendElement = document.querySelector('.rounded-full.bg-purple-100 + div .text-lg.font-bold');
            if (trendElement) {
                trendElement.textContent = trendText;
            } else {
                console.error('未找到趋势显示元素');
            }
            
            const trendProgressBar = document.querySelector('.rounded-full.bg-purple-100').closest('.bg-white').querySelector('.bg-purple-600');
            if (trendProgressBar) {
                trendProgressBar.style.width = `${currentWeekRate}%`;
            } else {
                console.error('未找到趋势进度条元素');
            }
            
            console.log('本周概览更新完成');
        } catch (error) {
            console.error('更新本周概览时出错:', error);
        }
    }
    
    // 更新分类记录
    function updateCategoryRecords(weeklyRecords) {
        console.log(`更新本周分类记录，共 ${weeklyRecords.length} 条记录`);
        
        // 在显示前再次检查和修复数据
        const validCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
        
        // 确保weeklyRecords是数组
        if (!Array.isArray(weeklyRecords)) {
            console.error('weeklyRecords不是数组，将使用空数组');
            weeklyRecords = [];
        }
        
        // 深拷贝记录数据，避免修改原始数据
        const safeRecords = JSON.parse(JSON.stringify(weeklyRecords));
        
        // 对记录进行ID去重处理
        const uniqueRecords = [];
        const recordIds = new Set();
        
        for (const record of safeRecords) {
            if (!record.id) {
                // 为无ID的记录生成一个新ID
                record.id = 'display_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log(`显示前修复: 为无ID记录创建ID: ${record.id}`);
            }
            
            if (!recordIds.has(record.id)) {
                recordIds.add(record.id);
                uniqueRecords.push(record);
            } else {
                console.log(`跳过显示重复ID的记录: ${record.id}, 标题: ${record.title || '无标题'}`);
            }
        }
        
        console.log(`去重后记录数量: ${uniqueRecords.length} (原始: ${weeklyRecords.length})`);
        
        // 在显示前确保每个记录都有正确的分类和标签
        uniqueRecords.forEach(record => {
            // 确保分类有效
            if (!validCategories.includes(record.category)) {
                record.category = 'study'; // 默认设置为学习成长
                console.log(`显示前修复: "${record.title || '(无标题)'}" - 设置默认分类为 study`);
            }
            
            // 确保标签数组只包含分类值
            if (!record.tags || !Array.isArray(record.tags)) {
                record.tags = [record.category];
                console.log(`显示前修复: "${record.title || '(无标题)'}" - 创建标签数组`);
            } else if (record.tags.length !== 1 || record.tags[0] !== record.category) {
                record.tags = [record.category];
                console.log(`显示前修复: "${record.title || '(无标题)'}" - 重置标签为 [${record.category}]`);
            }
        });
        
        // 定义所有支持的分类
        const allCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
        const categoryNames = {
            'study': '学习成长',
            'experience': '体验突破',
            'leisure': '休闲放松',
            'family': '家庭生活',
            'work': '工作职业',
            'social': '人际社群'
        };
        
        // 严格按分类分组记录 - 每个记录只能属于一个分类
        const recordsByCategory = {};
        allCategories.forEach(category => {
            // 筛选出严格属于当前分类的记录
            recordsByCategory[category] = uniqueRecords.filter(record => record.category === category);
            console.log(`分类 ${category} 筛选后记录数量: ${recordsByCategory[category].length}`);
        });
        
        // 处理每个分类的容器
        allCategories.forEach(category => {
            const categoryTitle = categoryNames[category];
            console.log(`处理分类 ${categoryTitle} 的内容`);
            
            // 查找分类容器
            let categoryContainer = null;
            const categoryTitleElements = document.querySelectorAll('h3.text-lg.font-semibold');
            
            for (const titleElement of categoryTitleElements) {
                if (titleElement.textContent.trim() === categoryTitle) {
                    categoryContainer = titleElement.closest('.bg-white.rounded-lg.shadow');
                    
                    // 添加记录数标记
                    const recordCount = recordsByCategory[category].length;
                    const countBadge = document.createElement('span');
                    countBadge.className = 'ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full';
                    countBadge.textContent = `${recordCount} 条`;
                    titleElement.appendChild(countBadge);
                    
                    break;
                }
            }
            
            if (!categoryContainer) {
                console.error(`未找到分类 ${categoryTitle} 的容器`);
                return; // 跳过当前分类处理
            }
            
            // 获取标题容器
            const titleContainer = categoryContainer.querySelector('.flex.items-center.justify-between.mb-2');
            if (!titleContainer) {
                console.error(`未找到分类 ${categoryTitle} 的标题容器`);
                return; // 跳过当前分类处理
            }
            
            // 清除现有的内容
            // 先移除所有空状态和记录容器
            const existingElements = categoryContainer.querySelectorAll('.flex.items-center.justify-center.h-20, .space-y-2');
            existingElements.forEach(element => element.remove());
            
            // 获取当前分类的记录
            const records = recordsByCategory[category];
            
            // 如果没有记录，显示空状态
            if (!records || records.length === 0) {
                console.log(`分类 ${categoryTitle} 没有记录，显示空状态`);
                const emptyState = document.createElement('div');
                emptyState.className = 'flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors';
                emptyState.innerHTML = '<p class="text-gray-400 text-sm">点击添加记录</p>';
                titleContainer.insertAdjacentElement('afterend', emptyState);
                
                // 为空状态添加点击事件
                emptyState.addEventListener('click', function() {
                    // 打开记录模态框
                    const recordModal = document.getElementById('modal-new-record');
                    if (recordModal) {
                        // 设置对应的分类
                        const typeRadio = document.querySelector(`input[name="record-type"][value="${category}"]`);
                        if (typeRadio) {
                            typeRadio.checked = true;
                        }
                        
                        // 显示模态框
                        recordModal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                    }
                });
                
                return; // 处理完成，返回
            }
            
            // 按日期倒序排序
            records.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            
            // 创建记录容器
            const recordsContainer = document.createElement('div');
            recordsContainer.className = 'space-y-2 max-h-64 overflow-y-auto pr-2 apple-scrollbar rounded-md transition-all';
            recordsContainer.style.backdropFilter = 'blur(5px)';
            recordsContainer.style.WebkitBackdropFilter = 'blur(5px)';
            recordsContainer.dataset.category = category; // 添加数据属性标记分类
            recordsContainer.dataset.page = '1'; // 当前页码
            recordsContainer.dataset.hasMore = (records.length > 10).toString(); // 是否有更多记录
            titleContainer.insertAdjacentElement('afterend', recordsContainer);
            
            // 初始显示10条记录
            const displayRecords = records.slice(0, 10);
            console.log(`分类 ${categoryTitle} 将显示 ${displayRecords.length} 条记录：`, 
                displayRecords.map(r => `${r.title || '(无标题)'} (ID: ${r.id})`).join(', '));
            
            // 添加记录项
            displayRecords.forEach(record => {
                addRecordItem(record, recordsContainer);
            });
            
            // 如果有更多记录，添加滚动监听
            if (records.length > 10) {
                // 移除旧的滚动事件监听器，避免重复
                recordsContainer.removeEventListener('scroll', recordScrollHandler);
                
                // 定义滚动事件处理函数
                function recordScrollHandler() {
                    // 当滚动到底部时加载更多
                    if (this.scrollHeight - this.scrollTop <= this.clientHeight + 50) {
                        const currentPage = parseInt(this.dataset.page || '1');
                        const hasMore = this.dataset.hasMore === 'true';
                        
                        if (hasMore) {
                            const nextPage = currentPage + 1;
                            const start = currentPage * 10;
                            const end = start + 10;
                            const nextRecords = records.slice(start, end);
                            
                            if (nextRecords.length > 0) {
                                console.log(`加载更多 ${categoryTitle} 记录，第 ${nextPage} 页`);
                                
                                // 添加新记录
                                nextRecords.forEach(record => {
                                    addRecordItem(record, recordsContainer);
                                });
                                
                                // 更新页码
                                this.dataset.page = nextPage.toString();
                                
                                // 检查是否还有更多记录
                                this.dataset.hasMore = (records.length > end).toString();
                            } else {
                                this.dataset.hasMore = 'false';
                            }
                        }
                    }
                }
                
                // 添加滚动事件监听
                recordsContainer.addEventListener('scroll', recordScrollHandler);
            }
        });
    }
    
    // 更新本周计划
    function updateWeeklyPlans(weeklyPlans) {
        console.log(`更新本周计划，共 ${weeklyPlans.length} 个计划`);
        
        try {
            // 计算完成的计划数量
            const completedPlans = weeklyPlans.filter(plan => plan.status === 'completed');
            const completedPlansCount = completedPlans.length;
            const totalPlansCount = weeklyPlans.length;
            
            console.log(`计划完成情况: ${completedPlansCount}/${totalPlansCount} 个已完成`);
            
            // 更新计划列表标题
            const planListTitle = document.querySelector('.p-4.bg-blue-50 span');
            if (planListTitle) {
                planListTitle.textContent = `${completedPlansCount}/${totalPlansCount} 已完成`;
                console.log('更新了计划列表标题');
            } else {
                console.error('未找到计划列表标题元素');
            }
            
            // 更新计划列表内容
            const planListContainer = document.querySelector('.p-4.space-y-3');
            if (!planListContainer) {
                console.error('未找到计划列表容器');
                return;
            }
            
            // 清空现有内容
            planListContainer.innerHTML = '';
            
            // 如果没有计划，显示空状态
            if (weeklyPlans.length === 0) {
                console.log('没有本周计划，显示空状态');
                const emptyState = document.createElement('div');
                emptyState.className = 'flex items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors';
                emptyState.innerHTML = '<p class="text-gray-400 text-sm">暂无计划，点击添加计划</p>';
                planListContainer.appendChild(emptyState);
                
                // 为空状态添加点击事件
                emptyState.addEventListener('click', function() {
                    // 打开计划模态框
                    const planModal = document.getElementById('modal-new-plan');
                    if (planModal) {
                        planModal.classList.remove('hidden');
                        document.body.style.overflow = 'hidden';
                    }
                });
                
                return;
            }
            
            // 按到期日期排序
            weeklyPlans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            // 最多显示5个计划
            const displayPlans = weeklyPlans.slice(0, 5);
            console.log(`将显示 ${displayPlans.length} 个计划`);
            
            // 添加计划项
            displayPlans.forEach(plan => {
                console.log(`添加计划: ${plan.title}`);
                
                const planItem = document.createElement('div');
                planItem.className = 'flex items-center p-3 bg-gray-50 rounded-lg group cursor-pointer';
                planItem.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                planItem.dataset.planId = plan.id; // 添加数据属性标记计划ID
                
                const isCompleted = plan.status === 'completed';
                const statusClass = isCompleted ? 
                    'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full task-status' : 
                    'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full task-status';
                const statusText = isCompleted ? '已完成' : '待处理';
                
                const dueDate = new Date(plan.dueDate);
                const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
                
                // 根据计划类型设置标签颜色
                const categoryColors = {
                    'work': 'red',
                    'study': 'blue',
                    'experience': 'purple',
                    'leisure': 'green',
                    'family': 'yellow',
                    'social': 'indigo'
                };
                
                // 分类名称中文映射
                const categoryNames = {
                    'work': '工作职业',
                    'study': '学习成长',
                    'experience': '体验突破',
                    'leisure': '休闲放松',
                    'family': '家庭生活',
                    'social': '人际社群'
                };
                
                // 优先级样式和名称
                const priorityColors = {
                    'high': 'red',
                    'medium': 'yellow',
                    'low': 'green'
                };
                
                const priorityNames = {
                    'high': '高',
                    'medium': '中',
                    'low': '低'
                };
                
                const categoryColor = categoryColors[plan.category] || 'gray';
                const categoryName = categoryNames[plan.category] || plan.category;
                
                const priorityColor = priorityColors[plan.priority] || 'gray';
                const priorityName = priorityNames[plan.priority] || '中';
                
                planItem.innerHTML = `
                    <input type="checkbox" class="h-5 w-5 text-blue-600 rounded task-checkbox" ${isCompleted ? 'checked' : ''} data-status="${isCompleted ? 'completed' : 'pending'}" data-plan-id="${plan.id}">
                    <div class="ml-3 flex-1">
                        <p class="text-gray-800 font-medium">${plan.title}</p>
                        <div class="flex items-center flex-wrap">
                            <p class="text-sm text-gray-500 mr-2">截止日期：${formattedDueDate}</p>
                            <span class="px-2 py-0.5 bg-${categoryColor}-50 text-${categoryColor}-700 text-xs rounded-full flex items-center mr-2">
                                <span class="w-2 h-2 bg-${categoryColor}-500 rounded-full mr-1"></span>${categoryName}
                            </span>
                            <span class="px-2 py-0.5 bg-${priorityColor}-50 text-${priorityColor}-700 text-xs rounded-full flex items-center">
                                <span class="w-2 h-2 bg-${priorityColor}-500 rounded-full mr-1"></span>优先级：${priorityName}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="${statusClass} mr-2">${statusText}</span>
                        <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="text-gray-400 hover:text-gray-600 edit-plan-btn" data-plan-id="${plan.id}">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button class="text-gray-400 hover:text-gray-600 delete-plan-btn" data-plan-id="${plan.id}">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // 添加任务复选框事件
                const checkbox = planItem.querySelector('.task-checkbox');
                checkbox.addEventListener('change', function() {
                    const statusLabel = planItem.querySelector('.task-status');
                    
                    if (this.checked) {
                        // 任务被标记为完成
                        statusLabel.textContent = '已完成';
                        statusLabel.className = 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full task-status mr-2';
                        this.dataset.status = 'completed';
                    } else {
                        // 任务被标记为未完成
                        statusLabel.textContent = '待处理';
                        statusLabel.className = 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full task-status mr-2';
                        this.dataset.status = 'pending';
                    }
                    
                    // 更新localStorage中的计划状态
                    updatePlanStatus(this.dataset.planId, this.checked ? 'completed' : 'pending');
                });
                
                // 添加编辑按钮事件
                const editBtn = planItem.querySelector('.edit-plan-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const planId = this.dataset.planId;
                        editPlan(planId);
                    });
                }
                
                // 添加删除按钮事件
                const deleteBtn = planItem.querySelector('.delete-plan-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const planId = this.dataset.planId;
                        if (confirm('确定要删除这个计划吗？')) {
                            deletePlan(planId);
                        }
                    });
                }
                
                // 整个计划项的点击事件触发编辑
                planItem.addEventListener('click', function() {
                    const planId = this.dataset.planId;
                    editPlan(planId);
                });
                
                planListContainer.appendChild(planItem);
            });
            
            console.log('本周计划更新完成');
        } catch (error) {
            console.error('更新本周计划时出错:', error);
        }
    }
    
    // 更新计划状态
    function updatePlanStatus(planId, status) {
        try {
            const eventsData = localStorage.getItem('events');
            const events = eventsData ? JSON.parse(eventsData) : [];
            
            const planIndex = events.findIndex(event => event.id === planId);
            if (planIndex !== -1) {
                events[planIndex].status = status;
                localStorage.setItem('events', JSON.stringify(events));
                console.log(`更新了计划 ${planId} 的状态为 ${status}`);
                
                // 刷新仪表盘
                initializeDashboard();
            }
        } catch (error) {
            console.error('更新计划状态时出错:', error);
        }
    }
    
    // 显示通知
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        
        // 根据类型设置样式
        let bgColor, textColor, icon;
        switch (type) {
            case 'success':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                icon = 'fa-check-circle';
                break;
            case 'error':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                icon = 'fa-exclamation-circle';
                break;
            case 'warning':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                icon = 'fa-exclamation-triangle';
                break;
            case 'info':
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                icon = 'fa-info-circle';
                break;
            default:
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-800';
                icon = 'fa-bell';
        }
        
        notification.className = `fixed top-4 right-4 ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-md flex items-center z-50 transform transition-all duration-300 ease-in-out translate-x-full`;
        notification.innerHTML = `
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 编辑记录函数
    function editRecord(recordId) {
        console.log('编辑记录:', recordId);
        
        // 获取事件数据
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const record = events.find(event => event.id === recordId);
        
        if (!record) {
            showNotification('找不到要编辑的记录', 'error');
            return;
        }
        
        // 设置表单为编辑模式
        const form = document.getElementById('new-record-form');
        form.dataset.mode = 'edit';
        form.dataset.eventId = recordId;
        
        // 填充表单数据
        document.getElementById('record-title').value = record.title;
        document.getElementById('record-desc').value = record.description || '';
        
        // 设置日期和时间
        if (record.startTime) {
            const date = new Date(record.startTime);
            
            // 设置日期
            const dateInput = document.getElementById('record-date');
            if (dateInput) {
                const formattedDate = date.toISOString().split('T')[0];
                dateInput.value = formattedDate;
            }
            
            // 设置时间
            const timeInput = document.getElementById('record-time');
            if (timeInput) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const formattedTime = `${hours}:${minutes}`;
                timeInput.value = formattedTime;
            }
        }
        
        // 设置类型
        if (record.category) {
            const typeRadio = document.querySelector(`input[name="record-type"][value="${record.category}"]`);
            if (typeRadio) {
                typeRadio.checked = true;
            }
        }
        
        // 显示删除按钮
        const deleteButton = document.getElementById('delete-record-btn');
        if (deleteButton) {
            deleteButton.classList.remove('hidden');
            // 确保删除按钮有事件监听器
            deleteButton.onclick = function() {
                if (confirm('确定要删除这条记录吗？')) {
                    deleteRecord(recordId);
                    // 关闭模态框
                    document.getElementById('modal-new-record').classList.add('hidden');
                    document.body.style.overflow = '';
                }
            };
        }
        
        // 打开模态框
        const modal = document.getElementById('modal-new-record');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // 删除记录函数
    function deleteRecord(recordId) {
        console.log('删除记录:', recordId);
        
        try {
            // 从localStorage获取现有事件
            const events = JSON.parse(localStorage.getItem('events')) || [];
            
            // 找到要删除的记录索引
            const recordIndex = events.findIndex(event => event.id === recordId);
            
            if (recordIndex === -1) {
                showNotification('找不到要删除的记录', 'error');
                return false;
            }
            
            // 删除记录
            events.splice(recordIndex, 1);
            
            // 保存回localStorage
            localStorage.setItem('events', JSON.stringify(events));
            
            // 显示通知
            showNotification('记录已成功删除！');
            
            // 刷新仪表盘
            initializeDashboard();
            
            return true;
        } catch (error) {
            console.error('删除记录时出错:', error);
            showNotification('删除记录时出错: ' + error.message, 'error');
            return false;
        }
    }

    // 添加记录项函数
    function addRecordItem(record, container) {
        const recordTitle = record.title || '(无标题)';
        const recordDate = new Date(record.startTime);
        const formattedDate = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(recordDate.getHours()).padStart(2, '0')}:${String(recordDate.getMinutes()).padStart(2, '0')}`;
        
        console.log(`创建记录项: ${recordTitle}, 日期: ${formattedDate}, 时间: ${formattedTime}, 分类: ${record.category}, ID: ${record.id}`);
        
        const recordItem = document.createElement('div');
        recordItem.className = 'flex items-start p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 group cursor-pointer';
        recordItem.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        recordItem.dataset.recordId = record.id; // 添加数据属性标记记录ID
        recordItem.innerHTML = `
            <div class="w-4 h-4 mt-1 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-check text-purple-600 text-xs"></i>
            </div>
            <div class="ml-3 flex-1">
                <p class="text-gray-800 text-sm font-medium">${recordTitle}</p>
                <p class="text-xs text-gray-500">${formattedDate} ${formattedTime}</p>
            </div>
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="text-gray-400 hover:text-gray-600 edit-record-btn" data-record-id="${record.id}">
                    <i class="fas fa-edit text-xs"></i>
                </button>
                <button class="text-gray-400 hover:text-gray-600 delete-record-btn" data-record-id="${record.id}">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
        `;
        
        container.appendChild(recordItem);
        
        // 添加编辑按钮点击事件
        const editBtn = recordItem.querySelector('.edit-record-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                const recordId = this.dataset.recordId;
                editRecord(recordId);
            });
        }
        
        // 添加删除按钮点击事件
        const deleteBtn = recordItem.querySelector('.delete-record-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                const recordId = this.dataset.recordId;
                if (confirm('确定要删除这条记录吗？')) {
                    deleteRecord(recordId);
                }
            });
        }
        
        // 整个记录项的点击事件仍然触发编辑
        recordItem.addEventListener('click', function() {
            const recordId = this.dataset.recordId;
            editRecord(recordId);
        });
    }

    // 编辑计划函数
    function editPlan(planId) {
        console.log('编辑计划:', planId);
        
        // 获取事件数据
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const plan = events.find(event => event.id === planId);
        
        if (!plan) {
            showNotification('找不到要编辑的计划', 'error');
            return;
        }
        
        // 设置表单为编辑模式
        const form = document.getElementById('new-plan-form');
        form.dataset.mode = 'edit';
        form.dataset.eventId = planId;
        
        // 填充表单数据
        document.getElementById('plan-title').value = plan.title;
        document.getElementById('plan-desc').value = plan.description || '';
        
        // 设置日期 - 从ISO日期字符串中提取日期部分
        const dateInput = document.getElementById('plan-due-date');
        if (dateInput && plan.dueDate) {
            const date = new Date(plan.dueDate);
            const formattedDate = date.toISOString().split('T')[0];
            dateInput.value = formattedDate;
        }
        
        // 设置类型
        if (plan.category) {
            const typeRadio = document.querySelector(`input[name="plan-type"][value="${plan.category}"]`);
            if (typeRadio) {
                typeRadio.checked = true;
            }
        }
        
        // 设置优先级
        if (plan.priority) {
            const priorityRadio = document.querySelector(`input[name="priority"][value="${plan.priority}"]`);
            if (priorityRadio) {
                priorityRadio.checked = true;
            }
        }
        
        // 打开模态框
        const modal = document.getElementById('modal-new-plan');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    // 删除计划函数
    function deletePlan(planId) {
        console.log('删除计划:', planId);
        
        try {
            // 从localStorage获取现有事件
            const events = JSON.parse(localStorage.getItem('events')) || [];
            
            // 找到要删除的计划索引
            const planIndex = events.findIndex(event => event.id === planId);
            
            if (planIndex === -1) {
                showNotification('找不到要删除的计划', 'error');
                return false;
            }
            
            // 删除计划
            events.splice(planIndex, 1);
            
            // 保存回localStorage
            localStorage.setItem('events', JSON.stringify(events));
            
            // 显示通知
            showNotification('计划已成功删除！');
            
            // 刷新仪表盘
            initializeDashboard();
            
            return true;
        } catch (error) {
            console.error('删除计划时出错:', error);
            showNotification('删除计划时出错: ' + error.message, 'error');
            return false;
        }
    }
}); 