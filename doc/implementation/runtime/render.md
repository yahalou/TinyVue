# render函数

## runtime-core 与 runtime-dom 的关系

在 `vue` 源码中，关于运行时的包主要有两个：

1. `packages/runtime-core`：运行时的核心代码
2. `packages/runtime-dom`：运行时关于浏览器渲染的代码



我们知道 `vue` 的渲染主要分为两种：

1. `SPA`： 单页应用。即：浏览器显然
2. `SSR`：服务端渲染

即：`Vue` 中需要处理两种不同 **宿主环境** ，将来还有可能会处理更多，比如 `windows 、android、ios应用程序` 等等。 在这些不同的宿主环境中，渲染 `DOM` 的方式是 **完全不同** 的。

所以 `vue` 就对运行时进行了处理，把所有的 **浏览器 `dom` 操作**，放到了 `runtime-dom` 中，而把整个运行时的 **核心代码** 都放入到了 `runtime-core` 之中。



`runtime-dom` 把 `DOM` 操作传递给了 `renderer` 渲染器 ，已达到 **不同的宿主环境，可以使用不同的 `API` 的目的**

```js
// runtime-dom/src/index
import { createRenderer } from '@vue/runtime-core'
import { extend } from '@vue/shared'

// 这是浏览器环境下的DOM操作
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer

function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
    ensureRenderer().render(...args)
}
```

## 挂载和卸载

### 挂载

- 传递给 patch 函数的第一个参数是 null。因为是挂载阶段，没有旧 vnode，所以只需要传递 null 即可。这样，当 patch 函数执行时，就会递归地调用 mountElement 函数完成挂载。
- 传递给 patch 函数的第三个参数是挂载点。由于我们正在挂载的子元素是 div 标签的子节点，所以**需要把刚刚创建的 div 元素作为挂载点，这样才能保证这些子节点挂载到正确位置。**
-  [HTML Attributes 与 DOM Properties 的区别](./Attributes&Properties.md)

```js
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    // 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
    patchProps(el, key, prevValue, nextValue) {
        if (shouldSetAsProps(el, key, nextValue)) {
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    }
})

function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => {
            patch(null, child, el)
        })
    }

    if (vnode.props) {
        for (const key in vnode.props) {
            // 调用 patchProps 函数即可
            patchProps(el, key, null, vnode.props[key])
        }
    }

    insert(el, container)
}

```



### 卸载

直接通过 innerHTML 清空容器。但这么做是不严谨的，原因有三点：

- 容器的内容可能是由某个或多个组件渲染的，当卸载操作发生时，应该正确地调用这些组件的 beforeUnmount、unmounted等生命周期函数。

- 即使内容不是由组件渲染的，有的元素存在自定义指令，我们应该在卸载操作发生时正确执行对应的指令钩子函数。

- 使用 innerHTML 清空容器元素内容的另一个缺陷是，它不会移除绑定在 DOM 元素上的事件处理函数。



正确的卸载方式是，根据 vnode 对象获取与其相关联的真实DOM 元素，然后使用原生 DOM 操作方法将该 DOM 元素移除。

## 更新

#### 更新类型

类型不同，先删除、后卸载

```js
function patch(n1, n2, container) {
    // 如果 n1 存在，则对比 n1 和 n2 的类型
    if (n1 && n1.type !== n2.type) {
        // 如果新旧 vnode 的类型不同，则直接将旧 vnode 卸载
        unmount(n1)
        n1 = null
    }

    if (!n1) {
        mountElement(n2, container)
    } else {
        // 更新
    }
}
```

#### 更新props

先添加新props，再删除老props

```js
   /**
     * 为 props 打补丁
     */
    const patchProps = (el: Element, vnode, oldProps, newProps) => {
        // 新旧 props 不相同时才进行处理
        if (oldProps !== newProps) {
            // 遍历新的 props，依次触发 hostPatchProp ，赋值新属性
            for (const key in newProps) {
                const next = newProps[key]
                const prev = oldProps[key]
                if (next !== prev) {
                    hostPatchProp(el, key, prev, next)
                }
            }
            // 存在旧的 props 时
            if (oldProps !== EMPTY_OBJ) {
                // 遍历旧的 props，依次触发 hostPatchProp ，删除不存在于新props 中的旧属性
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

```

### 更新事件：vue event invokers

vue event invokers，简称：`vei`

```js
function patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      // 定义 el._vei 为一个对象，存在事件名称到事件处理函数的映射
        const invokers = el._vei || (el._vei = {})
        //根据事件名称获取 invoker
        let invoker = invokers[key]
        const name = key.slice(2).toLowerCase()
        if (nextValue) {
            if (!invoker) {
              // 将事件处理函数缓存到 el._vei[key] 下，避免覆盖
                invoker = el._vei[key] = e => {
                    // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        // 否则直接作为函数调用
                        invoker.value(e)
                    }
                }
                invoker.value = nextValue
                el.addEventListener(name, invoker)
            } else {
                invoker.value = nextValue
            }
        } else if (invoker) {
            el.removeEventListener(name, invoker)
        }
    } else if (key === 'class') {
        // 省略部分代码
    } else if (shouldSetAsProps(el, key, nextValue)) {
        // 省略部分代码
    } else {
        // 省略部分代码
    }
}

```



vei 的作用：

> 如果一个 `button` 最初的 `click` 事件，点击之后打印 `hello`
>
> 两秒之后，更新打印 `你好`

那么这样的一个更新操作，如果让我们通过 `el.addEventListener` 和 `el.removeEventListener` 来实现

```js
<script>
  const btnEle = document.querySelector('button')
  // 设置初始点击行为
  const invoker = () => {
    alert('hello')
  }
  btnEle.addEventListener('click', invoker)

  // 两秒之后，更新点击事件
  setTimeout(() => {
    // 先删除
    btnEle.removeEventListener('click', invoker)
    // 再添加
    btnEle.addEventListener('click', () => {
      alert('你好')
    })
  }, 2000);

</script>
```

但是我们知道如果频繁的删除、新增事件是非常消耗性能的，那么有没有更好的方案呢？

肯定是有的，这个方案就是 `vei`，我们来看下面这段代码：

```js
<script>
  const btnEle = document.querySelector('button')
  // 设置初始点击行为
  const invoker = () => {
    invoker.value()
  }
  // 为 invoker 指定了 value 属性，对应的值是《事件点击行为》
  invoker.value = () => {
    alert('hello')
  }
  // 把 invoker 作为回调函数，invoker 内部通过触发 value，来触发真正的点击行为
  btnEle.addEventListener('click', invoker)

  // 两秒之后更新
  setTimeout(() => {
    // 因为真正的事件点击行为其实是 invoker.value，所以我们想要更新事件，就不需要再次触发 addEventListener API 了，只需要修改 invoker.value 的值即可。
    invoker.value = () => {
      alert('你好')
    }
  }, 2000);
</script>

```

至于 `invokers` 则充当了一个事件缓存器，把所有的事件：**以事件名为 `key`，以事件行为为 `value` 。保存到 `el._vei` 中**。

### 更新子节点

见[diff](./diff.md)
