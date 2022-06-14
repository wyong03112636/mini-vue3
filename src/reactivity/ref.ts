import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
    private _value: any
    public deps: any
    private rawValue: any
    private _V__isRef = true
    constructor(value) {
        // 需要处理value为object的情况
        this.rawValue = value
        this._value = convert(value)
        this.deps = new Set()
    }
    get value() {
        trackRef(this)
        return this._value
    }

    set value(newValue) {
        if (hasChanged(this.rawValue, newValue)) { 
            this.rawValue = newValue
            this._value = convert(newValue)
            triggerEffects(this.deps)
        }
    }
}

const trackRef = (ref) => {
    if (isTracking()) {
        trackEffects(ref.deps)
    }
}

const convert = (value) => {
    return isObject(value) ? reactive(value) : value
}

export const ref = (value) => {
    return new RefImpl(value)
}  

export const isRef = (ref) => {
    return !!ref._V__isRef
}

export const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref
}