---
title: 使用vue3+vite+ts开发uniapp
categories: Develop
comments: true
keywords: vuejs, typescript, uniapp
tags:
  - uniapp
  - typescript
  - vue3
  - vite3
  - myproject
description: 从 vue3 + ts + pinia + vite3 迁移到 uniapp
created: 2024-01-02T10:00:31.050Z
modified: 2023-01-105T10:17:01.081Z
---

# 前期准备
- 使用官方`uni-perset-vue-vite-ts`脚手架或者`uni-vitesse`脚手架
- 使用node LTS 版本 16.20.0之后的版本
- 使用`vs-code`开发 下载相应扩展插件, `uni-help`、`uni-create-view`
- 依赖建议使用pnpm安装, 安装pnpm `npm install pnpm -g`, 后使用`pnpm install`命令
- 在`package.json`中添加项目所需的依赖
- 配置`vite.config.js`、`tsconfig.json` 
- 添加 store框架 `pinia` 相应的代码模块
- 添加 api 请求框架`axios`相应的代码模块
- 使用布局组件`@uni-helper/vite-plugin-uni-pages`, `@uni-helper/vite-plugin-uni-layouts`, 好处是不需要改造原始vue sfc组件的布局, 使用插槽模式嵌入已有组件作为页面
- 添加tailwindcss样式库, 小程序或app适配库, rem转换库 `@uni-helper/vite-plugin-uni-tailwind`、`tailwindcss-rem2px-preset`

# 项目整体结构
![](stranger-uni-01.png)
![](stranger-uni-02.png)
# 问题

## 开发环境问题
- pinia 运行出错 `xxxxx pinia export named 'hasInjectionContext'`
> 请使用固定版本2.0.x的 pinia版本 , 不要使用 `^2.0.x`开头,  目前 uniapp官方人员排查问题未知,  但web端环境则不会
- vs-code `import xxx`  依赖编译出错
> 使用 `command + shift + p` 打开配置使用设置, 输入typescript, 选择第二项,使用工作空间的typescript版本,  如果没有提示volar 工具, 则需要下载 `TypeScript Vue plugin(Volar)` 插件或者全家桶`Vue Volar extension Pack`
> 

## 配置问题
- 启动出现 `# [plugin:vite:vue] At least one <template> or <script> is required in a single file component.`
> vite.config.js中 去掉vue(), 这个是编译vuejs使用的

## 开发问题

### 样式兼容性
- tailwindcss 不生效, 分辨率单位适配问题
```JavaScript
// vite.config.js
import alias from "@rollup/plugin-alias"
import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from 'tailwindcss'
import uniTailwind from '@uni-helper/vite-plugin-uni-tailwind' // 适配小程序和app

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
  plugins: [
    alias(),
    uni(),
    uniTailwind()
  ]
})
```
- 去掉uniapp 顶部样式
- page页面无高度问题
```css
/**在App.vue 添加全局样式**/
uni-page-head {
	display: none;
}
uni-page, uni-page-body {
	height: 100%
}
::-webkit-scrollbar {
	width: 0;
	height: 0;
}
```
- 使用原生html标签导致 uni-button和tailwindcss样式冲突
```scss
/**
 * 针对重名html标签, 首先自定义类样式, 然后在需要重载的button组件页面添加该样式, 注意需要使用scoped 作用域
 */
<style scoped>
button {
  padding: 0 !important;
  background-color: transparent !important;
  border: none !important;
}
</style>
```
- 首屏页展示: 在pages中设置第一个页面的配置信息, 即首屏展示第一个页面
- 在设置图标中, 并不一定需要在button中设置插槽放入图标, 可以直接将图标放入div中, 设置`margin: 10px`即可
- 同级兄弟组件传递 可以使用 `uni.$on`和 `uni.$emit`进行传递事件数据

### 编译错误
- 提示`globalThis` 错误, 检查引入的组件是否有不兼容的写法, 使用排除法进行排查
- svg不支持在ios平台, window对象不支持
- uniapp不支持部分Vue3的Transition过渡动画, 会出现类似错误 `TypeError: undefined is not an object (evaluating 'i.classList.add') __ERROR`

### 真机调试和发布
- 申请个人开发者开发者账号, 付款-688¥/year
- 申请证书请求文件 -> 创建开发者证书 (iosDevelopment)-> 安装证书然后导出.p12文件-> 添加设备 -> 创建描述文件`.mobileprovision`
