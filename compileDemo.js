// parse 函数接收模板作为参数
function parse(str) {
    // 首先对模板进行标记化，得到 tokens
    const tokens = tokenize(str)
    // 创建 Root 根节点
    const root = {
        type: 'Root',
        children: []
    }
    // 创建 elementStack 栈，起初只有 Root 根节点
    const elementStack = [root]

    // 开启一个 while 循环扫描 tokens，直到所有 Token 都被扫描完毕为止
    while (tokens.length) {
        // 获取当前栈顶节点作为父节点 parent
        const parent = elementStack[elementStack.length - 1]
        // 当前扫描的 Token
        const t = tokens[0]
        switch (t.type) {
            case 'tag':
                // 如果当前 Token 是开始标签，则创建 Element 类型的 AST 节点
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children: []
                }
                // 将其添加到父级节点的 children 中
                parent.children.push(elementNode)
                // 将当前节点压入栈
                elementStack.push(elementNode)
                break
            case 'text':
                // 如果当前 Token 是文本，则创建 Text 类型的 AST 节点
                const textNode = {
                    type: 'Text',
                    content: t.content
                }
                // 将其添加到父节点的 children 中
                parent.children.push(textNode)
                break
            case 'tagEnd':
                // 遇到结束标签，将栈顶节点弹出
                elementStack.pop()
                break
        }
        // 消费已经扫描过的 token
        tokens.shift()
    }

    // 最后返回 AST
    return root
}

// 定义状态机的状态
const State = {
    initial: 1, // 初始状态
    tagOpen: 2, // 标签开始状态
    tagName: 3, // 标签名称状态
    text: 4, // 文本状态
    tagEnd: 5, // 结束标签状态
    tagEndName: 6 // 结束标签名称状态
}
// 一个辅助函数，用于判断是否是字母
function isAlpha(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}

// 接收模板字符串作为参数，并将模板切割为 Token 返回
function tokenize(str) {
    // 状态机的当前状态：初始状态
    let currentState = State.initial
    // 用于缓存字符
    const chars = []
    // 生成的 Token 会存储到 tokens 数组中，并作为函数的返回值返回
    const tokens = []
    // 使用 while 循环开启自动机，只要模板字符串没有被消费尽，自动机就会一直运行
    while (str) {
        // 查看第一个字符，注意，这里只是查看，没有消费该字符
        const char = str[0]
        // switch 语句匹配当前状态
        switch (currentState) {
            // 状态机当前处于初始状态
            case State.initial:
                // 遇到字符 <
                if (char === '<') {
                    // 1. 状态机切换到标签开始状态
                    currentState = State.tagOpen
                    // 2. 消费字符 <
                    str = str.slice(1)
                } else if (isAlpha(char)) {
                    // 1. 遇到字母，切换到文本状态
                    currentState = State.text
                    // 2. 将当前字母缓存到 chars 数组
                    chars.push(char)
                    // 3. 消费当前字符
                    str = str.slice(1)
                }
                break
            // 状态机当前处于标签开始状态
            case State.tagOpen:
                if (isAlpha(char)) {
                    // 1. 遇到字母，切换到标签名称状态
                    currentState = State.tagName
                    // 2. 将当前字符缓存到 chars 数组
                    chars.push(char)
                    // 3. 消费当前字符
                    str = str.slice(1)
                } else if (char === '/') {
                    // 1. 遇到字符 /，切换到结束标签状态
                    currentState = State.tagEnd
                    // 2. 消费字符 /
                    str = str.slice(1)
                }
                break
            // 状态机当前处于标签名称状态
            case State.tagName:
                if (isAlpha(char)) {
                    // 1. 遇到字母，由于当前处于标签名称状态，所以不需要切换状态，
                    // 但需要将当前字符缓存到 chars 数组
                    chars.push(char)
                    // 2. 消费当前字符
                    str = str.slice(1)
                } else if (char === '>') {
                    // 1.遇到字符 >，切换到初始状态
                    currentState = State.initial
                    // 2. 同时创建一个标签 Token，并添加到 tokens 数组中
                    // 注意，此时 chars 数组中缓存的字符就是标签名称
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    })
                    // 3. chars 数组的内容已经被消费，清空它
                    chars.length = 0
                    // 4. 同时消费当前字符 >
                    str = str.slice(1)
                }
                break
            // 状态机当前处于文本状态
            case State.text:
                if (isAlpha(char)) {
                    // 1. 遇到字母，保持状态不变，但应该将当前字符缓存到 chars 数组
                    chars.push(char)
                    // 2. 消费当前字符
                    str = str.slice(1)
                } else if (char === '<') {
                    // 1. 遇到字符 <，切换到标签开始状态
                    currentState = State.tagOpen
                    // 2. 从 文本状态 --> 标签开始状态，此时应该创建文本 Token，并添加到 tokens 数组
                    // 注意，此时 chars 数组中的字符就是文本内容
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    })
                    // 3. chars 数组的内容已经被消费，清空它
                    chars.length = 0
                    // 4. 消费当前字符
                    str = str.slice(1)
                }
                break
            // 状态机当前处于标签结束状态
            case State.tagEnd:
                if (isAlpha(char)) {
                    // 1. 遇到字母，切换到结束标签名称状态
                    currentState = State.tagEndName
                    // 2. 将当前字符缓存到 chars 数组
                    chars.push(char)
                    // 3. 消费当前字符
                    str = str.slice(1)
                }
                break
            // 状态机当前处于结束标签名称状态
            case State.tagEndName:
                if (isAlpha(char)) {
                    // 1. 遇到字母，不需要切换状态，但需要将当前字符缓存到 chars数组
                    chars.push(char)
                    // 2. 消费当前字符
                    str = str.slice(1)
                } else if (char === '>') {
                    // 1. 遇到字符 >，切换到初始状态
                    currentState = State.initial
                    // 2. 从 结束标签名称状态 --> 初始状态，应该保存结束标签名称Token
                    // 注意，此时 chars 数组中缓存的内容就是标签名称
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    })
                    // 3. chars 数组的内容已经被消费，清空它
                    chars.length = 0
                    // 4. 消费当前字符
                    str = str.slice(1)
                }
                break
        }
    }

    // 最后，返回 tokens
    return tokens
}

const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)

function transform(ast) {
    const context = {
        currentNode: null,
        parent: null,
        replaceNode(node) {
            context.currentNode = node
            context.parent.children[context.childIndex] = node
        },
        // 用于删除当前节点。
        removeNode() {
            if (context.parent) {
                // 调用数组的 splice 方法，根据当前节点的索引删除当前节点
                context.parent.children.splice(context.childIndex, 1)
                // 将 context.currentNode 置空
                context.currentNode = null
            }
        },
        nodeTransforms: [transformElement, transformText, transformRoot]
    }

    traverseNode(ast, context)
    // console.log(dump(ast))
}

function traverseNode(ast, context) {
    context.currentNode = ast
    // 1. 退出阶段的回调函数数组
    const exitFns = []
    // 进入阶段的回调函数数组
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        // 2. 转换函数可以返回另外一个函数，该函数即作为退出阶段的回调函数
        const onExit = transforms[i](context.currentNode, context)
        if (onExit) {
            // 将退出阶段的回调函数添加到 exitFns 数组中
            exitFns.push(onExit)
        }
        if (!context.currentNode) return
    }

    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode
            context.childIndex = i
            traverseNode(children[i], context)
        }
    }

    // 在节点处理的最后阶段执行缓存到 exitFns 中的回调函数
    // 注意，这里我们要反序执行
    let i = exitFns.length
    while (i--) {
        exitFns[i]()
    }
}
// 转换文本节点
function transformText(node) {
    // 如果不是文本节点，则什么都不做
    if (node.type !== 'Text') {
        return
    }
    // 文本节点对应的 JavaScript AST 节点其实就是一个字符串字面量，
    // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
    // 最后将文本节点对应的 JavaScript AST 节点添加到 node.jsNode 属性下
    node.jsNode = createStringLiteral(node.content)
}

// 转换标签节点
function transformElement(node) {
    // 将转换代码编写在退出阶段的回调函数中，
    // 这样可以保证该标签节点的子节点全部被处理完毕
    return () => {
        // 如果被转换的节点不是元素节点，则什么都不做
        if (node.type !== 'Element') {
            return
        }

        // 1. 创建 h 函数调用语句,
        // h 函数调用的第一个参数是标签名称，因此我们以 node.tag 来创建一个字符串字面量节点
        // 作为第一个参数
        const callExp = createCallExpression('h', [
            createStringLiteral(node.tag)
        ])
        // 2. 处理 h 函数调用的参数
        node.children.length === 1
            ? // 如果当前标签节点只有一个子节点，则直接使用子节点的 jsNode 作为参数
              callExp.arguments.push(node.children[0].jsNode)
            : // 如果当前标签节点有多个子节点，则创建一个 ArrayExpression 节点作为参数
              callExp.arguments.push(
                  // 数组的每个元素都是子节点的 jsNode
                  createArrayExpression(node.children.map(c => c.jsNode))
              )
        // 3. 将当前标签节点对应的 JavaScript AST 添加到 jsNode 属性下
        node.jsNode = callExp
    }
}

// 转换 Root 根节点
function transformRoot(node) {
    // 将逻辑编写在退出阶段的回调函数中，保证子节点全部被处理完毕
    return () => {
        // 如果不是根节点，则什么都不做
        if (node.type !== 'Root') {
            return
        }
        // node 是根节点，根节点的第一个子节点就是模板的根节点，
        // 当然，这里我们暂时不考虑模板存在多个根节点的情况
        const vnodeJSAST = node.children[0].jsNode
        // 创建 render 函数的声明语句节点，将 vnodeJSAST 作为 render 函数体的返回语句
        node.jsNode = {
            type: 'FunctionDecl',
            id: { type: 'Identifier', name: 'render' },
            params: [],
            body: [
                {
                    type: 'ReturnStatement',
                    return: vnodeJSAST
                }
            ]
        }
    }
}

// 用来创建 StringLiteral 节点
function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value
    }
}
// 用来创建 Identifier 节点
function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}
// 用来创建 ArrayExpression 节点
function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}
// 用来创建 CallExpression 节点
function createCallExpression(callee, arguments) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments
    }
}

function generate(node) {
    const context = {
        code: '',
        push(code) {
            context.code += code
        },
        // 当前缩进的级别，初始值为 0，即没有缩进
        currentIndent: 0,
        // 该函数用来换行，即在代码字符串的后面追加 \n 字符，
        // 另外，换行时应该保留缩进，所以我们还要追加 currentIndent * 2 个空格字符
        newline() {
            context.code += '\n' + ` `.repeat(context.currentIndent)
        },
        // 用来缩进，即让 currentIndent 自增后，调用换行函数
        indent() {
            context.currentIndent++
            context.newline()
        },
        // 取消缩进，即让 currentIndent 自减后，调用换行函数
        deIndent() {
            context.currentIndent--
            context.newline()
        }
    }

    genNode(node, context)

    return context.code
}

function genNode(node, context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDecl(node, context)
            break
        case 'ReturnStatement':
            genReturnStatement(node, context)
            break
        case 'CallExpression':
            genCallExpression(node, context)
            break
        case 'StringLiteral':
            genStringLiteral(node, context)
            break
        case 'ArrayExpression':
            genArrayExpression(node, context)
            break
    }
}

function genFunctionDecl(node, context) {
    // 从 context 对象中取出工具函数
    const { push, indent, deIndent } = context
    // node.id 是一个标识符，用来描述函数的名称，即 node.id.name
    push(`function ${node.id.name} `)
    push(`(`)
    // 调用 genNodeList 为函数的参数生成代码
    genNodeList(node.params, context)
    push(`) `)
    push(`{`)
    // 缩进
    indent()
    // 为函数体生成代码，这里递归地调用了 genNode 函数
    node.body.forEach(n => genNode(n, context))
    // 取消缩进
    deIndent()
    push(`}`)
}

function genNodeList(nodes, context) {
    const { push } = context
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        genNode(node, context)
        if (i < nodes.length - 1) {
            push(', ')
        }
    }
}

function genArrayExpression(node, context) {
    const { push } = context
    // 追加方括号
    push('[')
    // 调用 genNodeList 为数组元素生成代码
    genNodeList(node.elements, context)
    // 补全方括号
    push(']')
}

function genReturnStatement(node, context) {
    const { push } = context
    // 追加 return 关键字和空格
    push(`return `)
    // 调用 genNode 函数递归地生成返回值代码
    genNode(node.return, context)
}

function genStringLiteral(node, context) {
    const { push } = context
    // 对于字符串字面量，只需要追加与 node.value 对应的字符串即可
    push(`'${node.value}'`)
}

function genCallExpression(node, context) {
    const { push } = context
    // 取得被调用函数名称和参数列表
    const { callee, arguments: args } = node
    // 生成函数调用代码
    push(`${callee.name}(`)
    // 调用 genNodeList 生成参数代码
    genNodeList(args, context)
    // 补全括号
    push(`)`)
}

transform(ast)
const code = generate(ast.jsNode)

console.log(code)
