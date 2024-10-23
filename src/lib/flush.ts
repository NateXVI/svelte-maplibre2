/**
 * Removes any undefined or null values from an object.
 */
export default function flush<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  ) as T;
}
