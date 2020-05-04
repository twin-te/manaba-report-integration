export function readStorage<T>(key: string): Promise<T> {
  return new Promise<T>((resolve) => {
    chrome.storage.sync.get(key, (data) => resolve(data[key]))
  })
}
export function writeStorage(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    const fobj: any = {}
    fobj[key] = value
    chrome.storage.sync.set(fobj, () => resolve())
  })
}
