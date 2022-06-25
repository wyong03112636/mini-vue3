'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (obj) => {
    return obj !== null && typeof obj === 'object';
};

const publicPropertiiesMap = {
    $el: i => i.vnode.el
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // todo
    // initProps()
    setupStatefulComponent(instance);
}
// 处理组件状态
function setupStatefulComponent(instance) {
    const component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        const setupResult = setup();
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

function render(vnode, container) {
    // 调用 path
    path(vnode, container);
}
function path(vnode, container) {
    const { type } = vnode;
    if (typeof type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container);
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
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    vnode.el = el;
    const { children, props } = vnode;
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const val = props[key];
            el.setAttribute(key, val);
        }
    }
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        path(v, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
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

exports.createApp = createApp;
exports.h = h;
