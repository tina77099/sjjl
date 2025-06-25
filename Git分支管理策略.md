# Git 分支管理策略

## 分支类型

一个有效的Git分支管理策略通常包含以下几种类型的分支：

### 1. 主分支（main/master）

- **用途**：存放正式发布的历史
- **特点**：
  - 所有代码都应该是可部署的
  - 不允许直接提交代码
  - 只能通过合并其他分支的方式更新

### 2. 开发分支（develop）

- **用途**：日常开发的集成分支
- **特点**：
  - 包含最新的开发代码
  - 可能不稳定
  - 作为功能分支的合并目标

### 3. 功能分支（feature）

- **用途**：开发新功能
- **命名规范**：`feature/功能名称`
- **特点**：
  - 从develop分支创建
  - 完成后合并回develop
  - 一个功能一个分支
  - 完成后删除

### 4. 发布分支（release）

- **用途**：准备发布新版本
- **命名规范**：`release/版本号`
- **特点**：
  - 从develop分支创建
  - 只进行bug修复，不添加新功能
  - 完成后合并到main和develop
  - 发布完成后删除

### 5. 热修复分支（hotfix）

- **用途**：紧急修复生产环境的问题
- **命名规范**：`hotfix/问题描述`
- **特点**：
  - 从main分支创建
  - 修复后合并到main和develop
  - 修复完成后删除

## Git Flow 工作流

一个常用的分支管理模型是 Git Flow，它定义了严格的分支用途和合并规则：

```
      ┌─── 发布 ────┐
      ↓             ↓
  develop       main/master
  ↑  ↑ ↖         ↑ ↑
  │  │  ↖        │ │
  │  │   ↖       │ │
  │  │    release│ │
  │  │           │ │
  │  └── 合并 ────┘ │
  │                │
  └─── 合并 ─ hotfix┘
  ↑
feature
```

### 使用步骤

1. **初始化**：
   ```bash
   # 创建develop分支
   git checkout -b develop main
   git push origin develop
   ```

2. **开发新功能**：
   ```bash
   # 从develop创建功能分支
   git checkout -b feature/new-feature develop
   
   # 完成功能后合并回develop
   git checkout develop
   git merge --no-ff feature/new-feature
   git push origin develop
   
   # 删除功能分支
   git branch -d feature/new-feature
   ```

3. **准备发布**：
   ```bash
   # 从develop创建发布分支
   git checkout -b release/1.0.0 develop
   
   # 修复bug并提交
   git commit -am "修复发布前的bug"
   
   # 完成发布，合并到main和develop
   git checkout main
   git merge --no-ff release/1.0.0
   git tag -a v1.0.0 -m "版本1.0.0"
   
   git checkout develop
   git merge --no-ff release/1.0.0
   
   # 删除发布分支
   git branch -d release/1.0.0
   ```

4. **紧急修复**：
   ```bash
   # 从main创建修复分支
   git checkout -b hotfix/critical-bug main
   
   # 修复bug并提交
   git commit -am "修复紧急问题"
   
   # 合并到main和develop
   git checkout main
   git merge --no-ff hotfix/critical-bug
   git tag -a v1.0.1 -m "紧急修复1.0.1"
   
   git checkout develop
   git merge --no-ff hotfix/critical-bug
   
   # 删除修复分支
   git branch -d hotfix/critical-bug
   ```

## GitHub Flow

对于持续部署的项目，GitHub Flow 是一个更简单的模型：

1. 从main分支创建功能分支
2. 在分支上开发并提交
3. 创建Pull Request
4. 代码审查
5. 部署和测试（可选）
6. 合并到main分支

## 最佳实践

1. **分支命名**：使用描述性名称，遵循一致的命名规范
2. **保持分支最新**：经常从main/develop拉取最新代码并合并
3. **使用有意义的提交信息**：明确说明更改内容和原因
4. **频繁提交**：小而频繁的提交比大而罕见的提交更好管理
5. **使用Pull Requests/Merge Requests**：便于代码审查和讨论
6. **保护主分支**：设置分支保护规则，防止直接提交
7. **使用标签**：为重要的发布版本创建标签
8. **使用`--no-ff`参数**：保留分支合并历史

## Git提交消息规范

### 结构

```
<类型>(<范围>): <主题>

<正文>

<脚注>
```

### 类型

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档更改
- **style**: 格式（不影响代码运行的变动）
- **refactor**: 重构（既不修复bug也不添加新功能）
- **perf**: 性能优化
- **test**: 添加测试
- **chore**: 构建过程或辅助工具的变动

### 示例

```
feat(auth): 添加用户登录功能

实现了用户登录的前后端逻辑，包括：
- 登录表单验证
- 密码加盐哈希
- JWT令牌生成

修复 #123
```

## 工具推荐

1. **GUI客户端**：
   - GitKraken
   - SourceTree
   - GitHub Desktop
   - Fork

2. **Git扩展**：
   - git-flow：实现Git Flow工作流的命令行工具
   - hub：GitHub命令行工具
   - pre-commit：提交前检查和格式化代码

## 常见问题解决

### 解决合并冲突

当出现冲突时：

1. 运行 `git status` 查看冲突文件
2. 打开文件手动解决冲突（寻找 `<<<<<<<`, `=======`, `>>>>>>>` 标记）
3. 运行 `git add <冲突文件>` 标记为已解决
4. 完成合并 `git commit`

### 撤销错误合并

```bash
# 撤销合并并保留工作区更改
git merge --abort

# 或撤销已提交的合并
git revert -m 1 <合并提交ID>
``` 