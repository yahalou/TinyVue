# 实现思路
## 文件夹目录
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

## 项目构建
typescript + rollup

packages中每个文件夹为一个模块，入口文件为`packages/vue/src/index.ts`，最终被打包编译为 `./packages/vue/dist/vue.js`

## 使用说明

`packages/vue/examples`包含了 TinyVue 涉及到的所有功能

