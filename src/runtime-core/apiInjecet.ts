import { getCurrentInstance } from "./component"


export const provide = (key, value) => {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let provides = currentInstance.providers
        if (currentInstance.parent) {
            const parentProvies = currentInstance.parent.providers
            // 如果自己的 provides 和 parent.provides，那么就证明是初始化阶段
            if (provides === parentProvies) {
                // 此时将 provides 的原型链设置为 parent.provides
                // 这样我们在设置的时候就不会污染到 parent.provides
                // 在读取的时候因为原型链的特性，我们也能读取到 parent.provides
                provides = currentInstance.providers = Object.create(parentProvies)
            }
        }
        provides[key] = value
    }
}

export const inject = (key, defaultValue) => {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const { parent } = currentInstance
        if (key in parent.providers) {
            return parent.providers[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}