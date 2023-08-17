# TinyVue

简易版本的 vue3 实践

## 文档

[tinyvue.pages.dev](https://tinyvue.pages.dev)

## 示例

[所有示例代码](packages/vue/examples)

## 使用

```
npm install
npm run build
```

产物为`packages/vue/dist/vue.js`

## 目录结构

```
TinyVue
├── doc
├── package-lock.json
├── package.json
├── compileDemo     编译器部分的简单实现
├── packages
│ ├── compiler-core 编译器核心模块
│ ├── compiler-dom  浏览器部分编辑器模块
│ ├── reactivity    响应性模块
│ ├── runtime-core  运行时核心模块
│ ├── runtime-dom   浏览器部分运行时模块
│ ├── shared        共享公共方法模块
│ └── vue           打包、测试实例、项目整体入口模块
├── rollup.config.js
└── tsconfig.json
```
