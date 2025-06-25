/**
 * 标签管理页面JavaScript功能
 * 实现标签和分类的增删改查界面交互
 */

class TagsPageManager {
    constructor() {
        this.currentView = 'tags'; // 'tags' 或 'categories'
        this.currentEditingId = null;
        this.currentEditingType = null; // 'tag' 或 'category'
        this.isOperating = false; // 添加操作锁，防止重试机制干扰
        this.debugMode = true; // 启用调试模式
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        this.loadInitialData();
        console.log('标签管理页面初始化完成');
        
        // 添加额外的初始化验证
        this.validateInitialization();
    }

    /**
     * 验证初始化状态
     */
    validateInitialization() {
        setTimeout(() => {
            try {
                console.log('🔍 验证初始化状态...');
                const tbody = document.querySelector('#tags-table-body');
                if (!tbody) {
                    console.error('❌ 初始化验证失败：找不到 #tags-table-body');
                    return;
                }
                
                const tags = window.tagsManager?.getTags() || [];
                console.log(`📊 初始化验证：共有 ${tags.length} 个标签`);
                
                if (tags.length > 0 && tbody.children.length === 0) {
                    console.warn('⚠️ 发现渲染异常：有数据但表格为空，启动紧急修复');
                    this.emergencyFixRender();
                }
            } catch (error) {
                console.error('❌ 初始化验证时出错:', error);
            }
        }, 1000);
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

        // 分类颜色选择器事件（仅保留分类的颜色选择）
        this.bindCategoryColorPickerEvents();

        // 监听分类更新事件
        window.addEventListener('categoriesUpdated', () => {
            this.loadCategories();
        });
    }

    /**
     * 绑定分类颜色选择器事件
     */
    bindCategoryColorPickerEvents() {
        // 分类颜色选择器
        document.querySelectorAll('#categoryModal .color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('categoryColorInput').value = color;
                document.getElementById('categoryColorPreview').style.backgroundColor = color;
                this.updateColorSelection(e.target, '#categoryModal');
            });
        });

        // 分类颜色输入框事件
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
        // 如果正在进行标签操作，跳过重试
        if (this.isOperating) {
            console.log('🔒 标签操作进行中，跳过数据重试');
            return;
        }
        
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
            console.log('数据加载完成');
        } catch (error) {
            console.error('加载数据时出错:', error);
            if (retryCount < maxRetries && !this.isOperating) {
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
        try {
            console.log(`🎨 开始渲染标签表格，标签数量: ${tags?.length || 0}`);
            
            const tbody = document.querySelector('#tags-table-body');
            if (!tbody) {
                console.error('❌ 渲染失败：找不到 #tags-table-body 元素');
                return;
            }

            // 验证输入数据
            if (!Array.isArray(tags)) {
                console.error('❌ 渲染失败：tags 不是数组', tags);
                tags = [];
            }

            tbody.innerHTML = '';

            if (tags.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                            <i class="fas fa-tags text-4xl mb-2"></i>
                            <p>暂无标签数据</p>
                            <p class="text-sm">点击"新建标签"开始创建</p>
                        </td>
                    </tr>
                `;
                console.log('📝 渲染了空数据提示');
                return;
            }

            let successCount = 0;
            tags.forEach((tag, index) => {
                try {
                    // 验证标签数据完整性
                    if (!tag || !tag.id || !tag.name) {
                        console.warn(`⚠️ 跳过无效标签数据 [${index}]:`, tag);
                        return;
                    }

                    const applyToText = tag.applyTo ? tag.applyTo.map(scope => scope === 'plan' ? '计划' : '事件').join(', ') : '';
                    const createdDate = tag.createdAt ? new Date(tag.createdAt).toLocaleDateString('zh-CN') : '-';
                    
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50';
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="text-sm font-medium text-gray-900">${this.escapeHtml(tag.name)}</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${applyToText}</td>
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
                    successCount++;
                } catch (rowError) {
                    console.error(`❌ 渲染标签行时出错 [${index}]:`, rowError, tag);
                }
            });

            console.log(`✅ 标签表格渲染完成，成功渲染 ${successCount}/${tags.length} 个标签`);
            
            // 验证渲染结果
            const actualRows = tbody.children.length;
            if (actualRows === 0 && tags.length > 0) {
                console.error('❌ 渲染验证失败：应该有数据但表格为空');
                throw new Error('渲染结果验证失败');
            }
            
        } catch (error) {
            console.error('❌ 渲染标签表格时出错:', error);
            // 紧急回退渲染
            this.emergencyRenderTags(tags);
        }
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
     * 搜索标签
     */
    searchTags(keyword) {
        const tags = window.tagsManager.searchTags(keyword);
        this.renderTagsTable(tags);
    }

    /**
     * 排序标签
     */
    sortTags(sortBy) {
        const [field, order] = sortBy.split('-');
        const keyword = document.getElementById('tagSearchInput').value;
        
        let tags = window.tagsManager.searchTags(keyword);
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
            document.getElementById('tagApplyToPlan').checked = tag.applyTo && tag.applyTo.includes('plan');
            document.getElementById('tagApplyToEvent').checked = tag.applyTo && tag.applyTo.includes('event');
        } else {
            // 新建模式
            title.textContent = '新建标签';
            form.reset();
            document.getElementById('tagApplyToPlan').checked = true;
            document.getElementById('tagApplyToEvent').checked = true;
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
    async handleTagSubmit(e) {
        e.preventDefault();
        
        // 防止重复操作
        if (this.isOperating) {
            console.log('🔒 操作进行中，跳过重复请求');
            return;
        }
        
        this.isOperating = true;
        
        const formData = {
            name: document.getElementById('tagNameInput').value.trim(),
            applyTo: []
        };
        
        if (document.getElementById('tagApplyToPlan').checked) {
            formData.applyTo.push('plan');
        }
        if (document.getElementById('tagApplyToEvent').checked) {
            formData.applyTo.push('event');
        }
        
        console.log('🏷️ 提交标签数据:', formData);
        
        try {
            let result;
            if (this.currentEditingId) {
                // 更新标签
                console.log('📝 更新标签:', this.currentEditingId);
                result = window.tagsManager.updateTag(this.currentEditingId, formData);
            } else {
                // 创建标签
                console.log('✨ 创建新标签');
                result = await window.tagsManager.createTag(formData);
            }
            
            console.log('📊 操作结果:', result);
            
            if (result.success) {
                this.showNotification(this.currentEditingId ? '标签更新成功' : '标签创建成功', 'success');
                this.closeModals();
                
                // 🔄 简化刷新策略：直接调用loadTags重新加载
                console.log('🔄 刷新标签列表...');
                this.loadTags();
                
            } else if (result.conflictType === 'duplicate_name') {
                // 处理标签名称冲突
                console.log('🔄 处理标签名称冲突...');
                this.handleTagNameConflict(result.conflictData, formData);
            } else {
                console.error('❌ 标签操作失败:', result.error);
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ 标签提交过程出错:', error);
            this.showNotification('操作失败，请重试', 'error');
        } finally {
            // 释放操作锁
            setTimeout(() => {
                this.isOperating = false;
            }, 500);
        }
    }

    /**
     * 处理标签名称冲突
     */
    handleTagNameConflict(conflictData, originalFormData) {
        const { currentTag, existingTag, newName, suggestedNames } = conflictData;
        
        console.log('💡 显示冲突解决对话框...', conflictData);
        
        // 创建冲突解决对话框
        this.showTagConflictModal(currentTag, existingTag, newName, suggestedNames, originalFormData);
    }

    /**
     * 显示标签冲突解决模态框
     */
    showTagConflictModal(currentTag, existingTag, newName, suggestedNames, formData) {
        // 选择第一个建议名称作为默认建议
        const suggestedName = suggestedNames[0] || `${newName}1`;
        
        // 创建简化的模态框HTML
        const modalHtml = `
            <div id="tagConflictModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">标签名称冲突</h3>
                            <button type="button" class="text-gray-400 hover:text-gray-600" onclick="tagsPageManager.closeTagConflictModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                标签名称 "<strong>${newName}</strong>" 已经存在
                            </p>
                        </div>
                        
                        <div class="mb-6">
                            <p class="text-sm text-gray-700 mb-3">建议使用名称：</p>
                            <div class="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <input type="text" id="suggestedTagName" value="${suggestedName}" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <button type="button" class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200" 
                                        onclick="tagsPageManager.getNextSuggestion(['${suggestedNames.join("', '")}'])">
                                    换个名称
                                </button>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" 
                                    onclick="tagsPageManager.closeTagConflictModal()">
                                取消
                            </button>
                            <button type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" 
                                    onclick="tagsPageManager.resolveTagConflict()">
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 插入到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 存储冲突数据以便后续使用
        this.conflictData = { currentTag, existingTag, newName, formData, suggestedNames };
    }

    /**
     * 获取下一个建议名称
     */
    getNextSuggestion(allSuggestions) {
        const input = document.getElementById('suggestedTagName');
        const currentValue = input.value;
        
        // 找到当前值在建议列表中的位置
        let currentIndex = allSuggestions.indexOf(currentValue);
        
        // 如果不在列表中，从0开始
        if (currentIndex === -1) {
            currentIndex = 0;
        } else {
            // 移动到下一个建议
            currentIndex = (currentIndex + 1) % allSuggestions.length;
        }
        
        input.value = allSuggestions[currentIndex];
        input.focus();
        input.select();
    }

    /**
     * 解决标签冲突（简化版）
     */
    resolveTagConflict() {
        const { currentTag, formData } = this.conflictData;
        const newName = document.getElementById('suggestedTagName').value.trim();
        
        if (!newName) {
            this.showNotification('请输入标签名称', 'warning');
            return;
        }
        
        console.log('🔧 使用建议名称解决冲突:', newName);
        
        this.isOperating = true;
        
        try {
            // 使用建议的名称更新标签
            const newFormData = { ...formData, name: newName };
            const result = window.tagsManager.updateTag(currentTag.id, newFormData);
            
            if (result.success) {
                this.showNotification(`标签已更新为"${newName}"`, 'success');
                this.closeTagConflictModal();
                this.closeModals();
                this.loadTags();
            } else if (result.conflictType === 'duplicate_name') {
                // 如果新名称仍然冲突，提示用户
                this.showNotification('该名称仍然存在冲突，请尝试其他名称', 'warning');
                document.getElementById('suggestedTagName').focus();
                document.getElementById('suggestedTagName').select();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ 解决冲突时出错:', error);
            this.showNotification('解决冲突失败，请重试', 'error');
        } finally {
            setTimeout(() => {
                this.isOperating = false;
            }, 500);
        }
    }

    /**
     * 关闭标签冲突模态框
     */
    closeTagConflictModal() {
        const modal = document.getElementById('tagConflictModal');
        if (modal) {
            modal.remove();
        }
        this.conflictData = null;
    }

    /**
     * 验证数据已保存
     */
    verifyDataSaved(expectedTag) {
        try {
            console.log('🔍 验证数据保存状态...');
            const storedData = localStorage.getItem('eventRecorderTags');
            if (!storedData) {
                console.error('❌ localStorage中没有标签数据');
                return false;
            }
            
            const tags = JSON.parse(storedData);
            const found = tags.find(tag => tag.id === expectedTag.id);
            
            if (found) {
                console.log('✅ 数据保存验证成功:', found.name);
                return true;
            } else {
                console.error('❌ 数据保存验证失败：找不到新创建的标签');
                return false;
            }
        } catch (error) {
            console.error('❌ 验证数据保存时出错:', error);
            return false;
        }
    }

    /**
     * 验证渲染成功
     */
    verifyRenderSuccess() {
        try {
            console.log('🔍 验证渲染成功状态...');
            const tbody = document.querySelector('#tags-table-body');
            const tags = JSON.parse(localStorage.getItem('eventRecorderTags') || '[]');
            
            if (tags.length > 0 && tbody.children.length === 0) {
                console.warn('⚠️ 检测到渲染失败，启动紧急修复');
                this.emergencyFixRender();
                return false;
            }
            
            console.log(`✅ 渲染验证成功：${tags.length} 个标签，${tbody.children.length} 个表格行`);
            return true;
        } catch (error) {
            console.error('❌ 验证渲染成功时出错:', error);
            return false;
        }
    }

    /**
     * 同步刷新标签列表（增强版）
     */
    syncRefreshTags() {
        try {
            console.log('⚡ 开始同步刷新（增强版）...');
            
            // 1. 验证DOM环境
            const tbody = document.querySelector('#tags-table-body');
            if (!tbody) {
                console.error('❌ 同步刷新失败：未找到表格容器');
                return false;
            }
            
            // 2. 直接从localStorage读取最新数据
            const storedTags = localStorage.getItem('eventRecorderTags');
            if (!storedTags) {
                console.warn('⚠️ localStorage中没有标签数据');
                this.renderTagsTable([]);
                return true;
            }
            
            let tags;
            try {
                tags = JSON.parse(storedTags);
            } catch (parseError) {
                console.error('❌ 解析标签数据失败:', parseError);
                this.renderTagsTable([]);
                return false;
            }
            
            // 3. 验证数据格式
            if (!Array.isArray(tags)) {
                console.error('❌ 标签数据格式错误，不是数组:', typeof tags);
                this.renderTagsTable([]);
                return false;
            }
            
            console.log(`📋 获取到标签数据: ${tags.length} 个标签`);
            
            // 4. 清空并重新渲染
            tbody.innerHTML = '';
            this.renderTagsTable(tags);
            
            // 5. 验证渲染结果
            const renderedRows = tbody.children.length;
            const expectedRows = tags.length > 0 ? tags.length : 1; // 空数据时有1行提示
            
            if (renderedRows === 0 && tags.length > 0) {
                console.error('❌ 同步刷新失败：渲染后表格仍为空');
                return false;
            }
            
            console.log(`✅ 同步刷新完成：${tags.length} 个标签 -> ${renderedRows} 行`);
            return true;
            
        } catch (error) {
            console.error('❌ 同步刷新失败:', error);
            return false;
        }
    }

    /**
     * 紧急修复渲染
     */
    emergencyFixRender() {
        console.log('🚨 启动紧急修复渲染...');
        
        try {
            // 等待一小段时间确保数据稳定
            setTimeout(() => {
                const tbody = document.querySelector('#tags-table-body');
                if (!tbody) {
                    console.error('❌ 紧急修复失败：找不到表格容器');
                    return;
                }
                
                // 强制重新获取数据
                const rawData = localStorage.getItem('eventRecorderTags');
                if (!rawData) {
                    console.log('📝 紧急修复：渲染空数据提示');
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                                <i class="fas fa-tags text-4xl mb-2"></i>
                                <p>暂无标签数据</p>
                                <p class="text-sm">点击"新建标签"开始创建</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                const tags = JSON.parse(rawData);
                console.log(`🔧 紧急修复：重新渲染 ${tags.length} 个标签`);
                
                // 完全清空
                tbody.innerHTML = '';
                
                // 强制逐个渲染
                tags.forEach((tag, index) => {
                    try {
                        if (!tag || !tag.id) return;
                        
                        const applyToText = tag.applyTo ? tag.applyTo.map(scope => scope === 'plan' ? '计划' : '事件').join(', ') : '';
                        const createdDate = tag.createdAt ? new Date(tag.createdAt).toLocaleDateString('zh-CN') : '-';
                        
                        const row = document.createElement('tr');
                        row.className = 'hover:bg-gray-50';
                        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="text-sm font-medium text-gray-900">${this.escapeHtml(tag.name)}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${applyToText}</td>
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
                    } catch (rowError) {
                        console.error(`❌ 紧急修复第${index}行失败:`, rowError);
                    }
                });
                
                console.log(`✅ 紧急修复完成，渲染了 ${tbody.children.length} 行`);
                
            }, 200);
            
        } catch (error) {
            console.error('❌ 紧急修复失败:', error);
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
    async deleteTag(tagId) {
        const tag = window.tagsManager.getTagById(tagId);
        if (!tag) {
            this.showNotification('标签不存在', 'error');
            return;
        }
        
        this.showDeleteModal('标签', tag.name, async () => {
            const result = await window.tagsManager.deleteTag(tagId);
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