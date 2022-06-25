import { h } from '../../lib/guide-mini-vue.esm.js'
window.self = null;
export const App = {
    //.vue
    // render
    render() {

        window.self = this
        return h('div',{
            id: 'root',
            class: ['red', 'blue']
        },
        // [h('p', {class: 'red'}, 'hi'), h('p', {class: 'blue'}, 'wy')]
        `hi ${this.msg}`
        )
    },
    setup() {
        return {
            msg: 'mini-vue aaa'
        }
    }
}