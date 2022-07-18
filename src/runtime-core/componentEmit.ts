import { camelize, handlerKey } from "../shared/index"

export const emit = (instance, event, ...args) => {
    const { props } = instance

    const handler = props[handlerKey(camelize(event))]
    handler && handler(...args)
}