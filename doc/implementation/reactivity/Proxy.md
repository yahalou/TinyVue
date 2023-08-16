# Proxy
## 什么是响应性
```js
let A0 = 1
let A1 = 2
let A2 = A0 + A1

console.log(A2) // 3

A0 = 2
console.log(A2) // 仍然是 3
```

当我们更改 A0 后，A2 不会自动更新。
那么我们如何在 JavaScript 中做到这一点呢？首先，为了能重新运行计算的代码来更新 A2，我们需要将其包装为一个函数：

```js
let A2

function update() {
  A2 = A0 + A1
}
```

然后，我们需要定义几个术语：

- 这个 update() 函数会产生一个副作用，或者就简称为作用 (effect)，因为它会更改程序里的状态。

- A0 和 A1 被视为这个作用的依赖 (dependency)，因为它们的值被用来执行这个作用。因此这次作用也可以说是一个它依赖的订阅者 (subscriber)。

那么如何做到在 A0 或 A1 (这两个依赖) 变化时自动调用 update() (产生作用)。

## Vue2的响应性实现
### Object.defineProperty
```js
let A0 = 1
let obj = {
  A0: A0,
  A1: 2
}
let A2
function update() {
  A2 = obj.A0 + obj.A1
}
Object.defineProperty(obj, 'A0', {
  get() {
    return A0
  },
  set(val) {
    A0 = val
    update()
  }
})

update()
console.log(A2) // 3

obj.A0 = 2
console.log(A2) // 4
```



1. `vue 2` 是以 `Object.defineProperty` 作为核心 `API` 实现的响应性
2. `Object.defineProperty` 只可以监听 **指定对象的指定属性的 getter 和 setter**
3. 被监听了 `getter` 和 `setter` 的属性，就被叫做 **该属性具备了响应性**



### 缺点
**必须要知道指定对象中存在该属性**，才可以为该属性指定响应性

所以

1. 当为 **对象** 新增一个没有在 `data` 中声明的属性时，新增的属性 **不是响应性** 的
2. 当为 **数组** 通过下标的形式新增一个元素时，新增的元素 **不是响应性** 的



## Vue3的响应性实现

```js
let A0 = 1
let obj = {
  A0: A0,
  A1: 2
}
let A2
function update() {
  A2 = obj.A0 + obj.A1
}

let objProxy = new Proxy(obj, {
  get(obj, key, reciever) {
    return obj[key]
  },
  set(obj, key, val, reciever) {
    obj[key] = val
    update()
    return true
  }
})

update()
console.log(A2) // 3

objProxy.A0 = 2
console.log(A2) // 4
```



### 和vue2的区别

1. `proxy`

   1. `Proxy` 将代理一个对象（被代理对象），得到一个新的对象（代理对象），同时拥有被代理对象中所有的属性。
   2. 当想要修改对象的指定属性时，我们应该使用 **代理对象** 进行修改
   3. **代理对象** 的任何一个属性都可以触发 `handler` 的 `getter` 和 `setter`

2. `Object.defineProperty`

   1. `Object.defineProperty` 为 **指定对象的指定属性** 设置 **属性描述符**
   2. 当想要修改对象的指定属性时，可以使用原对象进行修改
   3. 通过属性描述符，只有 **被监听** 的指定属性，才可以触发 `getter` 和 `setter`



所以当 `vue3` 通过 `Proxy` 实现响应性核心 `API` 之后，`vue` 将 **不会** 再存在新增属性时失去响应性的问题。（新增属性会出发proxy的set）

### Reflect

### 用法

`Reflect.get(target, propertyKey[, receiver])`

> 如果 target 对象中指定了 getter ，receiver 则为 getter 调用时的this值。

```js
  const p1 = {
    lastName: '张',
    firstName: '三',
    // 通过 get 标识符标记，可以让方法的调用像属性的调用一样
    get fullName() {
      return this.lastName + this.firstName
    }
  }

  const p2 = {
    lastName: '李',
    firstName: '四',
    // 通过 get 标识符标记，可以让方法的调用像属性的调用一样
    get fullName() {
      return this.lastName + this.firstName
    }
  }

  console.log(p1.fullName) // 张三
  console.log(Reflect.get(p1, 'fullName')) // 张三

  // 第三个参数 receiver 在对象指定了 getter 时表示为 this
  console.log(Reflect.get(p1, 'fullName', p2)) // 李四

```

### 为什么要这么做

```js
  const p1 = {
    lastName: '张',
    firstName: '三',
    // 通过 get 标识符标记，可以让方法的调用像属性的调用一样
    get fullName() {
      return this.lastName + this.firstName
    }
  }

  const proxy = new Proxy(p1, {
    // target：被代理对象
    // receiver：代理对象
    get(target, key, receiver) {
      console.log('触发了 getter');
      return target[key]
    }
  })

  console.log(proxy.fullName);

```

此时我们触发了 `proxy.fullName`，在这个 `fullName` 中又触发了 `this.lastName + this.firstName` 

**此时 `getter` 应该被触发 3 次！** ，但是 **实际只触发了 1 次！** 。

因为在 `this.lastName + this.firstName` 这个代码中，我们的 `this` 是 `p1` ，**而非 `proxy`** ！所以 `lastName` 和 `firstName` 的触发，不会再次触发 `getter`。



```js
  const p1 = {
    lastName: '张',
    firstName: '三',
    // 通过 get 标识符标记，可以让方法的调用像属性的调用一样
    get fullName() {
      return this.lastName + this.firstName
    }
  }

  const proxy = new Proxy(p1, {
    // target：被代理对象
    // receiver：代理对象
    get(target, key, receiver) {
      console.log('触发了 getter');
      return Reflect.get(target,key,receiver)
    }
  })

  console.log(proxy.fullName);// 此时会打印三次get
```



