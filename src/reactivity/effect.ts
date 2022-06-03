class ReactiveEffect {
    private _fn: any
    constructor(fn) {
        this._fn = fn
    }

    run() {
        activeFn = this
        return this._fn()
    }
}

let activeFn
export const effect = (fn) => {
    const effect = new ReactiveEffect(fn)
    effect.run()
    return effect.run.bind(effect)
}

const targetMap = new Map()
// 依赖收集
export const track = (target, key) => {
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

 depSet.add(activeFn)

}

// 触发依赖
export const trigger = (target, key) => {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    deps.forEach(dep => {
        dep.run()
    });
}

