import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null;
export const App = {
    name: 'App',
    //.vue
    // render
    render() {

        window.self = this
        return h('div',{
            id: 'root',
            class: ['red', 'blue'],
            onClick() {
                console.log('click')
            },
            onMousedown() {
                console.log('mousedown')
            }
        },
        [h('p', {class: 'red'}, 'hi'), h(Foo, {count: 1})]
        // `hi ${this.msg}`
        )
    },
    setup() {
        return {
            msg: 'mini-vue aaa'
        }
    }
}