---
title: jvm 内存分析
categories: Devops
comments: true
keywords: jvm
tags: [jvm, linux, workspace]
description: jvm 内存 内存情况排查
date: 2023-12-04T12:00:31.050Z
updated: 2023-12-12T17:00:01.081Z
---

# 查看java进程的资源使用情况
`$ top`
`$ ps aux`

# 查看指定java进程的线程运行情况
```shell
$ top -Hp <pid>
$ ps -mp <pid> -o THREAD,tid,time
$ printf %x n #输出n的16进制

$ jstack -l <pid>|grep <tid> -A 30 # pid是进程id,tid是线程id(0x+16进制数) -A 30是输出指定行后30行的数据
$ jstat -gc <pid> #查看gc情况，各代内存使用大小
$ jstat -gcutil <pid> #查看gc情况，各代内存占用比%
$ jmap -heap <pid> #查看jvm的配置以及各区域的使用情况
$ jmap -histo <pid>#查看堆中的各对象占用情况
$ jmap -histo:live <pid> #查看队中活跃对象的占用情况
$ jmap -dump:format=b,file=文件名 <pid> #dump 日志，文件名后缀可以是dump或者jps等
```
