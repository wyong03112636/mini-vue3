
import { isObject, extend } from '../shared/index'
import { track, trigger } from './effect'
import { reactive, ReactiveFlag, readonly } from './reactive'


const createGetter = (isReadonly = false, isShallow = false) => (target, key) => {
    if (key === ReactiveFlag.Is_Reactive) {
        return !isReadonly
    } else if (key === ReactiveFlag.Is_Readonly) {
        return isReadonly
    }
    const res = Reflect.get(target, key)

    if (isShallow) {
        return res
    }

    // 依赖收集
    if (!isReadonly) {
        track(target, key)
    }

    if (isObject(res)) {
        return  isReadonly ? readonly(res) : reactive(res)
    }

    return res
}

const createSetter = () => (target, key, value) => {
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
}

const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key} can't set`)
        return true
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})