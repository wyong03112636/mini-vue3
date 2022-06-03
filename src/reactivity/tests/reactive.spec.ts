import { reactive } from '../reactive'
describe('reactive', () => {
    test('happy path', () => {
        const origin = {foo: 1}
        const observed = reactive(origin)
        expect(origin).not.toBe(observed)
        expect(observed.foo).toBe(1)
    })
})