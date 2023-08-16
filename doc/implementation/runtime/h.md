# h函数

## vnode数据结构

### type

vnode存在很多种不同的节点类型

- **string：DOM 节点**

```js
const vnode1 = h('div', {
    class: 'test'
  }, 'hello render')

// vnode1
{
  	// 用于判断是否为vnode的标识
    "__v_isVNode": true,
    // 节点类型 	
    "type": "div",
    // 属性
    "props": {
        "class": "test"	
    },
    // 类型标识
    "shapeFlag": 9,
    // 子节点
    "children": "hello render"
}
```

- **object：组件**

```js
const component = {
    render() {
      const vnode1 = h('div', '这是一个 component')
      return vnode1
    }
  }
const vnode2 = h(component)

// vnode2
{
    "__v_isVNode": true,
    "type": { render: f },
    "shapeFlag": 4,
    "children": null
}
```

- **Text：文本节点**
- **Comment：注释节点**
- **Fragment：包含多个根节点的模板被表示为一个片段 (fragment)**

```js
const { h, render, Text, Comment, Fragment } = Vue
  const vnodeText = h(Text, '这是一个 Text')
  console.log(vnodeText);

  const vnodeComment = h(Comment, '这是一个 Comment')
  console.log(vnodeComment);

  const vnodeFragment = h(Fragment, '这是一个 Fragment')
  console.log(vnodeFragment);

// vnodeText
{
    "__v_isVNode": true,
    "props": null,
    "type": Symbol(Text),
    "shapeFlag": 8,
    "children": "这是一个 Text"
}

// vnodeComment
{
    "__v_isVNode": true,
    "props": null,
    "type": Symbol(Comment),
    "shapeFlag": 8,
    "children": "这是一个 Comment"
}

// vnodeFragment
{
    "__v_isVNode": true,
    "props": null,
     "type": Symbol(Fragment),
    "shapeFlag": 8,
    "children": "这是一个 Fragment"
}
```

### shapeFlag

类型标识包含两个信息：**自己和children的类型**

```js
export const enum ShapeFlags {
    /**
     * type = Element
     */
    ELEMENT = 1,
    /**
     * 函数组件
     */
    FUNCTIONAL_COMPONENT = 1 << 1,
    /**
     * 有状态（响应数据）组件
     */
    STATEFUL_COMPONENT = 1 << 2,
    /**
     * children = Text
     */
    TEXT_CHILDREN = 1 << 3,
    /**
     * children = Array
     */
    ARRAY_CHILDREN = 1 << 4,
    /**
     * children = slot
     */
    SLOTS_CHILDREN = 1 << 5,
    /**
     * 组件：有状态（响应数据）组件 | 函数组件
     */
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

```

比如 Element + TEXT_CHILDREN，那么 shapeFlag = ShapeFlags.ELEMENT | ShapeFlags.TEXT_CHILDREN



## 实现

h -> createVNode -> createBaseVNode

- h函数：**处理不同的参数**，统一后调用createVNode

```js
function h(type: any, propsOrChildren?: any, children?: any): VNode {
    // 获取用户传递的参数数量
    const l = arguments.length
    // 如果用户只传递了两个参数，那么证明第二个参数可能是 props , 也可能是 children
    if (l === 2) {
        // 如果 第二个参数是对象，但不是数组。则第二个参数只有两种可能性：1. VNode 2.普通的 props
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 如果是 VNode，则 第二个参数代表了 children
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            // 如果不是 VNode， 则第二个参数代表了 props
            return createVNode(type, propsOrChildren)
        }
        // 如果第二个参数不是单纯的 object，则 第二个参数代表了 props
        else {
            return createVNode(type, null, propsOrChildren)
        }
    }
    // 如果用户传递了三个或以上的参数，那么证明第二个参数一定代表了 props
    else {
        // 如果参数在三个以上，则从第二个参数开始，把后续所有参数都作为 children
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        }
        // 如果传递的参数只有三个，则 children 是单纯的 children
        else if (l === 3 && isVNode(children)) {
            children = [children]
        }
        // 触发 createVNode 方法，创建 VNode 实例
        return createVNode(type, propsOrChildren, children)
    }
}
```

- createVNode：参数固定，**生成一个 VNode 对象，并返回**

```js
/**
 * 生成一个 VNode 对象，并返回
 * @param type vnode.type string
 * @param props 标签属性或自定义属性 object
 * @param children 子节点 array
 * @returns vnode 对象
 */
export function createVNode(type, props, children?): VNode {
    // 通过 bit 位处理 shapeFlag 类型
    const shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT
        : isObject(type)
        ? ShapeFlags.STATEFUL_COMPONENT
        : 0

    if (props) {
        // 处理 class
        let { class: klass, style } = props
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass)
        }
    }

    return createBaseVNode(type, props, children, shapeFlag)
}
```

- createBaseVNode

```js
/**
 * 构建基础 vnode
 */
function createBaseVNode(type, props, children, shapeFlag) {
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        shapeFlag
    } as VNode

    // 根据children的类型修改vnode.shapeFlag
    normalizeChildren(vnode, children)

    return vnode
}
```

