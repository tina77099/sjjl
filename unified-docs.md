# 事件记录应用 - 开发与设计文档

本文档提供「事件记录」应用的数据结构、开发说明和设计规范，为开发和维护提供指导。

## 应用核心功能

「事件记录」应用有两个核心功能模块，彼此有明显区别：

1. **计划管理** - 用于创建和跟踪未来要做的事项
   - 关注点是"未来将要做什么"
   - 有完成状态的概念（待处理、进行中、已完成等）
   - 用户可以勾选完成，表示计划已执行
   - 主要显示在"本周计划"等区域

2. **事件记录** - 用于记录和分类已经完成的活动
   - 关注点是"过去已经做了什么"
   - 记录时已经是完成状态，没有状态变化
   - 用户不能/不需要勾选完成
   - 主要显示在"分类记录"等区域

## 数据结构

### 事件对象 (Event)

```javascript
{
  id: "string",              // 唯一标识符，如 "evt_1634567890123"
  title: "string",           // 事件标题
  description: "string",     // 事件描述
  eventType: "string",       // 事件类型："plan"(计划) 或 "record"(记录)
  startTime: "ISO string",   // 开始时间，如 "2023-10-15T14:00:00"
  endTime: "ISO string",     // 结束时间，如 "2023-10-15T15:30:00"
  isAllDay: boolean,         // 是否全天事件
  location: "string",        // 地点
  category: "string",        // 分类，如 "work", "study", "health", "life"
  priority: "string",        // 优先级，如 "high", "medium", "low" 
  status: "string",          // 状态(仅用于计划类型)，如 "completed", "in-progress", "pending", "overdue"
  tags: ["string"],          // 标签数组，如 ["会议", "设计", "产品"]
  participants: ["string"],  // 参与者数组
  createdAt: "ISO string",   // 创建时间
  updatedAt: "ISO string",   // 更新时间
  reminders: [{              // 提醒设置(主要用于计划类型)
    time: "ISO string",      // 提醒时间
    type: "string"           // 提醒类型，如 "notification", "email"
  }]
}
```

### 标签对象 (Tag)

```javascript
{
  id: "string",              // 唯一标识符，如 "tag_1634567890123"
  name: "string",            // 标签名称
  color: "string",           // 颜色代码，如 "#3B82F6"
  category: "string",        // 所属分类
  count: number,             // 使用次数
  createdAt: "ISO string"    // 创建时间
}
```

### 用户设置对象 (Settings)

```javascript
{
  theme: "string",           // 主题，如 "light", "dark"
  defaultView: "string",     // 默认视图，如 "day", "week", "month"
  notifications: {
    email: boolean,          // 是否开启邮件通知
    browser: boolean,        // 是否开启浏览器通知
    reminders: boolean,      // 是否开启事件提醒
    summary: boolean         // 是否开启每日摘要
  },
  language: "string",        // 语言设置，如 "zh-CN"
  startOfWeek: number        // 每周开始日，0-周日，1-周一
}
```

### 本地存储结构

使用 localStorage 存储数据：

```javascript
// 事件数据
localStorage.setItem('events', JSON.stringify(eventsArray));

// 标签数据
localStorage.setItem('tags', JSON.stringify(tagsArray));

// 用户设置
localStorage.setItem('settings', JSON.stringify(settingsObject));
```

## 开发说明

### 文件结构

```
/
├── index.html        # 仪表盘页面
├── events.html       # 事件列表页面
├── calendar.html     # 日历视图页面 
├── statistics.html   # 统计分析页面
├── tags.html         # 标签管理页面
├── settings.html     # 设置页面
├── js/
│   ├── main.js       # 主要JavaScript逻辑
│   ├── plans.js      # 计划相关功能
│   ├── records.js    # 记录相关功能
│   ├── events.js     # 通用事件功能
│   ├── calendar.js   # 日历相关功能
│   ├── statistics.js # 统计分析相关功能
│   ├── tags.js       # 标签管理相关功能
│   ├── settings.js   # 设置相关功能
│   └── utils.js      # 通用工具函数
└── css/
    └── custom.css    # 自定义样式（如有需要）
```

### 页面功能实现

#### 1. 仪表盘 (index.html)

- 显示本周计划和分类记录
- 主要函数:
  - `loadDashboard()`: 加载仪表盘数据
  - `updateStatistics()`: 更新统计卡片
  - `renderPlans()`: 渲染本周计划
  - `renderRecords()`: 渲染分类记录

#### 2. 事件列表 (events.html)

- 显示所有事件，支持分类查看
- 提供筛选、排序和搜索功能
- 主要函数:
  - `loadEvents()`: 加载事件数据
  - `filterEvents(criteria)`: 根据条件筛选事件
  - `sortEvents(criteria)`: 根据条件排序事件
  - `searchEvents(query)`: 搜索事件
  - `togglePlanStatus(eventId)`: 切换计划完成状态（仅对计划类型有效）

#### 3. 日历视图 (calendar.html)

- 提供月/周/日视图
- 在日历上显示计划和记录（可区分显示）
- 主要函数:
  - `renderCalendar(view, date)`: 渲染日历
  - `getEventsForDate(date)`: 获取特定日期的事件
  - `navigateCalendar(direction)`: 切换月份/周/日

#### 4. 统计分析 (statistics.html)

- 显示各类统计图表
- 可区分计划和记录的完成情况和分布
- 主要函数:
  - `loadStatistics(timeFrame)`: 加载统计数据
  - `renderCharts()`: 渲染各种图表
  - `exportReport()`: 导出报告功能

#### 5. 标签管理 (tags.html)

- 显示所有标签
- 支持创建、编辑和删除标签
- 主要函数:
  - `loadTags()`: 加载标签数据
  - `createTag(tagData)`: 创建新标签
  - `editTag(tagId, newData)`: 编辑标签
  - `deleteTag(tagId)`: 删除标签

#### 6. 设置 (settings.html)

- 管理用户设置
- 提供各类配置选项
- 主要函数:
  - `loadSettings()`: 加载设置
  - `saveSettings(newSettings)`: 保存设置
  - `resetSettings()`: 重置设置

### 通用功能

- **数据持久化**:
  ```javascript
  // 保存事件
  function saveEvent(event) {
    // 设置事件类型，若未指定则根据上下文判断
    if (!event.eventType) {
      // 在仪表盘的本周计划中添加的是计划类型
      // 在分类记录中添加的是记录类型
      event.eventType = 'plan'; // 默认为计划类型，实际应根据上下文确定
    }
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const index = events.findIndex(e => e.id === event.id);
    
    if (index > -1) {
      events[index] = event; // 更新现有事件
    } else {
      event.id = 'evt_' + Date.now();
      event.createdAt = new Date().toISOString();
      events.push(event); // 添加新事件
    }
    
    event.updatedAt = new Date().toISOString();
    localStorage.setItem('events', JSON.stringify(events));
  }
  
  // 读取所有事件
  function getEvents() {
    return JSON.parse(localStorage.getItem('events') || '[]');
  }
  
  // 获取计划类型事件
  function getPlans() {
    const events = getEvents();
    return events.filter(event => event.eventType === 'plan');
  }
  
  // 获取记录类型事件
  function getRecords() {
    const events = getEvents();
    return events.filter(event => event.eventType === 'record');
  }
  ```

- **事件筛选**:
  ```javascript
  function filterEvents(criteria = {}) {
    let events = getEvents();
    
    // 按事件类型筛选
    if (criteria.eventType) {
      events = events.filter(event => event.eventType === criteria.eventType);
    }
    
    // 按类别筛选
    if (criteria.category && criteria.category !== 'all') {
      events = events.filter(event => event.category === criteria.category);
    }
    
    // 按状态筛选（仅适用于计划类型）
    if (criteria.status && criteria.status !== 'all') {
      events = events.filter(event => 
        event.eventType === 'plan' && event.status === criteria.status
      );
    }
    
    // 其他筛选条件...
    
    return events;
  }
  ```

- **日期处理**:
  ```javascript
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  ```

## 设计规范

### 颜色方案

#### 主色

- **品牌主色**: `#4F46E5` (靛蓝色, Indigo-600)
- **浅色变体**: `#EEF2FF` (靛蓝色-50)
- **深色变体**: `#4338CA` (靛蓝色-700)

#### 功能色

- **成功色**: `#10B981` (绿色-500)
- **警告色**: `#F59E0B` (黄色-500)
- **错误色**: `#EF4444` (红色-500)
- **信息色**: `#3B82F6` (蓝色-500)

#### 事件类型颜色

- **计划类型**: `#3B82F6` (蓝色-500)
- **记录类型**: `#8B5CF6` (紫色-500)

#### 中性色

- **背景色**: `#F9FAFB` (灰色-50)
- **卡片背景**: `#FFFFFF` (白色)
- **边框色**: `#E5E7EB` (灰色-200)
- **文本-主要**: `#1F2937` (灰色-800)
- **文本-次要**: `#6B7280` (灰色-500)
- **文本-禁用**: `#9CA3AF` (灰色-400)

### 排版

#### 字体

- **主要字体**: 系统字体栈, sans-serif
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  ```

#### 字号

- **页面标题**: `1.5rem` (24px)
- **卡片标题**: `1.25rem` (20px)
- **正文文本**: `1rem` (16px)
- **小号文本**: `0.875rem` (14px)
- **微型文本**: `0.75rem` (12px)

### 间距

- **基础单位**: `0.25rem` (4px)
- **内部边距(Padding)**: 
  - 卡片: `1.5rem` (24px)
  - 按钮: `0.5rem 1rem` (8px 16px)
- **外部边距(Margin)**:
  - 组件间: `1.5rem` (24px)
  - 段落: `1rem` (16px)

### 圆角

- **小圆角**: `0.25rem` (4px)
- **中圆角**: `0.5rem` (8px)
- **大圆角**: `1rem` (16px)
- **全圆**: `9999px` (用于圆形头像等)

### 阴影

- **轻微阴影**: 
  ```css
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  ```
- **中等阴影**: 
  ```css
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  ```
- **强烈阴影**: 
  ```css
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  ```

### 组件样式

#### 不同类型事件的视觉区分

- **计划项**:
  ```css
  /* 边框左侧标记 */
  border-left: 4px solid #3B82F6;
  ```

- **记录项**:
  ```css
  /* 边框左侧标记 */
  border-left: 4px solid #8B5CF6;
  ```

#### 按钮

- **主要按钮**:
  ```css
  background-color: #4F46E5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  ```
- **次要按钮**:
  ```css
  background-color: white;
  color: #4F46E5;
  padding: 0.5rem 1rem;
  border: 1px solid #4F46E5;
  border-radius: 0.5rem;
  font-weight: 500;
  ```

- **添加计划按钮**:
  ```css
  background-color: #3B82F6;
  color: white;
  ```

- **添加记录按钮**:
  ```css
  background-color: #8B5CF6;
  color: white;
  ```

#### 卡片

```css
background-color: white;
border-radius: 0.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
padding: 1.5rem;
```

#### 表单元素

- **输入框**:
  ```css
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  focus:outline-none;
  focus:ring-2;
  focus:ring-indigo-300;
  ```
- **下拉菜单**:
  ```css
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  appearance: none;
  background-image: url('chevron-down.svg');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  ```

#### 标签

```css
background-color: #EEF2FF;
color: #4F46E5;
padding: 0.25rem 0.5rem;
border-radius: 9999px;
font-size: 0.75rem;
font-weight: 500;
```

### 响应式设计断点

- **移动设备**: `640px`
- **平板设备**: `768px`
- **桌面设备**: `1024px`
- **大屏设备**: `1280px`

```css
/* 移动设备 */
@media (min-width: 640px) { ... }

/* 平板设备 */
@media (min-width: 768px) { ... }

/* 桌面设备 */
@media (min-width: 1024px) { ... }

/* 大屏设备 */
@media (min-width: 1280px) { ... }
```

## 最佳实践

1. **命名约定**:
   - 使用驼峰命名法(camelCase)命名JavaScript变量和函数
   - HTML类名采用短横线分隔(kebab-case)

2. **注释规范**:
   - 为每个函数添加简短描述
   - 对复杂逻辑添加详细注释

3. **代码组织**:
   - 将功能相似的代码组织在一起
   - 优先使用函数式编程方法
   - 避免过长函数，保持单一职责

4. **性能考虑**:
   - 避免频繁操作DOM
   - 使用事件委托处理列表项事件
   - 批量更新localStorage，避免频繁读写

5. **安全考虑**:
   - 不存储敏感信息
   - 使用内容安全策略(CSP)
   - 验证用户输入，防止XSS攻击 