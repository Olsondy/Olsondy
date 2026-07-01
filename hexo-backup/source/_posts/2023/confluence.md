---
title: 使用 docker + confluence 搭建企业内部wiki
categories: Devops
comments: true
keywords: docker,wiki,confluence
tags: [linux,docker,wiki,confluence]
description: confluence平台的搭建与使用
date: '2023-09-24T16:00:31.050Z'
updated: '2023-10-19T14:32:34.081Z'
---
# 介绍

企业内部可以在Confluence上面进行创建，分享和讨论文件，想法，备忘录，规格，实体模型，图表和项目， 通过Confluence平台进行小组工作的协同和知识分享

# 相关环境工具

- Centos7
- Docker
- Mysql 5.7
- Confluence 7.9.3

# 安装

- 编写 Dockerfile, 将破解包加入 confluence
```shell
# 最新的 confluence 镜像 
FROM cptactionhank/atlassian-confluence:latest USER root 
#将代理破解包加入容器 
COPY "atlassian-agent.jar" 
/opt/atlassian/confluence/ 
# 设置启动加载代理包 
RUN echo 'export CATALINA_OPTS="-javaagent:/opt/atlassian/confluence/atlassian-agent.jar ${CATALINA_OPTS}"' >> /opt/atlassian/confluence/bin/setenv.sh
```

- 离线破解包 `atlassian-agent-v1.2.3.zip`
- 构建 confluence 破解镜像
```bash
$ docker build -t confluence:latest
```

- 启动 confluence
```bash
$ docker run -d --name confluence \ --restart always \ -p 23915:8090 \ -e TZ="Asia/Shanghai" \ -v /home/docker-data/confluence:/var/atlassian/confluence \ confluence:latest
```
- 安装mysql
```bash
# 设置数据库的数据存储位置 
$ mkdir -p /home/docker-data/mysql-5.7/mysql_data /home/docker-data/mysql-5.7/logs /home/docker-data/mysql-5.7/conf 
# 安装指定版本的 mysql 数据库 
$ docker run -p 3308:3306 --name mysql \ 
-e MYSQL_ROOT_PASSWORD=flute@ROOT123 \ 
-e MYSQL_ROOT_HOSTS=% \ 
-v /etc/localtime:/etc/localtime:ro \ 
-v /home/docker-data/mysql-5.7/mysql_data:/var/lib/mysql \ 
-v /home/docker-data/mysql-5.7/conf:/etc/mysql/conf.d \ 
-v /home/docker-data/mysql-5.7/logs:/mysql/logs \ 
-itd mysql:5.7 --lower_case_table_names=1
```

# 初始化

- 访问安装好的confluence域名,  按照步骤设置
- 设置激活码, 找到破解工具`atlassian-agent.jar`的位置执行以下命令
```bash
# 查看一下生成激活码的配置类型
$ java -jar atlassian-agent.jar
====================================================
=======        Atlassian Crack Agent         =======
=======           https://zhile.io           =======
=======          QQ Group: 30347511          =======
====================================================
 
KeyGen usage: java -jar
       /Users/dy/DevSoftWare/developer/docker-tar/atlassian-confluence/doc
       kerUp/atlassian-agent.jar [-d] [-h] -m <arg> [-n <arg>] -o <arg> -p
       <arg> -s <arg>
 -d,--datacenter           Data center license[default: false]
 -h,--help                 Print help message
 -m,--mail <arg>           License email
 -n,--name <arg>           License name[default: <license email>]
 -o,--organisation <arg>   License organisation
 -p,--product <arg>        License product, support:
                           [crowd: Crowd]
                           [questions: Questions plugin for Confluence]
                           [crucible: Crucible]
                           [capture: Capture plugin for JIRA]
                           [conf: Confluence]
                           [training: Training plugin for JIRA]
                           [*: Third party plugin key, looks like:
                           com.foo.bar]
                           [bitbucket: Bitbucket]
                           [tc: Team Calendars plugin for Confluence]
                           [bamboo: Bamboo]
                           [fisheye: FishEye]
                           [portfolio: Portfolio plugin for JIRA]
                           [jc: JIRA Core]
                           [jsd: JIRA Service Desk]
                           [jira: JIRA Software(common jira)]
 -s,--serverid <arg>       License server ID
# 生成指定类型的激活码
$ java -jar atlassian-agent.jar   -d -m fluteorg@springflute.com -n FLUTE   -p conf -o http://192.168.x.xx   -s BM8O-M82U-0AI1-JT0W (页面显示的服务器id)
```
- 将上述命令生成的相应类型的激活码拷贝到输入框中
  ![](confluence01.png)

- 配置数据库
```sql
drop database if exists confluence;
#confluence
# 进入数据库执行以下命令：
# 1：创建数据库，注意：confluence7.x版本数据库编码需要指定 utf8mb4
CREATE DATABASE IF NOT EXISTS confluence default CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
# 2：创建confluence专属账号密码
create user 'flute_confluence'@'%' identified by 'flute_confluence_password';
# 3：confluence用授权
grant all privileges on confluence.* to 'flute_confluence'@'%' with grant option;
# 4：设置开头的事务级别
show variables like 'transaction%';
set global tx_isolation = 'READ-COMMITTED';
flush privileges;
```
![](confluence02.png)

# 可能会发生的问题

- 乱码问题, 在数据库链接上不要忘记设置编码格式
- docker 网络问题, 无法链接数据库. 检查一下在容器中访问一下是否可以访问宿主机.
