import { RemoteStatsDatabase, RemoteSyncConfig } from '../types/omnistats';
import { buildRawGithubUrl, normalizeRemoteDatabase } from '../engine/remoteSync';

export const REMOTE_DB_CACHE_KEY = 'omnistats_remote_db_v1';
export const REMOTE_CONFIG_KEY = 'omnistats_remote_config_v1';
const CACHE_TTL_MS = 6 * 3600 * 1000; // 6 hours

export const DEFAULT_REMOTE_CONFIG: RemoteSyncConfig = {
  mode: 'github',
  owner: '',
  repo: '',
  branch: 'main',
  filePath: 'data/stats-database.json',
  customUrl: '',
};

interface CachedRemotePayload {
  savedAt: number;
  url: string;
  data: RemoteStatsDatabase;
}

export function loadRemoteSyncConfig(): RemoteSyncConfig {
  try {
    const raw = localStorage.getItem(REMOTE_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_REMOTE_CONFIG, ...(JSON.parse(raw) as Partial<RemoteSyncConfig>) };
    }
  } catch {
    // ignore corrupted localStorage
  }
  return { ...DEFAULT_REMOTE_CONFIG };
}

export function saveRemoteSyncConfig(config: RemoteSyncConfig): void {
  try {
    localStorage.setItem(REMOTE_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota
  }
}

export function clearRemoteSyncConfigAndCache(): void {
  try {
    localStorage.removeItem(REMOTE_CONFIG_KEY);
    localStorage.removeItem(REMOTE_DB_CACHE_KEY);
  } catch {
    // ignore
  }
}

export function readRemoteCache(expectedUrl?: string): CachedRemotePayload | null {
  try {
    const raw = localStorage.getItem(REMOTE_DB_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRemotePayload;
    if (!parsed || typeof parsed.savedAt !== 'number' || !parsed.data) return null;
    if (expectedUrl && parsed.url && parsed.url !== expectedUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRemoteCache(url: string, data: RemoteStatsDatabase): number {
  const savedAt = Date.now();
  try {
    const payload: CachedRemotePayload = { savedAt, url, data };
    localStorage.setItem(REMOTE_DB_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota errors cleanly
  }
  return savedAt;
}

export interface RemoteFetchResult {
  status: 'ok' | 'stale-cache' | 'error';
  url: string;
  fromCache: boolean;
  savedAt: number | null;
  data: RemoteStatsDatabase | null;
  error: string | null;
}

export async function fetchRemoteDatabase(
  config: RemoteSyncConfig,
  options?: { force?: boolean },
): Promise<RemoteFetchResult> {
  const url = buildRawGithubUrl(config);
  if (!url) {
    return {
      status: 'error',
      url: '',
      fromCache: false,
      savedAt: null,
      data: null,
      error: 'URL distante invalide ou incomplète.',
    };
  }

  const cached = readRemoteCache(url);
  if (!options?.force && cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return {
      status: 'ok',
      url,
      fromCache: true,
      savedAt: cached.savedAt,
      data: cached.data,
      error: null,
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) {
      const hint =
        res.status === 404
          ? 'Fichier introuvable (HTTP 404) — vérifiez que le dépôt est Public et que le workflow a généré data/stats-database.json.'
          : `Erreur HTTP ${res.status} lors du chargement de la base distante.`;
      throw new Error(hint);
    }

    const rawJson: unknown = await res.json();
    const normalized = normalizeRemoteDatabase(rawJson);
    const savedAt = writeRemoteCache(url, normalized);

    return {
      status: 'ok',
      url,
      fromCache: false,
      savedAt,
      data: normalized,
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'Délai réseau dépassé (timeout 12 s) lors de la synchronisation GitHub.'
        : err instanceof Error
          ? err.message
          : 'Impossible de joindre la base distante.';

    if (cached) {
      return {
        status: 'stale-cache',
        url,
        fromCache: true,
        savedAt: cached.savedAt,
        data: cached.data,
        error: message,
      };
    }

    return {
      status: 'error',
      url,
      fromCache: false,
      savedAt: null,
      data: null,
      error: message,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function formatShortFrenchDateTime(isoOrMs: string | number | null | undefined): string {
  if (!isoOrMs) return '—';
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} à ${hh}:${min}`;
}
