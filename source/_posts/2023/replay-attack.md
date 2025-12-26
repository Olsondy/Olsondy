---
title: http接口请求的重放攻击
categories: Develop
comments: true
keywords: security-web,java
tags: [security-web, java, workspace]
description: 安全漏洞方案-http接口请求的重放攻击
date: 2023-12-04T12:00:31.050Z
updated: 2023-12-12T17:00:01.081Z
---

# http接口请求的重放攻击

## 介绍
> `API`重放攻击（`Replay Attacks`）又称重播攻击、回放攻击，这种攻击会不断恶意或欺诈性地重复一个有效的`API`请求。攻击者利用网络监听或者其他方式盗取`API`请求，进行一定的处理后，再把它重新发给认证服务器，是黑客常用的攻击方式之一。

## 防止攻击
提供`X-Ca-Timestamp`、`X-Ca-Nonce`（`nonce`:`number used once`）两个可选`Http Header`，客户端调用`API`时一起使用这两个参数，可以达到防止重放攻击的目的。

## 解决方案
- `X-Ca-Timestamp`：发起请求的时间，可以取自机器的本地实现。当网关收到请求时，会校验这个参数的有效性，误差不超过指定时间（如：`15`分钟）。
-  `X-Ca-Nonce`：这个是请求的唯一标识，一般使用`UUID`来标识。网关收到这个参数后会校验这个参数的有效性，同样的值，指定时间（如：`15`分钟）只能被使用一次。
- `X-Ca-Timestamp`、`X-Ca-Nonce`和一起辅助参数都加入签名计算，所以请求的任何修改，都会造成签名失败。
