---
title: spring-booot使用mysql设置
categories: Develop
comments: true
keywords: spring-boot,mysql
tags:
  - spring-boot
  - mysql
  - java
  - workspace
description: spring-boot 项目使用mysql,数据的时区错误问题排查
date: 2023-12-04T12:00:31.050Z
updated: 2023-12-12T17:00:01.081Z
---

# spring-boot 项目使用mysql,数据的时区错误问题排查

## 环境
- 应用: spring-boot + mysql
- 数据库: docker搭建的mysql

## 问题
- 应用保存数据, 时间类型时区不正确
- 保存到数据库后时间显示不正确, 慢了 14 个小时 , 即变成了`UTC-6`时区(西六区, 美洲中部时间)

## 排查解决

### 检查服务器机器的时间/时区
- 查看linux时间
```shell
$ date
$ date -R
```
- 如果时区不正确不是CST时区, 则需要修改时区, 执行以下命令,选择对应的时区
```shell
$ tzselect
```
- 选择完成后执行以下命令
```shell
cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
```
- 将软件时间写入硬件bioss时间,同步硬件时钟
```shell
sudo hwclock -w 
hwclock -r
```

### 检查docker 容器设置.
- 下面是使用docker启动mysql容器的命令, -V是启动参数, 可以看到引用了宿主机的本地时间文件`/etc/localtime`
```shell
podman run -p 3307:3306 --name mysql  -e MYSQL_ROOT_PASSWORD=Olsond@0920 \
    --restart always \
    -e TZ=Asia/Shanghai \
    -V /etc/localtime:/etc/localtime:ro \
    -v /home/olsond/data/podman_data/mysql/data:/var/lib/mysql \
    -v /home/olsond/data/podman_data/mysql/conf/my.cnf:/etc/mysql/conf.d/my.cnf \
    -v /home/olsond/data/podman_data/mysql/logs:/mysql/logs \
    -itd mysql:latest \
    --lower_case_table_names=1
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci \
```

### 检查 mysql 时区设置
- 首先确定数据库安装后的时区
 ```sql
# 查看数据库的当前时间
select now();
#time_zone说明mysql使用system的时区，system_time_zone说明system使用CST时区
show variables like "%time_zone%";
```
- 设置time_zone: 使用root账号在mysql db中修改时区`set global time_zone = '+8:00'; set time_zone = '+8:00';` 或者修改mysql的配置文件
```cnf
[mysqld]
default-time-zone = '+08:00'
character-set-server = utf8
 ```
> 注意修改配置文件后一定要重启mysql才能生效.

### 应用设置
- 首先确定应用连接时带了时区参数
  - `serverTimeZone=Asia/Shanghai`
 - 确定java中的时间类型参数格式化是否指定时区
```yaml
spring:  
  jackson:  
    date-format: "yyyy-MM-dd HH:mm:ss"  
    time-zone: 'GMT+'
```
