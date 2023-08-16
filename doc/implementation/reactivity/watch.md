# watch函数

## 使用

`watch(source,cb,{immediate})`

目前只支持：

source为reactive对象或者ref，ref.value也必须是个对象

## 伪代码

```js
function traverse(value) {
    if (typeof value !== 'object') {
        return value
    }

    for (const key in value) {
        // 依赖收集
        traverse(value[key])
    }
    return value
}

function watch(source, cb, immediate) {
    let baseGetter = () => source
    let getter = () => traverse(baseGetter())

    let oldValue = {}

    // source依赖触发job
    // 1. 获取新值
    // 2. 执行cb
    const job = () => {
        activeEffect = effect
        const newValue = effect()
        if (typeof newValue === 'object' || oldValue !== newValue) {
            cb(newValue, oldValue)
            oldValue = newValue
        }
    }

    // 只要执行了getter，就收集了依赖
    const effect = getter
    // 由于有scheduler，依赖触发时会执行job
    effect.scheduler = job

    // 在这里面收集了依赖
    if (immediate) {
        // 获取值 + 执行cb
        job()
    } else {
        //  获取值
        activeEffect = effect
        oldValue = effect()
    }
}

let obj = reactive({
    A0: 1,
    A1: 2
})


watch(
    obj,
    (value, oldValue) => {
        console.log('watch 监听触发')
        console.log(value.A0)
    },
    true
)

obj.A0 = 2
```