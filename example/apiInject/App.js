// 组件 provide 和 inject 功能
import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(Provider2)]);
  },
};

const Provider2 = {
    setup() {
        provide('foo', 'foo2')
        const foo = inject('foo')
        return {
            foo
        }
    },
    render() {
      return h('div', {}, [h('div', {}, `Provider2${this.foo}` ), h(Consumer)])
    },
  }

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // const baz = inject('baz', 'baz')
    const baz = inject('baz', () => 'baz')
    return {
      foo,
      bar,
      baz
    };
  },

  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar}-${this.baz}`);
  },
};

export default {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
  },
};