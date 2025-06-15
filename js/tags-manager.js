/**
 * 标签数据管理模块
 * 提供统一的标签数据管理功能，包括增删改查、数据验证等
 */

class TagsManager {
    constructor() {
        this.storageKey = 'eventRecorderTags';
        this.usageStorageKey = 'eventRecorderTagUsage';
        this.init();
    }

    /**
     * 初始化标签数据
     */
    init() {
        const tags = this.getTags();
        if (!tags || tags.length === 0) {
            console.log('初始化空标签数据');
        }
    }

    /**
     * 获取所有标签
     * @returns {Array} 标签数组
     */
    getTags() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取标签数据失败:', error);
            return [];
        }
    }

    /**
     * 保存标签数据
     * @param {Array} tags 标签数组
     */
    saveTags(tags) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tags));
            console.log('标签数据保存成功');
        } catch (error) {
            console.error('保存标签数据失败:', error);
            throw new Error('保存标签数据失败');
        }
    }

    /**
     * 根据ID获取标签
     * @param {string} id 标签ID
     * @returns {Object|null} 标签对象
     */
    getTagById(id) {
        const tags = this.getTags();
        return tags.find(tag => tag.id === id) || null;
    }

    /**
     * 根据名称获取标签
     * @param {string} name 标签名称
     * @returns {Object|null} 标签对象
     */
    getTagByName(name) {
        const tags = this.getTags();
        return tags.find(tag => tag.name === name) || null;
    }

    /**
     * 根据分类获取标签
     * @param {string} categoryId 分类ID
     * @returns {Array} 标签数组
     */
    getTagsByCategory(categoryId) {
        const tags = this.getTags();
        return tags.filter(tag => tag.categoryId === categoryId);
    }

    /**
     * 获取适用于指定范围的标签
     * @param {string} scope 适用范围 ('plan' 或 'event')
     * @returns {Array} 标签数组
     */
    getTagsByScope(scope) {
        const tags = this.getTags();
        return tags.filter(tag => 
            tag.applyTo && tag.applyTo.includes(scope)
        );
    }

    /**
     * 搜索标签
     * @param {string} keyword 搜索关键词
     * @param {Object} filters 过滤条件
     * @returns {Array} 标签数组
     */
    searchTags(keyword = '', filters = {}) {
        let tags = this.getTags();

        // 关键词搜索
        if (keyword.trim()) {
            const lowerKeyword = keyword.toLowerCase();
            tags = tags.filter(tag => 
                tag.name.toLowerCase().includes(lowerKeyword) ||
                (tag.description && tag.description.toLowerCase().includes(lowerKeyword))
            );
        }

        // 分类过滤
        if (filters.categoryId && filters.categoryId !== 'all') {
            tags = tags.filter(tag => tag.categoryId === filters.categoryId);
        }

        // 适用范围过滤
        if (filters.scope) {
            tags = tags.filter(tag => 
                tag.applyTo && tag.applyTo.includes(filters.scope)
            );
        }

        return tags;
    }

    /**
     * 强制刷新数据状态
     * 清除可能的内部缓存，强制从localStorage重新读取数据
     * @returns {Array} 最新的标签数据
     */
    forceRefresh() {
        console.log('🔄 执行强制数据刷新...');
        
        // 清除可能的浏览器缓存
        if (typeof window !== 'undefined' && window.localStorage) {
            // 重新读取数据确保最新状态
            const rawData = localStorage.getItem(this.storageKey);
            console.log(`📊 强制刷新读取的原始数据长度: ${rawData ? rawData.length : 0}`);
            
            if (rawData) {
                try {
                    const tags = JSON.parse(rawData);
                    console.log(`📈 强制刷新解析出 ${tags.length} 个标签`);
                    return tags;
                } catch (error) {
                    console.error('强制刷新时解析数据失败:', error);
                    return [];
                }
            }
        }
        
        return [];
    }

    /**
     * 等待数据同步完成
     * @param {number} delay 延迟时间(毫秒)
     * @returns {Promise} Promise对象
     */
    waitForDataSync(delay = 100) {
        console.log(`⏱️ 等待数据同步完成 (${delay}ms)...`);
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('✅ 数据同步等待完成');
                resolve();
            }, delay);
        });
    }

    /**
     * 验证数据一致性
     * @param {string} tagName 要检查的标签名称
     * @returns {Object} 验证结果
     */
    validateDataConsistency(tagName) {
        console.log(`🔍 验证标签 "${tagName}" 的数据一致性...`);
        
        // 方法1: 使用getTags()方法
        const methodTags = this.getTags();
        const methodFound = methodTags.find(tag => tag.name === tagName);
        
        // 方法2: 直接从localStorage读取
        let directTags = [];
        try {
            const rawData = localStorage.getItem(this.storageKey);
            directTags = rawData ? JSON.parse(rawData) : [];
        } catch (error) {
            console.error('直接读取localStorage失败:', error);
        }
        const directFound = directTags.find(tag => tag.name === tagName);
        
        const isConsistent = !!methodFound === !!directFound;
        
        console.log(`📊 数据一致性检查结果:`);
        console.log(`   - getTags()方法: ${methodFound ? '找到' : '未找到'}`);
        console.log(`   - 直接读取: ${directFound ? '找到' : '未找到'}`);
        console.log(`   - 一致性: ${isConsistent ? '一致' : '不一致'}`);
        
        return {
            isConsistent,
            methodFound: !!methodFound,
            directFound: !!directFound,
            methodTags,
            directTags
        };
    }

    /**
     * 创建新标签
     * @param {Object} tagData 标签数据
     * @returns {Object} 创建结果
     */
    async createTag(tagData) {
        try {
            console.log('🏷️ createTag 开始创建标签:', tagData);
            
            // 1. 强制刷新数据状态，确保最新数据
            await this.waitForDataSync(50);
            const refreshedTags = this.forceRefresh();
            console.log(`🔄 刷新后获得 ${refreshedTags.length} 个标签`);
            
            // 2. 数据验证
            const validation = this.validateTagData(tagData);
            if (!validation.isValid) {
                console.log('❌ 标签数据验证失败:', validation.error);
                return { success: false, error: validation.error };
            }

            // 3. 双重验证：检查数据一致性
            const consistencyCheck = this.validateDataConsistency(tagData.name);
            if (!consistencyCheck.isConsistent) {
                console.warn('⚠️ 检测到数据不一致，尝试重新同步...');
                await this.waitForDataSync(100);
                // 使用直接读取的数据作为准确来源
                const tags = consistencyCheck.directTags;
            } else {
                // 使用常规方法获取的数据
                var tags = this.getTags();
            }
            
            console.log(`📊 最终使用的标签数组长度: ${tags.length}`);
            
            // 4. 详细检查名称是否已存在（使用最新数据）
            console.log(`🔍 准备检查名称 "${tagData.name}" 是否重复...`);
            const existingTagsWithSameName = tags.filter(tag => tag.name === tagData.name);
            console.log(`🔍 找到同名标签数量: ${existingTagsWithSameName.length}`);
            
            if (existingTagsWithSameName.length > 0) {
                console.log('❌ 发现同名标签:', existingTagsWithSameName);
                existingTagsWithSameName.forEach((tag, index) => {
                    console.log(`   [${index}] ID: ${tag.id}, 名称: "${tag.name}", 创建时间: ${tag.createdAt}`);
                });
                return { success: false, error: '标签名称已存在' };
            }
            
            console.log('✅ 名称检查通过，无重复标签');

            // 5. 验证分类是否存在
            if (tagData.categoryId && window.categoriesManager) {
                const category = window.categoriesManager.getCategoryById(tagData.categoryId);
                if (!category) {
                    console.log('❌ 指定的分类不存在:', tagData.categoryId);
                    return { success: false, error: '指定的分类不存在' };
                }
            }

            // 6. 创建新标签
            const newTag = {
                id: this.generateTagId(tagData.name),
                name: tagData.name,
                description: tagData.description || '',
                categoryId: tagData.categoryId || null,
                color: tagData.color || '#3B82F6',
                applyTo: tagData.applyTo || ['plan', 'event'],
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('🆕 新标签对象创建:', newTag);

            // 7. 添加到标签数组
            tags.push(newTag);
            console.log(`📈 标签数组更新，新长度: ${tags.length}`);
            
            // 8. 保存到localStorage
            this.saveTags(tags);
            console.log('💾 标签数据已保存到localStorage');
            
            // 9. 延迟验证保存结果
            await this.waitForDataSync(100);
            const savedTags = this.getTags();
            const verifyTag = savedTags.find(tag => tag.id === newTag.id);
            if (verifyTag) {
                console.log('✅ 保存验证成功，标签已存在于localStorage');
            } else {
                console.error('❌ 保存验证失败，标签未找到');
            }

            console.log('✅ 创建标签成功:', newTag);
            return { success: true, data: newTag };
        } catch (error) {
            console.error('❌ 创建标签过程出错:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 更新标签
     * @param {string} id 标签ID
     * @param {Object} updateData 更新数据
     * @returns {Object} 更新结果
     */
    updateTag(id, updateData) {
        try {
            const tags = this.getTags();
            const tagIndex = tags.findIndex(tag => tag.id === id);
            
            if (tagIndex === -1) {
                return { success: false, error: '标签不存在' };
            }

            const tag = tags[tagIndex];

            // 验证更新数据
            const validation = this.validateTagData(updateData, true);
            if (!validation.isValid) {
                return { success: false, error: validation.error };
            }

            // 检查名称是否与其他标签冲突
            if (updateData.name && updateData.name !== tag.name) {
                console.log(`🔍 检查标签名称重复: "${updateData.name}" (当前: "${tag.name}")`);
                const duplicateTag = tags.find(t => t.id !== id && t.name === updateData.name);
                if (duplicateTag) {
                    console.log(`❌ 发现重复标签:`, duplicateTag);
                    
                    // 返回详细的冲突信息
                    return { 
                        success: false, 
                        error: '标签名称已存在',
                        conflictType: 'duplicate_name',
                        conflictData: {
                            currentTag: tag,
                            existingTag: duplicateTag,
                            newName: updateData.name,
                            suggestedNames: this.generateSuggestedNames(updateData.name, tags)
                        }
                    };
                }
                console.log(`✅ 名称检查通过，无重复`);
            } else if (updateData.name) {
                console.log(`📝 标签名称未改变: "${updateData.name}"`);
            }

            // 验证分类是否存在
            if (updateData.categoryId && window.categoriesManager) {
                const category = window.categoriesManager.getCategoryById(updateData.categoryId);
                if (!category) {
                    return { success: false, error: '指定的分类不存在' };
                }
            }

            // 更新标签
            const updatedTag = {
                ...tag,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            tags[tagIndex] = updatedTag;
            this.saveTags(tags);

            console.log('更新标签成功:', updatedTag);
            return { success: true, data: updatedTag };
        } catch (error) {
            console.error('更新标签失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 删除标签
     * @param {string} id 标签ID
     * @returns {Object} 删除结果
     */
    async deleteTag(id) {
        try {
            console.log(`🗑️ deleteTag 开始删除标签，ID: ${id}`);
            
            const tags = this.getTags();
            console.log(`📊 删除前标签总数: ${tags.length}`);
            
            const tagIndex = tags.findIndex(tag => tag.id === id);
            console.log(`🔍 要删除的标签索引: ${tagIndex}`);
            
            if (tagIndex === -1) {
                console.log('❌ 删除失败：标签不存在');
                return { success: false, error: '标签不存在' };
            }

            const tag = tags[tagIndex];
            console.log(`📝 找到要删除的标签:`, tag);

            // 检查是否有关联的记录
            const hasRelatedData = this.checkTagUsage(id);
            if (hasRelatedData.hasUsage) {
                console.log('❌ 删除失败：标签正在使用中', hasRelatedData.details);
                return { 
                    success: false, 
                    error: `标签正在使用中，无法删除。${hasRelatedData.details}` 
                };
            }

            console.log('🔄 执行删除操作...');
            
            // 删除标签
            tags.splice(tagIndex, 1);
            console.log(`📉 标签从数组中移除，新长度: ${tags.length}`);
            
            // 保存到localStorage
            this.saveTags(tags);
            console.log('💾 删除后的标签数据已保存到localStorage');
            
            // 强制刷新和数据同步
            console.log('🔄 执行删除后的数据同步...');
            await this.waitForDataSync(150); // 增加延迟确保数据写入完成
            
            // 强制刷新数据状态
            const refreshedTags = this.forceRefresh();
            console.log(`🔄 删除后强制刷新，当前标签数量: ${refreshedTags.length}`);
            
            // 验证删除结果
            const verifyTag = refreshedTags.find(tag => tag.id === id);
            if (!verifyTag) {
                console.log('✅ 删除验证成功，标签已从localStorage移除');
            } else {
                console.error('❌ 删除验证失败，标签仍存在于localStorage:', verifyTag);
                // 如果验证失败，尝试再次删除
                console.log('🔄 尝试再次删除残留数据...');
                const updatedTags = refreshedTags.filter(t => t.id !== id);
                this.saveTags(updatedTags);
                await this.waitForDataSync(100);
            }
            
            // 额外验证：检查同名标签
            const sameNameTags = refreshedTags.filter(t => t.name === tag.name && t.id !== id);
            console.log(`🔍 删除后同名标签 "${tag.name}" 的数量: ${sameNameTags.length}`);
            if (sameNameTags.length > 0) {
                console.log('⚠️ 警告：删除后仍存在同名标签:', sameNameTags);
            } else {
                console.log(`✅ 确认删除彻底，无同名标签 "${tag.name}" 残留`);
            }

            console.log('✅ 删除标签成功:', tag);
            return { success: true, data: tag };
        } catch (error) {
            console.error('❌ 删除标签过程出错:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 验证标签数据
     * @param {Object} data 标签数据
     * @param {boolean} isUpdate 是否为更新操作
     * @returns {Object} 验证结果
     */
    validateTagData(data, isUpdate = false) {
        if (!data || typeof data !== 'object') {
            return { isValid: false, error: '标签数据格式错误' };
        }

        // 名称验证
        if (!isUpdate || data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                return { isValid: false, error: '标签名称不能为空' };
            }
            if (data.name.trim().length > 20) {
                return { isValid: false, error: '标签名称不能超过20个字符' };
            }
        }

        // 描述验证
        if (data.description !== undefined) {
            if (typeof data.description !== 'string') {
                return { isValid: false, error: '标签描述格式错误' };
            }
            if (data.description.length > 100) {
                return { isValid: false, error: '标签描述不能超过100个字符' };
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
     * 生成标签ID
     * @param {string} name 标签名称
     * @returns {string} 标签ID
     */
    generateTagId(name) {
        // 简单的ID生成策略：使用时间戳和随机数
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `tag_${timestamp}_${random}`;
    }

    /**
     * 检查标签使用情况
     * @param {string} tagId 标签ID
     * @returns {Object} 使用情况
     */
    checkTagUsage(tagId) {
        // 这里应该检查事件记录、计划等数据中是否使用了该标签
        // 暂时返回未使用状态，实际实现时需要检查相关数据
        return { hasUsage: false, details: '' };
    }

    /**
     * 增加标签使用次数
     * @param {string} tagId 标签ID
     */
    incrementTagUsage(tagId) {
        const tags = this.getTags();
        const tagIndex = tags.findIndex(tag => tag.id === tagId);
        
        if (tagIndex !== -1) {
            tags[tagIndex].usageCount = (tags[tagIndex].usageCount || 0) + 1;
            tags[tagIndex].lastUsedAt = new Date().toISOString();
            this.saveTags(tags);
        }
    }

    /**
     * 减少标签使用次数
     * @param {string} tagId 标签ID
     */
    decrementTagUsage(tagId) {
        const tags = this.getTags();
        const tagIndex = tags.findIndex(tag => tag.id === tagId);
        
        if (tagIndex !== -1) {
            tags[tagIndex].usageCount = Math.max(0, (tags[tagIndex].usageCount || 0) - 1);
            this.saveTags(tags);
        }
    }

    /**
     * 获取热门标签
     * @param {number} limit 返回数量限制
     * @returns {Array} 热门标签数组
     */
    getPopularTags(limit = 10) {
        const tags = this.getTags();
        return tags
            .filter(tag => tag.usageCount > 0)
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
            .slice(0, limit);
    }

    /**
     * 获取最近使用的标签
     * @param {number} limit 返回数量限制
     * @returns {Array} 最近使用的标签数组
     */
    getRecentTags(limit = 10) {
        const tags = this.getTags();
        return tags
            .filter(tag => tag.lastUsedAt)
            .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
            .slice(0, limit);
    }

    /**
     * 排序标签
     * @param {Array} tags 标签数组
     * @param {string} sortBy 排序字段
     * @param {string} order 排序顺序 ('asc' 或 'desc')
     * @returns {Array} 排序后的标签数组
     */
    sortTags(tags, sortBy = 'name', order = 'asc') {
        const sortedTags = [...tags];
        
        sortedTags.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'usageCount':
                    valueA = a.usageCount || 0;
                    valueB = b.usageCount || 0;
                    break;
                case 'createdAt':
                    valueA = new Date(a.createdAt);
                    valueB = new Date(b.createdAt);
                    break;
                case 'updatedAt':
                    valueA = new Date(a.updatedAt);
                    valueB = new Date(b.updatedAt);
                    break;
                default:
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
            }
            
            if (order === 'desc') {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            } else {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            }
        });
        
        return sortedTags;
    }

    /**
     * 批量创建标签
     * @param {Array} tagNames 标签名称数组
     * @param {Object} commonData 公共数据
     * @returns {Object} 创建结果
     */
    batchCreateTags(tagNames, commonData = {}) {
        const results = [];
        const errors = [];
        
        for (const name of tagNames) {
            const tagData = {
                name: name.trim(),
                ...commonData
            };
            
            const result = this.createTag(tagData);
            if (result.success) {
                results.push(result.data);
            } else {
                errors.push({ name, error: result.error });
            }
        }
        
        return {
            success: errors.length === 0,
            created: results,
            errors: errors,
            total: tagNames.length,
            successCount: results.length,
            errorCount: errors.length
        };
    }

    /**
     * 导出标签数据
     * @returns {string} JSON格式的标签数据
     */
    exportTags() {
        const tags = this.getTags();
        return JSON.stringify(tags, null, 2);
    }

    /**
     * 导入标签数据
     * @param {string} jsonData JSON格式的标签数据
     * @returns {Object} 导入结果
     */
    importTags(jsonData) {
        try {
            const tags = JSON.parse(jsonData);
            if (!Array.isArray(tags)) {
                return { success: false, error: '数据格式错误' };
            }

            // 验证每个标签数据
            for (const tag of tags) {
                const validation = this.validateTagData(tag);
                if (!validation.isValid) {
                    return { success: false, error: `标签"${tag.name || '未知'}"数据无效: ${validation.error}` };
                }
            }

            this.saveTags(tags);
            console.log('导入标签数据成功');
            return { success: true };
        } catch (error) {
            console.error('导入标签数据失败:', error);
            return { success: false, error: '数据格式错误或解析失败' };
        }
    }

    /**
     * 清理未使用的标签
     * @returns {Object} 清理结果
     */
    cleanupUnusedTags() {
        const tags = this.getTags();
        const unusedTags = tags.filter(tag => (tag.usageCount || 0) === 0);
        
        if (unusedTags.length === 0) {
            return { success: true, cleaned: 0, message: '没有未使用的标签' };
        }
        
        const usedTags = tags.filter(tag => (tag.usageCount || 0) > 0);
        this.saveTags(usedTags);
        
        console.log(`清理了 ${unusedTags.length} 个未使用的标签`);
        return { 
            success: true, 
            cleaned: unusedTags.length, 
            message: `成功清理了 ${unusedTags.length} 个未使用的标签` 
        };
    }

    /**
     * 生成建议的替代名称
     * @param {string} baseName 基础名称
     * @param {Array} existingTags 现有标签列表
     * @returns {Array} 建议名称数组
     */
    generateSuggestedNames(baseName, existingTags) {
        const suggestions = [];
        const existingNames = new Set(existingTags.map(tag => tag.name));
        
        // 策略1: 添加数字后缀
        for (let i = 1; i <= 9; i++) {
            const candidate = `${baseName}${i}`;
            if (!existingNames.has(candidate)) {
                suggestions.push(candidate);
                if (suggestions.length >= 3) break;
            }
        }
        
        // 策略2: 添加描述性后缀
        const suffixes = ['标签', '相关', '类别', '专用', '记录'];
        for (const suffix of suffixes) {
            const candidate = `${baseName}${suffix}`;
            if (!existingNames.has(candidate) && !suggestions.includes(candidate)) {
                suggestions.push(candidate);
                if (suggestions.length >= 5) break;
            }
        }
        
        return suggestions.slice(0, 3); // 最多返回3个建议
    }

    /**
     * 替换现有标签（删除旧标签并创建新标签）
     * @param {string} oldTagId 要删除的旧标签ID
     * @param {string} currentTagId 当前编辑的标签ID
     * @param {Object} newTagData 新标签数据
     * @returns {Object} 操作结果
     */
    replaceExistingTag(oldTagId, currentTagId, newTagData) {
        try {
            const tags = this.getTags();
            
            // 找到要删除的旧标签和当前编辑的标签
            const oldTagIndex = tags.findIndex(tag => tag.id === oldTagId);
            const currentTagIndex = tags.findIndex(tag => tag.id === currentTagId);
            
            if (oldTagIndex === -1) {
                return { success: false, error: '要替换的标签不存在' };
            }
            
            if (currentTagIndex === -1) {
                return { success: false, error: '当前编辑的标签不存在' };
            }
            
            const oldTag = tags[oldTagIndex];
            const currentTag = tags[currentTagIndex];
            
            console.log(`🔄 执行标签替换: 删除 "${oldTag.name}" (${oldTag.id}), 更新 "${currentTag.name}" -> "${newTagData.name}"`);
            
            // 1. 删除旧标签
            tags.splice(oldTagIndex, 1);
            
            // 2. 更新当前标签索引（如果旧标签在当前标签之前，索引需要调整）
            const adjustedCurrentIndex = oldTagIndex < currentTagIndex ? currentTagIndex - 1 : currentTagIndex;
            
            // 3. 更新当前标签
            const updatedTag = {
                ...tags[adjustedCurrentIndex],
                ...newTagData,
                updatedAt: new Date().toISOString()
            };
            
            tags[adjustedCurrentIndex] = updatedTag;
            
            // 4. 保存数据
            this.saveTags(tags);
            
            console.log('标签替换成功:', updatedTag);
            
            return { 
                success: true, 
                data: updatedTag,
                replacedTag: oldTag,
                message: `成功将 "${oldTag.name}" 替换为 "${newTagData.name}"`
            };
            
        } catch (error) {
            console.error('标签替换失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 创建全局实例
window.tagsManager = new TagsManager();

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TagsManager, tagsManager: window.tagsManager };
} 