# Git 使用指南

## 基本工作流程

Git 的基本工作流程包括以下几个部分：
1. 工作区（Working Directory）：你的文件夹中实际的文件
2. 暂存区（Staging Area）：准备提交的文件集合
3. 本地仓库（Local Repository）：完成提交后的文件记录
4. 远程仓库（Remote Repository）：托管在服务器上的仓库

## 基础命令

### 查看状态和历史

```bash
# 查看当前状态（修改、暂存等）
git status

# 查看提交历史
git log
git log --oneline  # 简洁版本
git log --graph    # 图形化显示
```

### 基本操作

```bash
# 添加文件到暂存区
git add 文件名           # 添加指定文件
git add .             # 添加所有更改的文件

# 提交文件到本地仓库
git commit -m "提交信息"  # 提交并添加说明

# 查看文件变化
git diff              # 查看未暂存的文件变化
git diff --staged     # 查看已暂存的文件变化
```

### 分支操作

```bash
# 创建并切换到新分支
git checkout -b 分支名  # 创建并切换
git branch 分支名      # 只创建不切换
git checkout 分支名    # 切换分支

# 查看分支
git branch            # 查看本地分支
git branch -r         # 查看远程分支
git branch -a         # 查看所有分支

# 合并分支
git merge 分支名       # 将指定分支合并到当前分支
```

### 远程仓库操作

```bash
# 添加远程仓库
git remote add origin https://github.com/用户名/仓库名.git

# 查看远程仓库
git remote -v

# 下载远程仓库内容但不合并
git fetch origin

# 下载并合并
git pull origin 分支名

# 推送到远程仓库
git push origin 分支名
git push -u origin 分支名  # 设置上游分支并推送
```

## 常用工作流程示例

### 日常工作流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/new-feature

# 3. 修改文件...

# 4. 添加并提交更改
git add .
git commit -m "添加新功能"

# 5. 推送到远程
git push origin feature/new-feature

# 6. 在GitHub/GitLab等平台创建Pull Request或Merge Request
```

### 处理冲突

当合并分支时发生冲突：

1. 打开冲突文件，查找标记（<<<<<<< HEAD, =======, >>>>>>> branch-name）
2. 编辑文件解决冲突
3. 添加解决后的文件 `git add 冲突文件`
4. 完成合并 `git commit`

## 进阶技巧

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- 文件名

# 撤销暂存区的修改
git reset HEAD 文件名

# 撤销提交
git revert 提交ID     # 创建新提交来撤销旧提交
git reset --soft HEAD~1  # 撤销上一次提交但保留更改
git reset --hard HEAD~1  # 完全撤销上一次提交（危险！会丢失更改）
```

### 暂存工作

```bash
# 临时保存修改
git stash

# 查看保存的stash
git stash list

# 应用保存的stash
git stash apply      # 应用最近的stash但不删除
git stash pop        # 应用最近的stash并删除
```

### 标签管理

```bash
# 创建标签
git tag v1.0.0       # 创建轻量标签
git tag -a v1.0.0 -m "版本1.0.0发布"  # 创建带注释的标签

# 查看标签
git tag

# 推送标签到远程
git push origin v1.0.0    # 推送特定标签
git push origin --tags    # 推送所有标签
```

## 配置

```bash
# 设置用户信息
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 设置默认编辑器
git config --global core.editor vim

# 查看配置
git config --list
```

## 提交规范

一个好的提交信息应该能清晰地表达更改的内容，推荐使用以下格式：

```
feat: 添加了新功能
fix: 修复了某个bug
docs: 更新了文档
style: 代码风格相关更改
refactor: 代码重构，无功能更改
test: 添加测试
chore: 构建过程或辅助工具变动
```

## 提示与技巧

1. 使用 `.gitignore` 文件忽略不需要版本控制的文件
2. 经常提交小的、完整的更改，而不是大量的更改
3. 撰写有意义的提交信息
4. 定期从主分支同步更新
5. 使用分支进行功能开发，保持主分支稳定

更多详细信息请参考 [Git官方文档](https://git-scm.com/doc) 或 [GitHub文档](https://docs.github.com/cn)。 