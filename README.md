# 事件记录 - 数字生活助手

一个简洁高效的个人事务管理系统，帮助用户记录和追踪日常事件、计划和活动。

## 项目概述

事件记录系统是一个基于 Web 的应用程序，允许用户：

- 记录和分类各种生活事件
- 创建和跟踪个人计划和任务
- 查看日历视图以了解计划的时间安排
- 管理标签系统便于组织和检索
- 查看统计数据以分析时间分配

## 文件结构

```
/ 
├── index.html           # 主页/仪表盘
├── calendar.html        # 日历视图
├── events.html          # 事件列表
├── statistics.html      # 统计分析
├── tags.html            # 标签管理
├── settings.html        # 设置页面
├── js/
│   ├── common.js        # 通用功能和交互
│   └── components.js    # 组件管理系统
├── components/          # 组件库
└── README.md            # 项目文档
```

## 技术栈

- HTML5
- TailwindCSS (通过 CDN)
- 原生 JavaScript
- Font Awesome 图标库
- 本地存储 (localStorage) 用于数据持久化

## 功能模块

### 仪表盘 (index.html)
展示本周概览、分类记录和待办计划，提供快速访问主要功能的界面。

### 日历视图 (calendar.html)
以日历形式展示计划和已完成事件，支持月视图和周视图。

### 事件列表 (events.html)
按时间顺序列出所有计划和记录，支持筛选和排序。

### 统计分析 (statistics.html)
显示各类别事件统计、时间分配和效率趋势。

### 标签管理 (tags.html)
管理事件和计划的标签系统，支持增删改查、导入导出功能。

### 设置 (settings.html)
提供用户配置、数据管理和界面自定义选项。

## 开发指南

### 代码规范

1. **HTML**: 使用语义化标签，保持结构清晰。
2. **CSS**: 尽量使用 Tailwind 类处理样式，避免内联样式。
3. **JavaScript**: 
   - 使用 ES6+ 语法
   - 避免全局变量污染
   - 使用模块化和组件化设计
   - 保持单一职责原则

### 组件系统

项目使用轻量级组件系统，通过 `components.js` 加载和管理组件。
添加新组件时，请遵循以下步骤：

1. 在 `components/` 目录中创建组件 HTML 文件
2. 在 `components.js` 中注册组件
3. 使用 `<div id="component-name-container"></div>` 创建组件容器

### 数据存储

系统使用 localStorage 进行数据持久化，主要数据结构包括：

- `events`: 存储所有计划和记录
- `tags`: 存储标签信息
- `settings`: 存储用户设置

### 后续开发计划

1. 添加用户认证系统
2. 实现云同步功能
3. 优化移动端体验
4. 添加提醒和通知功能
5. 增强数据可视化和分析能力

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 开源许可

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

## 开发日志

### 2023-10-15: 代码优化与清理
- 删除了测试用的 `test_component.js` 文件，移除了对该文件的引用
- 优化了 `common.js` 文件，移除了冗余的控制台日志和调试信息
- 改进了通知系统，实现更简洁的弹窗效果
- 删除了不必要的备份文件，整理了代码库结构
- 标准化了错误处理和事件触发机制
- 更新了项目文档，提供了更详细的结构说明和开发指南 