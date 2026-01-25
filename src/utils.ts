import {Ref} from "./Ref.js";

/**
 * Creates a new Ref instance.
 */
export function ref<T = undefined>(): Ref<T | undefined>
export function ref<T>(value: T): Ref<T>
export function ref<T>(value: Ref<T>): Ref<T>
export function ref<T>(value?: T | Ref<T>): Ref<T | undefined> {
  if (isRef(value)) return value
  if (value === undefined) {
    return new Ref<T | undefined>(undefined)
  }
  return new Ref<T>(value as T | Ref<T>)
}

/**
 * Checks whether a value is a Ref instance.
 */
export const isRef = <T = unknown>(value: unknown): value is Ref<T> => {
  return value instanceof Ref
}

type Unref<T> = T extends Ref<infer U> ? U : T

/**
 * Unwraps a Ref to its value.
 * If the value is not a Ref, it is returned as-is.
 */
export function unref<T>(value: Ref<T>): Unref<T>
export function unref<T>(value: T): T
export function unref<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value
}

/**
 * Creates a new Ref with the current value of another Ref.
 * The resulting Ref is NOT linked to the original one.
 */
export function cloneRef<T>(source: Ref<T>): Ref<T> {
  return ref(source.value)
}

/**
 * Creates a new Ref with a deep-cloned value.
 */
export function cloneRefDeep<T>(source: Ref<T>): Ref<T> {
  return ref(structuredClone(source.value))
}
