---
title: 重构项目问题汇总
categories: Develop
comments: true
keywords: coding,refactor
tags: [workspace,coding,refactor]
description: 重构项目问题汇总
date: '2023-5-10T16:00:31.050Z'
updated: '2023-09-25T06:00:01.081Z'
---

# 前端问题
- 部署vue问题, 使用nginx代理转发后端总结
  - we're sorry but xxx doesn't work properly without javascript enabled. please enable it to continue
  - nginx 配置location匹配规则优先级问题, 跟history无关

# 后端问题总结

- oracle char类型使用mybaits需要使用trim函数,由于char类型的长度会自动填充,假如数据的内容不满足char设置的长度,oracle会补充空格

- jasypt 加密受jdk版本的影响. <https://stackoverflow.com/questions/15544266/org-jasypt-exceptions-encryptionoperationnotpossibleexception>

- 使用shiro权限框架, shiro的filter 需要修改过滤链调用中的httpRequestWrapper
