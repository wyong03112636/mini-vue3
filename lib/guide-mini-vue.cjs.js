'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const handlerKey = (str) => {
    return str ? `on${capitalize(str)}` : '';
};

const targetMap = new WeakMap();
// 触发依赖
const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    triggerEffects(deps);
};
const triggerEffects = (deps) => {
    deps.forEach(dep => {
        if (dep.schedular) {
            dep.schedular();
        }
        else {
            dep.run();
        }
    });
};

const createGetter = (isReadonly = false, isShallow = false) => (target, key) => {
    if (key === ReactiveFlag.Is_Reactive) {
        return !isReadonly;
    }
    else if (key === ReactiveFlag.Is_Readonly) {
        return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (isShallow) {
        return res;
    }
    if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
};
const createSetter = () => (target, key, value) => {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key} can't set`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

var ReactiveFlag;
(function (ReactiveFlag) {
    ReactiveFlag["Is_Reactive"] = "__v_isReactive";
    ReactiveFlag["Is_Readonly"] = "__V_isReadonly";
})(ReactiveFlag || (ReactiveFlag = {}));
const creteObjectActive = (raw, baseHandlers) => {
    return new Proxy(raw, baseHandlers);
};
const reactive = (raw) => {
    return creteObjectActive(raw, mutableHandlers);
};
const readonly = (raw) => {
    return creteObjectActive(raw, readonlyHandlers);
};
const shallowReadonly = (raw) => {
    return creteObjectActive(raw, shallowReadonlyHandlers);
};

const emit = (instance, event, ...args) => {
    const { props } = instance;
    const handler = props[handlerKey(camelize(event))];
    handler && handler(...args);
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
};

const publicPropertiiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const initSlots = (instance, children) => {
    const { vnode } = instance;
    if (vnode.shapFlag & 16 /* ShapFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
};
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotsValue(value(props));
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
// 处理组件状态
function setupStatefulComponent(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // todo: function 
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
let currentInstance = null;
const getCurrentInstance = () => {
    return currentInstance;
};
// 封装为一个函数后续方便调试，只需要在函数内部打一个断点就可以
const setCurrentInstance = (instance) => {
    currentInstance = instance;
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapFlag: getShapFlag(type)
    };
    // 或运算 赋值
    if (typeof children === 'string') {
        vnode.shapFlag |= 4 /* ShapFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapFlag |= 8 /* ShapFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapFlag & 2 /* ShapFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapFlag |= 16 /* ShapFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapFlag(type) {
    return typeof type === 'string' ? 1 /* ShapFlags.ELEMENT */ : 2 /* ShapFlags.STATEFUL_COMPONENT */;
}
const createTextVNode = (text) => {
    return createVNode(Text, {}, text);
};

function render(vnode, container) {
    // 调用 path
    path(vnode, container);
}
function path(vnode, container) {
    const { shapFlag, type } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapFlag & 1 /* ShapFlags.ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapFlag & 2 /* ShapFlags.STATEFUL_COMPONENT */) {
                // 处理组件
                processComponent(vnode, container);
            }
            break;
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
// 组件状态处理完之后，处理render函数返回
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // subTree是一个vnode虚拟节点
    const subTree = instance.render.call(proxy);
    path(subTree, container);
    // 执行完path之后 会把组件上的el挂载到subTree上， 此时的vnode为组件的vnode
    initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
const isOn = (key) => /^on[A-Z]/.test(key);
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children, props, shapFlag } = vnode;
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            if (isOn(key)) {
                const event = key.slice(2).toLowerCase();
                el.addEventListener(event, val);
            }
            else {
                el.setAttribute(key, val);
            }
        }
    }
    if (shapFlag & 4 /* ShapFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapFlag & 8 /* ShapFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        path(v, container);
    });
}
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const text = (vnode.el = document.createTextNode(children));
    container.append(text);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换为vnode，后续操作基于vnode
            // component => vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const renderSlots = (slots, name, props) => {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
};

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.renderSlots = renderSlots;
