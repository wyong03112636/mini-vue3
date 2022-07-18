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
        },
        [h('p', {class: 'red'}, 'hi'), h(Foo, {onAdd() {
            console.log('onAdd')
        }, 
            onAddFoo(a, b) {
                console.log(a, b)
            }
        })]
        )
    },
    setup() {
        return {
            msg: 'mini-vue aaa'
        }
    }
}