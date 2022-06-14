
import { readonly, isReadonly, isProxy } from '../reactive'
describe('readonly', () => {
    it('happy path', () => {
        // not set
        const original = {foo: 1, master: {b: 2}}
        const wraped = readonly(original)

        expect(original).not.toBe(wraped)
        expect(wraped.foo).toBe(1)

        expect(isReadonly(wraped)).toBe(true)
        expect(isReadonly(wraped.master)).toBe(true)
        expect(isReadonly(original)).toBe(false)

        expect(isProxy(wraped)).toBe(true)
    })

    it('warn when call set', () => {
        const obj = readonly({foo: 1})
        console.warn = jest.fn()
        obj.foo = 2

        expect(console.warn).toBeCalled()
    })
})