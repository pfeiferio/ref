# @pfeiferio/ref

> A minimal mutable reference primitive with change notifications.

[![npm version](https://badge.fury.io/js/%40pfeiferio%2Fref.svg)](https://www.npmjs.com/package/@pfeiferio/ref)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

This package provides a small, explicit `Ref` abstraction for sharing and observing mutable state.
It is **not** a reactive framework and intentionally avoids schedulers, dependency tracking, or magic.

---

## Features

- Explicit mutable references
- Change notifications via events
- Deep equality comparison for updates
- Idempotent `ref()` creation
- No dependencies (Node.js only)

---

## Installation

```bash
npm install @pfeiferio/ref
````

---

## Basic Usage

```js
import {ref} from '@pfeiferio/ref'

const count = ref(0)

count.on('update', (next, prev) => {
  console.log(prev, '→', next)
})

count.value++
```

---

## `ref()`

Creates a new `Ref` instance.

If the passed value is already a `Ref`, the same instance is returned.

```js
const a = ref(1)
const b = ref(a)

a === b // true
```

This guarantees **reference identity** and avoids accidental duplication of state.

---

## `unref()`

Extracts the value from a `Ref`, or returns the value unchanged if it is not a `Ref`.

```js
unref(1)         // 1
unref(ref(1))   // 1
```

---

## `isRef()`

Type guard for checking whether a value is a `Ref`.

```js
if (isRef(x)) {
  console.log(x.value)
}
```

---

## Cloning

If you want an **independent copy** of a `Ref`, this must be done explicitly.

```js
const a = ref(1)
const b = cloneRef(a)

b.value = 2
a.value // 1
```

Deep cloning is also available:

```js
const c = cloneRefDeep(a)
```

---

## Semantics

* A `Ref` represents **identity**, not a container
* `ref()` is idempotent
* State sharing is always explicit
* Copying state is never implicit

This package is intended as a **low-level primitive** for controlled state handling.

---

## License

MIT
