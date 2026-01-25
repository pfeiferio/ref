import test, {describe} from 'node:test'
import assert from 'node:assert/strict'

import {Ref} from '../dist/Ref.js'
import {isRef, ref} from '../dist/utils.js'

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

  test('shares internal state when constructed from another Ref', () => {
    const a = ref(1)
    const b = ref(a)

    assert.equal(a.value, 1)
    assert.equal(b.value, 1)

    let aCalled = false
    let bCalled = false

    a.on('update', () => {
      aCalled = true
    })
    b.on('update', () => {
      bCalled = true
    })

    b.value = 2

    assert.equal(a.value, 2)
    assert.equal(b.value, 2)
    assert.equal(aCalled, true)
    assert.equal(bCalled, true)
  })

  test('forwards update events from shared refs', () => {
    const a = ref(1)
    const b = ref(a)

    let forwarded = false

    b.on('update', (next, prev) => {
      forwarded = true
      assert.equal(prev, 1)
      assert.equal(next, 2)
    })

    a.value = 2
    assert.equal(forwarded, true)
  })

  test('toJSON returns the current value', () => {
    const r = ref({a: 1})
    assert.deepEqual(JSON.stringify(r), JSON.stringify({a: 1}))
  })

})

describe('ref()', () => {

  test('creates a Ref instance', () => {
    const r = ref(123)
    assert.ok(r instanceof Ref)
  })

  test('accepts an existing Ref and shares state', () => {
    const a = ref(1)
    const b = ref(a)

    b.value = 5
    assert.equal(a.value, 5)
  })

})

describe('isRef()', () => {

  test('returns true for Ref instances', () => {
    const r = ref(1)
    assert.equal(isRef(r), true)
  })

  test('returns false for non-Ref values', () => {
    assert.equal(isRef(1), false)
    assert.equal(isRef({}), false)
    assert.equal(isRef(null), false)
    assert.equal(isRef(undefined), false)
  })

})
