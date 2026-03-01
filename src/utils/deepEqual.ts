/**
 * Deep equality comparison with circular reference protection.
 */
export function deepEqualComparison(a: unknown, b: unknown, seen = new WeakSet<object>()): boolean {
  if (a === b) return true

  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  // Circular reference protection
  if (seen.has(a as object) || seen.has(b as object)) {
    return true // Assume equal if already being processed in this branch
  }

  // Handle Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    seen.add(a)
    seen.add(b)
    return a.every((val, i) => deepEqualComparison(val, b[i], seen))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  // Handle Plain Objects
  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  seen.add(a as object)
  seen.add(b as object)

  return keysA.every(key =>
    deepEqualComparison((a as any)[key], (b as any)[key], seen)
  )
}
