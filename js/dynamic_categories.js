/**
 * 动态分类选择器更新模块
 * 负责在分类变更时同步更新各个模块的分类选择器
 */

class DynamicCategoriesUpdater {
    constructor() {
        this.observers = [];
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 监听分类数据变化
        this.setupStorageListener();
        console.log('动态分类更新器初始化完成');
    }

    /**
     * 设置localStorage监听器
     */
    setupStorageListener() {
        // 监听storage事件（跨标签页同步）
        window.addEventListener('storage', (e) => {
            if (e.key === 'eventRecorderCategories') {
                console.log('检测到分类数据变化，更新所有选择器');
                this.updateAllSelectors();
            }
        });

        // 监听自定义事件（同页面内同步）
        window.addEventListener('categoriesUpdated', () => {
            console.log('接收到分类更新事件，更新所有选择器');
            this.updateAllSelectors();
        });
    }

    /**
     * 注册观察者
     * @param {Function} callback 回调函数
     * @param {string} scope 适用范围 ('plan', 'event', 'all')
     */
    registerObserver(callback, scope = 'all') {
        this.observers.push({ callback, scope });
    }

    /**
     * 移除观察者
     * @param {Function} callback 回调函数
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(observer => observer.callback !== callback);
    }

    /**
     * 通知所有观察者
     * @param {string} scope 适用范围
     */
    notifyObservers(scope = 'all') {
        this.observers.forEach(observer => {
            if (observer.scope === 'all' || observer.scope === scope) {
                try {
                    observer.callback();
                } catch (error) {
                    console.error('观察者回调执行失败:', error);
                }
            }
        });
    }

    /**
     * 更新所有分类选择器
     */
    updateAllSelectors() {
        // 更新新建计划模态框的分类选择器
        this.updatePlanCategorySelector();
        
        // 更新新建事件模态框的分类选择器
        this.updateEventCategorySelector();
        
        // 更新标签管理页面的分类选择器
        this.updateTagsCategorySelectors();
        
        // 更新首页分类记录显示
        this.updateDashboardCategories();
        
        // 通知观察者
        this.notifyObservers();
    }

    /**
     * 更新新建计划模态框的分类选择器
     */
    updatePlanCategorySelector() {
        // 更新select形式的分类选择器
        const selector = document.getElementById('plan-type');
        if (selector) {
            try {
                const categories = window.categoriesManager ? 
                    window.categoriesManager.getCategoriesByScope('plan') : [];
                
                this.updateSelectElement(selector, categories);
                console.log('更新计划分类选择器成功');
            } catch (error) {
                console.error('更新计划分类选择器失败:', error);
            }
        }

        // 更新单选按钮形式的分类选择器
        this.updatePlanRadioButtons();
    }

    /**
     * 更新新建事件模态框的分类选择器
     */
    updateEventCategorySelector() {
        const selectors = [
            document.getElementById('record-type'),
            document.getElementById('eventCategory')
        ];

        selectors.forEach(selector => {
            if (!selector) return;

            try {
                const categories = window.categoriesManager ? 
                    window.categoriesManager.getCategoriesByScope('event') : [];
                
                this.updateSelectElement(selector, categories);
                console.log('更新事件分类选择器成功');
            } catch (error) {
                console.error('更新事件分类选择器失败:', error);
            }
        });

        // 更新单选按钮形式的分类选择器
        this.updateRecordRadioButtons();
    }

    /**
     * 更新标签管理页面的分类选择器
     */
    updateTagsCategorySelectors() {
        const selectors = [
            document.getElementById('filterTags'),
            document.getElementById('tagCategorySelect')
        ];

        selectors.forEach(selector => {
            if (!selector) return;

            try {
                const categories = window.categoriesManager ? 
                    window.categoriesManager.getCategories() : [];
                
                // 标签管理页面的选择器需要包含"全部分类"选项
                if (selector.id === 'filterTags') {
                    this.updateFilterSelectElement(selector, categories);
                } else {
                    this.updateSelectElement(selector, categories);
                }
                console.log('更新标签管理分类选择器成功');
            } catch (error) {
                console.error('更新标签管理分类选择器失败:', error);
            }
        });
    }

    /**
     * 更新首页分类记录显示
     */
    updateDashboardCategories() {
        // 如果在首页，触发分类记录更新
        if (typeof updateCategoryRecords === 'function') {
            try {
                // 获取当前周记录并重新渲染
                const weeklyRecords = JSON.parse(localStorage.getItem('weeklyRecords') || '[]');
                updateCategoryRecords(weeklyRecords);
                console.log('更新首页分类记录成功');
            } catch (error) {
                console.error('更新首页分类记录失败:', error);
            }
        }
    }

    /**
     * 更新select元素的选项
     * @param {HTMLSelectElement} selectElement select元素
     * @param {Array} categories 分类数组
     */
    updateSelectElement(selectElement, categories) {
        if (!selectElement || !Array.isArray(categories)) return;

        // 保存当前选中值
        const currentValue = selectElement.value;
        
        // 清空现有选项
        selectElement.innerHTML = '';
        
        // 添加新选项
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });
        
        // 尝试恢复之前的选中值
        if (currentValue && categories.some(cat => cat.id === currentValue)) {
            selectElement.value = currentValue;
        } else if (categories.length > 0) {
            // 如果之前的值不存在，选择第一个选项
            selectElement.value = categories[0].id;
        }
    }

    /**
     * 更新过滤器select元素的选项（包含"全部"选项）
     * @param {HTMLSelectElement} selectElement select元素
     * @param {Array} categories 分类数组
     */
    updateFilterSelectElement(selectElement, categories) {
        if (!selectElement || !Array.isArray(categories)) return;

        // 保存当前选中值
        const currentValue = selectElement.value;
        
        // 清空现有选项
        selectElement.innerHTML = '';
        
        // 添加"全部分类"选项
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '全部分类';
        selectElement.appendChild(allOption);
        
        // 添加分类选项
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });
        
        // 尝试恢复之前的选中值
        if (currentValue && (currentValue === 'all' || categories.some(cat => cat.id === currentValue))) {
            selectElement.value = currentValue;
        } else {
            // 默认选择"全部分类"
            selectElement.value = 'all';
        }
    }

    /**
     * 更新计划单选按钮分类选择器
     */
    updatePlanRadioButtons() {
        const categories = window.categoriesManager ? 
            window.categoriesManager.getCategoriesByScope('plan') : [];
        
        if (categories.length === 0) return;

        // 查找所有计划类型容器
        const planTypeContainers = document.querySelectorAll('.plan-type-option');
        const parentContainers = [];
        
        planTypeContainers.forEach(container => {
            const parent = container.closest('.space-y-3, .grid');
            if (parent && !parentContainers.includes(parent)) {
                parentContainers.push(parent);
            }
        });

        parentContainers.forEach(container => {
            this.updateRadioButtonContainer(container, categories, 'plan-type', 'type-');
        });
    }

    /**
     * 更新记录单选按钮分类选择器
     */
    updateRecordRadioButtons() {
        const categories = window.categoriesManager ? 
            window.categoriesManager.getCategoriesByScope('event') : [];
        
        if (categories.length === 0) return;

        // 查找所有记录类型容器
        const recordTypeContainers = document.querySelectorAll('.record-type-option');
        const parentContainers = [];
        
        recordTypeContainers.forEach(container => {
            const parent = container.closest('.space-y-3, .grid');
            if (parent && !parentContainers.includes(parent)) {
                parentContainers.push(parent);
            }
        });

        parentContainers.forEach(container => {
            this.updateRadioButtonContainer(container, categories, 'record-type', 'rec-type-');
        });
    }

    /**
     * 更新单选按钮容器
     * @param {HTMLElement} container 容器元素
     * @param {Array} categories 分类数组
     * @param {string} radioName 单选按钮名称
     * @param {string} idPrefix ID前缀
     */
    updateRadioButtonContainer(container, categories, radioName, idPrefix) {
        if (!container || !Array.isArray(categories)) return;

        // 保存当前选中的值
        const currentChecked = container.querySelector(`input[name="${radioName}"]:checked`);
        const currentValue = currentChecked ? currentChecked.value : null;

        // 清空容器
        container.innerHTML = '';

        // 为每个分类创建单选按钮选项
        categories.forEach((category, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = `flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer ${radioName}-option`;
            
            const isChecked = currentValue === category.id || (!currentValue && index === 0);
            
            optionDiv.innerHTML = `
                <input type="radio" name="${radioName}" id="${idPrefix}${category.id}" class="mr-2" value="${category.id}" ${isChecked ? 'checked' : ''}>
                <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${category.color}"></div>
                    <label for="${idPrefix}${category.id}" class="text-sm font-medium text-gray-700 cursor-pointer">${category.name}</label>
                </div>
            `;

            // 添加点击事件
            optionDiv.addEventListener('click', (e) => {
                if (e.target.type !== 'radio') {
                    const radio = optionDiv.querySelector('input[type="radio"]');
                    radio.checked = true;
                    
                    // 触发change事件
                    const changeEvent = new Event('change', { bubbles: true });
                    radio.dispatchEvent(changeEvent);
                }
            });

            container.appendChild(optionDiv);
        });

        console.log(`更新${radioName}单选按钮成功，共${categories.length}个选项`);
    }

    /**
     * 手动触发分类更新
     */
    triggerUpdate() {
        this.updateAllSelectors();
        
        // 触发自定义事件
        const event = new CustomEvent('categoriesUpdated');
        window.dispatchEvent(event);
    }

    /**
     * 获取分类名称映射表
     * @returns {Object} 分类名称映射表
     */
    getCategoryNameMap() {
        if (window.categoriesManager) {
            return window.categoriesManager.getCategoryNameMap();
        }
        
        // 如果管理器不可用，返回默认映射
        return {
            'study': '学习成长',
            'experience': '体验突破',
            'leisure': '休闲放松',
            'family': '家庭生活',
            'work': '工作职业',
            'social': '人际社群'
        };
    }

    /**
     * 获取分类ID映射表
     * @returns {Object} 分类ID映射表
     */
    getCategoryIdMap() {
        if (window.categoriesManager) {
            return window.categoriesManager.getCategoryIdMap();
        }
        
        // 如果管理器不可用，返回默认映射
        return {
            '学习成长': 'study',
            '体验突破': 'experience',
            '休闲放松': 'leisure',
            '家庭生活': 'family',
            '工作职业': 'work',
            '人际社群': 'social'
        };
    }

    /**
     * 根据中文名称获取分类ID
     * @param {string} chineseName 中文名称
     * @returns {string|null} 分类ID
     */
    getCategoryIdByChineseName(chineseName) {
        const idMap = this.getCategoryIdMap();
        return idMap[chineseName] || null;
    }

    /**
     * 根据分类ID获取中文名称
     * @param {string} categoryId 分类ID
     * @returns {string|null} 中文名称
     */
    getChineseNameByCategoryId(categoryId) {
        const nameMap = this.getCategoryNameMap();
        return nameMap[categoryId] || null;
    }

    /**
     * 验证分类ID是否有效
     * @param {string} categoryId 分类ID
     * @returns {boolean} 是否有效
     */
    isValidCategoryId(categoryId) {
        if (window.categoriesManager) {
            const category = window.categoriesManager.getCategoryById(categoryId);
            return !!category;
        }
        
        // 如果管理器不可用，检查默认分类
        const defaultCategories = ['study', 'experience', 'leisure', 'family', 'work', 'social'];
        return defaultCategories.includes(categoryId);
    }

    /**
     * 修复记录的分类字段
     * @param {Array} records 记录数组
     * @returns {Array} 修复后的记录数组
     */
    fixRecordCategories(records) {
        if (!Array.isArray(records)) return [];

        const nameMap = this.getCategoryNameMap();
        const idMap = this.getCategoryIdMap();
        const validIds = Object.keys(nameMap);

        return records.map(record => {
            const fixedRecord = { ...record };

            // 如果category是中文名称，转换为ID
            if (record.category && idMap[record.category]) {
                fixedRecord.category = idMap[record.category];
            }
            
            // 如果category不是有效ID，设置为默认值
            if (!validIds.includes(fixedRecord.category)) {
                fixedRecord.category = 'study'; // 默认为学习成长
                console.log(`修复记录分类: "${record.title || '(无标题)'}" - 设置为默认分类 study`);
            }

            // 确保tags数组与category一致
            if (!fixedRecord.tags || !Array.isArray(fixedRecord.tags)) {
                fixedRecord.tags = [fixedRecord.category];
            } else if (fixedRecord.tags.length !== 1 || fixedRecord.tags[0] !== fixedRecord.category) {
                fixedRecord.tags = [fixedRecord.category];
            }

            return fixedRecord;
        });
    }
}

// 创建全局实例
window.dynamicCategoriesUpdater = new DynamicCategoriesUpdater();

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DynamicCategoriesUpdater, dynamicCategoriesUpdater: window.dynamicCategoriesUpdater };
}

// 提供全局函数供其他模块使用
window.getCategoryNameMap = function() {
    return window.dynamicCategoriesUpdater.getCategoryNameMap();
};

window.getCategoryIdMap = function() {
    return window.dynamicCategoriesUpdater.getCategoryIdMap();
};

window.updateCategorySelectors = function() {
    window.dynamicCategoriesUpdater.triggerUpdate();
}; 