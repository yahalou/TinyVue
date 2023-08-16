import { EMPTY_OBJ, hasChanged, isObject } from '@vue/shared'
import { isReactive } from 'packages/reactivity/src/reactive'
import { queuePreFlushCb } from './scheduler'
import { ReactiveEffect } from 'packages/reactivity/src/effect'

/**
 * watch 配置项属性
 */
export interface WatchOptions<Immediate = boolean> {
    immediate?: Immediate
    deep?: boolean
}

/**
 * 指定的 watch 函数
 * @param source 监听的响应性数据
 * @param cb 回调函数
 * @param options 配置对象
 * @returns
 */
export function watch(source, cb: Function, options?: WatchOptions) {
    return doWatch(source as any, cb, options)
}

function doWatch(
    source,
    cb: Function,
    { immediate, deep }: WatchOptions = EMPTY_OBJ
) {
    // 触发 getter 的指定函数
    let getter: () => any

    // 判断 source 的数据类型
    if (isReactive(source)) {
        // 指定 getter
        getter = () => source
        // 深度
        deep = true
    } else {
        getter = () => {}
    }

    // 存在回调函数和deep
    if (cb && deep) {
        const baseGetter = getter
        getter = () => traverse(baseGetter())
    }

    // 旧值
    let oldValue = {}
    // source 依赖收集 job
    const job = () => {
        if (cb) {
            const newValue = effect.run()
            // 因为reactive对象内部变化，但是hasChanged会返回false，所以deep必须为true
            if (deep || hasChanged(newValue, oldValue)) {
                cb(newValue, oldValue)
                oldValue = newValue
            }
        }
    }

    // 调度器
    let scheduler = () => queuePreFlushCb(job)

    const effect = new ReactiveEffect(getter, scheduler)

    if (cb) {
        if (immediate) {
            // 直接执行 cb
            job()
        } else {
            // 只获取值，不执行 cb
            oldValue = effect.run()
        }
    } else {
        effect.run()
    }

    return () => {
        effect.stop()
    }
}

/**
 * 依次执行 getter，从而触发依赖收集
 */
export function traverse(value: unknown) {
    if (!isObject(value)) {
        return value
    }

    for (const key in value as object) {
        // 依赖收集
        traverse((value as any)[key])
    }
    return value
}
