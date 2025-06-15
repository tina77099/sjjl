/**
 * 标签管理页面JavaScript功能
 * 实现标签和分类的增删改查界面交互
 */

class TagsPageManager {
    constructor() {
        this.currentView = 'tags'; // 'tags' 或 'categories'
        this.currentEditingId = null;
        this.currentEditingType = null; // 'tag' 或 'category'
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        this.loadInitialData();
        console.log('标签管理页面初始化完成');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航切换
        document.getElementById('tab-tags').addEventListener('click', () => this.switchView('tags'));
        document.getElementById('tab-categories').addEventListener('click', () => this.switchView('categories'));

        // 标签管理事件
        document.getElementById('addTagBtn').addEventListener('click', () => this.showTagModal());
        document.getElementById('tagSearchInput').addEventListener('input', (e) => this.searchTags(e.target.value));
        document.getElementById('filterTags').addEventListener('change', (e) => this.filterTags(e.target.value));
        document.getElementById('sortTags').addEventListener('change', (e) => this.sortTags(e.target.value));

        // 分类管理事件
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('categorySearchInput').addEventListener('input', (e) => this.searchCategories(e.target.value));

        // 模态框事件
        document.getElementById('tagForm').addEventListener('submit', (e) => this.handleTagSubmit(e));
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleCategorySubmit(e));
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.handleDelete());

        // 关闭模态框事件
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // 颜色选择器事件
        this.bindColorPickerEvents();

        // 监听分类更新事件
        window.addEventListener('categoriesUpdated', () => {
            this.loadCategories();
            this.updateCategorySelectors();
        });
    }

    /**
     * 绑定颜色选择器事件
     */
    bindColorPickerEvents() {
        // 标签颜色选择器
        document.querySelectorAll('#tagModal .color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('tagColorInput').value = color;
                document.getElementById('tagColorPreview').style.backgroundColor = color;
                this.updateColorSelection(e.target, '#tagModal');
            });
        });

        // 分类颜色选择器
        document.querySelectorAll('#categoryModal .color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('categoryColorInput').value = color;
                document.getElementById('categoryColorPreview').style.backgroundColor = color;
                this.updateColorSelection(e.target, '#categoryModal');
            });
        });

        // 颜色输入框事件
        document.getElementById('tagColorInput').addEventListener('input', (e) => {
            const color = e.target.value;
            document.getElementById('tagColorPreview').style.backgroundColor = color;
        });

        document.getElementById('categoryColorInput').addEventListener('input', (e) => {
            const color = e.target.value;
            document.getElementById('categoryColorPreview').style.backgroundColor = color;
        });
    }

    /**
     * 更新颜色选择状态
     */
    updateColorSelection(selectedElement, modalSelector) {
        const modal = document.querySelector(modalSelector);
        modal.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500');
        });
        selectedElement.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
    }

    /**
     * 加载初始数据
     */
    loadInitialData() {
        // 添加延迟确保所有管理器都已初始化
        setTimeout(() => {
            this.loadDataWithRetry();
        }, 100);
    }

    /**
     * 带重试机制的数据加载
     */
    loadDataWithRetry(retryCount = 0) {
        const maxRetries = 3;
        
        try {
            // 检查必要的管理器是否存在
            if (!window.categoriesManager || !window.tagsManager) {
                if (retryCount < maxRetries) {
                    console.log(`管理器未就绪，重试中... (${retryCount + 1}/${maxRetries})`);
                    setTimeout(() => {
                        this.loadDataWithRetry(retryCount + 1);
                    }, 200);
                    return;
                } else {
                    console.error('管理器初始化失败，无法加载数据');
                    return;
                }
            }

            console.log('开始加载标签和分类数据...');
            this.loadTags();
            this.loadCategories();
            this.updateCategorySelectors();
            console.log('数据加载完成');
        } catch (error) {
            console.error('加载数据时出错:', error);
            if (retryCount < maxRetries) {
                setTimeout(() => {
                    this.loadDataWithRetry(retryCount + 1);
                }, 500);
            }
        }
    }

    /**
     * 切换视图
     */
    switchView(view) {
        this.currentView = view;
        
        // 更新导航状态
        document.getElementById('tab-tags').classList.remove('tab-active');
        document.getElementById('tab-tags').classList.add('text-gray-500');
        document.getElementById('tab-categories').classList.remove('tab-active');
        document.getElementById('tab-categories').classList.add('text-gray-500');

        const activeTab = document.getElementById(`tab-${view}`);
        activeTab.classList.remove('text-gray-500');
        activeTab.classList.add('tab-active');

        // 切换容器显示
        document.getElementById('tags-container').classList.toggle('hidden', view !== 'tags');
        document.getElementById('categories-container').classList.toggle('hidden', view !== 'categories');
    }

    /**
     * 加载标签数据
     */
    loadTags() {
        const tags = window.tagsManager.getTags();
        this.renderTagsTable(tags);
    }

    /**
     * 渲染标签表格
     */
    renderTagsTable(tags) {
        const tbody = document.querySelector('#tags-table-body');
        tbody.innerHTML = '';

        if (tags.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-tags text-4xl mb-2"></i>
                        <p>暂无标签数据</p>
                        <p class="text-sm">点击"新建标签"开始创建</p>
                    </td>
                </tr>
            `;
            return;
        }

        tags.forEach(tag => {
            const categoryName = this.getCategoryNameById(tag.categoryId) || '未分类';
            const applyToText = tag.applyTo ? tag.applyTo.map(scope => scope === 'plan' ? '计划' : '事件').join(', ') : '';
            const createdDate = tag.createdAt ? new Date(tag.createdAt).toLocaleDateString('zh-CN') : '-';
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-3 w-3 rounded-full mr-3" style="background-color: ${tag.color}"></div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${this.escapeHtml(tag.name)}</div>
                            ${tag.description ? `<div class="text-sm text-gray-500">${this.escapeHtml(tag.description)}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${categoryName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${applyToText}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-4 w-4 rounded-full" style="background-color: ${tag.color}"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tag.usageCount || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="tagsPageManager.editTag('${tag.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="tagsPageManager.deleteTag('${tag.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * 加载分类数据
     */
    loadCategories() {
        console.log('正在加载分类数据...');
        
        if (!window.categoriesManager) {
            console.error('分类管理器未初始化');
            return;
        }

        const categories = window.categoriesManager.getCategories();
        console.log('获取到分类数据:', categories.length, '个分类');
        
        this.renderCategoriesTable(categories);
    }

    /**
     * 渲染分类表格
     */
    renderCategoriesTable(categories) {
        const tbody = document.querySelector('#categories-table tbody');
        tbody.innerHTML = '';

        if (categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-folder text-4xl mb-2"></i>
                        <p>暂无分类数据</p>
                        <p class="text-sm">点击"新建分类"开始创建</p>
                    </td>
                </tr>
            `;
            return;
        }

        categories.forEach(category => {
            const applyToText = category.applyTo ? category.applyTo.map(scope => scope === 'plan' ? '计划' : '事件').join(', ') : '';
            const isDefault = category.isDefault ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">默认</span>' : '';
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-3 w-3 rounded-full mr-3" style="background-color: ${category.color}"></div>
                        <div class="text-sm font-medium text-gray-900">${this.escapeHtml(category.name)}${isDefault}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${applyToText}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-6 w-6 rounded-full" style="background-color: ${category.color}"></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="tagsPageManager.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${categories.length > 1 ? `<button class="text-red-600 hover:text-red-900" onclick="tagsPageManager.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>` : '<span class="text-gray-400" title="至少需要保留一个分类"><i class="fas fa-lock"></i></span>'}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * 更新分类选择器
     */
    updateCategorySelectors() {
        const categories = window.categoriesManager.getCategories();
        
        // 更新标签过滤器
        const filterSelect = document.getElementById('filterTags');
        const currentFilter = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">全部分类</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentFilter;

        // 更新标签分类选择器
        const categorySelect = document.getElementById('tagCategorySelect');
        const currentCategory = categorySelect.value;
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        if (currentCategory && categories.some(cat => cat.id === currentCategory)) {
            categorySelect.value = currentCategory;
        }
    }

    /**
     * 搜索标签
     */
    searchTags(keyword) {
        const filterCategory = document.getElementById('filterTags').value;
        const filters = filterCategory !== 'all' ? { categoryId: filterCategory } : {};
        const tags = window.tagsManager.searchTags(keyword, filters);
        this.renderTagsTable(tags);
    }

    /**
     * 过滤标签
     */
    filterTags(categoryId) {
        const keyword = document.getElementById('tagSearchInput').value;
        const filters = categoryId !== 'all' ? { categoryId } : {};
        const tags = window.tagsManager.searchTags(keyword, filters);
        this.renderTagsTable(tags);
    }

    /**
     * 排序标签
     */
    sortTags(sortBy) {
        const [field, order] = sortBy.split('-');
        const keyword = document.getElementById('tagSearchInput').value;
        const filterCategory = document.getElementById('filterTags').value;
        const filters = filterCategory !== 'all' ? { categoryId: filterCategory } : {};
        
        let tags = window.tagsManager.searchTags(keyword, filters);
        tags = window.tagsManager.sortTags(tags, field, order);
        this.renderTagsTable(tags);
    }

    /**
     * 搜索分类
     */
    searchCategories(keyword) {
        const categories = window.categoriesManager.getCategories();
        const filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(keyword.toLowerCase())
        );
        this.renderCategoriesTable(filteredCategories);
    }

    /**
     * 显示标签模态框
     */
    showTagModal(tagId = null) {
        this.currentEditingId = tagId;
        this.currentEditingType = 'tag';
        
        const modal = document.getElementById('tagModal');
        const title = document.getElementById('tagModalTitle');
        const form = document.getElementById('tagForm');
        
        if (tagId) {
            // 编辑模式
            const tag = window.tagsManager.getTagById(tagId);
            if (!tag) {
                this.showNotification('标签不存在', 'error');
                return;
            }
            
            title.textContent = '编辑标签';
            document.getElementById('tagNameInput').value = tag.name;
            document.getElementById('tagDescription').value = tag.description || '';
            document.getElementById('tagCategorySelect').value = tag.categoryId || '';
            document.getElementById('tagColorInput').value = tag.color;
            document.getElementById('tagColorPreview').style.backgroundColor = tag.color;
            document.getElementById('applyToPlan').checked = tag.applyTo && tag.applyTo.includes('plan');
            document.getElementById('applyToEvent').checked = tag.applyTo && tag.applyTo.includes('event');
            
            // 更新颜色选择状态
            const colorOption = modal.querySelector(`[data-color="${tag.color}"]`);
            if (colorOption) {
                this.updateColorSelection(colorOption, '#tagModal');
            }
        } else {
            // 新建模式
            title.textContent = '新建标签';
            form.reset();
            document.getElementById('tagColorInput').value = '#3B82F6';
            document.getElementById('tagColorPreview').style.backgroundColor = '#3B82F6';
            document.getElementById('applyToPlan').checked = true;
            document.getElementById('applyToEvent').checked = true;
            
            // 重置颜色选择状态
            const defaultColorOption = modal.querySelector('[data-color="#3B82F6"]');
            if (defaultColorOption) {
                this.updateColorSelection(defaultColorOption, '#tagModal');
            }
        }
        
        modal.classList.remove('hidden');
    }

    /**
     * 显示分类模态框
     */
    showCategoryModal(categoryId = null) {
        this.currentEditingId = categoryId;
        this.currentEditingType = 'category';
        
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (categoryId) {
            // 编辑模式
            const category = window.categoriesManager.getCategoryById(categoryId);
            if (!category) {
                this.showNotification('分类不存在', 'error');
                return;
            }
            
            title.textContent = '编辑分类';
            document.getElementById('categoryNameInput').value = category.name;
            document.getElementById('categoryColorInput').value = category.color;
            document.getElementById('categoryColorPreview').style.backgroundColor = category.color;
            document.getElementById('categoryApplyToPlan').checked = category.applyTo && category.applyTo.includes('plan');
            document.getElementById('categoryApplyToEvent').checked = category.applyTo && category.applyTo.includes('event');
            
            // 更新颜色选择状态
            const colorOption = modal.querySelector(`[data-color="${category.color}"]`);
            if (colorOption) {
                this.updateColorSelection(colorOption, '#categoryModal');
            }
        } else {
            // 新建模式
            title.textContent = '新建分类';
            form.reset();
            document.getElementById('categoryColorInput').value = '#3B82F6';
            document.getElementById('categoryColorPreview').style.backgroundColor = '#3B82F6';
            document.getElementById('categoryApplyToPlan').checked = true;
            document.getElementById('categoryApplyToEvent').checked = true;
            
            // 重置颜色选择状态
            const defaultColorOption = modal.querySelector('[data-color="#3B82F6"]');
            if (defaultColorOption) {
                this.updateColorSelection(defaultColorOption, '#categoryModal');
            }
        }
        
        modal.classList.remove('hidden');
    }

    /**
     * 处理标签表单提交
     */
    handleTagSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('tagNameInput').value.trim(),
            description: document.getElementById('tagDescription').value.trim(),
            categoryId: document.getElementById('tagCategorySelect').value,
            color: document.getElementById('tagColorInput').value,
            applyTo: []
        };
        
        if (document.getElementById('applyToPlan').checked) {
            formData.applyTo.push('plan');
        }
        if (document.getElementById('applyToEvent').checked) {
            formData.applyTo.push('event');
        }
        
        let result;
        if (this.currentEditingId) {
            // 更新标签
            result = window.tagsManager.updateTag(this.currentEditingId, formData);
        } else {
            // 创建标签
            result = window.tagsManager.createTag(formData);
        }
        
        if (result.success) {
            this.showNotification(this.currentEditingId ? '标签更新成功' : '标签创建成功', 'success');
            this.closeModals();
            this.loadTags();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    /**
     * 处理分类表单提交
     */
    handleCategorySubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('categoryNameInput').value.trim(),
            color: document.getElementById('categoryColorInput').value,
            applyTo: []
        };
        
        if (document.getElementById('categoryApplyToPlan').checked) {
            formData.applyTo.push('plan');
        }
        if (document.getElementById('categoryApplyToEvent').checked) {
            formData.applyTo.push('event');
        }
        
        let result;
        if (this.currentEditingId) {
            // 更新分类
            result = window.categoriesManager.updateCategory(this.currentEditingId, formData);
        } else {
            // 创建分类
            result = window.categoriesManager.createCategory(formData);
        }
        
        if (result.success) {
            this.showNotification(this.currentEditingId ? '分类更新成功' : '分类创建成功', 'success');
            this.closeModals();
            this.loadCategories();
            this.updateCategorySelectors();
            
            // 触发分类更新事件
            window.dynamicCategoriesUpdater.triggerUpdate();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    /**
     * 编辑标签
     */
    editTag(tagId) {
        this.showTagModal(tagId);
    }

    /**
     * 编辑分类
     */
    editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    }

    /**
     * 删除标签
     */
    deleteTag(tagId) {
        const tag = window.tagsManager.getTagById(tagId);
        if (!tag) {
            this.showNotification('标签不存在', 'error');
            return;
        }
        
        this.showDeleteModal('标签', tag.name, () => {
            const result = window.tagsManager.deleteTag(tagId);
            if (result.success) {
                this.showNotification('标签删除成功', 'success');
                this.loadTags();
            } else {
                this.showNotification(result.error, 'error');
            }
        });
    }

    /**
     * 删除分类
     */
    deleteCategory(categoryId) {
        const category = window.categoriesManager.getCategoryById(categoryId);
        if (!category) {
            this.showNotification('分类不存在', 'error');
            return;
        }
        
        // 为默认分类提供特殊确认提示
        const isDefault = category.isDefault;
        const confirmMessage = isDefault 
            ? `确定要删除默认分类"${category.name}"吗？\n\n⚠️ 警告：删除默认分类可能影响系统的正常使用，建议谨慎操作。`
            : `确定要删除分类"${category.name}"吗？`;
        
        this.showDeleteModal('分类', category.name, () => {
            const result = window.categoriesManager.deleteCategory(categoryId);
            if (result.success) {
                this.showNotification('分类删除成功', 'success');
                this.loadCategories();
                this.updateCategorySelectors();
                
                // 通知其他模块更新
                if (window.dynamicCategories) {
                    window.dynamicCategories.updateAllCategorySelectors();
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        }, isDefault ? confirmMessage : null);
    }

    /**
     * 显示删除确认模态框
     */
    showDeleteModal(type, name, callback, confirmMessage = null) {
        this.deleteCallback = callback;
        
        document.getElementById('deleteModalTitle').textContent = `确认删除${type}`;
        document.getElementById('deleteModalMessage').textContent = confirmMessage || `您确定要删除${type}"${name}"吗？此操作不可撤销。`;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    /**
     * 处理删除确认
     */
    handleDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
            this.deleteCallback = null;
        }
        this.closeModals();
    }

    /**
     * 关闭所有模态框
     */
    closeModals() {
        document.querySelectorAll('.fixed.inset-0').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.currentEditingId = null;
        this.currentEditingType = null;
        this.deleteCallback = null;
    }

    /**
     * 根据分类ID获取分类名称
     */
    getCategoryNameById(categoryId) {
        if (!categoryId) return null;
        const category = window.categoriesManager.getCategoryById(categoryId);
        return category ? category.name : null;
    }

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        const icon = notification.querySelector('i');
        
        messageElement.textContent = message;
        
        // 重置样式
        notification.className = 'fixed top-4 right-4 px-4 py-3 rounded-lg shadow-md flex items-center z-50 transform transition-all duration-300 ease-in-out';
        
        if (type === 'success') {
            notification.classList.add('bg-green-100', 'text-green-800');
            icon.className = 'fas fa-check-circle mr-2';
        } else if (type === 'error') {
            notification.classList.add('bg-red-100', 'text-red-800');
            icon.className = 'fas fa-exclamation-circle mr-2';
        } else if (type === 'warning') {
            notification.classList.add('bg-yellow-100', 'text-yellow-800');
            icon.className = 'fas fa-exclamation-triangle mr-2';
        }
        
        // 显示通知
        notification.classList.remove('translate-x-full');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.tagsPageManager = new TagsPageManager();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TagsPageManager;
} 