const publicPropertiiesMap = {
    $el: i => i.vnode.el
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
        }

        const publicGetter = publicPropertiiesMap[key]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}