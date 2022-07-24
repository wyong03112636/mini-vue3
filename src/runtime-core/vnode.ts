import { ShapFlags } from "./shapFlags"

export const Fragment = Symbol('Fragment')

export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapFlag: getShapFlag(type)
    }
    // 或运算 赋值
    if (typeof children === 'string') {
        vnode.shapFlag |= ShapFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapFlag |= ShapFlags.ARRAY_CHILDREN
    }

    if (vnode.shapFlag & ShapFlags.STATEFUL_COMPONENT){
        if (typeof children === 'object') {
            vnode.shapFlag |= ShapFlags.SLOT_CHILDREN
        }
    }

    return vnode
}

function getShapFlag(type: any) {
    return typeof type === 'string' ? ShapFlags.ELEMENT : ShapFlags.STATEFUL_COMPONENT
}

export const createTextVNode = (text: String) => {
  return createVNode(Text, {}, text)
}