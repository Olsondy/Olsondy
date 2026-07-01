---
title: TDSql部署手册
categories: Devops
comments: true
keywords: td-sql
tags: [database,td-sql]
description: TDSql部署手册
date: '2022-12-10T06:38:45.401Z'
updated: '2023-04-25T05:58:25.682Z'
---

机器：

- 主：
  - 10.168.1.11
- 从
  - 10.168.1.12
  - 10.168.1.13
  - 10.168.1.14

网卡：

- ens33

#### 10.168.1.11

1. 配置主机名

   ```sh
   hostname mac1
   ```

2. 添加主机名IP映射

   ```sh
   cat >> /etc/hosts<< EOF
   10.168.1.11 mac1
   10.168.1.12 mac2
   10.168.1.13 mac3
   10.168.1.14 mac4
   EOF
   ```

3. 开启时间同步

   ```sh
   yum -y -C install ntp
   cat >> /etc/ntp.conf<< EOF
   server 127.127.1.0 iburst
   EOF
   systemctl restart ntpd.service
   ```

4. 规划存储目录

   ```sh
   mkdir -p /data
   mkdir -p /data1
   ```

5. 配置免密登录

   ```sh
   ssh-keygen -t rsa
   ```

   ```sh
   ssh-copy-id -i /root/.ssh/id_rsa.pub 10.168.1.11
   ```

   ```sh
   ssh-copy-id -i /root/.ssh/id_rsa.pub 10.168.1.12
   ```

   ```sh
   ssh-copy-id -i /root/.ssh/id_rsa.pub 10.168.1.13
   ```

   ```sh
   ssh-copy-id -i /root/.ssh/id_rsa.pub 10.168.1.14
   ```

6. 修改配置文件

   ```sh
   export LANG='en_US.UTF-8'
   cat > /root/tdsql_10.3.17.3.0/tdsql_install/tdsql_hosts<< EOF
   [tdsql_allmacforcheck]
   tdsql_mac1 ansible_ssh_host=10.168.1.11
   tdsql_mac2 ansible_ssh_host=10.168.1.12
   tdsql_mac3 ansible_ssh_host=10.168.1.13
   tdsql_mac4 ansible_ssh_host=10.168.1.14
    
   [tdsql_zk]
   tdsql_zk1 ansible_ssh_host=10.168.1.11
   tdsql_zk2 ansible_ssh_host=10.168.1.12
   tdsql_zk3 ansible_ssh_host=10.168.1.13
    
   [tdsql_scheduler]
   tdsql_scheduler1 ansible_ssh_host=10.168.1.12
   tdsql_scheduler2 ansible_ssh_host=10.168.1.13
    
   [tdsql_oss]
   tdsql_oss1 ansible_ssh_host=10.168.1.12
   tdsql_oss2 ansible_ssh_host=10.168.1.13
    
   [tdsql_chitu]
   tdsql_chitu1 ansible_ssh_host=10.168.1.12
   tdsql_chitu2 ansible_ssh_host=10.168.1.13
    
   [tdsql_monitor]
   tdsql_monitor1 ansible_ssh_host=10.168.1.12
   tdsql_monitor2 ansible_ssh_host=10.168.1.13
    
   [tdsql_db]
   tdsql_db1 ansible_ssh_host=10.168.1.11
   tdsql_db2 ansible_ssh_host=10.168.1.12
   tdsql_db3 ansible_ssh_host=10.168.1.13
    
   [tdsql_proxy]
   tdsql_proxy1 ansible_ssh_host=10.168.1.11
   tdsql_proxy2 ansible_ssh_host=10.168.1.12
   tdsql_proxy3 ansible_ssh_host=10.168.1.13
    
   [tdsql_hdfs]
   tdsql_hdfs1 ansible_ssh_host=10.168.1.11
    
   [tdsql_lvs]
   tdsql_lvs1 ansible_ssh_host=10.168.1.12
   tdsql_lvs2 ansible_ssh_host=10.168.1.13
    
   [tdsql_kafka]
   tdsql_kafka1 ansible_ssh_host=10.168.1.11
   tdsql_kafka2 ansible_ssh_host=10.168.1.12
   tdsql_kafka3 ansible_ssh_host=10.168.1.13
    
   [tdsql_consumer]
   tdsql_consumer1 ansible_ssh_host=10.168.1.11
    
   [tdsql_es]
   tdsql_es1 ansible_ssh_host=10.168.1.11
    
   [tdsql_mc]
   tdsql_mc1 ansible_ssh_host=1.1.1.1
   tdsql_mc2 ansible_ssh_host=1.1.1.1
   tdsql_mc3 ansible_ssh_host=1.1.1.1
    
   [tdsql_newdb]
   tdsql_newdb1 ansible_ssh_host=1.1.1.1
   tdsql_newdb2 ansible_ssh_host=2.2.2.2
   tdsql_newdb3 ansible_ssh_host=3.3.3.3
    
   [tdsql_ansible_test]
   tdsql_ansible_test1 ansible_ssh_host=1.1.1.1
   tdsql_ansible_test2 ansible_ssh_host=2.2.2.2
   tdsql_ansible_test3 ansible_ssh_host=3.3.3.3
   EOF
   cat > /root/tdsql_10.3.17.3.0/tdsql_install/group_vars/all<< EOF
   ---
   # scheduler,oss机器网卡
   tdsql_sche_netif: ens33
   
   # 操作系统账号tdsql的明文密码
   # 如果有规划要部署两个集群做DCN同步, 则这两个集群的tdsql密码要一致
   tdsql_os_pass: a+complex+password
   
   # tdsql在zk上的根路径, 保持默认不允许修改
   tdsql_zk_rootdir: /tdsqlzk
   
   # zk机器的域名配置, 会写入各配置文件, 并将域名配置到/etc/hosts中
   # 正式环境必须用机房或者地区的关键字, 有意义的关键字来命名
   # 如果部署多套TDSQL集群, 则名字需要唯一
   # 例如: 深圳机房zk的域名可以定义为tdsql_sz_zk
   tdsql_zk_domain_name: tdsql_test_zk
   
   # zk端口配置, 保持默认不要改,如果是自建的zk, 则和已有zk端口保持一致
   tdsql_zk_clientport: 2118
   tdsql_zk_serverport1: 2338
   tdsql_zk_serverport2: 2558
   
   
   # 赤兔监控库配置, 赤兔初始化完成后需要将监控库信息在这里更新
   tdsql_metadb_ip: 10.168.1.11
   tdsql_metadb_port: 15001
   tdsql_metadb_ip_bak: 10.168.1.11
   tdsql_metadb_port_bak: 15001
   tdsql_metadb_user: hanlon
   tdsql_metadb_password: 123456
   
   
   # hdfs机器的ssh端口
   tdsql_hdfs_ssh: 22
   
   # hdfs数据目录, 正式环境要求mount挂载比较大的数据盘
   tdsql_hdfs_datadir: /data2/hdfs,/data3/hdfs,/data4/hdfs
   
   
   # kafka日志目录，正式环境要求mount挂载比较大的数据盘
   tdsql_kafka_logdir: /data2/kafka,/data3/kafka,/data4/kafka
   
   # 多源同步消费服务的机器网卡
   tdsql_consumer_netif: ens33
   
   
   # es7配置
   tdsql_es7_mem: 4
   tdsql_es7_base_path: /data1/es
   tdsql_helper_cluster_name: tdsql
   
   
   # 一致性读MC机器的网卡, 需要安装MC时配置
   tdsql_mc_netif: ens33
   
   
   update_tdsqlinstall_packet: mysqlagent
   EOF
   ```

7. 安装ansible

   ```sh
   mv /root/init_env_packet.sh /root/tdsql_10.3.17.3.0/tdsql_install/roles/tdsql_beginning/files/shell_scripts/init_env_packet.sh
   cd /root/tdsql_10.3.17.3.0/tdsql_install/scripts
   source environment_set
   sh install_ansible.sh
   ```

8. TDSQL安装

   ```sh
   cd /root/tdsql_10.3.17.3.0/tdsql_install
   ansible-playbook -i tdsql_hosts playbooks/tdsql_part1_site.yml
   ```

9. 赤兔初始化

   1. 访问地址：http://10.168.1.11/tdsqlpcloud

#### 10.168.1.12

1. 配置主机名

   ```sh
   hostname mac2
   ```

2. 添加主机名IP映射

   ```sh
   cat >> /etc/hosts<< EOF
   10.168.1.11 mac1
   10.168.1.12 mac2
   10.168.1.13 mac3
   10.168.1.14 mac4
   EOF
   ```

3. 开启时间同步

   ```sh
   yum -y -C install ntp
   cat >> /etc/ntp.conf<< EOF
   server 10.168.1.11
   restrict 10.168.1.11 mask 255.255.255.0 nomodify notrap
   EOF
   systemctl restart ntpd.service
   ```

4. 规划存储目录

   ```sh
   mkdir -p /data
   mkdir -p /data1
   ```

#### 10.168.1.13

1. 配置主机名

   ```sh
   hostname mac3
   ```

2. 添加主机名IP映射

   ```sh
   cat >> /etc/hosts<< EOF
   10.168.1.11 mac1
   10.168.1.12 mac2
   10.168.1.13 mac3
   10.168.1.14 mac4
   EOF
   ```

3. 开启时间同步

   ```sh
   yum -y -C install ntp
   cat >> /etc/ntp.conf<< EOF
   server 10.168.1.11
   restrict 10.168.1.11 mask 255.255.255.0 nomodify notrap
   EOF
   systemctl restart ntpd.service
   ```

4. 规划存储目录

   ```sh
   mkdir -p /data
   mkdir -p /data1
   ```

#### 10.168.1.14

1. 配置主机名

   ```sh
   hostname mac4
   ```

2. 添加主机名IP映射

   ```sh
   cat >> /etc/hosts<< EOF
   10.168.1.11 mac1
   10.168.1.12 mac2
   10.168.1.13 mac3
   10.168.1.14 mac4
   EOF
   ```

3. 开启时间同步

   ```sh
   yum -y -C install ntp
   cat >> /etc/ntp.conf<< EOF
   server 10.168.1.11
   restrict 10.168.1.11 mask 255.255.255.0 nomodify notrap
   EOF
   systemctl restart ntpd.service
   ```

4. 规划存储目录

   ```sh
   mkdir -p /data
   mkdir -p /data1
   ```

   

> 参考文档：https://blog.csdn.net/maibaizhou/article/details/124509511
