
import { track, trigger } from './effect'

const createGetter = (isReadonly = false) => (target, key) => {
    const res = Reflect.get(target, key)
    // 依赖收集
    if (!isReadonly) {
        track(target, key)
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