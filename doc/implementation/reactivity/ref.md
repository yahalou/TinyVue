# ref函数

## 伪代码

如果ref传入一个object，需明确不同的操作需要会触发什么

```js
// 前面省略reactive部分的伪代码

function effect(fn) {
    activeEffect = fn
    fn()
    activeEffect = null
}

class ref {
    constructor(rawValue) {
        // 自己维护一个记录表，但和reactive不同的是不需要记录了哪个对象的哪个key对应着哪个函数
        // 只需要记录依赖自己value的函数，只要自己的value变了，就全部执行
        this.dep = new Set()
        this._value =
            typeof rawValue === 'object' ? reactive(rawValue) : rawValue
    }

    get value() {
        if (activeEffect) this.dep.add(activeEffect)
        return this._value
    }

    set value(newValue) {
        if (this._value !== newValue) {
            this._value = newValue
            const effectArray = [...this.dep]
            effectArray.forEach(fn => {
                fn()
            })
        }
    }
}

```

情况一：传入的是对象，会转为reactive对象

```js
let obj = new ref({
    A0: 1,
    A1: 2
})
let A3

effect(() => {
    // 触发 ref.get value()，reactive.get()
    A3 = obj.value.A0 + obj.value.A1
})

// 此时obj.dep里存着[fn]
// reactive.targetMap里存着[obj.value,['A0':fn,'A1':fn]]

console.log(A3) //3

// 不会触发 ref.set value()!!!
// 只会触发 ref.get value()，reactive.set()
// 所以执行reactive.targetMap里的fn
obj.value.A0 = 2
console.log(A3) // 4

// 这个才会触发 ref.set value()
//	所以执行obj.dep里的fn
obj.value = { A0: 2, A1: 3 }
console.log(A3)	// 5
```

情况二：传入的是普通类型

```js
let x = new ref(0)
let y

effect(() => {
    y = x.value + 1
})

// 此时x.dep=[fn]

console.log(y)  // 1

// 触发x.set value(),执行x.dep里的函数
x.value = 1

console.log(y)  // 2 
```



## 和reactive的区别

`ref` 函数本质上是生成了一个 `RefImpl` 类型的实例对象



- 对于普通数据类型：

`vue` 通过 `get value()` 和 `set value（）` 定义了两个属性函数，通过 **主动** 触发这两个函数（属性调用）的形式来进行 **依赖收集** 和 **触发依赖**

**所以我们必须通过 `.value` 来保证响应性。**



- 对于复杂数据类型：

本质是利用 `reactive` 函数，但想要访问 `ref` 的真实数据，需要通过 `.value`