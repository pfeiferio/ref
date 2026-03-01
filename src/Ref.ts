import EventEmitter from 'node:events'
import {REF_SYMBOL} from "./utils/Symbols.js";
import type {Unref} from "./types/types.js";
import {unref} from "./utils/utils.js";
import {deepEqualComparison} from "./utils/deepEqual.js";

/**
 * A mutable reference wrapper with change notifications.
 *
 * Updates must always be applied by replacing the entire value:
 *   ref.value = { ...ref.value, newProp: x }
 *
 * Direct mutation of nested objects will NOT trigger update events.
 */
export class Ref<T> {

  readonly [REF_SYMBOL] = true

  #value: T
  #emitter: EventEmitter

  constructor(value: T) {
    this.#value = value
    this.#emitter = new EventEmitter()
    this.#emitter.setMaxListeners(0)
  }

  /**
   * Returns the current value.
   */
  get value(): T {
    return this.#value
  }

  /**
   * Updates the value and emits an `update` event if it changed.
   * Uses deep equality comparison for objects and arrays.
   */
  set value(value: T) {
    if (this.#value === value) return
    const oldValue = this.#value
    if (!deepEqualComparison(oldValue, value)) {
      this.#value = value
      this.#emitter.emit('update', value, oldValue)
    }
  }

  /**
   * Adds a listener for value updates.
   */
  on(event: 'update', listener: (newValue: T, oldValue: T) => void): this {
    this.#emitter.on(event, listener)
    return this
  }

  /**
   * Adds a one-time listener for value updates.
   */
  once(event: 'update', listener: (newValue: T, oldValue: T) => void): this {
    this.#emitter.once(event, listener)
    return this
  }

  [Symbol.dispose]() {
    this.#emitter.removeAllListeners()
  }

  /**
   * Removes a listener for value updates.
   */
  off(event: 'update', listener: (newValue: T, oldValue: T) => void): this {
    this.#emitter.off(event, listener)
    return this
  }

  /**
   * JSON serialization support.
   */
  toJSON(): Unref<T> {
    return unref(this.#value)
  }
}
