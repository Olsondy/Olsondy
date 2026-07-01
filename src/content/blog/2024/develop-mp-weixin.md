---
title: 微信小程序开发脚手架 (by uniapp)
categories: Develop
comments: true
keywords: vuejs, typescript, uniapp
tags:
  - uniapp
  - typescript
  - vue3
  - vite3
  - myproject
description: uniapp cli 小程序脚手架
pubDate: '2024-01-02T10:00:31.050Z'
lastModDate: 2025-12-25T10:17:01.081Z
---

# 微信小程序开发脚手架 (by uniapp)

## Intro

- **Nodejs version 20+ **
## Features

- 📱[Uniapp Cli](https://uniapp.dcloud.net.cn/) - Cross-platform
- ⚡️ [Vue 3](https://github.com/vuejs/core), [Vite](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/), [ESBuild](https://github.com/evanw/esbuild) - born with fastness

- 🗂 [File based routing](./src/pages)

- 📦 [Components auto importing](./src/components)

- 📑 [Layout System](./src/layouts)

- 🎨 [UnoCSS](https://github.com/antfu/unocss) - The instant on-demand atomic CSS engine.

- 😃 Use icons from any icon sets in [Pure CSS](https://github.com/antfu/unocss/tree/main/packages/preset-icons)

- 🔥 Use the [new `<script setup>` style](https://github.com/vuejs/rfcs/pull/227)

- 🦾 [TypeScript](https://www.typescriptlang.org/) & [ESLint](https://eslint.org/) - Code Quality

## Construct

```txt
...
| - src
    |- api            // 和后端交互的接口统一定义
    |- compontents    // 组件模块
      |- states       // 公用状态组件
      |- ui           // 公用UI组件
      |- view         // pages页面相关的模块
    |- composables    // 组合函数
    |- http           // 请求封装
    |- layouts        // 布局方案
    |- locale         // 国际化资源
    |- pages          // 页面定义文件
    |- static         // 静态资源
    |- store          // 应用缓存
    |- style          // 自定义样式
    |- uni_modules    // uniapp-plugins
    |- App.vue        // 启动页
    |- main.ts        // 主入口ts
    |- types.ts       // 类型定义
- eslint.config.mjs   // 开发规范
- manifest.config.ts  // uniapp应用运行打包相关配置
- packages.json       // 包管理
- pages.config.ts     // 页面配置文件
- unocss.config.ts    // unocss配置
- vite.config.ts      // vite构建工具配置

...
```

## Quick start

```bash
npm install -g pnpm
# not npm for POSIX platforms
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
## Install & Running

``` bash
# add packages
pnpm install

# preview h5+
pnpm run dev:h5

# development weixin
pnpm run dev:mp-weixin

# production weixin
pnpm run build:mp-weixin
```

### Develop

> 保姆级开发流程
- 使用webstorm开发工具, 需要安装相关插件, 以提高开发效率. 打开 `Settings > Plugins`,搜索 `Unocss Uniapp-Tool`
- 开始安装依赖 ([Quick start](##Quick start)), 已安装可以忽略此步骤
> **当前已设置好小程序主页面框架, 页面主题样式、底部头部导航、背景**

### 开始开发一个页面

#### 页面定义
- 在`src/pages`文件夹中新建.vue文件, 参考下方命名方式
- 打开`pages.config.ts`, 配置好你的页面路径参数, 如下
```vue
 {
  path: 'pages/qa', // 访问路径 (约定好的目录)
  type: 'page'     // 类型是页面
}
```
#### 文件命名方式
- `src/pages`文件夹中的文件统一小写开头命名, 跟path相对应, 符合resful风格
- `component`文件夹页面需使用的相关组件, 大写开头驼峰命名方式
- `.ts`后缀,小写开头驼峰命名方式

#### 布局
  ```vue
  <!--  uni-pages 布局参数 -->
    <route lang="json">
      {}
    </route>
  ```
- 由pages和route动态执行加载
- 页面组件加载顺序: layout -> pages - component
- 参考`index`入口页面的加载顺序
  - `/layout/main.vue -> /pages/index.vue -> /frame/Entry.vue- >/frame/sidebar/index.vue`
- 当前配置了俩种布局 `default` 和 `main`, 默认route块为空, 则使用default布局, 布局样例参考 `/pages/qa.vue、/pages/access.vue、/pages/index`

> 以下是布局中可能使用的代码 (仅参考)
- 每个页面的可见高度在不同设备不一致, 动态获取可见高度来指定页面的高度
```vue
const windowHeight = ref(uni.getWindowInfo().windowHeight)
<view :style="{height: `${windowHeight}px`}"></view>
```
- 单文件组件中, 需要统一每个页面的风格(如顶部导航, 滚动样式等), 这里的统一是为了符合小程序和多端的一致性,并不影响实际逻辑代码
```typescript
const navBarTop = ref(30) // 内边距高度，单位px
const navBarHeight = ref(70) // navbar的高度，单位px

onMounted(() => {
  // #ifdef MP-WEIXIN
  // 编译成小程序需要页面顶部和微信小程序菜单栏对齐
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  navBarTop.value = menuButtonInfo.top
  navBarHeight.value = menuButtonInfo.height
  // #endif
})
```

##### (202.09.23 更新)
> ** 注意:~~通常在小程序里,页面都需要顶部导航组件~~  现已经封装成组件,根据参数动态显示顶部导航, 使用样例参考 `/pages/qa.vue`

#### 页面跳转常用几种方式
- `uni.relanuch({ url: '/pages/xxx'})` 重新加载一个页面, ~~不可回退~~(不可回退仅app效果, 小程序无效 )
- `uni.navigateTo({ url: '/pages/xxx'})` 路由到一个新页面, 可以回退

#### 国际化
- 国际化资源目录, 请参考文档中的目录结构介绍
- 使用案例
```vue
/*ts中使用*/
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const text: string = t('translate.key')

// template中使用
<!--正常使用-->
<label>
{{ $t('translate.key') }}
</label>

<!-- 带参数的用法 -->
<label>
{{ $t('translate.key',[params...]) }}
</label>
```

### 注意点:
- 组件生命周期函数, 参考uniapp文档: [vue3页面及组件生命周期](https://zh.uniapp.dcloud.io/tutorial/page.html#vue3-lifecycle-flow)
- 使用图标时, 如需动态加载图标库, 需要先定义. 参考 `unocss-icon.ts`,  see: https://github.com/unocss/unocss/issues/829
- 默认 font-size 为 16px，即 1rem = 16px，也就是说 Unocss 的1单位换算成 px 就是 4px , e.g: `[w-1] = 0.25rem = 4px`
- setup 语法糖的问题, @vue/runtime-core 和 vue的区别
  - 俩者import的写法不一一样, runtime:`import { ref } from 'vue@runtime-core'`  vue: `import { ref } from 'vue'`
  - runtime-core适用开发一个自定义的 Vue 生态工具或库, 否则适用vue即可

- 背景图不支持本地图片, 使用网络图片, 用云存储或者自建静态服务器cdn

### 样式兼容性
- 小程序不能使用伪类的样式, 此问题是小程序的和uniapp 无关
- 设置小程序局部样式穿透, 原始情况是父子组件样式是隔离的, 每个组件只受自己的wxss文件的影响, 设置穿透后, 父组件指定样式可以影响子组件
```vue
<!-- 允许样式穿透 -->
<script lang="ts">
export default {
  options: { styleIsolation: 'shared' },
}
</script>
```
- 不管是vue事件还是自定义事件请尽量不要设置在子组件名字标签上\, 

## 开发参考
- [基于京东的ui库:wot-ui](https://wot-design-uni.cn/)
- [unocss规则参考](https://unocss.dev/interactive/)
- [unocss运行演示](https://unocss.antfu.me/play/)
- [tailwind样式参考库](https://tailwindcss.com/)
- [字体图标库](https://icones.js.org/collection/carbon?s=home&icon=carbon:home)
- [正则库](https://regex101.com/)
- [webstorm插件不生效的问题](https://youtrack.jetbrains.com/issue/WEB-67807/Vue-Language-Service-always-terminated-even-after-restarting-it)
- [Web开发手册](https://developer.mozilla.org/zh-CN/docs/Web)
