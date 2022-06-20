import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 调用 path
    path(vnode, container)
}

function path(vnode, container) {
    // 处理组件
    processComponent(vnode, container)
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode)
    setupComponent(instance)

    setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: any, container) {
    const subTree = instance.render()

    path(subTree, container)
}

