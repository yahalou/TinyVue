import { defineConfig } from 'vitepress';

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
                            link: '/example/markdown-examples',
                        },
                        {
                            text: 'Runtime API Examples',
                            link: '/example/api-examples',
                        },
                    ],
                },
            ],
            '/implementation/': [
                {
                    text: '实现',
                    items: [
                        {
                            text: '实现',
                            link: '/implementation/index',
                        },
                    ],
                },
                {
                    text: '响应式',
                    items: [
                        {
                            text: '响应式核心：Proxy',
                            link: '/implementation/reactivity/Proxy',
                        },
                        {
                            text: 'reactive函数',
                            link: '/implementation/reactivity/reactive',
                        },
                        {
                            text: 'ref函数',
                            link: '/implementation/reactivity/ref',
                        },
                        {
                            text: 'computed函数',
                            link: '/implementation/reactivity/computed',
                        },
                        {
                            text: 'watch函数',
                            link: '/implementation/reactivity/watch',
                        },
                    ],
                },
                {
                    text: '运行时',
                    items: [
                        {
                            text: '运行时核心',
                            link: '/implementation/runtime/mechanism',
                        },
                        {
                            text: 'h函数',
                            link: '/implementation/runtime/h',
                        },
                        {
                            text: 'render函数',
                            link: '/implementation/runtime/render',
                        },
                        {
                            text: '组件',
                            link: '/implementation/runtime/component',
                        },
                        {
                            text: 'diff算法',
                            link: '/implementation/runtime/diff',
                        },
                    ],
                },
                {
                    text: '编译时',
                    items: [
                        {
                            text: '编译时核心',
                            link: '/implementation/compiler/mechanism',
                        },
                        {
                            text: 'parse函数',
                            link: '/implementation/compiler/parse',
                        },
                        {
                            text: 'transform函数',
                            link: '/implementation/compiler/transform',
                        },
                        {
                            text: 'generate函数',
                            link: '/implementation/compiler/generate',
                        },
                        {
                            text: '插值和指令',
                            link: '/implementation/compiler/interpolation',
                        },
                        {
                            text: '运行时+编译时：createApp函数',
                            link: '/implementation/compiler/createApp',
                        },
                    ],
                },
            ],
        },
        socialLinks: [{ icon: 'github', link: 'https://github.com/yahalou/TinyVue' }],
    },
    base: '',
});
