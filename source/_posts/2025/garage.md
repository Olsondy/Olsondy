---
title: 搭建兼容S3的云存储- Garage的安装和使用
categories: Deveops
comments: true
keywords: deveops,os
tags:
  - centos
  - linux
  - devops
description: grage是个轻量的兼容s3的云存储服务, 可以在配置较低的服务器中运行
date: 2025-12-26
updated: 2025-12-26
---
# Garage的安装和使用

> **现有的对象存储方案**

* Nginx 反向代理静态资源

* NAS 服务

* 云厂商的 COS : 例如腾讯云对象存储或者阿里云

* 自建存储 : minio ceph 等

## 准备工作

* 域名一个

* 云主机或云服务器

* 安装docker或podman

## 安装Garage以及 web-ui

首先需要准备一个配置文件 `garage.toml`, 存放位置没有要求

* [Garage configuration](https://garagehq.deuxfleurs.fr/documentation/reference-manual/configuration/#s3_root_domain) garage配置文档

* [Garage web ui](https://github.com/khairul169/garage-webui/blob/main/misc/img/garage-webui.png)  github地址

```toml
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "localhost:3901"
rpc_secret = "f1b082015ee1564f71634d2a3985ef7092ba1f6f27d952d98cc964bc2a2a1526"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3-garage.techwork.cloud" 

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web-garage.techwork.cloud"
index = "index.html"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "5ac4f2778731704a1f03c1b267fea1ccaa14f61782945cd8960e7492471b327a"
metrics_token = "a684ce3d9ef9a847e0fb073392f15d91eb42bddec3d09479f844d1074c20544b"
```

**注意:**

> \[s3\_api]中的 root\_domain属性决定了请求的garage 服务的域名,  garage约定就是以 \<bucket>.s3-garage.example.com形式进行访问的, 例如你有一个名称为test的桶, 那么访问时就会以 test.s3-garage.example.com来进行 (尝试过设置为一级域名无法访问, 必需是s3-garage的二级域名)

### 创建工作空间

```bash
mkdir -p /podman_data/garage
```

### 使用 podman-compose.yml 启动

```yaml
version: 3
services:
  # 存储服务
  garage:
    image: dxflrs/garage:v1.1.0
    container_name: garage
    restart: unless-stopped
    ports:
     - "3900:3900"   ## s3 api
     - "3901:3901"   ## rpc
     - "3902:3902"   ## s3 web
     - "3903:3903"   ## admin api and '/metrics' for prometheus
    volumes:
      - ./garage/garage.toml:/etc/garage.toml
      - ./garage/meta:/var/lib/garage/meta
      - ./garage/data:/var/lib/garage/data
    environment:
      - TZ=Asia/Shanghai
    networks:
      - techwork_net
  # garage ui界面
  webui:
    image: khairul169/garage-webui:latest
    container_name: garage-webui
    restart: unless-stopped
    ports:
      - "3909:3909"
    volumes:
      - ./garage/garage.toml:/etc/garage.toml:ro
    environment:
      API_BASE_URL: "http://garage:3903"
      S3_ENDPOINT_URL: "http://garage:3900"
    networks:
      - techwork_net
networks:
  techwork_net:
    driver: bridge
```

以上启动就可以在浏览器访问http://ip:3909访问了

### Garage 使用

* webui的功能其实就是将garage命令简化成页面操作了, 你可以使用garage 命令进行操作.&#x20;

#### 关联节点

![](image.png)

![](image-1.png)

#### 创建key

![](image-2.png)

#### 创建bucket

![](image-3.png)

#### 授权

![](image-4.png)



#### 相关工具

Garage 兼容s3,  例如使用一些支持s3的客户端工具: minio clicent,  amazon s3 client

##### 安装aws client

````bash
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo yum install unzip
unzip awscliv2.zip
sudo ./aws/install

# config client
aws configure

# userprofile
vim ~/.awsrc
### add content for .awsrc
export AWS_ACCESS_KEY_ID=     # put your Key ID here
export AWS_SECRET_ACCESS_KEY=  # put your Secret key here
export AWS_DEFAULT_REGION='garage'
export AWS_ENDPOINT_URL='http://localhost:3900' #替换为你的Garage实际IP和端口

source .awsrc
````

配置 `aws configure`命令时 按照提示输入以下信息：

* **`AWS Access Key ID [None]:`** Garage 生成的 `Key ID`。

* **`AWS Secret Access Key [None]:`**  Garage 生成的`Secret key`。

* **`Default region name [None]:`**  `garage` 约定是这个

* **`Default output format [None]:`** 推荐输入 `json`，这样输出会是结构化的 JSON 格式。

配置信息会存储在 `~/.aws/credentials` 和 `~/.aws/config` 文件中