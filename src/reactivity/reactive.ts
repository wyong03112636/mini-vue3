
import { mutableHandlers, readonlyHandlers } from './baseHandlers'


const creteObjectActive = (raw, baseHandlers) => {
    return new Proxy(raw, baseHandlers)
}

export const reactive = (raw) => {
    return creteObjectActive(raw, mutableHandlers)
}

export const readonly = (raw) => {
    return creteObjectActive(raw, readonlyHandlers)
}
