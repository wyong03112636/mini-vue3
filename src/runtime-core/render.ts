import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { ShapFlags } from "./shapFlags"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options


    function render(vnode, container, parentComponent) {
        // 调用 path
        path(vnode, container, parentComponent)
    }

    function path(vnode, container, parentComponent) {
        const { shapFlag, type } = vnode
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;

            case Text:
                processText(vnode, container)
                break;
            default:
                if (shapFlag & ShapFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapFlag & ShapFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processComponent(vnode, container, parentComponent)
                }
                break;
        }

    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVNode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)

        setupRenderEffect(instance, initialVNode, container)
    }
    // 组件状态处理完之后，处理render函数返回
    function setupRenderEffect(instance: any, initialVNode, container) {
        const { proxy } = instance
        // subTree是一个vnode虚拟节点
        const subTree = instance.render.call(proxy)
        path(subTree, container, instance)
        // 执行完path之后 会把组件上的el挂载到subTree上， 此时的vnode为组件的vnode
        initialVNode.el = subTree.el
    }

    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }


    function mountElement(vnode: any, container: any, parentComponent) {
        const el = hostCreateElement(vnode.type)
        vnode.el = el
        const { children, props, shapFlag } = vnode

        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                const val = props[key];
                hostPatchProp(el, key, val)
            }
        }
        if (shapFlag & ShapFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapFlag & ShapFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }

        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            path(v, container, parentComponent)
        })
    }

    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }
    function processText(vnode: any, container: any) {
        const { children } = vnode
        const text = (vnode.el = document.createTextNode(children))
        container.append(text)
    }

    return {
        createApp: createAppAPI(render)
    }

}