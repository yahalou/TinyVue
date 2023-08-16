# HTML Attributes 与 DOM Properties

:::TIP

**HTML Attributes的作用是设置与之对应的 DOM Pr operties 的初始值**

:::

## 二者含义

给出如下 HTML 代码：

```html
<input id="my-input" type="text" value="foo" />
```

**HTML Attributes 指的就是定义在 HTML 标签上的属性，这里指的就是 id="my-input"、type="text" 和 value="foo"。**



当浏览器解析这段 HTML 代码后，会创建一个与之相符的 DOM 元素对象，我们可以通过 JavaScript 代码来读取该 DOM 对象

```js
const el = document.querySelector('#my-input')
```

**这个 DOM 对象会包含很多属性（properties）,  就是所谓的 DOM Properties**

## 区别一：DOM Properties 与 HTML Attributes 不是一一对应的

1. 有的名字不一样

```js
<div class="foo"></div>

el.className === 'foo'
```

2. 有的 HTML Attributes 就没有与之对应的 DOM Properties。

```js
<div aria-valuenow="75"></div>
```

aria-* 类的 HTML Attributes 就没有与之对应的 DOM Properties。

3. 不是所有 DOM Properties 都有与之对应的 HTML Attributes

例如可以用 el.textContent 来设置元素的文本内容，但并没有与之对应的 HTML Attributes 来完成同样的工作。

## 区别二：值不一样

```html
<input value="foo" />
```

这是一个具有 value 属性的 input 标签。如果用户没有修改文本框的内容，那么通过 el.value 读取对应的 DOM Properties 的值就是字符串 'foo'。而如果用户修改了文本框的值，那么 el.value 的值就是当前文本框的值。例如，用户将文本框的内容修改为 'bar'，那么：

```js
console.log(el.value) // 'bar'
console.log(el.getAttribute('value')) // 仍然是 'foo'
el.defaultValue // 'foo'
```

## 区别三：有些 DOM Properties为只读，只能通过 HTML Attributes去修改

```html
<form id="form1"></form>
<input form="form1" />
```

在这段代码中，我们为 <input/> 标签设置了 form 属性（HTML Attributes）。它对应的 DOM Properties 是 el.form，但 el.form 是只读的，因此我们只能够通过 setAttribute 函数来设置它

## 区别四：性能不同

对于设置 class 而言，DOM Properties的性能更好

```js
<body>
  <div id="app"></div>
  <div id="app2"></div>
</body>

<script>
  const divEle1 = document.querySelector('#app')
  const divEle2 = document.querySelector('#app2')

  console.time('classname')
  for (let i = 0; i < 10000; i++) {
    divEle1.className = 'test-2'
  }
  console.timeEnd('classname')

  console.time('attr')
  for (let i = 0; i < 10000; i++) {
    divEle2.setAttribute('class', 'test')
  }
  console.timeEnd('attr')
</script>

classname: 1.7470703125 ms
attr: 3.389892578125 ms

```



## 总结

1. `HTML Attributes 和 DOM Properties`：我们知道想要成功的进行各种属性的设置，那么需要 **针对不同属性，通过不同方式** 完成
2. `className` 和 `setAttribute('class', '')` ：因为 `className` 的性能更高，所以我们应该尽量使用 `className` 进行指定。