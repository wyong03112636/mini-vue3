
import { readonly, isReadonly } from '../reactive'
describe('readonly', () => {
    it('happy path', () => {
        // not set
        const original = {foo: 1}
        const wraped = readonly(original)

        expect(original).not.toBe(wraped)
        expect(wraped.foo).toBe(1)

        expect(isReadonly(wraped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
    })

    it('warn when call set', () => {
        const obj = readonly({foo: 1})
        console.warn = jest.fn()
        obj.foo = 2

        expect(console.warn).toBeCalled()
    })
})