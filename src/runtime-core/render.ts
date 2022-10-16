import { effect } from "../reactivity/effect"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { ShapFlags } from "./shapFlags"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options


    function render(vnode, container, parentComponent) {
        // 调用 path
        path(null, vnode, container, parentComponent)
    }
    // n1 => 老的虚拟节点
    // n2 => 新的虚拟节点

    function path(n1, n2, container, parentComponent) {
        const { shapFlag, type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;

            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapFlag & ShapFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapFlag & ShapFlags.STATEFUL_COMPONENT) {
                    // 处理组件
                    processComponent(n1,n2, container, parentComponent)
                }
                break;
        }

    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }



    function mountComponent(initialVNode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)

        setupRenderEffect(instance, initialVNode, container)
    }
    // 组件状态处理完之后，处理render函数返回
    function setupRenderEffect(instance: any, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance
                // subTree是一个vnode虚拟节点
                const subTree = instance.render.call(proxy)
                instance.subTree = subTree
                path(null, subTree, container, instance)
                // 执行完path之后 会把组件上的el挂载到subTree上， 此时的vnode为组件的vnode
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // update
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                path(prevSubTree, subTree, container, instance)
            }


        })

    }

    function processElement(n1, n2: any, container: any, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }


    function patchElement(n1, n2, container) {
        console.log(n1, n2, container)
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
            path(null, v, container, parentComponent)
        })
    }

    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }
    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const text = (n2.el = document.createTextNode(children))
        container.append(text)
    }

    return {
        createApp: createAppAPI(render)
    }

}