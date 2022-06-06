import { reactive, isReactive } from '../reactive'
describe('reactive', () => {
    test('happy path', () => {
        const origin = {foo: 1}
        const observed = reactive(origin)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(origin)).toBe(false)
        expect(origin).not.toBe(observed)
        expect(observed.foo).toBe(1)
    })

    test('nested reactive', () => {
        const origin = {foo: 1, master: {a: 1}, arr: [{b: 2}]}
        const observed = reactive(origin)
        expect(isReactive(observed.master)).toBe(true)
        expect(isReactive(observed.arr)).toBe(true)
    })
})