import { render } from "./render"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换为vnode，后续操作基于vnode
            // component => vnode
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
}


