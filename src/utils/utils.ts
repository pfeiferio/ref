import {Ref} from "../Ref.js";
import type {Unref} from "../types/types.js";
import {REF_SYMBOL} from "./Symbols.js";

/**
 * Creates a new Ref instance.
 * Always returns a new Ref, even if the passed value is already a Ref.
 */
export function ref<T = undefined>(): Ref<T | undefined>
export function ref<T>(value: T): Ref<Unref<T>>
export function ref<T>(value?: T): Ref<Unref<T> | undefined> {
  return new Ref<Unref<T> | undefined>(unref(value))
}

/**
 * Checks whether a value is a Ref instance.
 */
export const isRef = <T = unknown>(value: unknown): value is Ref<T> => {
  return typeof value === 'object' && value !== null && (value as any)[REF_SYMBOL] === true
}

/**
 * Unwraps a Ref to its value.
 * If the value is not a Ref, it is returned as-is.
 */
export function unref<T>(value: T): Unref<T> {
  while (isRef(value)) {
    value = value.value as any;
  }
  return value as Unref<T>
}
