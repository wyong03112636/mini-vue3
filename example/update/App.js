import { h, ref } from '../../lib/guide-mini-vue.esm.js'

export default {
    setup() {
      const counter = ref(1)
      function inc() {
        counter.value += 1
      }
      return {
        counter,
        inc,
      }
    },
    render() {
      return h('div', {}, [
        h('div', {}, 'count:' + this.counter),
        h('button', { onClick: this.inc }, 'inc'),
      ])
    },
  }