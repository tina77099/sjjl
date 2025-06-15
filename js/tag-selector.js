/**
 * 标签选择器组件
 * 支持多选、搜索、快速创建新标签
 */
class TagSelector {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: '选择或输入标签...',
            maxTags: 10,
            allowCreate: true,
            applyTo: 'both', // 'plan', 'event', 'both'
            ...options
        };
        
        this.selectedTags = [];
        this.availableTags = [];
        this.isOpen = false;
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error(`标签选择器容器 #${this.containerId} 不存在`);
            return;
        }

        this.loadAvailableTags();
        this.render();
        this.bindEvents();
    }

    /**
     * 加载可用标签
     */
    loadAvailableTags() {
        if (!window.tagsManager) {
            console.warn('标签管理器未初始化');
            this.availableTags = [];
            return;
        }

        const allTags = window.tagsManager.getTags();
        
        // 根据适用范围过滤标签
        this.availableTags = allTags.filter(tag => {
            if (this.options.applyTo === 'both') return true;
            return tag.applyTo && tag.applyTo.includes(this.options.applyTo);
        });
    }

    /**
     * 渲染组件
     */
    render() {
        this.container.innerHTML = `
            <div class="tag-selector-wrapper">
                <div class="tag-selector-input-area">
                    <div class="selected-tags-container">
                        ${this.renderSelectedTags()}
                    </div>
                    <input type="text" 
                           class="tag-selector-input" 
                           placeholder="${this.selectedTags.length === 0 ? this.options.placeholder : ''}"
                           autocomplete="off">
                </div>
                <div class="tag-selector-dropdown hidden">
                    <div class="tag-selector-search">
                        <input type="text" class="tag-search-input" placeholder="搜索标签...">
                    </div>
                    <div class="tag-selector-list">
                        ${this.renderAvailableTags()}
                    </div>
                    ${this.options.allowCreate ? `
                        <div class="tag-selector-create">
                            <button type="button" class="create-tag-btn">
                                <i class="fas fa-plus"></i> 创建新标签
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.addStyles();
    }

    /**
     * 渲染已选择的标签
     */
    renderSelectedTags() {
        return this.selectedTags.map(tag => `
            <span class="selected-tag" data-tag-id="${tag.id}">
                <span class="tag-color" style="background-color: ${tag.color}"></span>
                <span class="tag-name">${tag.name}</span>
                <button type="button" class="remove-tag-btn" data-tag-id="${tag.id}">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `).join('');
    }

    /**
     * 渲染可用标签列表
     */
    renderAvailableTags(searchTerm = '') {
        const filteredTags = this.availableTags.filter(tag => {
            // 排除已选择的标签
            if (this.selectedTags.some(selected => selected.id === tag.id)) {
                return false;
            }
            // 搜索过滤
            if (searchTerm) {
                return tag.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });

        if (filteredTags.length === 0) {
            return `<div class="no-tags-message">
                ${searchTerm ? '未找到匹配的标签' : '暂无可用标签'}
            </div>`;
        }

        return filteredTags.map(tag => `
            <div class="tag-option" data-tag-id="${tag.id}">
                <span class="tag-color" style="background-color: ${tag.color}"></span>
                <span class="tag-name">${tag.name}</span>
                <span class="tag-usage">${tag.usageCount || 0}次使用</span>
            </div>
        `).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const wrapper = this.container.querySelector('.tag-selector-wrapper');
        const input = this.container.querySelector('.tag-selector-input');
        const dropdown = this.container.querySelector('.tag-selector-dropdown');
        const searchInput = this.container.querySelector('.tag-search-input');

        // 点击输入区域显示下拉框
        wrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag-btn') || e.target.closest('.remove-tag-btn')) {
                return;
            }
            this.showDropdown();
        });

        // 输入框获得焦点
        input.addEventListener('focus', () => {
            this.showDropdown();
        });

        // 搜索输入
        searchInput.addEventListener('input', (e) => {
            this.updateTagList(e.target.value);
        });

        // 标签选择
        dropdown.addEventListener('click', (e) => {
            const tagOption = e.target.closest('.tag-option');
            if (tagOption) {
                const tagId = tagOption.dataset.tagId;
                this.selectTag(tagId);
            }

            // 创建新标签
            if (e.target.closest('.create-tag-btn')) {
                this.showCreateTagModal();
            }
        });

        // 移除标签
        wrapper.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-tag-btn');
            if (removeBtn) {
                const tagId = removeBtn.dataset.tagId;
                this.removeTag(tagId);
            }
        });

        // 点击外部关闭下拉框
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // 键盘事件
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && this.selectedTags.length > 0) {
                // 删除最后一个标签
                this.removeTag(this.selectedTags[this.selectedTags.length - 1].id);
            }
        });
    }

    /**
     * 显示下拉框
     */
    showDropdown() {
        const dropdown = this.container.querySelector('.tag-selector-dropdown');
        dropdown.classList.remove('hidden');
        this.isOpen = true;
        
        // 聚焦搜索框
        const searchInput = this.container.querySelector('.tag-search-input');
        setTimeout(() => searchInput.focus(), 100);
    }

    /**
     * 隐藏下拉框
     */
    hideDropdown() {
        const dropdown = this.container.querySelector('.tag-selector-dropdown');
        dropdown.classList.add('hidden');
        this.isOpen = false;
        
        // 清空搜索
        const searchInput = this.container.querySelector('.tag-search-input');
        searchInput.value = '';
        this.updateTagList('');
    }

    /**
     * 选择标签
     */
    selectTag(tagId) {
        const tag = this.availableTags.find(t => t.id === tagId);
        if (!tag) return;

        if (this.selectedTags.length >= this.options.maxTags) {
            this.showNotification(`最多只能选择${this.options.maxTags}个标签`, 'warning');
            return;
        }

        this.selectedTags.push(tag);
        this.updateSelectedTagsDisplay();
        this.updateTagList();
        
        // 触发变更事件
        this.triggerChange();
    }

    /**
     * 移除标签
     */
    removeTag(tagId) {
        this.selectedTags = this.selectedTags.filter(tag => tag.id !== tagId);
        this.updateSelectedTagsDisplay();
        this.updateTagList();
        
        // 触发变更事件
        this.triggerChange();
    }

    /**
     * 更新已选择标签的显示
     */
    updateSelectedTagsDisplay() {
        const container = this.container.querySelector('.selected-tags-container');
        container.innerHTML = this.renderSelectedTags();
        
        // 更新输入框占位符
        const input = this.container.querySelector('.tag-selector-input');
        input.placeholder = this.selectedTags.length === 0 ? this.options.placeholder : '';
    }

    /**
     * 更新标签列表
     */
    updateTagList(searchTerm = '') {
        const listContainer = this.container.querySelector('.tag-selector-list');
        listContainer.innerHTML = this.renderAvailableTags(searchTerm);
    }

    /**
     * 显示创建标签模态框
     */
    showCreateTagModal() {
        // 简化版快速创建
        const tagName = prompt('请输入新标签名称：');
        if (!tagName || !tagName.trim()) return;

        if (!window.tagsManager) {
            this.showNotification('标签管理器未初始化', 'error');
            return;
        }

        const result = window.tagsManager.createTag({
            name: tagName.trim(),
            applyTo: this.options.applyTo === 'both' ? ['plan', 'event'] : [this.options.applyTo]
        });

        if (result.success) {
            this.loadAvailableTags();
            this.selectTag(result.data.id);
            this.showNotification('标签创建成功', 'success');
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    /**
     * 触发变更事件
     */
    triggerChange() {
        const event = new CustomEvent('tagSelectionChange', {
            detail: {
                selectedTags: this.selectedTags,
                tagIds: this.selectedTags.map(tag => tag.id),
                tagNames: this.selectedTags.map(tag => tag.name)
            }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * 获取选中的标签
     */
    getSelectedTags() {
        return this.selectedTags;
    }

    /**
     * 设置选中的标签
     */
    setSelectedTags(tagIds) {
        this.selectedTags = [];
        if (Array.isArray(tagIds)) {
            tagIds.forEach(tagId => {
                const tag = this.availableTags.find(t => t.id === tagId);
                if (tag) {
                    this.selectedTags.push(tag);
                }
            });
        }
        this.updateSelectedTagsDisplay();
        this.updateTagList();
    }

    /**
     * 清空选择
     */
    clear() {
        this.selectedTags = [];
        this.updateSelectedTagsDisplay();
        this.updateTagList();
        this.triggerChange();
    }

    /**
     * 刷新可用标签
     */
    refresh() {
        this.loadAvailableTags();
        this.updateTagList();
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 简单的通知实现
        const notification = document.createElement('div');
        notification.className = `tag-selector-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 10000;
            background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('tag-selector-styles')) return;

        const style = document.createElement('style');
        style.id = 'tag-selector-styles';
        style.textContent = `
            .tag-selector-wrapper {
                position: relative;
                width: 100%;
            }

            .tag-selector-input-area {
                min-height: 42px;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                background: white;
                cursor: text;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
                transition: border-color 0.2s;
            }

            .tag-selector-input-area:hover {
                border-color: #9ca3af;
            }

            .tag-selector-input-area:focus-within {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .selected-tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .selected-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                font-size: 12px;
                color: #374151;
            }

            .tag-color {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .remove-tag-btn {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .remove-tag-btn:hover {
                background: #e5e7eb;
                color: #374151;
            }

            .tag-selector-input {
                border: none;
                outline: none;
                flex: 1;
                min-width: 120px;
                font-size: 14px;
                color: #374151;
            }

            .tag-selector-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-height: 300px;
                overflow: hidden;
                margin-top: 4px;
            }

            .tag-selector-search {
                padding: 12px;
                border-bottom: 1px solid #f3f4f6;
            }

            .tag-search-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                outline: none;
            }

            .tag-search-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .tag-selector-list {
                max-height: 200px;
                overflow-y: auto;
            }

            .tag-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .tag-option:hover {
                background: #f9fafb;
            }

            .tag-option .tag-name {
                flex: 1;
                font-size: 14px;
                color: #374151;
            }

            .tag-option .tag-usage {
                font-size: 12px;
                color: #9ca3af;
            }

            .tag-selector-create {
                padding: 8px 12px;
                border-top: 1px solid #f3f4f6;
            }

            .create-tag-btn {
                width: 100%;
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px dashed #d1d5db;
                border-radius: 6px;
                color: #6b7280;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .create-tag-btn:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
                color: #374151;
            }

            .no-tags-message {
                padding: 20px;
                text-align: center;
                color: #9ca3af;
                font-size: 14px;
            }

            .hidden {
                display: none !important;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 全局导出
window.TagSelector = TagSelector; 