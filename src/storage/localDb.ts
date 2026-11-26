import { Entity, ScoringWeights, SportRecord } from '../types/omnistats';
import { DEFAULT_WEIGHTS } from '../data/sports';

const DB_NAME = 'OmniStatsLocalDB_v1';
const DB_VER = 1;

const LS_FAVS = 'omnistats_favs';
const LS_WEIGHTS = 'omnistats_weights';
const LS_THEME = 'omnistats_theme';
const LS_APISPORTS_KEY = 'omnistats_apisports_key';
const LS_APISPORTS_QUOTA = 'omnistats_apisports_quota';

export interface ApiQuotaState {
  date: string;
  count: number;
  limit: number;
}

class LocalDbManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  async init(): Promise<IDBDatabase | null> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const req = window.indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('customRecords')) {
          db.createObjectStore('customRecords', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customEntities')) {
          db.createObjectStore('customEntities', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('apiCache')) {
          db.createObjectStore('apiCache', { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      req.onerror = () => resolve(null);
    });

    return this.initPromise;
  }

  async getAll<T>(storeName: 'customRecords' | 'customEntities' | 'apiCache'): Promise<T[]> {
    const db = await this.init();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve((req.result || []) as T[]);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async putMany(
    storeName: 'customRecords' | 'customEntities' | 'apiCache',
    items: Array<Record<string, unknown>>,
  ): Promise<void> {
    const db = await this.init();
    if (!db || items.length === 0) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async clearStore(storeName: 'customRecords' | 'customEntities' | 'apiCache'): Promise<void> {
    const db = await this.init();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async getApiCache<T>(key: string): Promise<T | null> {
    const db = await this.init();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('apiCache', 'readonly');
        const req = tx.objectStore('apiCache').get(key);
        req.onsuccess = () => {
          const row = req.result as { key: string; data: T; ts: number } | undefined;
          resolve(row ? row.data : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async setApiCache(key: string, data: unknown): Promise<void> {
    await this.putMany('apiCache', [{ key, data, ts: Date.now() }]);
  }

  async saveCustomRecords(records: SportRecord[]): Promise<void> {
    await this.putMany('customRecords', records as unknown as Array<Record<string, unknown>>);
  }

  async saveCustomEntities(entities: Entity[]): Promise<void> {
    await this.putMany('customEntities', entities as unknown as Array<Record<string, unknown>>);
  }

  async getCacheSummary(): Promise<{ customRecords: number; customEntities: number; apiEntries: number; estimatedKb: number }> {
    const [recs, ents, cache] = await Promise.all([
      this.getAll<SportRecord>('customRecords'),
      this.getAll<Entity>('customEntities'),
      this.getAll<Record<string, unknown>>('apiCache'),
    ]);
    const bytes = new Blob([JSON.stringify({ recs, ents, cache })]).size;
    return {
      customRecords: recs.length,
      customEntities: ents.length,
      apiEntries: cache.length,
      estimatedKb: Math.max(1, Math.round(bytes / 1024)),
    };
  }

  // LocalStorage helpers
  loadFavorites(): string[] {
    try {
      const raw = localStorage.getItem(LS_FAVS);
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      // ignore
    }
    return ['real_madrid', 'FR', 'ferrari'];
  }

  saveFavorites(favs: string[]): void {
    try {
      localStorage.setItem(LS_FAVS, JSON.stringify(favs));
    } catch {
      // ignore
    }
  }

  loadWeights(): ScoringWeights {
    try {
      const raw = localStorage.getItem(LS_WEIGHTS);
      if (raw) return { ...DEFAULT_WEIGHTS, ...(JSON.parse(raw) as Partial<ScoringWeights>) };
    } catch {
      // ignore
    }
    return { ...DEFAULT_WEIGHTS };
  }

  saveWeights(weights: ScoringWeights): void {
    try {
      localStorage.setItem(LS_WEIGHTS, JSON.stringify(weights));
    } catch {
      // ignore
    }
  }

  loadTheme(): 'dark' | 'light' {
    try {
      const saved = localStorage.getItem(LS_THEME);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  saveTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem(LS_THEME, theme);
    } catch {
      // ignore
    }
  }

  loadApiSportsKey(): string {
    try {
      return localStorage.getItem(LS_APISPORTS_KEY) || '';
    } catch {
      return '';
    }
  }

  saveApiSportsKey(key: string): void {
    try {
      localStorage.setItem(LS_APISPORTS_KEY, key.trim());
    } catch {
      // ignore
    }
  }

  getApiQuota(): ApiQuotaState {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(LS_APISPORTS_QUOTA);
      if (raw) {
        const parsed = JSON.parse(raw) as ApiQuotaState;
        if (parsed.date === today) return parsed;
      }
    } catch {
      // ignore
    }
    return { date: today, count: 0, limit: 100 };
  }

  incrementApiQuota(): ApiQuotaState {
    const cur = this.getApiQuota();
    const next: ApiQuotaState = { ...cur, count: cur.count + 1 };
    try {
      localStorage.setItem(LS_APISPORTS_QUOTA, JSON.stringify(next));
    } catch {
      // ignore
    }
    return next;
  }
}

export const localDb = new LocalDbManager();
