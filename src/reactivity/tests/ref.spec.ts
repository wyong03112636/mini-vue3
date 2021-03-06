import { effect } from '../effect'
import { reactive } from '../reactive'
import { isRef, proxyRefs, ref, unRef } from '../ref'

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

    it('isRef', () => {
        const a = ref(1)
        const user = reactive({age: 1})
        expect(isRef(a)).toBe(true)
        expect(isRef(1)).toBe(false)
        expect(isRef(user)).toBe(false)
    })

    it('unRef', () => {
        const a = ref(1)
        expect(unRef(a)).toBe(1)
        expect(unRef(1)).toBe(1)
    })

    it('proxyRefs', () => {
        const user = {
            age: ref(10),
            name: 'WY'
        }

        const proxyUsers = proxyRefs(user)
        expect(user.age.value).toBe(10)
        expect(proxyUsers.age).toBe(10)
        expect(proxyUsers.name).toBe('WY')

        proxyUsers.age = 20;
        expect(proxyUsers.age).toBe(20)
        expect(user.age.value).toBe(20)

        proxyUsers.age = ref(10);
        expect(proxyUsers.age).toBe(10)
        expect(user.age.value).toBe(10)
    })
})

