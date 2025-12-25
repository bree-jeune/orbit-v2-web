type ChromeStorageArea = {
  get: (
    keys: string[] | string,
    callback: (items: Record<string, unknown>) => void
  ) => void;
  set: (items: Record<string, unknown>, callback: () => void) => void;
};

const chromeStorage = (() => {
  if (typeof globalThis === "undefined") {
    return undefined;
  }

  const browserChrome = (globalThis as { chrome?: { storage?: { local?: unknown } } }).chrome;
  const localStorageArea = browserChrome?.storage?.local;

  if (
    localStorageArea &&
    typeof localStorageArea === "object" &&
    "get" in localStorageArea &&
    "set" in localStorageArea
  ) {
    return localStorageArea as ChromeStorageArea;
  }

  return undefined;
})();

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    if (chromeStorage) {
      return new Promise<T>((resolve) => {
        chromeStorage.get([key], (result) => {
          resolve((result[key] as T) ?? fallback);
        });
      });
    }

    // web fallback
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (chromeStorage) {
      return new Promise((resolve) => {
        chromeStorage.set({ [key]: value }, () => resolve());
      });
    }

    localStorage.setItem(key, JSON.stringify(value));
  },
};
