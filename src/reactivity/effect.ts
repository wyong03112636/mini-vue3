import { extend } from '../shared'
let activeFn; // 当前effect实例
let shouldTrack // 是否应该依赖收集
class ReactiveEffect {
    private _fn: any
    deps = [] // Array<Set>
    active = true // stop方法加锁
    onStop?: () => void // 调用stop方法后的回调
    constructor(fn, public schedular?) {
        this._fn = fn
    }

    run() {
        if (!this.active) {
            // 说明调用过stop方法
            return this._fn()
        }
        shouldTrack = true
        activeFn = this
        const result = this._fn() // 执行this._fn会触发 依赖收集track函数执行
        shouldTrack = false
        return result
    }
    // 停止触发副作用函数
    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

const cleanupEffect = (effect) => {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

export const effect = (fn, options: any = {}) => {
    const effect = new ReactiveEffect(fn, options.scheduler)
    effect.run()
    // options
    extend(effect, options)

    const runner: any = effect.run.bind(effect)
    runner.effect = effect

    return runner
}

export const stop = (runner) => {
    runner.effect.stop()
}


const targetMap = new WeakMap()
// 依赖收集
export const track = (target, key) => {
    if (!isTracking()) return

    // target => key => dep
    let keyMap = targetMap.get(target)
    if (!keyMap) {
        keyMap = new Map()
        targetMap.set(target, keyMap)
    }

    let depSet = keyMap.get(key)
    if (!depSet) {
        depSet = new Set()
        keyMap.set(key, depSet)
    }

    if (depSet.has(activeFn)) return

    depSet.add(activeFn)
    activeFn.deps.push(depSet)
}

// 是否可以收集依赖
const isTracking = () => {
    return shouldTrack && activeFn !== undefined
}

// 触发依赖
export const trigger = (target, key) => {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    deps.forEach(dep => { // dep  为 effect实例
        if (dep.schedular) {
            dep.schedular()
        } else {
            dep.run()
        }
    });
}

