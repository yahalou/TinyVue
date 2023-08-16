---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "TinyVue Document"
  # text: "简易版本的vue3实践"
  tagline: 简易版本的vue3实践
  actions:
    - theme: brand
      text: 实现
      link: /implementation/index
    # - theme: alt
    #   text: API Examples
    #   link: /api-examples

features:
  - title: 响应性
    details: 使用 Proxy 创建响应式对象，通过依赖收集和依赖触发实现响应性，并实现了reactive、effect、ref、computed、watch 等核心函数
  - title: 运行时
    details: 封装浏览器API 操作，实现了ELEMENT、TEXT、COMMENT 这三种基本节点类型以及组件的挂载、更新、卸载逻辑；通过diff 算法高效的更新子节点
  - title: 编译器
    details: 完成了一个基础的编辑器，能处理文本、部分指令和响应式数据，关联运行时+ 编译器，直接实现模板的渲染
---

