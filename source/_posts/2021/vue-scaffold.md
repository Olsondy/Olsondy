---
title: 初学vue搭建项目脚手架
categories: Develop
comments: true
keywords: vuejs, javascript
tags: [workspace, vuejs, javascript]
description: 一个使用vuejs搭建的项目脚手架
date: '2018-04-24T16:00:31.050Z'
updated: '2023-09-25T06:00:01.081Z'
---

## SPA应用 ？ ##
- SPA应用的概念
> - SPA (Signle Page Application) 整个webapp就一个html文件，里面的各个功能页面是javascript通过hash,或者history api来进行路由，并通过ajax拉取数据来实现响应功能。因为整个webapp就一个html，所以叫单页应用

- 优势
> - 前后端职责分离，架构清晰：前端进行交互逻辑，后端负责数据处理。
> - 前后端单独开发、单独测试。
> - 良好的交互体验，前端进行的是局部渲染。避免了不必要的跳转和重复渲染

## 项目简介 ##
Authority Management System (权限管理系统)

[![node](https://img.shields.io/node/v/webpack.svg)](https://github.com/nodejs/node)
[![npm](https://img.shields.io/badge/npm-3.8.9-blue.svg)](https://github.com/npm/npm)
[![webpack](https://img.shields.io/badge/webpack-2.6.1-blue.svg)](https://github.com/webpack/webpack)
[![vue](https://img.shields.io/badge/vue-2.4.2-brightgreen.svg)](https://github.com/vuejs/vue)
[![vuex](https://img.shields.io/badge/vuex-2.3.1-brightgreen.svg)](https://github.com/vuejs/vuex)
[![vue-router](https://img.shields.io/badge/vue--router-2.5.3-brightgreen.svg)](https://github.com/vuejs/vue-router)
[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)]()

- 本项目使用的是vue-cli 脚手架生成的基于webpace的单页应用[vue-cli 脚手架](https://cn.vuejs.org/v2/guide/installation.html)
- 开发工具
	- 规定使用`webstorm 2017.2 + eslint + babel`
- 简要规范
 - 使用 ES6(ES2015) 来编写代码。
 - `npm install` 成功后,在`webstorm`中设置`eslint`环境,遵守当前项目的`eslint`规范
 - 按钮统一使用`iview UI`的`<Button>`组件
 - 表单统一使用`iview UI`的表单组件
 - 表格统一使用`element UI`的`<el-table>`
 - 开发界面独立样式在组件中`style`标签下新增
 - 菜单`.vue`组件一定要放在`view`目录下,否则会导致路由加载不到页面的错误.
 - 业务异常的提示弹出不需要自己写,只需要写异常之后需要处理的业务.
 - 操作成功的提示弹出层统一使用`element UI`的`message`组件.

> 如组件页面有其他UI组件的需求,则需要和前端UI进行沟通

## 兼容性 ##
 基于Chrome内核的现代浏览器和Internet Explorer 10+

## 功能 ##
- [ ] 布局(菜单、头部、导航、内容)
- [ ] 路由导航,动态侧边栏（支持多级路由）
- [ ] 查询表单的自适应,分页表格功能
- [ ] 表单 (选择组件、可搜索选择组件)
- [ ] http请求封装(get post put delete)
- [ ] store 状态数据存储
- [ ] mock数据
- [ ] http请求的国际化
- [ ] 与后台交互增删改查的例子
- [ ] 多环境发布
- [ ] 按钮权限设计
- [ ] 多语言、换肤切换


## 目录结构介绍 ##
	|-- build                            // webpack配置文件
	|-- config                           // 项目打包运行环境配置
	|-- src                              // 源码目录
	|   |-- assets                       // 内部使用资源目录
	|   |-- common                       // 所有系统可以公用的功能模块
	|       |-- api                      // http请求方法
	|       |-- components               // 公共通用组件
	|       |-- main                     // 首页布局模板
	|       |-- mock                     // mockjs模拟请求
	|       |-- plugins                  // 插件目录
	|       |-- router                   // 路由配置
	|       |-- styles                   // 通用css样式
	|       |-- stores                   // 状态管理数据存储
	|       |-- utils                    // 工具函数
	|   |-- components                   // 当前项目单独通用组件组件
	|   |-- views                        // 当前项目页面模块
	|   |-- App.vue                      // 页面入口文件
	|   |-- main.js                      // 程序入口文件，加载各种公共组件
	|-- static                           // 外部引入静态文件目录
	|-- test                             // 单元测试目录
	|
	|    ....
	|
	|-- .babelrc                         // babel-loader语法编译配置
	|-- .editorconfig                    // 代码编写规格
	|-- .eslintignore                    // 需要忽略js语法及代码风格的配置
	|-- .eslintrc.js                     // 检查js语法错误及代码风格
	|-- .gitignore                       // git提交忽略的文件
	├── leo-face.ico                     // favicon图标
	|-- .npmrc                           // npm install 工具包配置
	|-- index.html                       // 入口html文件
	|-- package.json                     // 项目及工具的依赖配置文件
	|-- README.md                        // 说明


!> **注意** 开发时请按照上面目录结构描述进行开发.

## 安装及启动
### 安装 ###

    // 下载到本地
	git clone http://code.hoau.net/itiaoling-sc/leo-face.git && cd leo-face
	//设置npm安装地址注册到淘宝镜像的地址
	npm config set registry https://registry.npm.taobao.org
	// 安装项目依赖
	npm i

> - 如果是node-sass的错误,安装cnpm,使用cnpm执行以下命令
>   - npm i cnpm -g
>   - cnpm i node-sass


### 本地开发 ###

	// 开启服务器，浏览器访问 http://localhost:8089
	npm run dev

### 测试环境 ###

	// 执行构建命令，生成的dist文件夹放在服务器下即可访问
	// 生成webpack-bundle-analyzer的code split图
	npm run build:test

### 生产环境 ###

	// 执行构建命令，生成的dist文件夹放在服务器下即可访问
	npm run build:prod

## 相关组件说明与简单例子演示 ##
### Element & iView ###
基于vue2.x封装的网站快速成型工具包

>项目已经在`main.js`中引入了相关依赖,在组件中直接按照官方例子使用即可,如需在js中单独使用,请使用`import`按需引入

**相关地址**
- [Element](https://github.com/ElemeFE/element) ,[官方教程](http://element.eleme.io/#/zh-CN)<p></p>
[![version](https://img.shields.io/badge/element--ui-1.4.3-brightgreen.svg)](https://github.com/ElemeFE/element)
[![downloads](http://img.shields.io/npm/dm/element-ui.svg)](https://github.com/ElemeFE/element)

- [iView](https://github.com/iview/iview/),[官方教程](https://www.iviewui.com)<p></p>
[![version](https://img.shields.io/badge/iview-2.3-brightgreen.svg)](https://github.com/iview/iview/)
[![downloads](http://img.shields.io/npm/dm/iview.svg)](https://github.com/iview/iview/)

!> **注意**
- leo-face 脚手架使用了俩个ui组件库的组件.组件内部使用互不影响,但可能某些情况下会出现css样式冲突


### mock.js 框架的使用 ###
拦截并模拟 ajax 请求

>项目使用了mock.js模拟，在无后台环境前可使用展示界面,需使用后端api，可在main.js移除
>
>	  import 'common/mock/index.js'; // 模拟http数据请求  (注释则可以调用本地配置的开发环境)

**相关地址**
- [官方wiki](https://github.com/nuysoft/Mock/wiki/Getting-Started)
- [简易教程](http://cnodejs.org/topic/53f718218f44dfa3511af923)

**使用**
- 文件位置`common/mock/index.js`

```javascript
/**
 * 测试接口覆盖
 */
import Mock from 'mockjs';
import mockAPI from './response';

// 声明需要拦截的地址请求,
// 参数说明
// restful接口
// http method
// 执行请求方法
// 前俩个参数需与拦截的请求一致方可拦截成功
Mock.mock(/\/users\/v1\/actions\/login/,'post',mockAPI.login);
```

### http请求 axios框架使用 ###
**基于http客户端的promise，面向浏览器和nodejs**

[![axios](https://img.shields.io/badge/axios-0.16.2-brightgreen.svg)](https://github.com/mzabriskie/axios)
> - vue更新到2.0之后，就宣告不再对vue-resource更新，而是推荐的axios
> - 将当前的http请求方法绑定在vm对象中,可直接使用例如`vm.$get()`

**相关地址**
- [源码地址](https://github.com/mzabriskie/axios)
- [中文翻译文档](https://segmentfault.com/a/1190000008470355)

**使用**
- 文件位置`common/api/http.js`
  ```javascript
	//get请求
	http.get(getUrl, params).then(data =>{

	}).catch(error=>{

	})

	//post or put请求  请求url、请求json对象、请求方法
	http.mergePostAndPut(reqUrl, params,reqMethod).then(data =>{

	}).catch(error=>{

	})
			//delete 请求
	http.delete(delUrl).then(data =>{

	}).catch(error=>{

	})
  ```

- 使用例子
```javascript
     //获取用户信息
     http.get('/users/v1/current').then(data => {
          if (data){
            const user = data.result;
            if (user){
              commit('SET_NAME', user.userChineseName);
              commit('SET_CODE', user.userCode);
            } else {
              return Message({
                message: '获取用户信息失败',
                type: 'error',
                showClose: true,
                duration: 2 * 1000
              });
            }
          }
    }).catch(error => {
       //异常需要处理的流程
    });
```

> 提示: 在目录`common/utils/fetch.js`中封装了axios的httpRequest和httpResponse相关promise hook

### vuex 状态管理 ###
应用的数据与状态存储

>- `main.js`已经全局导入声明了vuex
>- 项目中只有user和app配置相关状态使用vuex存在全局，其它数据都由每个业务页面自己管理。


**相关地址**
- [vuex](https://vuex.vuejs.org/zh-cn/)
- [Actions](https://vuex.vuejs.org/zh-cn/actions.html)

**实例介绍**
- 目录结构`src/common`

		|-- stores                               //stores目录
		|   |-- module                           //模块
		|       |-- app.js                       //当前应用使用的数据存储对象及操作
		|       |-- permission.js                //整个系统路由的数据存储对象及操作
		|   		|-- user.js                      // 左侧菜单路由渲染组件
		|   |-- getters.js                       // vuex对象属性全局获取的对象
		|   |-- index.js                         // vuex对象声明创建
- 组件中使用
```javascript
//在vue的computed属性中使用Es6数组扩展运算符加载getters对象
computed: {
	 ...mapGetters([
	 'permission_routers',
	 'sidebar'
	 ]),
}
//组件中使用
this.$store.dispatch('toggleSideBar')  //vue当前组件对象中使用
this.$store.commit('SET_LANG',e);  //提交数据存储到vuex对象
//javascript中使用
store.dipatch('login')   //import依赖后使用对象调用,转发到actions相应方法
```

### vue-router 路由
使用vue-router实现的动态路由导航

>项目中根据权限的数据生成的vue-router对象,达到动态路由的目的渲染菜单和页面

**相关地址**
- [router导航](https://router.vuejs.org/zh-cn/advanced/navigation-guards.html)
- [router导航信息配置](https://router.vuejs.org/zh-cn/api/route-object.html)

**实例介绍**
- 目录结构`src/common`

		|-- router
		|   |-- _import_components.js             //懒加载配置
		|   |-- dynamicRouter.js                  // 动态导航钩子
		|   |-- index.js                          // router实例

```javascript
//main.js
import router from 'common/router';
import 'common/router/dynamicRouter';

//router/index
//创建路由
export default new Router({
  mode:'history',
  base: '/leo-face/'
});

//router/dynamicRouter.js
//设置当前系统的默认路由导航
const constantRouterMap = [{
  path: '/',
  name: '',
  component: LeoLayout,
  redirect: '/main',
  hidden: true,
  children: [
    {
      path: '/main',
      component: homepage,
      name:'首页',
      beforeEnter: (to, from, next) => {
        store.dispatch('addVisitedViews',to);  //首页标签页的初始化
        next();
      }
    }
  ]
}];
//导航拦截,用来完成跳转
router.beforeEach((to, from, next) => {});
//完成导航
router.afterEach(() => {});
```

### 布局 ###
项目的主体框架布局

**介绍**
- 目录结构`src/common`

		|  -- main                              // 首页目录
		|    |-- Layout.vue                    // 主组件
		|    |-- Siderbar.vue                  // 左侧菜单面板组件
		|    |-- SiderbarItem.vue              // 左侧菜单路由渲染组件
		|    |-- Navbar.vue                    // 头部组件
		|    |-- TabsView.vue                  // 基于tags的标签页组件(后续修改为tabs)
		|    |-- AppMain.vue                   // 右侧内容布局组件

- 布局概述
  - Layout：布局容器，其下可嵌套 Navbar Siderbar AppMain 或 Layout 本身，可以放在任何父容器中。
  - Navbar：顶部布局，自带默认样式，其下可嵌套任何元素，只能放在 Layout 中。
  - Siderbar：左侧菜单面板组件，只能放在 Layout 中。
  - SiderbarItem：左侧菜单路由渲染组件,只能放在 Siderbar 中。
  - AppMain：内容部分，自带默认样式，其下可嵌套任何元素，只能放在 Layout 中。

### 内容页 ###
- 表单,表格的一致风格
```html
<template>
  <div class="app-container">
    <div class="filter-container">
        <Form :label-width="80">
          <div class="row">
            <div class="col-sm-6 col-md-6 col-lg-3">
              <Form-item label="系统编码">
                <static-selector :params="codeSelector" ref="staticSelector"></static-selector>
              </Form-item>
            </div>
        </div>
      </Form>
    </div>
    <div class="panel-container">

    </div>
  </div>
</template>
```

> 以上是右侧内容布局的写法,使用`bootstrap`自适应的栅格布局,`<div class="col-sm-6 col-md-6 col-lg-3">`


### Selector 下拉组件 ###
**以`ChildSystemSetting.vue`组件使用为例**

- 可选择selector `StaticSelector.vue`
	- 在父组件中使用
		- `template`

			```html
			<el-col :span="4">
			 <Form-item label="系统编码">
				 <static-selector :params="codeSelector" ref="staticSelector"></static-selector>
			 </Form-item>
			</el-col>
			```

  		- `script`
			```javascript
            data () {
               return {
               nameSelector: {
                 selectAt: 'all',     //设置默认值
                 emptyText: '选择系统编码',  //设置默认文本提示,默认值是:'请选择'
                 remoteUrl: '/sub-systems/v1/display' //获取数据的url
               }
              }
            }
      ```

- 动态搜索selector `DynamicSelector.vue`
	- 在父组件中使用
		- `template`

			```html
			<el-col :span="4">
				<Form-item label="系统名称">
			 		<dynamic-selector :params="nameSelector" ref="dynamicSelector"></dynamic-selector>
				</Form-item>
			</el-col>
			```

		- `script`

			```javascript
			data () {
				return {
					nameSelector: {
						emptyText: '搜索系统名称',  //设置默认文本提示,默认值是:'请选择'
						remoteUrl: '/sub-systems/v1/systemName' //获取数据的url
					}
				}
			}
			```

> 说明:
>- `:params`自定义属性,该属性封装了父组件传递给子组件的信息
>- `ref`属性用于获取子组件信息进行通信,在当前vue对象中使用`this.$refs.XXX`获取子组件
>- `@selectChange`自定义选择事件,当前组件选择option后触发
>- `StaticSelector.vue`中的方法,
>	- `resetValue`,重置下拉选择
>	- `loadData`,执行获取服务器请求方法
>- `DynamicSelector.vue`中的方法,
>	- `setSelectorValue`,重置或设置默认值
>	- `remoteMethod`,对输入的值进行搜索返回渲染的方法

### 简单的分页表格 ###

- `template`

```html
  <div class="row filter-btn" align="right" :test="test">
    <basic-button btnType="Search" @click="clickSearch"></basic-button>
  </div>
  <general-table :gridInstance="gridData"
   ref="demoGrid"
   :showPagingTool="false"
   @selectChange="handleSelectionChange"
   :isShowCheckBox="false"></general-table>
```
- 相关的`script`

  ```javascript
  //data对象
  //表格的模板列
  gridData: {
      columns:[{
        key: 'id'
      },
      {
        title: this.$t('childSystem.commonLang.systemCode'),
        key: 'systemCode'
      },
      {
        title: this.$t('childSystem.commonLang.systemName'),
        key: 'systemName'
      },
      {
        title: this.$t('childSystem.tableLang.createTime'),
        key: 'createTime',
        render: (row, columns) => {
           return this.dateFormatter(row,column);
        }
      }]
   }
  //computed
  computed : {
    ...mapGetters([
      'tablePaginationSize'
    ])
  },
  //methods
  clickSearch(){
     //fetch data
     this.$refs.demoGrid.gridDataInit(url, queryParams)
  },
  handleSelectionChange(rows){  //表格选择处理
    this.multipleSelection = rows;
  },
  dateFormatter(row, column){
    let date = row[column.property];
    if (date) {
      return utils.parseTime(date,'{y}-{m}-{d} {h}:{i}:{s}');
    }
    return '';
  }
  ```

>说明
- `basic-button`组件,封装了基础的按钮和国际化信息
- `general-table`使用的是`iview`的单行数据的`table`组件和`page`分页组件
  - `checkBox`属性,设置表格支持多选
  - `columns`属性,表格的列渲染,`render`属性,指定方法进行返回值渲染
  - `selectChange`事件,绑定当前表格`chekcbox`选择事件

### 前端国际化 ###
页面组件,文本的信息国际化切换

 [![vue-i18n](https://img.shields.io/badge/vue--i18n-5.0x-brightgreen.svg)](http://kazupon.github.io/vue-i18n/old/)
- `assets/i18n/locale.js`本地语言国际化信息,`localeNames`数组存放当前所有的本地国际化信息文件名称
- 在入口文件中`main.js`合并了本地语言国际化信息和`iview`的国际化

`template`中使用
```html
<Form-item :label="$t('childSystem.searchForm.testLayout')">
  <Input :placeholder="$t('childSystem.searchForm.testPlaceholder')"/>
</Form-item>
```

`script`中使用
```javascript
this.$Message.warning({
    content: this.$t('global.chooseRow'),
    showClose: true
});
```
!> **注意**`locale.js`中语言对象的声明规则

### 其他 ###
**font**

>项目中的有4个字体组件,ElementUI 和 iview自带的以及自定义的,以下俩个是自定义字体组件的使用

- [vue-awesome](https://github.com/justineo/vue-awesome)
	- 组件中使用

	```html
	<template>
	   <icon-vueSvg name="you icon name"></icon-vueSvg>
	</template>
	```
	- js注册图标

	```javascript
      //index.js
      //引入自定义注册库的js
      import './font-basic';

      //font-basic.js
      //引入图标组件进行图标注册
      import Icon from './Icon';

      Icon.register({
         'information': {
         'width': 1024,
         'height': 1024,
         'paths': [
             {
					//svg数据
             }
           ]
         }
      });
	```

>给图标设置样式（大小可以通过 transform: scale() 来设置）
>新建图标文件出口文件，这个在使用的图标很多的时候比较方便

- [iconfont](http://iconfont.cn/)
	- 使用图标库步骤:
		- 在当前自己的图标库中生成`symbol`引用地址
		- 定义一个自定义的`icon.vue`组件
		- 组件中使用

		```html
  		<template>
  		   <icon-fontSvg icon-class="you icon name"></icon-fontSvg>
  		</template>
		```

>项目统一使用一个项目图标库,只生成一个统一的图标库地址,不需要开发者单独去生成引用,可以使用即可

**vue-devtools**
- 基于chrome的vuejs开发调试工具
- [下载及使用](http://www.cnplugins.com/devtool/vuejs-devtools/)
