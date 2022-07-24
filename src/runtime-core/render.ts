import { createComponentInstance, setupComponent } from "./component"
import { ShapFlags } from "./shapFlags"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
    // 调用 path
    path(vnode, container)
}

function path(vnode, container) {
    const { shapFlag, type } = vnode
    switch (type) {
        case Fragment:
            processFragment(vnode, container)
            break;
    
        case Text:
            processText(vnode, container)
            break;
        default:
            if (shapFlag & ShapFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapFlag & ShapFlags.STATEFUL_COMPONENT) {
                // 处理组件
                processComponent(vnode, container)
            }
            break;
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

const isOn = (key: string) => /^on[A-Z]/.test(key)

function mountElement(vnode: any, container: any) {
   const el =  document.createElement(vnode.type)
   vnode.el = el
    const { children, props, shapFlag } = vnode

    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            if (isOn(key)) {
                const event = key.slice(2).toLowerCase()
                el.addEventListener(event, val)
            } else {
                el.setAttribute(key, val)
            }

        }
    }
    if (shapFlag & ShapFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapFlag & ShapFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }
    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        path(v, container)
    })
}

function processFragment(vnode, container) {
    mountChildren(vnode, container)
}
function processText(vnode: any, container: any) {
    const { children } = vnode
    const text = (vnode.el = document.createTextNode(children))
    container.append(text)
}

