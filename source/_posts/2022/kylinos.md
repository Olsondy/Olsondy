---
title: 国产麒麟(Sword)操作系统安装docker
categories: Devops
comments: true
keywords: kylin
tags: [system,kylin]
description: 国产麒麟(Sword)操作系统的使用
date: '2022-11-08T05:36:29.557Z'
updated: '2022-11-15T10:19:11.496Z'
---

# Kylinos-server (Sword)  Deploy

> kylinos-server(兆芯版) for Ubuntu 64

## Login account
- root/Olsond@1qaz

## Checked OS

```bash 
  $ cat /etc/kylin-release

  $ uname -p
```

## View docker stable website 
[Docker list](https://download.docker.com/linux/static/stable)

## Install
-  Docker install url
```bash
  $ wget https://download.docker.com/linux/static/stable/x86_64/docker-20.10.9.tgz 
  ``` 
*noted: if using offline installation, ignore the above install steps*


## Setting docker
``` bash
$ tar -zxvf docker-20.10.9.tgz

$ mv docker/* /usr/bin
```
- Create docker.service conf
```
$ vi /usr/lib/systemd/system/docker.service
```

- Parse the fllowing
``` bash
  [Unit]
  Description=Docker Application Container Engine
  Documentation=https://docs.docker.com
  After=network-online.target firewalld.service
  Wants=network-online.target
  [Service]
  Type=notify
  ExecStart=/usr/bin/dockerd
  ExecReload=/bin/kill -s HUP $MAINPID
  LimitNOFILE=infinity
  LimitNPROC=infinity
  TimeoutStartSec=0
  Delegate=yes
  KillMode=process
  Restart=on-failure
  StartLimitBurst=3
  StartLimitInterval=60s
  [Install]
  WantedBy=multi-user.target
```

- Permission
``` bash
$ chmod +x /usr/lib/systemd/system/docker.service
```

- Setting mirros
```bash
$ sudo mkdir -p /etc/docker
$ sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "http://f1361db2.m.daocloud.io",
    "https://7bnhbpem.mirror.aliyuncs.com",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://mirror.ccs.tencentyun.com",
    "https://ung2thfc.mirror.aliyuncs.com",
    "https://reg-mirror.qiniu.com"
   ]
}
EOF
```

- Setting friewall forward
```bash
$ firewall-cmd --query-masquerade
$ sysctl -p
$ vi /etc/sysctl.conf
$ firewall-cmd --add-masquerade --permanent
$ firewall-cmd --permanent --add-port=22/tcp
$ firewall --reload
```

- Docker Start 
```bash
$ sudo systemctl daemon-reload
$ sudo systemctl start docker
$ sudo systemctl enable docker.service
$ sudo systemctl restart docker
```
- Docker operation commands
```bash
$ touch ~/.vimrc && vi ~/.vimrc
:set encoding=utf-8

$ docker network create --driver bridge --subnet 172.18.0.1/24 --gateway 172.18.0.1 poc_net

$ docker load --input [imageName.tar]

$ docker run --name [containerId] -itd [imagaeId|repository:tag]

# In container
$ docker exec -it [containerId] /bin/bash

$ docker tag [imageId] [reposity:tag]

# delate container if container status exit
$ docker stop $(docker ps -a -q)

$ docker container prune

# delate images
$ docker rmi -f [imageId|repository:tag]

# container logs
$ docker logs --since 30m 62db69ff44b9
```


