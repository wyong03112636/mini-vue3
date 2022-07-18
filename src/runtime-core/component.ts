import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => {}
    }
    component.emit = emit.bind(null, component) as any
    return component
}

export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}
 // 处理组件状态
function setupStatefulComponent(instance: any) {
    const component = instance.type
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers)
    const { setup } = component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit})
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

