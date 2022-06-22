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

function processElement(vnode: any, container: any) {
    mountElement(vnode, container) 
}

function mountElement(vnode: any, container: any) {
   const el =  document.createElement(vnode.type)
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