import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'TinyVue Document',
    description: 'A VitePress Site',
    themeConfig: {
        sidebar: {
            '/example/': [
                {
                    text: '样例',
                    items: [
                        {
                            text: 'Markdown Examples',
                            link: '/example/markdown-examples'
                        },
                        {
                            text: 'Runtime API Examples',
                            link: '/example/api-examples'
                        }
                    ]
                }
            ],
            '/implementation/': [
                {
                    text: '实现',
                    items: [
                        {
                            text: '实现',
                            link: '/implementation/index'
                        }
                    ]
                },
                {
                    text: '响应式',
                    items: [
                        {
                            text: '响应式核心：Proxy',
                            link: '/implementation/reactivity/Proxy'
                        },
                        {
                            text: 'reactive函数',
                            link: '/implementation/reactivity/reactive'
                        },
                        {
                            text: 'ref函数',
                            link: '/implementation/reactivity/ref'
                        },
                        {
                            text: 'computed函数',
                            link: '/implementation/reactivity/computed'
                        },
                        {
                            text: 'watch函数',
                            link: '/implementation/reactivity/watch'
                        }
                    ]
                },
                {
                    text: '运行时',
                    items: [
                        {
                            text: '相关概念',
                            link: '/implementation/runtime/mechanism'
                        }
                    ]
                }
            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/yahalou/TinyVue' }
        ]
    },
    base: ''
})
