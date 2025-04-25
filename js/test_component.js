// 测试组件加载
document.addEventListener('DOMContentLoaded', function() {
    console.log('测试脚本已加载');
    
    // 检查header-container是否存在
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        console.log('找到header-container元素');
    } else {
        console.error('未找到header-container元素');
    }
    
    // 监听组件加载完成事件
    document.addEventListener('component-loaded', function(e) {
        console.log(`组件 ${e.detail.componentName} 已加载`);
        
        // 检查按钮是否存在
        if (e.detail.componentName === 'header') {
            const newPlanBtn = document.getElementById('btn-new-plan');
            const newRecordBtn = document.getElementById('btn-new-record');
            
            if (newPlanBtn) {
                console.log('新建计划按钮已加载');
                
                // 测试点击事件
                newPlanBtn.addEventListener('click', function() {
                    console.log('新建计划按钮被点击 - 测试事件');
                }, { once: true });
            } else {
                console.error('未找到新建计划按钮');
            }
            
            if (newRecordBtn) {
                console.log('记录事项按钮已加载');
                
                // 测试点击事件
                newRecordBtn.addEventListener('click', function() {
                    console.log('记录事项按钮被点击 - 测试事件');
                }, { once: true });
            } else {
                console.error('未找到记录事项按钮');
            }
        }
    });
}); 