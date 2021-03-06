
import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

export enum ReactiveFlag {
    Is_Reactive = '__v_isReactive',
    Is_Readonly = '__V_isReadonly'
}

const creteObjectActive = (raw, baseHandlers) => {
    return new Proxy(raw, baseHandlers)
}

export const reactive = (raw) => {
    return creteObjectActive(raw, mutableHandlers)
}

export const readonly = (raw) => {
    return creteObjectActive(raw, readonlyHandlers)
}

export const shallowReadonly = (raw) => {
    return creteObjectActive(raw, shallowReadonlyHandlers)
}

export const isReactive = (value) => {
    return !!value[ReactiveFlag.Is_Reactive]
}

export const isReadonly = (value) => {
    return !!value[ReactiveFlag.Is_Readonly]
}

export const isProxy = (value) => {
    return isReactive(value) || isReadonly(value)
}