# 插值和指令的处理

## 插值

```html
<div>hello {{ msg }}</div>
```

compiler 结果

```js
function render(_ctx, _cache) {
    with (_ctx) {
        const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = _Vue;

        return _createElementVNode('div', [], [' hello ' + _toDisplayString(msg)]);
    }
}
```

其中

```js
export const toDisplayString = (val: unknown): string => {
    return String(val);
};
```

在调用 render 的过程中绑定响应式数据，这样就能找到 msg 了

```js
export function renderComponentRoot(instance) {
	const { vnode, render, data = {} } = instance

	let result
	try {
		// 解析到状态组件
		if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
			// 获取到 result 返回值，如果 render 中使用了 this，则需要修改 this 指向
            // 第二个data是with的_ctx
			result = normalizeVNode(render!.call(data, data))
		}
	} catch (err) {
		console.error(err)
	}

	return result
}
```

## 指令

```html
<div>
    hello world
    <h1 v-if="isShow">你好，世界</h1>
</div>
```

compile 结果

```js
function render(_ctx, _cache) {
    with (_ctx) {
        const { createElementVNode: _createElementVNode, createCommentVNode: _createCommentVNode } = _Vue;

        return _createElementVNode(
            'div',
            [],
            [
                ' hello world ',
                isShow ? _createElementVNode('h1', null, ['你好，世界']) : _createCommentVNode('v-if', true),
                ' ',
            ]
        );
    }
}
```
