import { shallowReadonly } from "../reactivity/reactive"
import { proxyRefs } from "../reactivity/ref"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        providers: parent? parent.providers : {},
        parent,
        isMounted: false,
        subTree: {},
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
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit})
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
    
}
function handleSetupResult(instance, setupResult: any) {
    // todo: function 
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult) 
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
   const component = instance.type
   if (component.render) {
        instance.render = component.render
   }
}

let currentInstance = null;
export const getCurrentInstance = () => {
    return currentInstance
}

// 封装为一个函数后续方便调试，只需要在函数内部打一个断点就可以
const setCurrentInstance = (instance) => {
    currentInstance = instance
}