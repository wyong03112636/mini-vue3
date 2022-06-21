export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    }
    return component
}

export function setupComponent(instance) {
    // todo
    // initProps()

    setupStatefulComponent(instance)
}
 // 处理组件状态
function setupStatefulComponent(instance: any) {
    const component = instance.type

    const { setup } = component

    if (setup) {
        const setupResult = setup()

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

