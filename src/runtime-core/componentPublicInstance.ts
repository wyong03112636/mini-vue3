import { hasOwn } from "../shared/index"

const publicPropertiiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        }

        const publicGetter = publicPropertiiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}