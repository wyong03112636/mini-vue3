'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

const extend = Object.assign;
const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};
const hasChanged = (value, newValue) => !Object.is(value, newValue);
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

let activeFn; // 当前effect实例
let shouldTrack; // 是否应该依赖收集
class ReactiveEffect {
    constructor(fn, schedular) {
        this.schedular = schedular;
        this.deps = []; // Array<Set>
        this.active = true; // stop方法加锁
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            // 说明调用过stop方法 执行fn函数 触发依赖收集 此时的shouldTrack为false 就不会触发依赖收集
            return this._fn();
        }
        shouldTrack = true;
        activeFn = this;
        const result = this._fn(); // 执行this._fn会触发 依赖收集track函数执行
        shouldTrack = false;
        return result;
    }
    // 停止触发副作用函数
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
const cleanupEffect = (effect) => {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
};
const effect = (fn, options = {}) => {
    const effect = new ReactiveEffect(fn, options.scheduler);
    effect.run();
    // options
    extend(effect, options);
    const runner = effect.run.bind(effect);
    runner.effect = effect;
    return runner;
};
const targetMap = new WeakMap();
// 依赖收集
const track = (target, key) => {
    if (!isTracking())
        return;
    // target => key => dep
    let keyMap = targetMap.get(target);
    if (!keyMap) {
        keyMap = new Map();
        targetMap.set(target, keyMap);
    }
    let depSet = keyMap.get(key);
    if (!depSet) {
        depSet = new Set();
        keyMap.set(key, depSet);
    }
    trackEffects(depSet);
};
const trackEffects = (depSet) => {
    if (depSet.has(activeFn))
        return;
    depSet.add(activeFn);
    activeFn.deps.push(depSet);
};
// 是否可以收集依赖
const isTracking = () => {
    return shouldTrack && activeFn !== undefined;
};
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
    // 依赖收集
    if (!isReadonly) {
        track(target, key);
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

class RefImpl {
    constructor(value) {
        this._V__isRef = true;
        // 需要处理value为object的情况
        this.rawValue = value;
        this._value = convert(value);
        this.deps = new Set();
    }
    get value() {
        trackRef(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this.rawValue, newValue)) {
            this.rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.deps);
        }
    }
}
const trackRef = (ref) => {
    if (isTracking()) {
        trackEffects(ref.deps);
    }
};
const convert = (value) => {
    return isObject(value) ? reactive(value) : value;
};
const ref = (value) => {
    return new RefImpl(value);
};
const isRef = (ref) => {
    return !!ref._V__isRef;
};
const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref;
};
const proxyRefs = (obj) => {
    return new Proxy(obj, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
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

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        providers: parent ? parent.providers : {},
        parent,
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
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

const provide = (key, value) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let provides = currentInstance.providers;
        if (currentInstance.parent) {
            const parentProvies = currentInstance.parent.providers;
            // 如果自己的 provides 和 parent.provides，那么就证明是初始化阶段
            if (provides === parentProvies) {
                // 此时将 provides 的原型链设置为 parent.provides
                // 这样我们在设置的时候就不会污染到 parent.provides
                // 在读取的时候因为原型链的特性，我们也能读取到 parent.provides
                provides = currentInstance.providers = Object.create(parentProvies);
            }
        }
        provides[key] = value;
    }
};
const inject = (key, defaultValue) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        if (key in parent.providers) {
            return parent.providers[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
};

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换为vnode，后续操作基于vnode
                // component => vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer, rootComponent);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container, parentComponent) {
        // 调用 path
        path(null, vnode, container, parentComponent);
    }
    // n1 => 老的虚拟节点
    // n2 => 新的虚拟节点
    function path(n1, n2, container, parentComponent) {
        const { shapFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapFlag & 1 /* ShapFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapFlag & 2 /* ShapFlags.STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 创建组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    // 组件状态处理完之后，处理render函数返回
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // subTree是一个vnode虚拟节点
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;
                path(null, subTree, container, instance);
                // 执行完path之后 会把组件上的el挂载到subTree上， 此时的vnode为组件的vnode
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // update
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                path(prevSubTree, subTree, container, instance);
            }
        });
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container);
        }
    }
    function patchElement(n1, n2, container) {
        console.log(n1, n2, container);
    }
    function mountElement(vnode, container, parentComponent) {
        const el = hostCreateElement(vnode.type);
        vnode.el = el;
        const { children, props, shapFlag } = vnode;
        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(props, key)) {
                const val = props[key];
                hostPatchProp(el, key, val);
            }
        }
        if (shapFlag & 4 /* ShapFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapFlag & 8 /* ShapFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            path(null, v, container, parentComponent);
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const text = (n2.el = document.createTextNode(children));
        container.append(text);
    }
    return {
        createApp: createAppAPI(render)
    };
}

const createElement = (type) => {
    return document.createElement(type);
};
const isOn = (key) => /^on[A-Z]/.test(key);
const patchProp = (el, key, val) => {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, val);
    }
    else {
        el.setAttribute(key, val);
    }
};
const insert = (el, container) => {
    container.append(el);
};
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
const createApp = (...args) => {
    return renderer.createApp(...args);
};

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
