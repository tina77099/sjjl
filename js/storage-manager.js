/**
 * 存储管理器
 * 提供统一的数据存储和管理功能
 */
class StorageManager {
    constructor() {
        this.storagePrefix = 'eventRecorder';
        this.init();
    }

    /**
     * 初始化存储管理器
     */
    init() {
        console.log('📦 存储管理器初始化完成');
    }

    /**
     * 获取存储键名
     * @param {string} key 键名
     * @returns {string} 完整的存储键名
     */
    getStorageKey(key) {
        return `${this.storagePrefix}_${key}`;
    }

    /**
     * 存储数据
     * @param {string} key 键名
     * @param {any} data 数据
     */
    setItem(key, data) {
        try {
            const storageKey = this.getStorageKey(key);
            const serializedData = JSON.stringify(data);
            localStorage.setItem(storageKey, serializedData);
            console.log(`💾 数据已存储: ${key}`);
        } catch (error) {
            console.error(`❌ 存储数据失败: ${key}`, error);
            throw error;
        }
    }

    /**
     * 获取数据
     * @param {string} key 键名
     * @param {any} defaultValue 默认值
     * @returns {any} 数据
     */
    getItem(key, defaultValue = null) {
        try {
            const storageKey = this.getStorageKey(key);
            const data = localStorage.getItem(storageKey);
            if (data === null) {
                return defaultValue;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ 获取数据失败: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * 移除数据
     * @param {string} key 键名
     */
    removeItem(key) {
        try {
            const storageKey = this.getStorageKey(key);
            localStorage.removeItem(storageKey);
            console.log(`🗑️ 数据已移除: ${key}`);
        } catch (error) {
            console.error(`❌ 移除数据失败: ${key}`, error);
        }
    }

    /**
     * 清除所有数据
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🧹 所有存储数据已清除');
        } catch (error) {
            console.error('❌ 清除数据失败', error);
        }
    }

    /**
     * 获取存储大小
     * @returns {number} 存储大小（字节）
     */
    getStorageSize() {
        try {
            let totalSize = 0;
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    totalSize += localStorage.getItem(key).length;
                }
            });
            return totalSize;
        } catch (error) {
            console.error('❌ 计算存储大小失败', error);
            return 0;
        }
    }

    /**
     * 备份数据
     * @returns {Object} 备份数据
     */
    backup() {
        try {
            const backup = {};
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    backup[key] = localStorage.getItem(key);
                }
            });
            console.log('📋 数据备份完成');
            return backup;
        } catch (error) {
            console.error('❌ 数据备份失败', error);
            return {};
        }
    }

    /**
     * 恢复数据
     * @param {Object} backup 备份数据
     */
    restore(backup) {
        try {
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, backup[key]);
            });
            console.log('📥 数据恢复完成');
        } catch (error) {
            console.error('❌ 数据恢复失败', error);
        }
    }
}

// 创建全局实例
window.storageManager = new StorageManager();

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storageManager: window.storageManager };
} 