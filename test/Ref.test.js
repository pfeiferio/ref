import test, {describe} from 'node:test'
import assert from 'node:assert/strict'

import {Ref} from '../dist/Ref.js'
import {isRef, ref, unref} from '../dist/index.js'
import {deepEqualComparison} from '../dist/utils/deepEqual.js'

describe('Ref', () => {

  test('creates a ref with an initial value', () => {
    const r = ref(1)
    assert.equal(r.value, 1)
  })

  test('updates value and emits update event', () => {
    const r = ref(1)

    let called = false
    r.on('update', (next, prev) => {
      called = true
      assert.equal(prev, 1)
      assert.equal(next, 2)
    })

    r.value = 2
    assert.equal(called, true)
  })

  test('does not emit update event if value does not change (primitive)', () => {
    const r = ref(1)

    let called = false
    r.on('update', () => {
      called = true
    })

    r.value = 1
    assert.equal(called, false)
  })

  test('uses deep equality for objects', () => {
    const r = ref({a: 1})

    let called = false
    r.on('update', () => {
      called = true
    })

    r.value = {a: 1}
    assert.equal(called, false)

    r.value = {a: 2}
    assert.equal(called, true)
  })

  test('uses deep equality for arrays', () => {
    const r = ref([1, 2, 3])

    let calls = 0
    r.on('update', () => {
      calls++
    })

    r.value = [1, 2, 3]
    r.value = [1, 2, 3]
    assert.equal(calls, 0)

    r.value = [1, 2, 4]
    assert.equal(calls, 1)
  })

  test('once() fires only once', () => {
    const r = ref(0)

    let calls = 0
    r.once('update', () => {
      calls++
    })

    r.value = 1
    r.value = 2
    assert.equal(calls, 1)
  })

  test('off() removes a listener', () => {
    const r = ref(0)

    let calls = 0
    const listener = () => {
      calls++
    }

    r.on('update', listener)
    r.value = 1
    r.off('update', listener)
    r.value = 2

    assert.equal(calls, 1)
  })

  test('[Symbol.dispose] removes all listeners', () => {
    const r = ref(0)

    let calls = 0
    r.on('update', () => { calls++ })
    r.on('update', () => { calls++ })

    r[Symbol.dispose]()
    r.value = 1

    assert.equal(calls, 0)
  })

  test('toJSON returns the current value', () => {
    const r = ref({a: 1})
    assert.deepEqual(JSON.stringify(r), JSON.stringify({a: 1}))
  })

  test('direct nested mutation does NOT fire update — use explicit replace', async () => {
    const r = ref({a: {b: 1}})

    let called = false
    r.on('update', () => {
      called = true
    })

    r.value.a.b = 2       // silent — no event
    assert.equal(called, false)
    r.value = {...r.value} // explicit replace but no changes, should not fire event
    assert.equal(called, false)

    r.value = {a: 4}
    assert.equal(called, true)
  })

})

describe('ref()', () => {

  test('creates a Ref instance', () => {
    const r = ref(123)
    assert.ok(r instanceof Ref)
  })

  test('creates a new instance even when passed a Ref', () => {
    const a = ref(1)
    const b = ref(a)

    assert.ok(b instanceof Ref)
    assert.notEqual(a, b)
  })

  test('wrapping a Ref gives a Ref<T>, not a shared alias', () => {
    const a = ref(1)
    const b = ref(a)

    assert.equal(b.value, a.value)
    assert.equal(b.value, 1)

    a.value = 99
    assert.equal(b.value, 1)
    assert.equal(a.value, 99)
  })

  test('creates a ref with undefined when called without arguments', () => {
    const r = ref()
    assert.equal(r.value, undefined)
  })

})

describe('isRef()', () => {

  test('returns true for Ref instances', () => {
    assert.equal(isRef(ref(1)), true)
  })

  test('returns false for non-Ref values', () => {
    assert.equal(isRef(1), false)
    assert.equal(isRef({}), false)
    assert.equal(isRef(null), false)
    assert.equal(isRef(undefined), false)
  })

})

describe('unref()', () => {

  test('unwraps a Ref', () => {
    assert.equal(unref(ref(42)), 42)
  })

  test('unwraps deeply nested Refs', () => {
    assert.equal(unref(ref(ref(ref(42)))), 42)
  })

  test('returns non-Ref values as-is', () => {
    assert.equal(unref(42), 42)
    assert.equal(unref('hello'), 'hello')
  })

})

describe('deepEqualComparison()', () => {

  // Primitives
  test('same primitives are equal', () => {
    assert.equal(deepEqualComparison(1, 1), true)
    assert.equal(deepEqualComparison('a', 'a'), true)
    assert.equal(deepEqualComparison(null, null), true)
  })

  test('different primitives are not equal', () => {
    assert.equal(deepEqualComparison(1, 2), false)
    assert.equal(deepEqualComparison('a', 'b'), false)
    assert.equal(deepEqualComparison(null, undefined), false)
  })

  // Arrays
  test('arrays with different lengths are not equal', () => {
    assert.equal(deepEqualComparison([1, 2], [1, 2, 3]), false)
  })

  test('arrays with same values are equal', () => {
    assert.equal(deepEqualComparison([1, 2, 3], [1, 2, 3]), true)
  })

  test('array vs object is not equal', () => {
    assert.equal(deepEqualComparison([1, 2], {0: 1, 1: 2}), false)
  })

  // Objects
  test('objects with different keys are not equal', () => {
    assert.equal(deepEqualComparison({a: 1}, {b: 1}), false)
  })

  test('objects with same keys but different values are not equal', () => {
    assert.equal(deepEqualComparison({a: 1}, {a: 2}), false)
  })

  test('objects with same keys and values are equal', () => {
    assert.equal(deepEqualComparison({a: 1, b: 2}, {a: 1, b: 2}), true)
  })

  test('objects with different key counts are not equal', () => {
    assert.equal(deepEqualComparison({a: 1}, {a: 1, b: 2}), false)
  })

  // Nested
  test('nested objects that are equal', () => {
    assert.equal(deepEqualComparison({a: {b: {c: 1}}}, {a: {b: {c: 1}}}), true)
  })

  test('nested objects that differ deeply', () => {
    assert.equal(deepEqualComparison({a: {b: {c: 1}}}, {a: {b: {c: 2}}}), false)
  })

  test('nested arrays that are equal', () => {
    assert.equal(deepEqualComparison([[1, 2], [3, 4]], [[1, 2], [3, 4]]), true)
  })

  test('nested arrays that differ', () => {
    assert.equal(deepEqualComparison([[1, 2], [3, 4]], [[1, 2], [3, 5]]), false)
  })

  // Dates
  test('compares Dates by value', () => {
    assert.equal(deepEqualComparison(new Date('2024-01-01'), new Date('2024-01-01')), true)
    assert.equal(deepEqualComparison(new Date('2024-01-01'), new Date('2024-01-02')), false)
  })

  // Circular references
  test('handles circular references without throwing', () => {
    const a = {}
    a.self = a
    const b = {}
    b.self = b

    assert.doesNotThrow(() => deepEqualComparison(a, b))
  })

})
