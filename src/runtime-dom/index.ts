import { createRenderer } from "../runtime-core"


const createElement = (type) => {
    return document.createElement(type)
}

const isOn = (key: string) => /^on[A-Z]/.test(key)
const patchProp = (el, key, val) => {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
    } else {
        el.setAttribute(key, val)
    }
}

const insert = (el, container) => {
    container.append(el)
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export const createApp = (...args) => {
    return renderer.createApp(...args)
}

export * from '../runtime-core/index'