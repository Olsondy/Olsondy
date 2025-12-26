---
title: docker的使用
categories: Devops
comments: true
keywords: docker
tags: [linux,docker]
description: docker的安装与简单使用
date: '2023-04-24T16:00:31.050Z'
updated: '2023-10-19T14:32:34.081Z'
---
# Install docker

# Docker commands
- command
```shell
# 镜像重命名
docker tag IMAGEID(镜像id) REPOSITORY:TAG（仓库：标签）  #Docker image rename
# 备份镜像
docker save -o 镜像导出文件(格式为tar压缩文件) 镜像ID或镜像名称[:版本号]
或
docker save 镜像ID或镜像名称[:版本号] > 镜像导出文件(格式为tar压缩文件)
e.g:
docker save -o $(pwd)/mytomcat.tar newtomcat:v1.0
或
docker save newtomcat:v1.0 > $(pwd)/mytomcat.tar
# 恢复镜像
docker load -i 镜像导出文件(格式为tar压缩文件)
或
docker load < 镜像导出文件(格式为tar压缩文件)

e.g:
docker load -i $(pwd)/mytomcat.tar 
或 
docker load < $(pwd)/mytomcat.tar

#备份容器
docker export -o 容器导出文件(格式为tar压缩文件) 容器ID或容器名称  
或
docker export 容器ID或容器名称 > 容器导出文件(格式为tar压缩文件) 

e.g:
docker export -o $(pwd)/newtomcat.tar mytomcat
或
docker export mytomcat > $(pwd)/newtomcat.tar 

#恢复容器
docker import 容器导出文件(格式为tar压缩文件) 新镜像名称[:版本号]
或
docker import /URL 新镜像名称[:版本号]
e.g: 
docker import $(pwd)/newtomcat.tar newtomcat:v1.0
或
docker import http://example.com/exampleimage.tgz example/imagerepo

注释：
$(pwd)是docker支持的获取当前目录路径的方法，与linux的pwd类似
$(pwd)/newtomcat.tar 表示在当前目录下生成一个newtomcat.tar压缩文件

备注：
容器可以不启动进行备份操作
```
- docker run params
```
Usage: docker run [OPTIONS] IMAGE [COMMAND] [ARG...]    

-d, --detach=false         指定容器运行于前台还是后台，默认为false     
-i, --interactive=false   打开STDIN，用于控制台交互    
-t, --tty=false            分配tty设备，该可以支持终端登录，默认为false    
-u, --user=""              指定容器的用户    
-a, --attach=[]            登录容器（必须是以docker run -d启动的容器）  
-w, --workdir=""           指定容器的工作目录   
-c, --cpu-shares=0        设置容器CPU权重，在CPU共享场景使用    
-e, --env=[]               指定环境变量，容器中可以使用该环境变量    
-m, --memory=""            指定容器的内存上限    
-P, --publish-all=false    指定容器暴露的端口    
-p, --publish=[]           指定容器暴露的端口   
-h, --hostname=""          指定容器的主机名    
-v, --volume=[]            给容器挂载存储卷，挂载到容器的某个目录    
--volumes-from=[]          给容器挂载其他容器上的卷，挂载到容器的某个目录  
--cap-add=[]               添加权限，权限清单详见：http://linux.die.net/man/7/capabilities    
--cap-drop=[]              删除权限，权限清单详见：http://linux.die.net/man/7/capabilities    
--cidfile=""               运行容器后，在指定文件中写入容器PID值，一种典型的监控系统用法    
--cpuset=""                设置容器可以使用哪些CPU，此参数可以用来容器独占CPU    
--device=[]                添加主机设备给容器，相当于设备直通    
--dns=[]                   指定容器的dns服务器    
--dns-search=[]            指定容器的dns搜索域名，写入到容器的/etc/resolv.conf文件    
--entrypoint=""            覆盖image的入口点    
--env-file=[]              指定环境变量文件，文件格式为每行一个环境变量    
--expose=[]                指定容器暴露的端口，即修改镜像的暴露端口    
--link=[]                  指定容器间的关联，使用其他容器的IP、env等信息    
--lxc-conf=[]              指定容器的配置文件，只有在指定--exec-driver=lxc时使用    
--name=""                  指定容器名字，后续可以通过名字进行容器管理，links特性需要使用名字    
--net="bridge"             容器网络设置:  
                           bridge 使用docker daemon指定的网桥       
                           host    //容器使用主机的网络    
                           container:NAME_or_ID  >//使用其他容器的网路，共享IP和PORT等网络资源    
                           none 容器使用自己的网络（类似--net=bridge），但是不进行配置   
--privileged=false         指定容器是否为特权容器，特权容器拥有所有的capabilities    
--restart="no"             指定容器停止后的重启策略:  
                           no：容器退出时不重启    
                           on-failure：容器故障退出（返回值非零）时重启   
                           always：容器退出时总是重启    
--rm=false                 指定容器停止后自动删除容器(不支持以docker run -d启动的容器)    
--sig-proxy=true           设置由代理接受并处理信号，但是SIGCHLD、SIGSTOP和SIGKILL不能被代理    
```
- add network route
route -p add 172.17.0.0 mask 255.255.0.0 192.168.93.129
route -p add 172.18.0.0 mask 255.255.255.0 192.168.93.129
route -p add 172.19.0.0 mask 255.255.255.0 192.168.99.100

## install docker-machine
- virtualbox mirrors
http://f1361db2.m.daocloud.io
https://7bnhbpem.mirror.aliyuncs.com

- create machine
```bash
docker-machine create -d virtualbox --engine-registry-mirror http://f1361db2.m.daocloud.io \
    --virtualbox-memory 2048 \
    --virtualbox-cpu-count 2 \
    --virtualbox-disk-size "100000" rog_machine
```

## install apps
- add bridge network
```bash
docker network create --driver bridge --subnet 172.19.0.1/24 --gateway 172.19.0.1 rog_net
```

- **gitlab**
```shell
#macos
docker run --detach \
    --hostname mygitlab.com \
    --publish 443:443 --publish 80:80 --publish 22:22 \
    --name gitlab \
    --restart always \
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/config:/etc/gitlab \
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/logs:/var/log/gitlab \
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/data:/var/opt/gitlab \
    gitlab/gitlab-ce:latest

sudo docker run -d \
    --hostname localhost \
    --name gitlab \
    --publish 8882:22 --publish 8081:80 --publish 8884:443 \
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/data:/var/opt/gitlab \
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/logs:/var/log/gitlab\
    --volume /Users/dy/DevSoftWare/developer/docker-volumes/gitlab/config:/etc/gitlab \
    gitlab/gitlab-ce
```

- **teamcity server**
```bash
#macos
mkdir -p /home/docker-data/teamcity
docker run --name teamcity  \
    -v /home/docker-data/teamcity:/data/teamcity_server/datadir \
    -v /home/docker-data/teamcity/logs:/opt/teamcity/logs  \
    -p 9002:8111 -itd -u 0\
    jetbrains/teamcity-server
```

- **mysql**
```bash
# win
mkdir -p /home/docker/mysql/data /home/docker/mysql/logs /home/docker/mysql/conf

docker run -p 3307:3306 --name mysql --net=rog_net -e MYSQL_ROOT_PASSWORD=Olsond@2022 -v /etc/localtime:/etc/localtime:ro -v /home/docker/mysql/mysq_data:/var/lib/mysql -v /home/docker/mysql/conf/my.cnf:/etc/mysql/conf.d/my.cnf -v /home/docker/mysql/logs:/logs -d mysql:latest --lower_case_table_names=1

#macos
mkdir -p /Users/dy/DevSoftWare/developer/docker-data/mysql/mysql_data /Users/dy/DevSoftWare/developer/docker-data/mysql/logs /Users/dy/DevSoftWare/developer/docker-data/mysql/conf && touch /Users/dy/DevSoftWare/developer/docker-data/mysql/conf/my.cnf

$ docker run -p 3307:3306 --name mysql --restart always \
    -e MYSQL_ROOT_PASSWORD=Olsond@0920 \
    -e TZ=Asia/Shanghai \
    -v /etc/localtime:/etc/localtime:ro \
    -v /Users/dy/DevSoftWare/developer/docker-data/mysql/data:/var/lib/mysql \
    -v /Users/dy/DevSoftWare/developer/docker-data/mysql/conf/my.cnf:/etc/mysql/conf.d/my.cnf \
    -v /Users/dy/DevSoftWare/developer/docker-data/mysql/logs:/mysql/logs \
    -itd mysql:latest \
    --lower_case_table_names=1 \
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci \
    --default-time_zone='+8:00'
```

- **redis**
```bash
mkdir -p  /Users/dy/DevSoftWare/developer/docker-data/redis/conf /Users/dy/DevSoftWare/developer/docker-data/redis/data && cd /Users/dy/DevSoftWare/developer/docker-data/redis/conf
#download redis.conf default
wget http://download.redis.io/redis-stable/redis.conf

$ docker run --name redis -p 6279:6379 \
    -v /Users/dy/DevSoftWare/developer/docker-data/redis/data:/data \
    -v /Users/dy/DevSoftWare/developer/docker-data/redis/conf:/etc/redis/conf\
    -d redis:latest redis-server /etc/redis/conf/redis.conf
```


- memos
```bash
mkdir -p /home/olsond/data/podman_data/memos/.memos

podman run --privileged -d --name memos -p 5230:5230 -v /home/olsond/data/podman_data/memos/.memos:/var/opt/memos docker.io/neosmemo/memos:latest
```

- flute-cjms
```bash
docker run -p 8097:8097 --name cjms --link mysql:poc_mysql --link redis:poc_redis --link es:poc_es -d cjms:latest
```

- elasticsearch
```bash
#win
$ docker pull elasticsearch:7.17.7

$ mkdir -p /docker-data/elasticsearch/config/ /docker-data/elasticsearch/data/

$ echo "http.host: 0.0.0.0">>/docker-data/elasticsearch/config/elasticsearch.yml

$ sudo docker run --name es -p 9200:9200 -p 9300:9300 \
--net poc_net \
-e ES_JAVA_OPS="-Xms256m -Xmx256m" \
-e "discovery.type=single-node" \
-v /docker-data/elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
-v /docker-data/elasticsearch/data:/var/lib/elasticsearch/data \
-v /docker-data/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
-d elasticsearch:7.17.7
```

- kibana
```bash
#macos
mkdir -p /Users/dy/DevSoftWare/developer/docker-data/kibana
docker run -d --name kibana -p 5601:5601 kibana:7.14.1

docker cp kibana:/usr/share/kibana/config /Users/dy/DevSoftWare/developer/docker-data/kibana

vi /Users/dy/DevSoftWare/developer/docker-data/kibana/config/kibana.yml

docker stop kibana
docker rm kibana

docker run -d --name kibana -p 5601:5601 -v /Users/dy/DevSoftWare/developer/docker-data/kibana/config:/usr/share/kibana/config kibana:7.14.1
```

- portainer
```shell
#podman not rootless
$ systemctl --user enable --now podman.socket
# podman system service -t 0 &

# portainer
$ podman run -d --privileged -p 9001:9000 -p 8000:8000 --name portainer --restart=always -v /run/user/$(id -u)/podman/podman.sock:/var/run/docker.sock -v  /home/olsond/data/podman_data/portainer_data:/data portainer/portainer-ee:2.18.3

# agent
$ podman run -d --privileged \
  -p 9002:9001 \
  -e AGENT_SECRET=87654321 \
  --name portainer_agent \
  --restart=always \
  -v /run/user/$(id -u)/podman/podman.sock:/var/run/docker.sock:Z \
  -v /var/lib/containers/storage/volumes:/var/lib/docker/volumes \
  portainer/agent:2.18.3



# docker
$ docker run -d -p 9001:9000 -p 8000:8000 --name portainer --restart=always -e AGENT_SECRET=87654321 -v /var/run/docker.sock:/var/run/docker.sock -v  /Users/dy/DevSoftWare/developer/docker-data/portainer_data:/data portainer/portainer-ee:2.18.3


# agent && edge agent
$ docker run -d \
  -p 9001:9001 \
  -e AGENT_SECRET=87654321 \
  --name portainer_agent \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  portainer/agent:2.18.3

$ docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  -v /:/host \
  -v /Users/dy/DevSoftWare/developer/docker-data/portainer_agent_data:/data \
  --restart always \
  -e EDGE=1 \
  -e EDGE_ID=861717fb-3d9c-4875-a3f7-00ca27cdac22 \
  -e EDGE_KEY=aHR0cDovLzEyMy42MC45MS42MDo5MDAxfDEyMy42MC45MS42MDo4MDAwfDA1OjVmOjkyOjliOmFjOjMyOjllOjc4OmY4OjM0OjQxOjlhOmZjOjNhOjQ0OjBlfDE1 \
  -e EDGE_INSECURE_POLL=1 \
  --name portainer_edge_agent \
  portainer/agent:2.18.3

# reset-password
docker run --rm -v /home/docker-data/portainer:/data portainer/helper-reset-password
```
- pgsql
```shell
docker run --name postgres -e POSTGRES_PASSWORD=olsond@dy -p 5433:5432 -v /Users/dy/DevSoftWare/developer/docker-data/postgres/data:/var/lib/postgresql/data -d postgres
```
- onlyoffice
```shell
docker run  -d --name onlyoffice -p 9011:80 \
    -v /home/docker-data/onlyoffice/logs:/var/log/onlyoffice  \
    -v /home/docker-data/onlyoffice/data:/var/www/onlyoffice/Data  onlyoffice/documentserver
# 拷贝出配置文件修改 example 地址
docker cp /Users/dy/Desktop/default.json containerId:/etc/onlyoffice/documentserver-example/default.json
```

- ribbitmq
```shell
 podman run -d --name rabbitmq -p 5673:5672 -p 15673:15672 \
-v /home/olsond/data/podman_data/rabbit:/var/lib/rabbitmq \
-e RABBITMQ_DEFAULT_VHOST=/chat \
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=123456 \
rabbitmq:3.8.34-management
```



- docker 容器访问mac/windows主机网络可以使用 `host.docker.internal`域名解决问题