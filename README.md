# @pfeiferio/ref

> A minimal mutable reference primitive with change notifications.

[![npm version](https://img.shields.io/npm/v/@pfeiferio/ref.svg)](https://www.npmjs.com/package/@pfeiferio/ref)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![codecov](https://codecov.io/gh/pfeiferio/ref/branch/main/graph/badge.svg)](https://codecov.io/gh/pfeiferio/ref)

A small, explicit `Ref` abstraction for holding and observing mutable state.
It is **not** a reactive framework and intentionally avoids schedulers, dependency tracking, or magic.

---

## Features

- Explicit mutable references
- Change notifications via `on` / `off` / `once`
- Deep equality comparison — no event fired if value did not change
- Recursive `unref()` unwrapping
- `[Symbol.dispose]` support for explicit cleanup
- No dependencies (Node.js only)

---

## Installation

```bash
npm install @pfeiferio/ref
```

---

## Basic Usage

```ts
import {ref} from '@pfeiferio/ref'

const count = ref(0)

count.on('update', (next, prev) => {
  console.log(prev, '→', next)
})

count.value = 1 // 0 → 1
count.value = 1 // no event — value unchanged
```

---

## `ref()`

Creates a new `Ref` instance. Always returns a new instance — no idempotency, no implicit aliasing.

```ts
const a = ref(1)
const b = ref(1)

a === b // false — always distinct instances
```

If a `Ref` is passed as value, it is unwrapped first:

```ts
const a = ref(1)
const b = ref(a) // Ref<number>, not Ref<Ref<number>>

b.value // 1
a.value = 99
b.value // 1 — b is independent
```

If you want to share state, pass the same instance around directly.

---

## `unref()`

Unwraps a `Ref` to its value. If the value is not a `Ref`, it is returned as-is.
Unwrapping is recursive — nested `Ref`s are fully resolved.

```ts
unref(1)                  // 1
unref(ref(1))             // 1
unref(ref(ref(ref(1))))   // 1
```

---

## `isRef()`

Type guard for checking whether a value is a `Ref`.

```ts
if (isRef(x)) {
  console.log(x.value)
}
```

---

## Events

`Ref` exposes a minimal event API. Only `'update'` is emitted, and only when the value actually changed.
Deep equality is used for objects, arrays, and dates.

```ts
const r = ref({a: 1})

const listener = (next, prev) => console.log(prev, '→', next)

r.on('update', listener)
r.once('update', listener)
r.off('update', listener)
```

`Ref` does **not** extend `EventEmitter` — only these three methods are part of the public API.

---

## Updates

Updates must always be applied by replacing the entire value. Direct mutation of nested objects will **not** trigger
events.

```ts
const r = ref({a: {b: 1}})

r.value.a.b = 2       // silent — no event fired
r.value = {...r.value, a: {b: 2}} // fires event
```

---

## Cleanup

`Ref` implements `Symbol.dispose` for use with the `using` keyword (TypeScript 5.2+, Node.js 20+).

```ts
{
  using r = ref(0)
  r.on('update', () => { ...
  })
} // all listeners removed automatically
```

Or manually:

```ts
r[Symbol.dispose]()
```

---

## Semantics

- `ref()` always creates a new instance
- State sharing is always explicit — pass the same instance
- Copying state is always explicit — use `structuredClone` or spread
- No implicit linking between `Ref` instances
- No schedulers, no dependency tracking, no magic

---

## License

MIT
