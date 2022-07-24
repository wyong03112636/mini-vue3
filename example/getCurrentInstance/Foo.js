import { h, renderSlots, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: 'Foo',
    setup() {
        const instance = getCurrentInstance()
        console.log(instance)
    },
    render() {
        const age = 18;
        const foo = h('p', {}, 'foo')
        return h('div', {}, [renderSlots(this.$slots, 'header', {age}), foo, renderSlots(this.$slots, 'footer')])
    }
}