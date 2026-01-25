import EventEmitter from 'node:events'

/**
 * Deep equality comparison for detecting changes.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a == null || b == null) return false

  if (typeof a !== 'object' || typeof b !== 'object') return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, i) => deepEqual(val, b[i]))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key =>
    deepEqual((a as any)[key], (b as any)[key])
  )
}

/**
 * A mutable reference wrapper with change notifications.
 */
export class Ref<T> extends EventEmitter {

  /**
   * Shared internal storage.
   */
  #value: { value: T }

  /**
   * Creates a new Ref.
   * If the value is another Ref, both share the same internal storage.
   */
  constructor(value: T | Ref<T>) {
    super()

    if (value instanceof Ref) {
      this.#value = value.#value

      // Forward update events from the shared reference
      value.on('update', (newVal, oldVal) => {
        this.emit('update', newVal, oldVal)
      })
    } else {
      this.#value = {value}
    }
  }

  /**
   * Returns the current value.
   */
  get value(): T {
    return this.#value.value
  }

  /**
   * Updates the value and emits an `update` event if it changed.
   * Uses deep equality comparison for objects and arrays.
   * @param value - The new value to set
   */
  set value(value: T) {
    const oldValue = this.#value.value

    // Use deep equality for objects/arrays, reference equality for primitives
    const hasChanged = !deepEqual(oldValue, value)

    if (hasChanged) {
      this.#value.value = value
      this.emit('update', value, oldValue)
    }
  }

  /**
   * JSON serialization support.
   */
  toJSON(): T {
    return this.value
  }

  /**
   * Adds a listener for value updates.
   * @param event - Must be 'update'
   * @param listener - Callback with (newValue, oldValue)
   */
  on(event: 'update', listener: (newValue: T, oldValue: T) => void): this
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener)
  }

  /**
   * Adds a one-time listener for value updates.
   */
  once(event: 'update', listener: (newValue: T, oldValue: T) => void): this
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener)
  }

  /**
   * Removes a listener for value updates.
   */
  off(event: 'update', listener: (newValue: T, oldValue: T) => void): this
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener)
  }
}
