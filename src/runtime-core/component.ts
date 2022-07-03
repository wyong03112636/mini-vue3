import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    }
    return component
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    setupStatefulComponent(instance)
}
 // 处理组件状态
function setupStatefulComponent(instance: any) {
    const component = instance.type
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers)
    const { setup } = component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props))
        handleSetupResult(instance, setupResult)
    }
    
}
function handleSetupResult(instance, setupResult: any) {
    // todo: function 
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
   const component = instance.type
   if (component.render) {
        instance.render = component.render
   }
}

