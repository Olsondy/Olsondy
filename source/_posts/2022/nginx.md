---
title: CentOS安装nginx
categories: Devops
comments: true
keywords: centos,nginx
tags: [linux,centos,nginx]
description: CentOS安装nginx及简单使用
created: '2022-11-12T16:00:31.050Z'
modified: '2023-04-25T06:00:01.081Z'
---


# Start
>使用yum安装,目前安装的版本是 nginx 1.16.1

## Environment
 - _OS: CentOS Linux release 8.5.2111_

## Download dependency
  ```shell
    [root@olsond-private-app nginx]# yum -y install gcc zlib zlib-devel pcre-devel openssl openssl-devel
  ```

## Download (_recommend_)
  ```shell
    #创建一个文件夹
    [root@olsond-private-app nginx]# mkdir nginx && cd nginx
    #下载tar包
    [root@olsond-private-app nginx]# wget http://nginx.org/download/nginx-1.16.1.tar.gz
    #解压
    [root@olsond-private-app nginx]# tar -xvf nginx-1.16.1.tar.gz
   ```

## Install
  ```shell
  [root@olsond-private-app nginx]# cd nginx-1.16.1
  #--prefix                           指定安装路径
  #--with-http_stub_status_module    允许查看nginx状态的模块
  #--with-http_ssl_module            支持https的模块
  [root@olsond-private-app nginx-1.16.1]# ./configure --prefix=/opt/nginx --with-http_stub_status_module --with-http_ssl_module --with-http_v2_module --with-http_sub_module --with-http_gzip_static_module --with-pcre
  [root@olsond-private-app nginx-1.16.1]# make
  [root@olsond-private-app nginx-1.16.1]# make install
  ```
## Testing config
  ```shell
    [root@olsond-private-app nginx-1.16.1]# /opt/nginx/sbin/nginx -t
    nginx: the configuration file /opt/nginx/conf/nginx.conf syntax is ok
    nginx: configuration file /opt/nginx/conf/nginx.conf test is successful
  ```
## Checking start
  ```shell
    [root@olsond-private-app nginx-1.16.1]# ps -ef | grep nginx
    root        6464    1103  0 11:30 pts/0    00:00:00 grep --color=auto nginx
  ```
## Command
  ```shell
    #指定配置文件启动
    [root@olsond-private-app nginx-1.16.1]# /opt/nginx/sbin/nginx -c /opt/nginx/conf/nginx.conf
    [root@olsond-private-app nginx-1.16.1]# ps -ef | grep nginx
    root        6483       1  0 11:37 ?        00:00:00 nginx: master process /opt/nginx/sbin/nginx -c /opt/nginx/conf/nginx.conf
    nobody      6484    6483  0 11:37 ?        00:00:00 nginx: worker process
    root        6486    1103  0 11:37 pts/0    00:00:00 grep --color=auto nginx
    #重启
    [root@olsond-private-app nginx-1.16.1]# /opt/nginx/sbin/nginx -s reload
    #关闭
    [root@olsond-private-app nginx-1.16.1]# /opt/nginx/sbin/nginx -s stop
    [root@olsond-private-app nginx-1.16.1]# ps -ef | grep nginx
    root        6491    1103  0 11:39 pts/0    00:00:00 grep --color=auto nginx
  ```
  

# Summary
  - 安装nginx-1.13.1版本时出现make失败的问题, 解决方案就是安装新版本的nginx
    ```shell
      src/os/unix/ngx_user.c: In function ‘ngx_libc_crypt’:
      src/os/unix/ngx_user.c:36:7: error: ‘struct crypt_data’ has no member named ‘current_salt’
      cd.current_salt[0] = ~salt[0];
      ^
      make[1]: *** [objs/Makefile:732: objs/src/os/unix/ngx_user.o] Error 1
      make[1]: Leaving directory '/opt/install_pkg/nginx-1.13.1'
      make: *** [Makefile:8: build] Error 2
      [root@olsond-private-app nginx-1.13.1]#
    ```
  - 安装时可以指定参数(个人习惯), 也可以默认安装, 默认的好处是nginx命令会在环境全局生效

