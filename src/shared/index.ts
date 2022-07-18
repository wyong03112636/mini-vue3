export const extend = Object.assign

export const isObject = (obj) => {
    return obj !== null && typeof obj === 'object'
}

export const hasChanged = (value, newValue) => !Object.is(value, newValue)

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)

export const camelize = (str: String) => {
    return str.replace(/-(\w)/g, (_, c: String) => {
         return c ? c.toUpperCase(): ''
     })
 }

 const capitalize = (str: String) => {
     return str.charAt(0).toUpperCase() + str.slice(1)
 }

export const handlerKey = (str: String) => {
     return str ? `on${capitalize(str)}` : ''
 }