---
title: 服务器从0-1初始化及环境搭建
categories: Deveops
comments: true
keywords: deveops,os
tags:
  - centos
  - linux
  - devops
description: 如何使用podman手动搭建一个应用启动环境, 从服务器购买到初始化
date: 2025-07-12T10:20:12.050Z
updated: 2025-12-26T13:53:01.081Z
---


# Server initialization
## cloud 
- cloud server OS Centos 8x
- update server ssh port
```shell
# add a row of custom ports (e.g Port 9576)
vi /etc/ssh/sshd_config
#Port 25073
#ClientAliveInterval 60     # 服务器每 60 秒检测一次客户端
#ClientAliveCountMax 3      # 允许 3 次检测无响应
sudo service sshd restart
sudo systemctl restart sshd

# add a row of custom ListenStream (e.g ListenStream=9576)
vi /etc/systemd/system/sockets.target.wants/ssh.socket
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
```
- add user and auth
```shell
sudo adduser yourusername
sudo passwd yourusername

#usage Ubuntu
sudo usermod -aG sudo yourusername

# update auth Debain默认没有，Ubuntu自身应该是已经有安装的
apt update && apt install sudo  #

visudo
# add row 
yourusername ALL=(ALL) NOPASSWD: ALL

#successfuly !!!
ssh yourusername@xxx.xx.xx.xx -p port
```

## install app container
- create podman container workspace data dir
```
mkdir -p /home/olsond/podman_data &&  cd /home/olsond/podman_data
```
- podman & podman compose
```shell
#CentOS
sudo dnf install podman podman-compose
#Ubuntu(由于ubuntu系统过于追求更新, 在这个操作系统上 这俩个版本会不一致,需要手动去确认版本)
sudo apt-get update && sudo apt-get install podman podman-compose
#install socket
systemctl --user enable --now podman.socket
systemctl --user start podman.socket
systemctl --user status podman.socket
ls -l /run/user/$(id -u)/podman/
# config registries
#root
#sudo vim /etc/containers/registries.conf
#rootless
vim ~/.config/containers/registries.conf
chmod 644 ~/.config/containers/registries.conf  # 设置权限
#add registries
unqualified-search-registries = ["docker.io"]
[[registry]]
prefix = "docker.io"
location = "docker.1ms.run"
[[registry]]
prefix = "docker.io"
location = "docker-0.unsee.tech"

# setting storage
mkdir -p ~/.config/containers 
mkdir -p ~/.local/run/containers/storage
vim ~/.config/containers/storage.conf
# add storage dir
[storage]
driver = "overlay"
#runroot = "/home/$USER/.local/run/containers/storage"
graphroot = "/home/$USER/.local/share/containers/storage"
#successcful 
podman info
```
 - nginx workspece setting
```shell
# dir initialize
mkdir -p /home/olsond/podman_data/postgresql
mkdir -p /home/olsond/podman_data/nginx && cd /home/olsond/podman_data/nginx
# config initialize for demo nginx
podman run --name nginx -p 18080:80 -d nginx:latest
podman cp nginx:/etc/nginx/nginx.conf /home/olsond/podman_data/nginx/
podman cp nginx:/etc/nginx/conf.d /home/olsond/podman_data/nginx/conf.d
podman cp nginx:/usr/share/nginx/html /home/olsond/podman_data/nginx/html
# remove demo nginx
podman stop nginx
podman rm nginx
```
- portainer workspece setting
```shell
mkdir -p ~/podman_data/portainer/data
```
- podman compose command
```Shell
podman-compose -f xxx.yml up -d
#shutdown
podman-compose -f xxx.yml down
#condition
podman-compose -f compose.yml up -d [服务名]
podman-compose -f compose.yml down [服务名]

podman container -a

podman image prune -a

podman system prune -a
```

- crate user id script
```bash
#!/bin/bash
cat << EOF > .env
# 自动生成用户权限设置
CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)

# 应用特定设置
EOF
```

- podman-compose.yml demo
```YAML
version: 3
services:
  # 数据库服务（PostgreSQL）
  db:
    image: postgres:13
    container_name: postgresql
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: koalauser
      POSTGRES_PASSWORD: koalapwd@2025
      POSTGRES_DB: koala_words
      LANG: C.UTF-8
    volumes:
      - ./postgresql/data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myuser -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - network_name
   # Nginx服务
  #nginx:
  #  image: nginx:latest
  #  container_name: nginx
  #  ports:
  #    - "8080:80"     # HTTP端口
  #    - "8443:443"   # HTTPS端口
  #  volumes:
  #    # 挂载自定义配置
  #    - ./nginx/nginx.conf:/etc/nginx/nginx.conf
  #    - ./nginx/ssl:/etc/nginx/ssl
  #    - ./nginx/conf.d:/etc/nginx/conf.d
  #    - ./nginx/html:/usr/share/nginx/html
  #   - ./nginx/log:/var/log/nginx
  #  restart: always  # 自动重启
  #  networks: 
  #    - koala_test
  portainer_ce:
    image: portainer/portainer-ce:latest
    container_name: portainer
    ports: 
      # 注意官方教程中使用9443端口是用于https的,没有证书的无法启用
       - "9001:9000" #http ui port
       - "8000:8000"
    volumes:
       # 挂载自定义配置
      - ./podman_data/portainer/data:/data
      - /run/user/${CURRENT_UID}/podman/podman.sock:/var/run/docker.sock
    restart: always  # 自动重启
    privileged: true
    networks:
      - koala_test
networks:
  koala_test:
    driver: bridge
    name: network_name
```

## Issue
> 运行容器提示 "write /run/user/1000/libpod/tmp/events/events.log: no space left on device"
  -  磁盘日志满载 , 删除该日志文件 使用`df- u` 或者 `du -h --max-depth=1`查看用户空间

