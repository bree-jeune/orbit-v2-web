const chromeStorage = (() => {
  if (typeof globalThis === "undefined") {
    return undefined;
  }

  const browserChrome = (globalThis as { chrome?: { storage?: { local?: unknown } } })
    .chrome;
  return browserChrome?.storage?.local;
})();

const isChromeExtension = !!chromeStorage;

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    if (isChromeExtension) {
      return new Promise<T>((resolve) => {
        if (!chromeStorage) {
          resolve(fallback);
          return;
        }

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
    if (isChromeExtension) {
      return new Promise((resolve) => {
        if (!chromeStorage) {
          resolve();
          return;
        }

        chromeStorage.set({ [key]: value }, () => resolve());
      });
    }

    localStorage.setItem(key, JSON.stringify(value));
  },
};
