import { effect } from '../effect'
import { reactive } from '../reactive'
describe('effect', () => {
    it('happy path', () => {
        const obj = reactive({age:1})
        let nextAge
        effect(() => {
            nextAge = obj.age + 1
        })
        expect(nextAge).toBe(2)
        // update
        obj.age ++
        expect(nextAge).toBe(3)
    })
    it('return runner when call effect', () => {
        // effect(fn) => runner => fn => return 
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })
        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('foo')
    })
})