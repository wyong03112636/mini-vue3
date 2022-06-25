import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // 调用 path
    path(vnode, container)
}

function path(vnode, container) {
    const { type } = vnode
    if (typeof type === 'string') {
        processElement(vnode, container)
    } else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container)
    }
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container)
}
// 组件状态处理完之后，处理render函数返回
function setupRenderEffect(instance: any, initialVNode, container) {
    const { proxy } = instance
    // subTree是一个vnode虚拟节点
    const subTree = instance.render.call(proxy)
    path(subTree, container)
    // 执行完path之后 会把组件上的el挂载到subTree上， 此时的vnode为组件的vnode
    initialVNode.el = subTree.el
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container) 
}

function mountElement(vnode: any, container: any) {
   const el =  document.createElement(vnode.type)
   vnode.el = el
    const { children, props } = vnode

    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            el.setAttribute(key, val)
        }
    }

    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode, el)
    }
    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        path(v, container)
    })
}