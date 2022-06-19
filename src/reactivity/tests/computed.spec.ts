import { reactive } from '../reactive'
import { computed } from '../computed'

describe('computed', () => {
    it('happy path', () => {
        const user = reactive({
            age: 1
        })

        const age = computed(() => {
            return user.age
        })

        expect(age.value).toBe(1)
    })

    it('should compute lazily', () => {
        const foo = reactive({value: 1})

        const getter = jest.fn(() => {
            return foo.value
        })

        const cValue = computed(getter)
        // lazy
        expect(getter).not.toHaveBeenCalled()

        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)

        // 不应该重新计算
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(1)

        // 响应式对象值发生改变 不会触发getter
        foo.value = 2 // trigger => effect => get 重新执行
        expect(getter).toHaveBeenCalledTimes(1)

        // 重新触发getter 重新计算
        expect(cValue.value).toBe(2)
        expect(getter).toHaveBeenCalledTimes(2)

        // 不应该重新计算
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(2)
    })

})