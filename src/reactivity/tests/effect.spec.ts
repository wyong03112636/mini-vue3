import { effect, stop } from '../effect'
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

    it('scheduler', () => {
        // 调度执行，由用户决定副作用函数的执行时机 & 执行次数
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({foo: 1})
        const runner = effect(() => {
            dummy = obj.foo
        }, { scheduler })
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // update
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)

        run()
        expect(dummy).toBe(2)

    })

    it('stop', () => {
        // 本质是收集依赖时，把对应的effect实例删除
        let dummy
        const obj = reactive({foo: 1})
        const runner = effect(() => {
            dummy = obj.foo
        })

        obj.foo = 2
        expect(dummy).toBe(2)
        stop(runner)
        // obj.foo = 3
        obj.foo ++
        expect(dummy).toBe(2)
        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        let dummy
        const obj = reactive({foo: 1})
        const onStop = jest.fn()
        const runner = effect(() => {
            dummy = obj.foo
        }, {
            onStop
        })
        stop(runner)

        expect(onStop).toBeCalledTimes(1)
    })
})