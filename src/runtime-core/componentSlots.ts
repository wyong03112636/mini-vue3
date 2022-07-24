import { ShapFlags } from "./shapFlags"

export const initSlots = (instance, children) => {
    const {vnode} = instance
    if (vnode.shapFlag & ShapFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    } 
}

function normalizeObjectSlots (children: any, slots: any) {
    for (const key in children) {
        const value = children[key]
        slots[key] = (props) => normalizeSlotsValue(value(props))
    }
}

function normalizeSlotsValue(value: any): any {
    return Array.isArray(value) ? value : [value]
}
