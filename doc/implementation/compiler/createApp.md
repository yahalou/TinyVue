# createApp

当我们构建一个 `vue 3` 实例时，可以这么做

```js
<script>
  const { createApp } = Vue
  
  const APP = {
    template: `<div>hello world</div>`
  }

  const app = createApp(APP)
  app.mount('#app')
</script>
```

## createAPP

```js
export const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args)

    // 获取到 mount 挂载方法
    const { mount } = app
    // 对该方法进行重构，标准化 container，在重新触发 mount 进行挂载
    app.mount = (containerOrSelector: Element | string) => {
        const container = normalizeContainer(containerOrSelector)
        if (!container) return
        mount(container)
    }

    return app
}
```

## template 渲染

如果组件没有render函数，就进行compile

```js{5-12}
export function finishComponentSetup(instance) {
    const Component = instance.type

    // 组件不存在 render 时，才需要重新赋值
    if (!instance.render) {
        // 存在编辑器，并且组件中不包含 render 函数，同时包含 template 模板，则直接使用编辑器进行编辑，得到 render 函数
        if (compile && !Component.render) {
            if (Component.template) {
                // 这里就是 runtime 模块和 compile 模块结合点
                const template = Component.template
                Component.render = compile(template)
            }
        }
        // 为 render 赋值
        instance.render = Component.render
    }

    // 获得相应式数据，同时改变 options 中的 this 指向
    applyOptions(instance)
}
```

