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
})