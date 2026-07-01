---
title: 基于Zookeeper分布式应用集中配置管理
categories: Devops
comments: true
keywords: zookeeper
tags: [linux,zookeeper]
description: 配置集中管理搭建-分布式应用配置工具包config-toolkit 用于集群配置向 zookeeper的迁移
date: '2017-07-27T13:00:31.050Z'
updated: '2023-09-25T06:00:01.081Z'
---

# 配置集中管理搭建
分布式应用配置工具包config-toolkit 用于集群配置向 zookeeper的迁移

[TOC]

## Introduction
>* Zookeeper
>* Config Toolkit

## Zookeeper
zookeeper是为分布式应用设计的一个高性能协调服务，提供了如下的通用服务，如命名、配置管理、通过锁和分组服务，封装成简单易用的接口而无需开发人员从头编写代码。可以拿来即用，应用的领域有取得共识、分组管理、领导者选举和协议呈现。还可以按需自定义功能 [官网介绍](http://zookeeper.apache.org)

### Quick Start
       $ cd /usr
       $ rz -by
       $ tar -xvf zookeeper-3.4.10.tar.gz

### 单机模式
>* 把解压目录下conf/zoo_sample.cfg复制一份在同目录下，重命名为zoo.cfg,dataDir属性可设置成别的
>* 执行解压目录下的bin/zkServer.sh start开启zookeeper
>* 执行解压目录下的bin/zkCli.sh -server 127.0.0.1:2181连接zookeeper


### ZooKeeper伪分布式集群安装
伪分布式集群：在一台Server中，启动多个ZooKeeper的实例。上传并解压安装包

* 创建实例配置文件

        $ cd zookeeper-3.4.10/conf
        $ cp zoo_sample.cfg zoo1.cfg
        $ cp zoo_sample.cfg zoo2.cfg
        $ cp zoo_sample.cfg zoo3.cfg

* 修改配置文件

        ---------实例1的配置 $ vi zoo1.cfg--------
        
        tickTime=2000
        initLimit=10
        syncLimit=5
        dataDir=/tmp/zookeeper/datas/data_1
        clientPort=2181
        dataLogDir=/usr/zookeeper-3.4.10/logs/logs_1
        server.1=localhost:2887:3887
        server.2=localhost:2887:3888
        server.3=localhost:2887:3889

        ---------实例2的配置 $ vi zoo1.cfg--------
        
        tickTime=2000
        initLimit=10
        syncLimit=5
        dataDir=/tmp/zookeeper/datas/data_2
        clientPort=2182
        dataLogDir=/usr/zookeeper-3.4.10/logs/logs_2
        server.1=localhost:2887:3887
        server.2=localhost:2887:3888
        server.3=localhost:2887:3889

        ---------实例3的配置 $ vi zoo1.cfg--------
        
        tickTime=2000
        initLimit=10
        syncLimit=5
        dataDir=/tmp/zookeeper/datas/data_3
        clientPort=2183
        dataLogDir=/usr/zookeeper-3.4.10/logs/logs_3
        server.1=localhost:2887:3887
        server.2=localhost:2887:3888
        server.3=localhost:2887:3889


* 准备启动环境

        $ mkdir /tmp/zookeeper/datas/data_1
        $ mkdir /tmp/zookeeper/datas/data_2
        $ mkdir /tmp/zookeeper/datas/data_3
        
        $ mkdir /usr/zookeeper-3.4.10/logs/logs_1
        $ mkdir /usr/zookeeper-3.4.10/logs/logs_2
        $ mkdir /usr/zookeeper-3.4.10/logs/logs_3
        
        $ echo "1" > /tmp/zookeeper/data_1/myid
        $ echo "2" > /tmp/zookeeper/data_2/myid
        $ echo "3" > /tmp/zookeeper/data_3/myid

* 启动集群

        $ /usr/zookeeper-3.4.10/bin/zkServer.sh start zoo1.cfg
        $ /usr/zookeeper-3.4.10/bin/zkServer.sh start zoo2.cfg
        $ /usr/zookeeper-3.4.10/bin/zkServer.sh start zoo3.cfg
    
* 查看是否启动成功

        $ jps

* 看到类似下面的进程就表示3个实例均启动成功
    ```
    13419 QuorumPeerMain
    13460 QuorumPeerMain
    13561 Jps
    13392 QuorumPeerMain
    ```
    
* Java客户端测试
```java
    import org.apache.zookeeper.CreateMode;
    import org.apache.zookeeper.WatchedEvent;
    import org.apache.zookeeper.Watcher;
    import org.apache.zookeeper.ZooKeeper;
    import org.apache.zookeeper.ZooDefs.Ids;
    
    public class ZooKeeperClient {
        public static void main(String[] args) throws Exception {
            Watcher watcher = new Watcher() {
    
                @Override
                public void process(WatchedEvent event) {
                    System.out.println(event.toString());
                }
            };
            
            ZooKeeper zk = new ZooKeeper("xx.xx.xx.xx:2181", 3000, watcher);
            System.out.println("====创建节点");
            zk.create("/demoProject", "/demoModule".getBytes(), Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
            System.out.println("====查看节点是否安装成功");
            System.out.println(new String(zk.getData("/demoProject", false, null)));
            System.out.println("====修改节点的数据");
            zk.setData("/demoProject", "test".getBytes(), -1);
            System.out.println("====查看修改的节点是否成功");
            System.out.println(new String(zk.getData("/demoProject", false, null)));
            System.out.println("====删除节点");
            zk.delete("/demoProject", -1);
            System.out.println("====查看节点是否被删除");
            System.out.println("节点状态：" + zk.exists("/demoProject", false));
            zk.close();
        }
    }
        运行结果：
    ====创建节点
    WatchedEvent state:SyncConnected type:None path:null
    ====查看节点是否安装成功
    demoModule
    ====修改节点的数据
    ====查看修改的节点是否成功
    test
    ====删除节点
    ====查看节点是否被删除
    节点状态：null
```

## Config Toolkit
Config Toolkit 是大型集群和分布式应用配置工具包。Config Toolkit 用于简化从本地配置文件到 Zookeeper 的迁移。在大型集群和分布式应用中，配置不宜分散到集群结点中，应该集中管理。

### Module
>* Config Toolkit ： 封装应用属性配置的获取及更新
>* ConfigWeb： 提供web界面维护属性配置，提供配置导入导出功能

### Features
>* 集中管理集群配置
>* 实现配置热更新
>* 多配置源支持，内置支持zookeeper、本地文件、http协议
>* Spring集成
>* 本地配置覆盖
>* 配置管理web界面
>* 版本控制，支持灰度发布
>* 支持为配置项添加注释

### Quick Start
*  下载安装config-toolkit工具包
```java
    git clone https://github.com/dangdangdotcom/config-toolkit.git
    cd config-toolkit/config-zk-web
    mvn package
```
*  将编译好的`config-web.war`部署到tomcat即可

*  创建初始权限配置    
    * 使用命令行创建Zookeeper配置根节点，根节点密码使用sha1加密，如果要使用明文密码，可以自行修改`config-zk-web`的鉴权部分代码 以根路径为`/demoProject/demoModule`密码为 `1` 为例
    ```python
        # 使用python加密
        python -c "import hashlib;print hashlib.sha1('1').hexdigest();"  
        # 356a192b7913b04c54574d18c28d46e6395428ab
        zkCli.sh -server localhost:2181
        create /demoProject 1  
        create /demoProject/demoModule 356a192b7913b04c54574d18c28d46e6395428ab
    ```            
* 登录config-web，创建示例配置

    >* 访问 http://localhost:8080/config-web
    >* 点击"切换根节点"，输入/projectx/modulex，密码abc
    >* 点击"新建版本"，输入1.0.0
    >* 左侧的组管理，输入demoPropertyGroup，点击"创建"
    >* 在右侧添加两个配置，分别为test=cool
    >* 项目中加载配置
    >* 添加maven依赖
    ```xml
    <dependency>
      <groupId>com.dangdang</groupId>
      <artifactId>config-toolkit</artifactId>
      <version>3.2.3-RELEASE</version>
    </dependency>
    ```

### Make Use Spring SPEL                                                                                                                                                                                                                                                                                                                                      
*  `applicationContext.xml`的schema配置
```xml
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xmlns:config="https://crnlmchina.github.io/config"
       xsi:schemaLocation="
	    http://www.springframework.org/schema/beans
    	    http://www.springframework.org/schema/beans/spring-beans-4.0.xsd
            http://www.springframework.org/schema/util
            http://www.springframework.org/schema/util/spring-util-4.0.xsd
            https://crnlmchina.github.io/config
            https://crnlmchina.github.io/config/config.xsd">
```

*  `applicationContext.xml` 结合`spring` SPEL方式注入配置
```xml
     <!--SpringUtil Web Configuration -->
    <util:properties id="configToolkitConfigs" location="classpath*:config.properties"/>
    <!--SPEL zookeeper  集成-->
    <config:profile connect-str="#{configToolkitConfigs['zk.address']}" root-node="/demoProject/demoModule"
                    version="#{configToolkitConfigs['zk.configs.version']}"/>
    <config:group id="demoPropertyGroup" node="demoProperty-group"/>
    
   <!-- Your business bean Inject property with used spring style -->
   <!--<bean class="">-->
   <!--<property name="name" value="#{demoPropertyGroup['key']}" />-->
   <!--</bean>-->
```

### JavaCode
* 使用Java代码直接获取配置
```java
    ZookeeperConfigProfile configProfile = new ZookeeperConfigProfile("xx.xx.xx.xx:2181", "/demoProject/demoModule", "1.0.0");
    GeneralConfigGroup group = new ZookeeperConfigGroup(configProfile, "demoPropertyGroup");
    
    String stringProperty = group.get("test");
    Preconditions.checkState("cool".equals(stringProperty));             
```

* 使用spring注入获取配置
```java
    @Resource
    private ZookeeperConfigGroup configGroup;
    System.out.println(configGroup.get("test"));
```



