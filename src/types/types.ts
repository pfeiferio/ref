import type {Ref} from "../Ref.js";

export type Unref<T> = T extends Ref<infer U> ? Unref<U> : T
