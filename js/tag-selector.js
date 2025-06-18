/**
 * 标签选择器组件
 * 提供标签选择界面和交互功能
 */

class TagSelector {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            scope: options.scope || 'both', // 'plan', 'event', 'both'
            maxSelection: options.maxSelection || null, // 最大选择数量
            showSearch: options.showSearch !== false, // 是否显示搜索框
            showCategories: options.showCategories !== false, // 是否按分类分组
            allowCreate: options.allowCreate || false, // 是否允许创建新标签
            ...options
        };
        this.selectedTags = new Set();
        this.allTags = [];
        this.filteredTags = [];
        this.searchKeyword = '';
        this.selectedCategory = 'all';
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error('标签选择器容器不存在:', this.containerId);
            return;
        }

        this.loadTags();
        this.render();
        this.bindEvents();
    }

    /**
     * 加载标签数据
     */
    loadTags() {
        if (!window.tagsManager) {
            console.error('标签管理器未初始化');
            return;
        }

        // 根据适用范围获取标签
        if (this.options.scope === 'both') {
            this.allTags = window.tagsManager.getTags();
        } else {
            this.allTags = window.tagsManager.getTagsByScope(this.options.scope);
        }

        this.filteredTags = [...this.allTags];
        console.log('加载标签数据:', this.allTags.length, '个标签');
    }

    /**
     * 渲染组件
     */
    render() {
        // 如果同时关闭搜索和分类功能，使用简化版本
        if (!this.options.showSearch && !this.options.showCategories) {
            this.renderSimple();
            return;
        }
        
        // 使用完整版本
        const html = `
            <div class="tag-selector">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderTagList()}
                ${this.renderSelectedTags()}
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    /**
     * 渲染简化版本
     */
    renderSimple() {
        const html = `
            <div class="tag-selector">
                ${this.renderSimpleHeader()}
                ${this.renderSimpleTagList()}
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    /**
     * 渲染简化版头部
     */
    renderSimpleHeader() {
        return `
            <div class="tag-selector-header mb-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">
                        已选择 <span class="selected-count">${this.selectedTags.size}</span> 个标签
                        ${this.options.maxSelection ? `/ ${this.options.maxSelection}` : ''}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * 渲染简化版标签列表
     */
    renderSimpleTagList() {
        if (this.filteredTags.length === 0) {
            return `
                <div class="tag-list-empty text-center py-8 text-gray-500">
                    <i class="fas fa-tags text-2xl mb-2"></i>
                    <p>暂无可用标签</p>
                </div>
            `;
        }

        return `
            <div class="tag-list grid grid-cols-6 gap-3">
                ${this.filteredTags.map(tag => this.renderCheckboxTagCard(tag)).join('')}
            </div>
        `;
    }

    /**
     * 渲染checkbox样式的标签卡片（类似计划类型）
     */
    renderCheckboxTagCard(tag) {
        const isSelected = this.selectedTags.has(tag.id);
        const isDisabled = this.options.maxSelection && 
                          !isSelected && 
                          this.selectedTags.size >= this.options.maxSelection;
        
        return `
            <div class="flex items-center px-3 py-2 border rounded-lg hover:bg-blue-50 cursor-pointer tag-option ${isDisabled ? 'opacity-50' : ''}" 
                 data-tag-id="${tag.id}">
                <input type="checkbox" 
                       id="tag-${tag.id}" 
                       class="mr-2" 
                       ${isSelected ? 'checked' : ''} 
                       ${isDisabled ? 'disabled' : ''}>
                <label for="tag-${tag.id}" class="cursor-pointer flex-1 text-lg">
                    ${tag.name}
                </label>
            </div>
        `;
    }

    /**
     * 渲染标签按钮
     */
    renderTagButtons(tags) {
        return `
            <div class="flex flex-wrap gap-2">
                ${tags.map(tag => this.renderTagCard(tag)).join('')}
            </div>
        `;
    }

    /**
     * 渲染头部
     */
    renderHeader() {
        return `
            <div class="tag-selector-header mb-3">
                <div class="flex justify-between items-center">
                    <label class="block text-gray-700 font-medium">选择标签</label>
                    <span class="text-sm text-gray-500">
                        已选择 <span class="selected-count">${this.selectedTags.size}</span> 个标签
                        ${this.options.maxSelection ? `/ ${this.options.maxSelection}` : ''}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * 渲染过滤器
     */
    renderFilters() {
        if (!this.options.showSearch && !this.options.showCategories) {
            return '';
        }

        let html = '<div class="tag-selector-filters mb-3">';
        
        if (this.options.showSearch) {
            html += `
                <div class="mb-2">
                    <input type="text" 
                           class="tag-search-input w-full px-3 py-2 border rounded-lg text-sm" 
                           placeholder="搜索标签..." 
                           value="${this.searchKeyword}">
                </div>
            `;
        }

        if (this.options.showCategories && window.categoriesManager) {
            const categories = window.categoriesManager.getCategories();
            html += `
                <div class="mb-2">
                    <select class="tag-category-filter w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="all">所有分类</option>
                        ${categories.map(cat => 
                            `<option value="${cat.id}" ${this.selectedCategory === cat.id ? 'selected' : ''}>
                                ${cat.displayName}
                            </option>`
                        ).join('')}
                    </select>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    /**
     * 渲染标签列表
     */
    renderTagList() {
        if (this.filteredTags.length === 0) {
            return `
                <div class="tag-list-empty text-center py-8 text-gray-500">
                    <i class="fas fa-tags text-2xl mb-2"></i>
                    <p>暂无可用标签</p>
                    ${this.options.allowCreate ? '<p class="text-sm">您可以在标签管理中创建新标签</p>' : ''}
                </div>
            `;
        }

        let html = '<div class="tag-list max-h-48 overflow-y-auto border rounded-lg p-3">';
        
        if (this.options.showCategories && window.categoriesManager) {
            // 按分类分组显示
            const categories = window.categoriesManager.getCategories();
            const uncategorizedTags = this.filteredTags.filter(tag => !tag.categoryId);
            
            categories.forEach(category => {
                const categoryTags = this.filteredTags.filter(tag => tag.categoryId === category.id);
                if (categoryTags.length > 0) {
                    html += this.renderCategoryGroup(category, categoryTags);
                }
            });
            
            if (uncategorizedTags.length > 0) {
                html += this.renderCategoryGroup({ displayName: '未分类', id: 'uncategorized' }, uncategorizedTags);
            }
        } else {
            // 直接显示所有标签
            html += this.renderTagCards(this.filteredTags);
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 渲染分类组
     */
    renderCategoryGroup(category, tags) {
        return `
            <div class="tag-category-group mb-4">
                <div class="category-header text-sm font-medium text-gray-600 mb-2 pb-1 border-b">
                    ${category.displayName} (${tags.length})
                </div>
                <div class="category-tags">
                    ${this.renderTagCards(tags)}
                </div>
            </div>
        `;
    }

    /**
     * 渲染标签卡片
     */
    renderTagCards(tags) {
        return `
            <div class="flex flex-wrap gap-2">
                ${tags.map(tag => this.renderTagCard(tag)).join('')}
            </div>
        `;
    }

    /**
     * 渲染单个标签卡片
     */
    renderTagCard(tag) {
        const isSelected = this.selectedTags.has(tag.id);
        const isDisabled = this.options.maxSelection && 
                          !isSelected && 
                          this.selectedTags.size >= this.options.maxSelection;
        
        return `
            <div class="tag-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                 data-tag-id="${tag.id}"
                 style="--tag-color: ${tag.color}">
                <span class="tag-color" style="background-color: ${tag.color}"></span>
                <span class="tag-name">${tag.name}</span>
                ${isSelected ? '<i class="fas fa-check tag-check"></i>' : ''}
            </div>
        `;
    }

    /**
     * 渲染已选标签
     */
    renderSelectedTags() {
        if (this.selectedTags.size === 0) {
            return '';
        }

        const selectedTagsArray = Array.from(this.selectedTags).map(id => 
            this.allTags.find(tag => tag.id === id)
        ).filter(Boolean);

        return `
            <div class="selected-tags-section mt-3 pt-3 border-t">
                <div class="text-sm font-medium text-gray-600 mb-2">已选择的标签：</div>
                <div class="selected-tags-list flex flex-wrap gap-2">
                    ${selectedTagsArray.map(tag => `
                        <div class="selected-tag-item" data-tag-id="${tag.id}">
                            <span class="tag-color" style="background-color: ${tag.color}"></span>
                            <span class="tag-name">${tag.name}</span>
                            <button type="button" class="remove-tag" title="移除标签">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索输入事件
        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('tag-search-input')) {
                this.searchKeyword = e.target.value;
                this.filterTags();
            }
        });

        // 分类筛选和checkbox变化事件
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('tag-category-filter')) {
                this.selectedCategory = e.target.value;
                this.filterTags();
            }
            
            // 处理checkbox变化事件（简化版本）
            if (e.target.type === 'checkbox' && e.target.id && e.target.id.startsWith('tag-')) {
                const tagOption = e.target.closest('.tag-option');
                if (tagOption) {
                    const tagId = tagOption.dataset.tagId;
                    this.toggleTag(tagId);
                }
            }
        });

        // 标签选择事件
        this.container.addEventListener('click', (e) => {
            // 处理简化版本的tag-option点击
            const tagOption = e.target.closest('.tag-option');
            if (tagOption && !tagOption.classList.contains('disabled')) {
                // 如果点击的不是checkbox本身，模拟checkbox点击
                if (e.target.type !== 'checkbox') {
                    const checkbox = tagOption.querySelector('input[type="checkbox"]');
                    if (checkbox && !checkbox.disabled) {
                        checkbox.checked = !checkbox.checked;
                        const tagId = tagOption.dataset.tagId;
                        this.toggleTag(tagId);
                    }
                }
                return;
            }

            // 处理完整版本的tag-card点击
            const tagCard = e.target.closest('.tag-card');
            if (tagCard && !tagCard.classList.contains('disabled')) {
                const tagId = tagCard.dataset.tagId;
                this.toggleTag(tagId);
                return;
            }

            // 移除已选标签事件（仅完整版本）
            const removeBtn = e.target.closest('.remove-tag');
            if (removeBtn) {
                const tagItem = removeBtn.closest('.selected-tag-item');
                const tagId = tagItem.dataset.tagId;
                this.removeTag(tagId);
            }
        });
    }

    /**
     * 过滤标签
     */
    filterTags() {
        let filtered = [...this.allTags];

        // 关键词搜索
        if (this.searchKeyword.trim()) {
            const keyword = this.searchKeyword.toLowerCase();
            filtered = filtered.filter(tag => 
                tag.name.toLowerCase().includes(keyword) ||
                (tag.description && tag.description.toLowerCase().includes(keyword))
            );
        }

        // 分类过滤
        if (this.selectedCategory !== 'all') {
            if (this.selectedCategory === 'uncategorized') {
                filtered = filtered.filter(tag => !tag.categoryId);
            } else {
                filtered = filtered.filter(tag => tag.categoryId === this.selectedCategory);
            }
        }

        this.filteredTags = filtered;
        this.updateTagList();
    }

    /**
     * 更新标签列表显示
     */
    updateTagList() {
        const tagListContainer = this.container.querySelector('.tag-list');
        if (tagListContainer) {
            // 根据当前模式选择正确的渲染方法
            if (!this.options.showSearch && !this.options.showCategories) {
                tagListContainer.outerHTML = this.renderSimpleTagList();
            } else {
                tagListContainer.outerHTML = this.renderTagList();
            }
        }
    }

    /**
     * 切换标签选择状态
     */
    toggleTag(tagId) {
        if (this.selectedTags.has(tagId)) {
            this.removeTag(tagId);
        } else {
            this.addTag(tagId);
        }
    }

    /**
     * 添加标签
     */
    addTag(tagId) {
        if (this.options.maxSelection && this.selectedTags.size >= this.options.maxSelection) {
            console.warn('已达到最大选择数量限制');
            return false;
        }

        this.selectedTags.add(tagId);
        this.updateDisplay();
        this.triggerChange();
        
        // 更新标签使用次数
        if (window.tagsManager) {
            window.tagsManager.incrementTagUsage(tagId);
        }
        
        return true;
    }

    /**
     * 移除标签
     */
    removeTag(tagId) {
        this.selectedTags.delete(tagId);
        this.updateDisplay();
        this.triggerChange();
        return true;
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        // 更新计数
        const countElement = this.container.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = this.selectedTags.size;
        }

        // 重新渲染标签列表
        this.updateTagList();
        
        // 只有在完整版本（非简化版本）中才显示已选择标签区域
        if (this.options.showSearch || this.options.showCategories) {
            const selectedTagsContainer = this.container.querySelector('.selected-tags-section');
            if (selectedTagsContainer) {
                selectedTagsContainer.outerHTML = this.renderSelectedTags();
            } else if (this.selectedTags.size > 0) {
                // 如果之前没有已选标签区域，现在需要添加
                this.container.querySelector('.tag-selector').insertAdjacentHTML('beforeend', this.renderSelectedTags());
            }
        }
    }

    /**
     * 触发变化事件
     */
    triggerChange() {
        const event = new CustomEvent('tagSelectionChange', {
            detail: {
                selectedTags: this.getSelectedTags(),
                selectedTagIds: Array.from(this.selectedTags)
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 获取选中的标签对象
     */
    getSelectedTags() {
        return Array.from(this.selectedTags).map(id => 
            this.allTags.find(tag => tag.id === id)
        ).filter(Boolean);
    }

    /**
     * 获取选中的标签ID数组
     */
    getSelectedTagIds() {
        return Array.from(this.selectedTags);
    }

    /**
     * 设置选中的标签
     */
    setSelectedTags(tagIds) {
        this.selectedTags.clear();
        if (Array.isArray(tagIds)) {
            tagIds.forEach(id => {
                if (this.allTags.some(tag => tag.id === id)) {
                    this.selectedTags.add(id);
                }
            });
        }
        this.updateDisplay();
    }

    /**
     * 清空选择
     */
    clearSelection() {
        this.selectedTags.clear();
        this.updateDisplay();
        this.triggerChange();
    }

    /**
     * 刷新标签数据
     */
    refresh() {
        this.loadTags();
        this.filterTags();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 全局工具函数
window.TagSelector = TagSelector; 