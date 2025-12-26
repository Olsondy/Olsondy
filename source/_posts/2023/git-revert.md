---
title: git revert 使用场景 
categories: Devops
comments: true
keywords: devtools
tags:
  - git
  - workspace
description: git revert操作流程及原理
date: 2023-12-04T12:00:31.050Z
updated: 2023-12-12T17:00:01.081Z
---

# git revert 使用场景
## 场景
- A分支、 dev分支
- A分支合并到dev(commit A)后需要回滚 ,使用`git revert commitId`回滚,并产生一次revert 后的commit记录(commit B)
- A分支继续开发了新内容再次提交到dev, 导致之前commit A的记录再无法合并.
## 分析
- A分支合并到dev分支, 将commit A的合并请求revert, 产生一次新的revert的commit B记录, 只回滚该次合并的代码记录,不影响其他分支线提交记录
- A分支再次提交, revert之前的commit A的相关代码是在commit B之后的, 新的commit B记录会被认为是最新的时间线, 不会被认为有改动
##  解决
- 分析完很简单, 再次将commit B 再次revert操作再提交commit.
![](git-revert.png)
