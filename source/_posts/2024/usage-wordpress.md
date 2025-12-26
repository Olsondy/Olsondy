---
title: 独立站搭建流程记录
categories: Develop
comments: true
keywords: fp, wordpress , php
tags:
  - wordpress
  - litespeed
  - mariadb-server
description: 使用wordpress搭建个人独立站
date: 2024-07-02T10:00:31.050Z
updated: 2023-07-05T10:17:01.081Z
---
# 站点搭建
-  以 `ubuntu` 为例, `litespeed cache + wordpress`
```bash
# 创建放置证书的目录(主机商提供或者自己购买) 也可放到/usr/local/lsws/conf/cert目录下
sudo mkdir -p /usr/local/ssl
sudo chown -R root:root /usr/local/ssl
sudo chmod -R 400 /usr/local/ssl

sudo apt-get update
sudo apt-get upgrade

#安装 lsws web服务  (litespeedwebserver)
wget -O - https://repo.litespeed.sh | sudo bash
apt-get install openlitespeed
sudo apt install lsphp74 lsphp74-common lsphp74-curl lsphp74-imap lsphp74-json lsphp74-mysql lsphp74-opcache lsphp74-imagick

#需要对象缓存可以安装以下缓存插件
#redis
sudo apt install lsphp74-redis
sudo apt install redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# memcached
sudo apt install lsphp74-memcached
sudo apt-get install memcached

#修改php配置
vi /usr/local/lsws/lsphp74/etc/php/7.4/litespeed/php.ini
upload_max_filesize = 50M
post_max_size=50M
memory_limit = 512M

systemctl start lsws

# 安装数据库
sudo apt update
sudo apt install mariadb-server
sudo mysql_secure_installation
sudo mysql

# 创建数据库
CREATE DATABASE databaseName; 
CREATE USER username@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON databaseName.* TO username@'localhost';
or 
# GRANT ALL PRIVILEGES ON databaseName.* TO username@'%' identified by 'password'
FLUSH PRIVILEGES;

# 按需打开mariadb远程访问权限
vi /etc/mysql/mariadb.conf.d/50-server.conf
# 注释掉下面内容
# bind-address = 127.0.0.1

# 安装wordpress
wget -P /usr/local/lsws/surpoutlets/html/ https://wordpress.org/latest.tar.gz 
sudo tar xvfz /usr/local/lsws/surpoutlets/html/latest.tar.gz -C /usr/local/lsws/surpoutlets/html/

sudo chown -R nobody:nogroup /usr/local/lsws/surpoutlets/html/wordpress
sudo find /usr/local/lsws/surpoutlets/html/wordpress/ -type d -exec chmod 750 {} \;
sudo find /usr/local/lsws/surpoutlets/html/wordpress/ -type f -exec chmod 640 {} \;

sh /usr/local/lsws/admin/misc/admpass.sh

# 防火墙和端口设置
sudo apt update
sudo apt install ufw -y
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 7080/tcp  #lsws服务
sudo ufw allow 8088/tcp
sudo ufw allow 3360/tcp  #数据库访问端口

sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw status verbose
```
- Cloudflare 申请源服务器证书, 设置到lsws控制面板
- SSL模式修改为完全模式 即端到端都加密

## 已有站点-迁移
### wp-stage插件
使用该插件直接可恢复到指定版本, 选择备份文件即可
### 手动备份
#### 备份数据库数据
```bash
# 1. 原服务器导出
mysqldump -uusername -ppassword dbname | gzip > /data/wwwroot/www/dbname.sql.gz
# 2. 传输
scp /data/wwwroot/www/dbname.sql.gz root@newserverip:/root/dbname.sql.gz
# 3. 新服务器导入
gunzip < /root/dbname.sql.gz | mysql -uusernameb -ppasswordb dbnamenew
```

#### 迁移原有站点的数据内容
```bash
scp -R /usr/local/lsws/wordpress root@newserver:/usr/local/lsws/wordpress
```
### 域名变更
- 修改`cloudflare` 的dns解析到新的服务器地址, 
- 修改`litespeed web`的虚拟主机域名 
- 最后需更新wordpress数据表中的相关域名地址
```sql
update wp_posts set guid  = replace(guid, 'current.domain.com' ,'target.domain.com')  
                where guid like 'current.domain.com%'  
  
update wp_posts set post_content  = replace(post_content, 'https://surpoutlets.com' ,'https://us.surpoutlets.com')  
                where post_content like 'https://surpoutlets.com%'
update wp_posts_meta
```
### 迁移过后可能出现的问题
#### 访问页面或者发布页面出现404
**新增/修改页面时提示 `此响应不是合法的JSON响应。` 可以尝试以下解决办法**
- 首先确认下服务器是否有设置伪静态规则 (其实就是一个URL转发规则) 报错的原因就是按照规则链接没有动态转换
-  在站点**设置** >**固定连接结构** 选项中修改链接的访问形式, 然后清空缓存, 再次新建或打开页面尝试
- 删除服务器 `wordrpress` 根目录下的`.htaccess`文件,  **切记!!!wordpress的目录需要设置权限**
- 如果上述设置都还没有生效 **重启服务器**
#### 域名修改后新域名出现重定向301到老域名
- 缓存问题导致的wordpress配置还是到重定向到老域名, 如使用redis 缓存, 可以登录redis服务端清除缓存
- 关闭 `WP_DEBUG_DISPLAY`调试模式
- 编辑 WordPress 的 `wp-config.php` 文件，这是最直接的方法。
**步骤:**
- 找到 WordPress 的 `wp-config.php` 文件（通常在 WordPress 安装的根目录中）。
- 打开文件，找到以下代码或添加相关代码（通常在 `define( 'WP_DEBUG', true );` 之后）：
- 确保同时启用了 `WP_DEBUG` 和 `WP_DEBUG_LOG`，但禁用了显示功能：
```php
define( 'WP_DEBUG', true ); // 启用调试模式
define( 'WP_DEBUG_LOG', true ); // 将错误记录到 debug.log 文件
define( 'WP_DEBUG_DISPLAY', false ); // 禁止在前端显示错误
@ini_set( 'display_errors', 0 ); // 禁止 PHP 错误显示
```
- 保存文件并上传到服务器。**切记!!!wordpress的目录需要设置权限**

#### elementor编辑器打不开问题, 排查流程: 
- 安全模式是否可以打开页面
- 新建空白页面是否可以打开
- 浏览器控制台是否报错
- 数据库查看`wp_post_meta`表, 找到`elementor_data`字段,  检查json内容是否有问题

#### wordpress 已有用户删除的问题, 
导致删除此用户的之前上传或操作的内容资源不可见, 图片资源等等
## 开始使用

### 相关概念
**wordpress是CMS内容管理系统, 本身并不具备电商销售功能,所以需要集成相关插件来实现**
- `页面`: 即单个地址访问资源的页面内容
- `站点`: 发布之后供外部用户使用和查看
- `后台`: wordpress管理员访问的功能
### 插件
- 使用`Astra`  wordpress 主题, 适用于电商, 可以自定义站点主题设置
- `WooCommerce` 集销售一体的电商插件
- `Elementor` 单页面编辑插件
### 站点设置
- 设置站点标题, 这里的站点指的是外部用户访问
- 站点语言设置, 面向客户
- 设置站点访问地址: `update wp_options set option_value='https://xxxxxx.com' where option_name='home';`
### 用户设置
- 管理端的相关设置
- 关闭所有用户注册
- 语言设置, 面向后台管理员
- 设置管理端访问地址: `update wp_options set option_value='https://xxxxx.com' where option_name='siteurl';`

## 自定义站点
### wordpress 设置
- 创建用户, 设置用户角色, 使用 `用户角色编辑`插件
- 心愿单:  在YITH插件中开启或关闭`WooCommerce`的Wishlist功能
### Astra主题自定义设置
-   全局设置：  按钮字体类型、全局按钮样式
-   页眉设置：  网站标题、logo 、菜单、小组件等布局
-   页脚设置：  站点导航 、菜单、小组件等布局
-  `WooCommerce`设置：设置商店, 产品, 购物车, 结账等页面的相关布局
### WooCommerce设置
- 编辑产品: 设置产品的标签、分类、允许评论
- 打开`WooCommerce` 允许会员注册功能
- 电子邮件的设置
###  Wordpress Gutenberg（古腾堡）编辑器
- 侧边栏设置: 首先需要在`wordpress`页面或者在 `Astra`设置页面类型,  是否包含侧边栏的布局, 设置后可以在`Astra`自定义设置小工具中自定义侧边栏
- Gutenberg（古腾堡）编辑器:  `Woocommerce` 简码功能的使用 [教程](https://loyseo.com/tutorial/woocommerce/woocommerce-shortcodes/#ftoc-heading-15)
### 多语言
- 使用 Polylang插件
- 在多语言菜单中翻译自定义文本内容
- 创建页面需要设置多个语言内容
## 优化专题

### AB- Cloak
### Cache
### Analytics
- 收录网站 google search console
- 创建`Google Analytics(GA4)`数据流
- 将GA4绑定到`Google Tags Manager(GTM)`
- 创建自定义`GA Event`
- 在wordpress 安装 `Site Kit` 插件
### SEO

### ADS 
- TK
- Meta
- Pinterest

## 其他

### 数据库操作
查询用户类型
```sql
SELECT
    u.ID
FROM
    wp_users u
INNER JOIN
    wp_usermeta um ON u.ID = um.user_id
WHERE
    um.meta_key = 'wp_capabilities'
AND (um.meta_value LIKE '%subscriber%')
```
文章处理相关sql
```sql

DELETE
FROM wp_comments
WHERE comment_type = 'order_note';
DELETE
FROM wp_postmeta
WHERE post_id IN (SELECT ID FROM wp_posts WHERE post_type = 'shop_order');
DELETE
FROM wp_posts
WHERE post_type = 'shop_order';
DELETE
FROM wp_posts
WHERE post_type = 'post'
  and post_author = 4;
DELETE
FROM wp_posts
WHERE post_status = 'trash';

SELECT *
FROM wp_posts
WHERE post_type = 'page'
  AND post_status = 'publish';
select count(1)
from wp_posts
WHERE post_type = 'post'
  and post_author = 4;
select *
from wp_postmeta
where post_id = '1007'

select *
from wp_users
delete
from wp_users
where ID = 4

select *
from wp_options
where option_id in (1, 2)
select *
from wp_posts
where guid like 'https://surpoutlets.com%'
select *
from wp_posts
where post_content like '%us.surpoutlets.com%'
select *
from wp_postmeta
where meta_value like '%us.surpoutlets.com%'

select *
from wp_posts
where id = '25482'
select *
from wp_posts
where post_parent = '25482'

```

价格处理相关sql
```sql
DELETE
FROM wp_woocommerce_order_itemmeta
where 1 = 1;
DELETE
FROM wp_woocommerce_order_items
where 1 = 1;

# 查询价格
select *
from wp_options
where option_name like '%_transient_wc_var_prices%'
  and option_name in (select distinct concat('_transient_wc_var_prices_', w.post_parent)
                      from wp_posts w
                               join wp_posts w1 on w1.id = w.post_parent
                      where w1.post_type = 'product'
                        and w.post_type = 'product_variation'
                        and w.guid like '%us.surpoutlets.com%'
                        and w.post_parent = '25482');

# 先查单个产品
select id, post_title
from wp_posts
where post_type = 'product'
  and post_parent = '0'
  and guid like '%us.surpoutlets.com%';

# 查询单个产品的价格信息
select *
from wp_postmeta
where post_id in (select id
                  from wp_posts
                  where post_type = 'product'
                    and post_parent = '0'
                    and guid like '%us.surpoutlets.com%'
                    and id not in ('25482'))
  and meta_key like '%price%'
  and meta_value != '';

# 再查可变产品
select *
from wp_posts w
         join wp_posts w1 on w1.id = w.post_parent
where w1.post_type = 'product'
  and w.post_type = 'product_variation'
  and w.guid like '%us.surpoutlets.com%'
  and w.post_parent not in ('25482');
# 查询可变产品的价格信息
select *
from wp_postmeta
where post_id in (select w.id
                  from wp_posts w
                           join wp_posts w1 on w1.id = w.post_parent
                  where w1.post_type = 'product'
                    and w.post_type = 'product_variation'
                    and w.guid like '%us.surpoutlets.com%'
                    and w.post_parent not in ('25482'))
  and meta_key like '%price%'
  and meta_value != '';
# 查询可变产品的价格范围
select *
from wp_wc_product_meta_lookup
where product_id in (select w.id
                     from wp_posts w
                              join wp_posts w1 on w1.id = w.post_parent
                     where w1.post_type = 'product'
                       and w.post_type = 'product_variation'
                       and w.guid like '%us.surpoutlets.com%'
                       and w.post_parent not in ('25482'));


update wp_posts
set guid = replace(guid, 'https://us.surpoutlets.com', 'https://surpoutlets.com')
where guid like 'https://us.surpoutlets.com%';

update wp_posts
set post_content = replace(post_content, 'https://us.surpoutlets.com', 'https://surpoutlets.com')
where post_content like '%https://us.surpoutlets.com%'

update wp_postmeta
set meta_value = replace(meta_value, 'us.surpoutlets.com', 'surpoutlets.com')
where meta_value like '%us.surpoutlets.com%'

# 批量更新单个产品价格
update IGNORE wp_postmeta
set meta_value = round(cast(meta_value as integer) / 20, 0)
where post_id in (select id
                  from wp_posts
                  where post_type = 'product'
                    and post_parent = 0
                    and guid like '%us.surpoutlets.com%'
                    and id not in ('25482'))
  and meta_key like '%price%'
  and meta_value != '';

# 批量更新可变产品价格
update IGNORE wp_postmeta
set meta_value = round(cast(meta_value as decimal) / 20, 0)
where post_id in (select w.id
                  from wp_posts w
                           join wp_posts w1 on w1.id = w.post_parent
                  where w1.post_type = 'product'
                    and w.post_type = 'product_variation'
                    and w.guid like '%us.surpoutlets.com%'
                    and w.post_parent not in ('25482'))
  and meta_key like '%_price%'
  and meta_value != '';

# 可变产品需要更新价格区间
update ignore wp_wc_product_meta_lookup
set min_price = round(cast(min_price as decimal) / 20, 0),
    max_price = round(cast(max_price as decimal) / 20, 0)
where product_id in (select w.id
                     from wp_posts w
                              join wp_posts w1 on w1.id = w.post_parent
                     where w1.post_type = 'product'
                       and w.post_type = 'product_variation'
                       and w.guid like '%us.surpoutlets.com%'
                       and w.post_parent not in ('25482'));
#删除可变产品的价格区间缓存
delete
from wp_options
where option_name in (select distinct concat('_transient_wc_var_prices_', w.post_parent)
                      from wp_posts w
                               join wp_posts w1 on w1.id = w.post_parent
                      where w1.post_type = 'product'
                        and w.post_type = 'product_variation'
                        and w.guid like '%us.surpoutlets.com%'
                        and w.post_parent not in ('25482'));

commit;
rollback;

```