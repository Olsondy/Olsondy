---
title: ElasticSearch和Kibana安装及简单使用
categories: Devops
comments: true
keywords: elastic,kibana
tags: [database,elastic,kibana]
description: 在MacOS上使用homebrew安装ElasticSearch和Kibana及简单使用
date: '2021-12-17T11:00:01.050Z'
updated: '2023-09-25T06:00:01.081Z'
---


# Start
> 版本: ES 7.16.1, kibana 7.x
- 本地安装都是单机模式, 只是为了更好的去了解es和kibana, 集群搭建可移至官方教程
- Elasticsearch的介绍本篇文章就不再赘述了, 安装前可以先提前了解下ES相关的一些概念
## Environment
>- MacOS Catalina 10.15.4
>- homebrew (v3.3.8)

## Install
- 安装Elasticsearch [官方传送门](https://www.elastic.co/guide/en/elasticsearch/reference/current/brew.html)
- 安装Kibana的步骤和Elasticsearch几乎一模一样，在terminal一个新窗口里执行以下brew命令即可。
  ```shell
  brew install elastic/tap/kibana-full
  ```
- 接下来就是等待, 直到出现 (es安装也是一样)
```shell
 To have launchd start elastic/tap/kibana-full now and restart at login:
     brew services start elastic/tap/kibana-full
   Or, if you don't want/need a background service you can just run:
     kibana
```
## Q.A
>- _tap方式安装会出现连接443 timeout的问题, 由于elastic/tap包在github上, 我这边没有做什么代理和科学上网方式, 多试了几次就成功了._

# Config & Operation
> 上述步骤结束后,可以按需设置一些参数以及简单的命令检查

## ElasticSearch
- 先不着急启动,找到elasticsearch安装目录修改相关配置参数
  - 找到`/usr/local/etc/elasticsearch`
  - 打开`elasticsearch.yml`,根据实际情况修改(包括启动端口号,集群和节点名称都可以修改).
  - 打开`jvm.options`调整vm大小`-Xms2g -Xmx2g`
  - 启动
  ```shell
    #terminal
    DyMacBookPro:~ Dy$ elasticsearch
  ```
- 检查是否启动成功, 浏览器访问http://localhost:9200/ 或者控制台 `curl http://localhost:9200` 出现如下内容说明已经启动成功了
  ```json
    {
      "name" : "node-1",
      "cluster_name" : "elasticsearch_Dy",
      "cluster_uuid" : "jvW71Yb2SQukQITafqlukg",
      "version" : {
        "number" : "7.16.1",
        "build_flavor" : "default",
        "build_type" : "tar",
        "build_hash" : "5b38441b16b1ebb16a27c107a4c3865776e20c53",
        "build_date" : "2021-12-11T00:29:38.865893768Z",
        "build_snapshot" : false,
        "lucene_version" : "8.10.1",
        "minimum_wire_compatibility_version" : "6.8.0",
        "minimum_index_compatibility_version" : "6.0.0-beta1"
      },
     "tagline" : "You Know, for Search"
   }
  ```

### REST API
>- POST/PUT/GET基础操作, POST和PUT在操作上没有区别
>- **noted: REST API请参阅对应版本的官方文档, 会少走点弯路, 千万不要自己盲目去百度搜索, 网上博客资料很多es的版本都是不一致的.**  [官方传送门](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html)

#### 新增索引
```shell
DyMacBookPro:~ Dy$ curl -XPUT "http://localhost:9200/twitter"
{"acknowledged":true,"shards_acknowledged":true,"index":"twitter"}DyMacBookPro:~ Dy$
```
#### 初始化mapping信息
```shell
DyMacBookPro:~ Dy$ curl -XPUT "http://localhost:9200/twitter" -H 'Content-Type: application/json' -d'
> {
>   "mappings": {
>      "properties": {
>         "name": { "type": "text" },
>         "datetime": { "type": "date" },
>         "email": { "type": "keyword" }
>       }
>   }
> }'
#返回结果
{"acknowledged":true,"shards_acknowledged":true,"index":"job"}DyMacBookPro:~ Dy$
```
> **noted: 在设置mapping的时候被坑了, 前面说到REST API不同版本的问题, 我开始参阅的是ES中文官方文档, 结果一直设置不成功, 后面在相关版本英文官方文档上找到了这个说明 [Elasticsearch Mapping limit settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/removal-of-types.html)**

#### 新增单个mapping信息, 千万不要使用上面那个初始化的API，因为有可能出现exists error
```shell
DyMacBookPro:~ Dy$ curl -XPUT "localhost:9200/twitter/_mappings?include_type_name=false&pretty" -H 'Content-Type: application/json' -d'
{
  "properties": { 
    "desc": {
      "type": "text"
    }                                  
  }                                   
}      
'
#返回结果
{
  "acknowledged" : true
}
```
#### 设置mapping的分词属性
```shell
DyMacBookPro:~ Dy$ curl -XPUT "localhost:9200/twitter/_mappings?include_type_name=false&pretty" -H 'Content-Type: application/json' -d'
> {
>   "properties": { 
>     "message": {
>       "type": "text",
>       "analyzer": "ik_smart"
>     }
>   }
> }
> '
{
  "error" : {
    "root_cause" : [
      {
        "type" : "mapper_parsing_exception",
        "reason" : "Failed to parse mapping [_doc]: analyzer [ik_max_word] has not been configured in mappings"
      }
    ],
    "type" : "mapper_parsing_exception",
    "reason" : "Failed to parse mapping [_doc]: analyzer [ik_max_word] has not been configured in mappings",
    "caused_by" : {
      "type" : "illegal_argument_exception",
      "reason" : "analyzer [ik_max_word] has not been configured in mappings"
    }
  },
  "status" : 400
}
```
> 提示参数错误,那就说明需要安装分词plugin
#### 查看已安装的plugin(空就是没有)
```shell
DyMacBookPro:~ Dy$ curl -XGET localhost:9200/_cat/plugins
DyMacBookPro:~ Dy$ 
```
#### 安装plugin
> 这里我们安装一个中文`ik`分词插件 (需安装对应版本)  [传送门](https://github.com/medcl/elasticsearch-analysis-ik/releases)

- 直接线上安装, 结果凉凉~
   ```shell
   DyMacBookPro:~ Dy$ elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   warning: usage of JAVA_HOME is deprecated, use ES_JAVA_HOME
   Future versions of Elasticsearch will require Java 11; your Java version from [/Library/Java/JavaVirtualMachines/jdk1.8.0_202.jdk/Contents/Home/jre] does not meet this requirement. Consider switching to a distribution of Elasticsearch with a bundled JDK. If you are already using a distribution with a bundled JDK, ensure the JAVA_HOME environment variable is not set.
   -> Installing https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   -> Downloading https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   -> Failed installing https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   -> Rolling back https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   -> Rolled back https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.1/elasticsearch-analysis-ik-7.16.1.zip
   Exception in thread "main" java.net.SocketException: Operation timed out (Read failed)
      at java.net.SocketInputStream.socketRead0(Native Method)
      at java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
      at java.net.SocketInputStream.read(SocketInputStream.java:171)
      at java.net.SocketInputStream.read(SocketInputStream.java:141)
      at sun.security.ssl.InputRecord.readFully(InputRecord.java:465)
      at sun.security.ssl.InputRecord.read(InputRecord.java:503)
      at sun.security.ssl.SSLSocketImpl.readRecord(SSLSocketImpl.java:975)
      at sun.security.ssl.SSLSocketImpl.performInitialHandshake(SSLSocketImpl.java:1367)
      at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1395)
      at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:1379)
      at sun.net.www.protocol.https.HttpsClient.afterConnect(HttpsClient.java:559)
   ...
  ```
- 只能用官方提到的另一种方式离线安装了
  ```shell
  DyMacBookPro:~ Dy$ cd /usr/local/var/elasticsearch/plugins/
  DyMacBookPro:plugins Dy$ 
  DyMacBookPro:plugins Dy$ ll
  total 0
  drwxr-xr-x  2 Dy  admin  64 Dec 15 16:38 ./
  drwxr-xr-x  3 Dy  admin  96 Dec 15 16:38 ../
  DyMacBookPro:plugins Dy$ 
  DyMacBookPro:plugins Dy$ mkdir ik
  DyMacBookPro:plugins Dy$ 
  DyMacBookPro:plugins Dy$ mv ~/Desktop/elasticsearch-analysis-ik-7.16.1.zip /usr/local/var/elasticsearch/plugins/ik/
  DyMacBookPro:plugins Dy$ 
  DyMacBookPro:plugins Dy$ cd ik
  DyMacBookPro:ik Dy$ ll
  total 8800
  drwxr-xr-x  3 Dy  admin       96 Dec 17 16:02 ./
  drwxr-xr-x  3 Dy  admin       96 Dec 17 16:01 ../
  -rw-r--r--@ 1 Dy  staff  4504480 Dec 17 15:59 elasticsearch-analysis-ik-7.16.1.zip
  DyMacBookPro:ik Dy$ unzip elasticsearch-analysis-ik-7.16.1.zip 
  Archive:  elasticsearch-analysis-ik-7.16.1.zip
    inflating: elasticsearch-analysis-ik-7.16.1.jar  
    inflating: httpclient-4.5.2.jar    
    inflating: httpcore-4.4.4.jar      
    inflating: commons-logging-1.2.jar  
    inflating: commons-codec-1.9.jar   
    inflating: plugin-descriptor.properties  
    inflating: plugin-security.policy  
      creating: config/
    inflating: config/quantifier.dic   
    inflating: config/preposition.dic  
    inflating: config/main.dic         
    inflating: config/extra_single_word.dic  
    inflating: config/surname.dic      
    inflating: config/IKAnalyzer.cfg.xml  
    inflating: config/extra_single_word_low_freq.dic  
    inflating: config/extra_main.dic   
    inflating: config/extra_stopword.dic  
    inflating: config/extra_single_word_full.dic  
    inflating: config/stopword.dic     
    inflating: config/suffix.dic       
  DyMacBookPro:ik Dy$ 
  DyMacBookPro:ik Dy$ ll
  total 11656
  drwxr-xr-x  11 Dy  admin      352 Dec 17 16:04 ./
  drwxr-xr-x   3 Dy  admin       96 Dec 17 16:01 ../
  -rw-r--r--@  1 Dy  admin   263965 Apr 25  2021 commons-codec-1.9.jar
  -rw-r--r--@  1 Dy  admin    61829 Apr 25  2021 commons-logging-1.2.jar
  drwxr-xr-x@ 14 Dy  admin      448 Dec 11 23:21 config/
  -rw-r--r--@  1 Dy  admin    54595 Dec 13 21:22 elasticsearch-analysis-ik-7.16.1.jar
  -rw-r--r--@  1 Dy  staff  4504480 Dec 17 15:59 elasticsearch-analysis-ik-7.16.1.zip
  -rw-r--r--@  1 Dy  admin   736658 Apr 25  2021 httpclient-4.5.2.jar
  -rw-r--r--@  1 Dy  admin   326724 Apr 25  2021 httpcore-4.4.4.jar
  -rw-r--r--@  1 Dy  admin     1807 Dec 13 21:22 plugin-descriptor.properties
  -rw-r--r--@  1 Dy  admin      125 Dec 13 21:22 plugin-security.policy
  ```
- 重启 `elasticsearch`我们再操作试下
```shell
DyMacBookPro:~ Dy$ curl -XPUT "localhost:9200/twitter/_mappings?include_type_name=false&pretty" -H 'Content-Type: application/json' -d'
> {
>   "properties": { 
>     "message": {
>       "type": "text",
>       "analyzer": "ik_smart"
>     }
>   }
> }
> '
#返回结果没有报错
{
  "acknowledged" : true
}

#确认下,看到已经添加成功了
DyMacBookPro:~ Dy$ curl -X GET "localhost:9200/twitter?pretty"
{
  "twitter" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "datetime" : {
          "type" : "date"
        },
        "desc" : {
          "type" : "text"
        },
        "email" : {
          "type" : "keyword"
        },
        "message" : {
          "type" : "text",
          "analyzer" : "ik_smart"
        },
        "name" : {
          "type" : "text"
        }
      }
    },
    "settings" : {
      "index" : {
        "routing" : {
          "allocation" : {
            "include" : {
              "_tier_preference" : "data_content"
            }
          }
        },
        "number_of_shards" : "1",
        "provided_name" : "twitter",
        "creation_date" : "1639651383574",
        "number_of_replicas" : "0",
        "uuid" : "6qUBOpt0TXy8YupU5_TdbA",
        "version" : {
          "created" : "7160199"
        }
      }
    }
  }
}
```
> **noted: 目前mapping不支持删除,更新**
#### 新增文档
```shell
# 根据最后/_doc/{_id}参数进行匹配, 如果库里有匹配的id值则更新, 没有则新增
DyMacBookPro:~ Dy$ curl -XPUT "http://localhost:9200/twitter/_doc/olsond" -H 'Content-Type: application/json' -d'
>     {
>      "name": "olsond",
>      "datetime": "2021-12-16",
>      "email": "olsond@foxmail.com"
>      }'
#返回结果
{"_index":"twitter","_type":"_doc","_id":"olsond","_version":1,"result":"created","_shards":{"total":1,"successful":1,"failed":0},"_seq_no":3,"_primary_term":1}DyMacBookPro:~ Dy$
```
> **noted: 新版本下`/_doc`参数是固定的**
#### 查找单个索引
```shell
DyMacBookPro:~ Dy$ curl -X GET "localhost:9200/twitter?pretty"
{
  "twitter" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "datetime" : {
          "type" : "date"
        },
        "desc" : {
          "type" : "text"
        },
        "email" : {
          "type" : "keyword"
        },
        "name" : {
          "type" : "text"
        }
      }
    },
    "settings" : {
      "index" : {
        "routing" : {
          "allocation" : {
            "include" : {
              "_tier_preference" : "data_content"
            }
          }
        },
        "number_of_shards" : "1",
        "provided_name" : "twitter",
        "creation_date" : "1639651383574",
        "number_of_replicas" : "0",
        "uuid" : "6qUBOpt0TXy8YupU5_TdbA",
        "version" : {
          "created" : "7160199"
        }
      }
    }
  }
}
```
#### 列出所有索引信息
```shell
DyMacBookPro:~ Dy$ curl -X GET "http://localhost:9200/_cat/indices?v"
health status index                           uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .geoip_databases                QH2rX52lTNC-RdHxuCWTgA   1   0         42           35     41.2mb         41.2mb
yellow open   twitter                         6qUBOpt0TXy8YupU5_TdbA   1   0          1            0      9.3kb          9.3kb
green  open   .apm-custom-link                S0CeP8VnQF6JwD8jhPnTgg   1   0          0            0       226b           226b
green  open   .kibana_7.16.1_001              eMUehkSHThWFHIuOeYYw9Q   1   0        666          302      2.5mb          2.5mb
green  open   .kibana_task_manager_7.16.1_001 4VF3CL6UT2W_2OZVNEilwQ   1   0         17        11552        9mb            9mb
green  open   .apm-agent-configuration         BBMUtWbGRASk11ilJoLHJA   1   0          0            0       226b           226b
green  open   .async-search                   _Li-ufp_TBeWYFKyPO_x9g   1   0          0            0       252b           252b
green  open   .tasks                          C2aJ2IeNQq2rDGHovFmxpg   1   0         10            0     50.2kb         50.2kb
```
- 上面的返回结果有个索引是告警状态, 因为是单机部署,是没有备份的,没有副本, 所以需要设置下单机副本数量
```shell
curl -X PUT 'http://localhost:9200/_settings' -H 'Content-Type: application/json' -d '
{
  "number_of_replicas": 0
}
' 
#返回结果
{"acknowledged":true}DyMacBookPro:~ Dy$ 
```
## Kibana
> kibana本地启动会自动去连接本地的elasticsearch服务不需要额外配置

- 浏览器输入 `http://localhost:5601`, 可以访问就说明安装成功了
- 设置中文
