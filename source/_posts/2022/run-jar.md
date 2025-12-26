---
title: java应用启动脚本以及配置文件的优先级
categories: Devops
comments: true
keywords: jar,java
tags: [linux,jar,java]
description: java应用在linux系统的启动脚本,配置优先级
date: '2022-11-12T16:00:31.050Z'
updated: '2023-04-25T06:00:01.081Z'
---

# 多环境方式
- 使用内置多环境配置文件
```bash
#!/bin/sh
JAVA_HOME=/opt/jdk
CLASSPATH=.:$JAVA_HOME/lib.tools.jar
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME CLASSPATH PATH


mkdir -p /app/logs/cjms
/usr/bin/cd /app/logs/cjms
nohup java -Xms2048m -Xmx2048m -XX:+UseParallelGC -XX:MaxPermSize=512M -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/cjms-dump.log -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8370 -jar /app/cjms.jar --spring.profiles.active=dev > /app/logs/cjms/cjms.log 2>&1 &
```

# 简化方式
- 指定外置配置文件
```bash
$ java -Dfile.encoding=UTF-8 -jar ./flute-cps-server.jar -Dspring.config.location=./application.yaml
```

