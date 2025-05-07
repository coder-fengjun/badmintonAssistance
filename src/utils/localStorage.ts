/**
 * @description set storage
 * @param key
 * @param value
 */
export function setStorage(key: string, value: unknown): void {
  if (!window.localStorage) {
    throw new Error('该浏览器不支持localStorage')
  } else {
    if (typeof value === 'object') {
      window.localStorage.setItem(key, window.JSON.stringify(value))
    } else {
      window.localStorage.setItem(key, <string>value)
    }
  }
}
/**
 * @description get storage
 * @param key
 */
export function getStorage(key: string): string | null {
  if (!window.localStorage) {
    throw new Error('该浏览器不支持localStorage')
  } else {
    return window.localStorage.getItem(key)
  }
}

/**
 * @description remove by key
 * @param key
 */
export function removeStorageItem(key: string): void {
  window.localStorage.removeItem(key)
}
/**
 * @description clear all storage
 */
export function clearStorageAll(): void {
  window.localStorage.clear()
}
