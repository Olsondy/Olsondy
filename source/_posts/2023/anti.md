---
title: JavaWeb应用安全漏洞方案
categories: Develop
comments: true
keywords: java,nginx,javascript
tags: [java, nginx, javascript, workspace]
description: Spring应用安全相关解决方案
date: 2023-12-04T12:00:31.050Z
updated: 2023-12-12T17:00:01.081Z
---
# Spring 应用安全相关解决方案
> 以下内容方案仅限于使用spring生态框架进行开发的web应用, 包括spring mvc 、spring-boot、spring-gateway等

# 会话安全
> 在一个完整的系统中, 会话是不可或缺的一个环节, 但是会话安全隐患也是每个系统会存在的内容

## 锁定用户方案
- 根据用户上次登录时间做为介质, 判断长时间未使用过系统的用户,例如1-3个月,超过这个时间则锁定用户

## 用户会话保持设置方案

# 数据防护
> 在请求系统对外交互过程中, 会向系统获取数据, 提交数据, 而数据内容的安全性是否符合要求也非常重要, 包括数据的隐私性, 合法性等

## 数据加密、解密、防篡改、重放

## 访问请求控制、限流

## XSS 防护、SQL注入

# 服务器安全配置

## Host头攻击
 > 很多场景下，开发者都相信HTTP Host header传递的参数值用来更新链接导出脚本或者一些敏感操作。但该参数是可控的，若没有对其进行处理，就有可能造成恶意代码的传入。修复建议：使用SERVER_NAME代替host header。

- 方案: 配置`nginx.conf` 过滤信息, 配置只允许访问当前nginx服务的地址
```conf
if ($host !~* ^localhost|xxx.xx.xx:8888$)
{
	return 403;
}
```
- 检查 `curl --header "Host:localhost:3030"-X GET http://localhost:3030/`

## 目标HTTP安全响应头缺失
>X-Content-Type-Options响应头的缺失使得目标URL更易遭受跨站脚本攻击。修复建议：将您的服务器配置为在所有传出请求上发送值为“nosniff”的“X-Content-Type-Options”头。 

- 方案:  增加请求头设置, `ngxin.conf` 配置加固
```conf
#标准加固
add header X-Content-Type-Options nosniff;
#标准加固，只允许同源嵌入
add header X-Frame-Options SAMEORIGIN:
#所有的外部资源，都只能从当前域名加载
add header Content-Security-Policy "worker-src 'self';";
#启用XSS保护, 1=启用, 0=停用, mode=block：启用XSS保护，并在检查到XSS攻击时，停止渲染页面（例如IE8中，检查到攻击时，整个页面会被一个#替换）
add_header X-Xss-Protection "1;mod=block";
```
