import { effect } from '../effect'
import { ref } from '../ref'

describe('ref', () => {
    it('happy path', () => {
        const num = ref(1)
        expect(num.value).toBe(1)
    })

    it('should be reactive', () => {
        const a = ref(1);
        let num
        let calls = 0
        effect(() => {
            calls++
            num = a.value
        })
        expect(calls).toBe(1)
        expect(num).toBe(1)

        a.value = 2
        expect(calls).toBe(2)
        expect(num).toBe(2)

        // same vale should not trigger
        a.value = 2
        expect(calls).toBe(2)
        expect(num).toBe(2)

    })

    it('should make nested properties reactive', () => {
        const a = ref({count: 1})
        let num
        effect(() => {
            num = a.value.count
        })
        expect(num).toBe(1)
        a.value.count = 2
        expect(num).toBe(2)
    })
})