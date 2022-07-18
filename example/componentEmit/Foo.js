import { h } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
    name: 'Foo',
    setup(props, {emit}) {
        const handleEmit = () => {
            emit('add')
            emit('add-foo', 1, 2)
        }
       return {
            handleEmit
       }
    },
    render() {
        return h('div', {onClick: this.handleEmit}, `foo`)
    }
}