import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
    //.vue
    // render
    render() {
        return h('div',{
            id: 'root',
            class: ['red', 'blue']
        },
        [h('p', {class: 'red'}, 'hi'), h('p', {class: 'blue'}, 'wy')]
        )
    },
    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}