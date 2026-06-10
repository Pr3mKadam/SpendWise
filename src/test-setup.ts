import '@testing-library/jest-dom/vitest';

// Stub localStorage for environments that don't provide it (e.g. happy-dom)
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });
}

// Stub IndexedDB for environments that don't provide it
if (typeof indexedDB === 'undefined') {
  class FakeIDBRequest extends EventTarget {
    result: unknown = null;
    error: unknown = null;
    readyState = 'done';
    onsuccess: ((e: unknown) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    overrideonsuccess: ((e: unknown) => void) | null = null;
    constructor() { super(); }
  }
  class FakeIDBFactory {
    open() {
      const req = new FakeIDBRequest();
      setTimeout(() => {
        req.result = {};
        if (req.onsuccess) req.onsuccess({ target: req } as unknown);
      }, 0);
      return req as unknown as IDBRequest<undefined>;
    }
  }
  Object.defineProperty(globalThis, 'indexedDB', { value: new FakeIDBFactory(), writable: true });
}
