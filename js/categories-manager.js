/**
 * 分类数据管理模块
 * 提供统一的分类数据管理功能，包括增删改查、数据验证等
 */

class CategoriesManager {
    constructor() {
        this.storageKey = 'eventRecorderCategories';
        this.defaultCategories = [
            {
                id: 'study',
                name: '学习成长',
                color: '#3B82F6',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'experience',
                name: '体验突破',
                color: '#10B981',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'leisure',
                name: '休闲放松',
                color: '#F59E0B',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'family',
                name: '家庭生活',
                color: '#EF4444',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'work',
                name: '工作职业',
                color: '#8B5CF6',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'social',
                name: '人际社群',
                color: '#EC4899',
                applyTo: ['plan', 'event'],
                isDefault: true,
                createdAt: new Date().toISOString()
            }
        ];
        this.init();
    }

    /**
     * 初始化分类数据
     */
    init() {
        try {
            const categories = this.getCategories();
            
            // 检查数据完整性
            if (!this.validateCategoriesData(categories)) {
                console.warn('分类数据不完整或损坏，正在重置为默认数据...');
                this.saveCategories(this.defaultCategories);
                console.log('已重置为默认分类数据');
                return;
            }
            
            // 如果数据为空，初始化默认数据
            if (!categories || categories.length === 0) {
                this.saveCategories(this.defaultCategories);
                console.log('初始化默认分类数据');
                return;
            }
            
            console.log(`分类数据加载成功，共 ${categories.length} 个分类`);
        } catch (error) {
            console.error('初始化分类数据时出错:', error);
            // 出错时强制重置为默认数据
            try {
                this.saveCategories(this.defaultCategories);
                console.log('出错后已重置为默认分类数据');
            } catch (resetError) {
                console.error('重置默认数据也失败:', resetError);
            }
        }
    }

    /**
     * 验证分类数据的完整性
     * @param {Array} categories 分类数组
     * @returns {boolean} 数据是否有效
     */
    validateCategoriesData(categories) {
        if (!Array.isArray(categories)) {
            return false;
        }
        
        // 检查每个分类的必要字段
        for (const category of categories) {
            if (!category || typeof category !== 'object') {
                return false;
            }
            
            // 检查必要字段
            if (!category.id || !category.name || !category.color) {
                return false;
            }
            
            // 检查applyTo字段
            if (!Array.isArray(category.applyTo) || category.applyTo.length === 0) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 获取所有分类
     * @returns {Array} 分类数组
     */
    getCategories() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取分类数据失败:', error);
            return [];
        }
    }

    /**
     * 保存分类数据
     * @param {Array} categories 分类数组
     */
    saveCategories(categories) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(categories));
            console.log('分类数据保存成功');
        } catch (error) {
            console.error('保存分类数据失败:', error);
            throw new Error('保存分类数据失败');
        }
    }

    /**
     * 根据ID获取分类
     * @param {string} id 分类ID
     * @returns {Object|null} 分类对象
     */
    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(category => category.id === id) || null;
    }

    /**
     * 根据名称获取分类
     * @param {string} name 分类名称
     * @returns {Object|null} 分类对象
     */
    getCategoryByName(name) {
        const categories = this.getCategories();
        return categories.find(category => category.name === name) || null;
    }

    /**
     * 获取适用于指定范围的分类
     * @param {string} scope 适用范围 ('plan' 或 'event')
     * @returns {Array} 分类数组
     */
    getCategoriesByScope(scope) {
        const categories = this.getCategories();
        return categories.filter(category => 
            category.applyTo && category.applyTo.includes(scope)
        );
    }

    /**
     * 创建新分类
     * @param {Object} categoryData 分类数据
     * @returns {Object} 创建结果
     */
    createCategory(categoryData) {
        try {
            // 数据验证
            const validation = this.validateCategoryData(categoryData);
            if (!validation.isValid) {
                return { success: false, error: validation.error };
            }

            const categories = this.getCategories();
            
            // 检查ID是否已存在
            if (categories.some(cat => cat.id === categoryData.id)) {
                return { success: false, error: '分类ID已存在' };
            }

            // 检查名称是否已存在
            if (categories.some(cat => cat.name === categoryData.name)) {
                return { success: false, error: '分类名称已存在' };
            }

            // 创建新分类
            const newCategory = {
                id: categoryData.id || this.generateCategoryId(categoryData.name),
                name: categoryData.name,
                color: categoryData.color || '#3B82F6',
                applyTo: categoryData.applyTo || ['plan', 'event'],
                isDefault: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            categories.push(newCategory);
            this.saveCategories(categories);

            console.log('创建分类成功:', newCategory);
            return { success: true, data: newCategory };
        } catch (error) {
            console.error('创建分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 更新分类
     * @param {string} id 分类ID
     * @param {Object} updateData 更新数据
     * @returns {Object} 更新结果
     */
    updateCategory(id, updateData) {
        try {
            const categories = this.getCategories();
            const categoryIndex = categories.findIndex(cat => cat.id === id);
            
            if (categoryIndex === -1) {
                return { success: false, error: '分类不存在' };
            }

            const category = categories[categoryIndex];
            
            // 如果是默认分类，限制某些字段的修改
            if (category.isDefault && updateData.id && updateData.id !== id) {
                return { success: false, error: '默认分类的ID不能修改' };
            }

            // 验证更新数据
            const validation = this.validateCategoryData(updateData, true);
            if (!validation.isValid) {
                return { success: false, error: validation.error };
            }

            // 检查名称是否与其他分类冲突
            if (updateData.name && updateData.name !== category.name) {
                if (categories.some(cat => cat.id !== id && cat.name === updateData.name)) {
                    return { success: false, error: '分类名称已存在' };
                }
            }

            // 更新分类
            const updatedCategory = {
                ...category,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            categories[categoryIndex] = updatedCategory;
            this.saveCategories(categories);

            console.log('更新分类成功:', updatedCategory);
            return { success: true, data: updatedCategory };
        } catch (error) {
            console.error('更新分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 删除分类
     * @param {string} id 分类ID
     * @returns {Object} 删除结果
     */
    deleteCategory(id) {
        try {
            const categories = this.getCategories();
            const categoryIndex = categories.findIndex(cat => cat.id === id);
            
            if (categoryIndex === -1) {
                return { success: false, error: '分类不存在' };
            }

            const category = categories[categoryIndex];
            
            // 检查是否为最后一个分类（至少保留一个分类）
            if (categories.length <= 1) {
                return { success: false, error: '至少需要保留一个分类，无法删除' };
            }

            // 检查是否有关联的记录或标签
            const hasRelatedData = this.checkCategoryUsage(id);
            if (hasRelatedData.hasUsage) {
                return { 
                    success: false, 
                    error: `分类正在使用中，无法删除。${hasRelatedData.details}` 
                };
            }

            // 删除分类
            categories.splice(categoryIndex, 1);
            this.saveCategories(categories);

            console.log('删除分类成功:', category);
            return { success: true, data: category };
        } catch (error) {
            console.error('删除分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 验证分类数据
     * @param {Object} data 分类数据
     * @param {boolean} isUpdate 是否为更新操作
     * @returns {Object} 验证结果
     */
    validateCategoryData(data, isUpdate = false) {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: '分类数据格式错误' };
        }

        // 名称验证
        if (!isUpdate || data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                return { isValid: false, error: '分类名称不能为空' };
            }
            if (data.name.trim().length > 20) {
                return { isValid: false, error: '分类名称不能超过20个字符' };
            }
        }

        // 颜色验证
        if (data.color !== undefined) {
            if (!this.isValidColor(data.color)) {
                return { isValid: false, error: '颜色格式错误' };
            }
        }

        // 适用范围验证
        if (data.applyTo !== undefined) {
            if (!Array.isArray(data.applyTo) || data.applyTo.length === 0) {
                return { isValid: false, error: '适用范围不能为空' };
            }
            const validScopes = ['plan', 'event'];
            if (!data.applyTo.every(scope => validScopes.includes(scope))) {
                return { isValid: false, error: '适用范围包含无效值' };
            }
        }

        return { isValid: true };
    }

    /**
     * 检查颜色格式是否有效
     * @param {string} color 颜色值
     * @returns {boolean} 是否有效
     */
    isValidColor(color) {
        if (!color || typeof color !== 'string') return false;
        // 检查十六进制颜色格式
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * 生成分类ID
     * @param {string} name 分类名称
     * @returns {string} 分类ID
     */
    generateCategoryId(name) {
        // 简单的ID生成策略：使用时间戳和随机数
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `cat_${timestamp}_${random}`;
    }

    /**
     * 检查分类使用情况
     * @param {string} categoryId 分类ID
     * @returns {Object} 使用情况
     */
    checkCategoryUsage(categoryId) {
        // 这里应该检查事件记录、计划等数据中是否使用了该分类
        // 暂时返回未使用状态，实际实现时需要检查相关数据
        return { hasUsage: false, details: '' };
    }

    /**
     * 获取分类名称映射表（ID -> 名称）
     * @returns {Object} 映射表
     */
    getCategoryNameMap() {
        const categories = this.getCategories();
        const nameMap = {};
        categories.forEach(category => {
            nameMap[category.id] = category.name;
        });
        return nameMap;
    }

    /**
     * 获取分类ID映射表（名称 -> ID）
     * @returns {Object} 映射表
     */
    getCategoryIdMap() {
        const categories = this.getCategories();
        const idMap = {};
        categories.forEach(category => {
            idMap[category.name] = category.id;
        });
        return idMap;
    }

    /**
     * 重置为默认分类
     * @returns {Object} 重置结果
     */
    resetToDefault() {
        try {
            this.saveCategories(this.defaultCategories);
            console.log('重置为默认分类成功');
            return { success: true };
        } catch (error) {
            console.error('重置分类失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 导出分类数据
     * @returns {string} JSON格式的分类数据
     */
    exportCategories() {
        const categories = this.getCategories();
        return JSON.stringify(categories, null, 2);
    }

    /**
     * 导入分类数据
     * @param {string} jsonData JSON格式的分类数据
     * @returns {Object} 导入结果
     */
    importCategories(jsonData) {
        try {
            const categories = JSON.parse(jsonData);
            if (!Array.isArray(categories)) {
                return { success: false, error: '数据格式错误' };
            }

            // 验证每个分类数据
            for (const category of categories) {
                const validation = this.validateCategoryData(category);
                if (!validation.isValid) {
                    return { success: false, error: `分类"${category.name || '未知'}"数据无效: ${validation.error}` };
                }
            }

            this.saveCategories(categories);
            console.log('导入分类数据成功');
            return { success: true };
        } catch (error) {
            console.error('导入分类数据失败:', error);
            return { success: false, error: '数据格式错误或解析失败' };
        }
    }
}

// 创建全局实例
window.categoriesManager = new CategoriesManager();

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CategoriesManager, categoriesManager: window.categoriesManager };
} 