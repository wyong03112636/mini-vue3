import { isReadonly, shallowReadonly } from '../reactive'
describe('shallowReadonly', () => {
    test('should not make non-reactive properties reactive ', () => {
        const origin = shallowReadonly({n: {foo: 1}})
        expect(isReadonly(origin)).toBe(true)
        expect(isReadonly(origin.n)).toBe(false)
    })
    it('warn when call set', () => {
        const obj = shallowReadonly({foo: 1})
        console.warn = jest.fn()
        obj.foo = 2
        expect(console.warn).toBeCalled()
    })
})