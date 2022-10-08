
import { createVNode } from "./vnode"

export function createAppAPI(render) {
   return  function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换为vnode，后续操作基于vnode
                // component => vnode
                const vnode = createVNode(rootComponent)
    
                render(vnode, rootContainer, rootComponent)
            }
        }
    }
}
