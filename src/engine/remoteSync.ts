import {
  AdvancedStats,
  Entity,
  EntityType,
  RemoteSourceStatus,
  RemoteStatsDatabase,
  RemoteSyncConfig,
  SpecificSportId,
  SportRecord,
} from '../types/omnistats';
import { SPECIFIC_SPORT_IDS } from '../data/sports';

const ISO3_TO_ISO2: Record<string, { code: string; flag: string; name: string }> = {
  FRA: { code: 'FR', flag: '🇫🇷', name: 'France' },
  GBR: { code: 'GB', flag: '🇬🇧', name: 'Grande-Bretagne' },
  ESP: { code: 'ES', flag: '🇪🇸', name: 'Espagne' },
  ITA: { code: 'IT', flag: '🇮🇹', name: 'Italie' },
  DEU: { code: 'DE', flag: '🇩🇪', name: 'Allemagne' },
  GER: { code: 'DE', flag: '🇩🇪', name: 'Allemagne' },
  USA: { code: 'US', flag: '🇺🇸', name: 'États-Unis' },
  CAN: { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  AUT: { code: 'AT', flag: '🇦🇹', name: 'Autriche' },
  NLD: { code: 'NL', flag: '🇳🇱', name: 'Pays-Bas' },
  NED: { code: 'NL', flag: '🇳🇱', name: 'Pays-Bas' },
  AUS: { code: 'AU', flag: '🇦🇺', name: 'Australie' },
  JPN: { code: 'JP', flag: '🇯🇵', name: 'Japon' },
  CHE: { code: 'CH', flag: '🇨🇭', name: 'Suisse' },
  SUI: { code: 'CH', flag: '🇨🇭', name: 'Suisse' },
  DNK: { code: 'DK', flag: '🇩🇰', name: 'Danemark' },
  DEN: { code: 'DK', flag: '🇩🇰', name: 'Danemark' },
  CHN: { code: 'CN', flag: '🇨🇳', name: 'Chine' },
  BRA: { code: 'BR', flag: '🇧🇷', name: 'Brésil' },
  ARG: { code: 'AR', flag: '🇦🇷', name: 'Argentine' },
  NZL: { code: 'NZ', flag: '🇳🇿', name: 'Nouvelle-Zélande' },
  BEL: { code: 'BE', flag: '🇧🇪', name: 'Belgique' },
  SWE: { code: 'SE', flag: '🇸🇪', name: 'Suède' },
  FIN: { code: 'FI', flag: '🇫🇮', name: 'Finlande' },
  MEX: { code: 'MX', flag: '🇲🇽', name: 'Mexique' },
  MCO: { code: 'MC', flag: '🇲🇨', name: 'Monaco' },
  THA: { code: 'TH', flag: '🇹🇭', name: 'Thaïlande' },
  EUR: { code: 'EU', flag: '🇪🇺', name: 'Europe' },
};

const KNOWN_CLUB_ALIASES: Record<string, string> = {
  real_madrid: 'real_madrid',
  fc_barcelona: 'fc_barcelona',
  barcelona: 'fc_barcelona',
  fc_barcelone: 'fc_barcelona',
  bayern_munich: 'bayern',
  bayern_munchen: 'bayern',
  fc_bayern_munchen: 'bayern',
  fc_bayern_munich: 'bayern',
  manchester_city: 'man_city',
  liverpool: 'liverpool',
  liverpool_fc: 'liverpool',
  ac_milan: 'ac_milan',
  milan: 'ac_milan',
  paris_saint_germain: 'psg',
  paris_sg: 'psg',
  inter: 'inter',
  inter_milan: 'inter',
  chelsea: 'chelsea',
  chelsea_fc: 'chelsea',
  arsenal: 'arsenal',
  arsenal_fc: 'arsenal',
  manchester_united: 'man_utd',
  juventus: 'juventus',
  ajax: 'ajax',
  ajax_amsterdam: 'ajax',
  boston_celtics: 'celtics',
  los_angeles_lakers: 'lakers',
  la_lakers: 'lakers',
  golden_state_warriors: 'warriors',
  chicago_bulls: 'bulls',
  san_antonio_spurs: 'spurs',
  miami_heat: 'heat',
  denver_nuggets: 'nuggets',
  new_york_knicks: 'knicks',
  oklahoma_city_thunder: 'thunder',
  okc_thunder: 'thunder',
  ferrari: 'ferrari',
  scuderia_ferrari: 'ferrari',
  mercedes: 'mercedes',
  mercedes_amg_f1: 'mercedes',
  red_bull: 'red_bull',
  red_bull_racing: 'red_bull',
  mclaren: 'mclaren',
  mclaren_f1: 'mclaren',
  williams: 'williams',
  williams_racing: 'williams',
  alpine: 'alpine_f1',
  renault: 'alpine_f1',
  lotus: 'lotus',
  florida_panthers: 'florida_panthers',
  edmonton_oilers: 'edmonton_oilers',
  vegas_golden_knights: 'vegas_golden_knights',
  colorado_avalanche: 'colorado_avalanche',
  tampa_bay_lightning: 'tampa_bay_lightning',
  pittsburgh_penguins: 'pittsburgh_penguins',
  chicago_blackhawks: 'chicago_blackhawks',
  detroit_red_wings: 'detroit_red_wings',
  montreal_canadiens: 'montreal_canadiens',
  canadiens_de_montreal: 'montreal_canadiens',
  boston_bruins: 'boston_bruins',
};

const SOURCE_PRIORITY: Record<string, number> = {
  'api-sports': 5,
  apisports: 5,
  'nhl-api': 4,
  'jolpica-f1': 4,
  jolpica: 4,
  thesportsdb: 3,
  manual: 6,
  import: 4,
  core: 2,
};

function slugify(str: string): string {
  return String(str || 'unknown')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function normalizeCompetitionKey(comp: string): string {
  const s = slugify(comp);
  if (s.includes('champions_league') || s.includes('ligue_des_champions')) return 'ucl';
  if (s.includes('premier_league')) return 'premier_league';
  if (s.includes('ligue_1')) return 'ligue_1';
  if (s.includes('la_liga') || s === 'liga') return 'la_liga';
  if (s.includes('serie_a')) return 'serie_a';
  if (s.includes('bundesliga')) return 'bundesliga';
  if (s.includes('nba')) return 'nba';
  if (s.includes('nhl')) return 'nhl';
  if (s.includes('constructeur') || s.includes('championnat_f1')) return 'f1_constructors';
  if (s.includes('nations') && s.includes('f1')) return 'f1_nations';
  return s;
}

function normalizeCountryCode(rawCode: string): { code: string; flag: string; name?: string } {
  const upper = (rawCode || 'INT').trim().toUpperCase();
  if (ISO3_TO_ISO2[upper]) return ISO3_TO_ISO2[upper];
  // Check if already ISO2 matching one of our entries
  for (const v of Object.values(ISO3_TO_ISO2)) {
    if (v.code === upper) return v;
  }
  return { code: upper.slice(0, 2) || 'IN', flag: '🏳️' };
}

function resolveCanonicalEntityId(
  record: SportRecord,
  existingEntities: Record<string, Entity>,
): string {
  if (existingEntities[record.entityId]) return record.entityId;

  if (record.entityType === 'country') {
    const raw = record.entityId.replace(/^country_/i, '').toUpperCase();
    const mapped = normalizeCountryCode(raw);
    if (existingEntities[mapped.code]) return mapped.code;
    const byCode = normalizeCountryCode(record.countryCode);
    if (existingEntities[byCode.code]) return byCode.code;
    return mapped.code;
  }

  // Strip script prefixes like football_club_, basketball_club_, f1_team_, hockey_club_
  const strippedId = record.entityId.replace(/^(football|basketball|rugby|handball|hockey|cycling)_club_|^f1_team_/i, '');
  if (KNOWN_CLUB_ALIASES[strippedId] && existingEntities[KNOWN_CLUB_ALIASES[strippedId]]) {
    return KNOWN_CLUB_ALIASES[strippedId];
  }
  if (existingEntities[strippedId]) return strippedId;

  if (record.entityName) {
    const nameSlug = slugify(record.entityName);
    if (KNOWN_CLUB_ALIASES[nameSlug] && existingEntities[KNOWN_CLUB_ALIASES[nameSlug]]) {
      return KNOWN_CLUB_ALIASES[nameSlug];
    }
    const lowerName = record.entityName.trim().toLowerCase();
    const matchByName = Object.values(existingEntities).find(
      (e) => e.type === 'club' && e.name.toLowerCase() === lowerName,
    );
    if (matchByName) return matchByName.id;
  }

  return record.entityId;
}

function isSafeHttpUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /^https?:\/\/[^\s]+$/i.test(trimmed);
}

export function buildRawGithubUrl(config: RemoteSyncConfig): string {
  if (config.mode === 'url') {
    const u = config.customUrl.trim();
    return isSafeHttpUrl(u) ? u : '';
  }
  const owner = config.owner.trim().replace(/^@/, '');
  const repo = config.repo.trim();
  const branch = (config.branch || 'main').trim() || 'main';
  const filePath = (config.filePath || 'data/stats-database.json').trim().replace(/^\/+/, '');
  if (!owner || !repo || !filePath) return '';
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${filePath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

export function normalizeRemoteDatabase(raw: unknown): RemoteStatsDatabase {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Le fichier distant ne contient pas un objet JSON valide.');
  }
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.records)) {
    throw new Error('Schéma JSON invalide : le tableau "records" est absent.');
  }

  const normalizedRecords: SportRecord[] = [];
  for (const item of obj.records) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const rawSport = String(r.sport || '').toLowerCase() as SpecificSportId;
    if (!SPECIFIC_SPORT_IDS.includes(rawSport)) continue;

    const year = Number(r.year);
    if (!Number.isFinite(year) || year < 1950 || year > 2100) continue;

    const id = String(r.id || '').trim();
    const entityId = String(r.entityId || '').trim();
    if (!id || !entityId) continue;

    const entityType: EntityType = r.entityType === 'country' ? 'country' : 'club';
    const rawTier = Number(r.tier);
    const tier = (rawTier === 1 || rawTier === 2 || rawTier === 3 ? rawTier : 2) as 1 | 2 | 3;
    const rank = Math.max(1, Number(r.rank) || 1);
    const wins = Math.max(0, Number(r.wins) || 0);
    const draws = Math.max(0, Number(r.draws) || 0);
    const losses = Math.max(0, Number(r.losses) || 0);
    const eloRating = Number.isFinite(Number(r.eloRating)) ? Math.round(Number(r.eloRating)) : 1750;

    const rawAdv = (r.advancedStats && typeof r.advancedStats === 'object'
      ? r.advancedStats
      : {}) as Record<string, unknown>;
    const cleanAdv: AdvancedStats = {};
    for (const [k, v] of Object.entries(rawAdv)) {
      if (typeof v === 'number' && Number.isFinite(v)) {
        cleanAdv[k] = v;
      } else if (typeof v === 'string' && v.trim() !== '') {
        cleanAdv[k] = v.trim();
      }
    }

    normalizedRecords.push({
      id,
      year,
      date: typeof r.date === 'string' && r.date ? r.date : `${year}-12-01`,
      sport: rawSport,
      competition: typeof r.competition === 'string' && r.competition ? r.competition : 'Compétition',
      tier,
      entityId,
      entityName: typeof r.entityName === 'string' ? r.entityName : undefined,
      entityType,
      countryCode: typeof r.countryCode === 'string' ? r.countryCode : 'INT',
      rank,
      wins,
      draws,
      losses,
      titles: Number.isFinite(Number(r.titles)) ? Number(r.titles) : rank === 1 ? 1 : 0,
      finals: Number.isFinite(Number(r.finals)) ? Number(r.finals) : rank <= 2 ? 1 : 0,
      podiums: Number.isFinite(Number(r.podiums)) ? Number(r.podiums) : rank <= 3 ? 1 : 0,
      eloRating,
      advancedStats: cleanAdv,
      source: typeof r.source === 'string' ? r.source : 'remote',
    });
  }

  const rawSources = (obj.sourcesStatus && typeof obj.sourcesStatus === 'object'
    ? obj.sourcesStatus
    : {}) as Record<string, Record<string, unknown>>;

  const sourcesStatus: Record<string, RemoteSourceStatus> = {};
  for (const [key, val] of Object.entries(rawSources)) {
    if (!val || typeof val !== 'object') continue;
    const status = val.status === 'ok' || val.status === 'error' ? val.status : 'skipped';
    sourcesStatus[key] = {
      status,
      fetchedCount: Number.isFinite(Number(val.fetchedCount)) ? Number(val.fetchedCount) : 0,
      updatedAt: typeof val.updatedAt === 'string' ? val.updatedAt : '',
      error: typeof val.error === 'string' ? val.error : undefined,
    };
  }

  const sportsCovered = Array.isArray(obj.sportsCovered)
    ? obj.sportsCovered.map((s) => String(s))
    : Array.from(new Set(normalizedRecords.map((r) => r.sport))).sort();

  return {
    schemaVersion: typeof obj.schemaVersion === 'string' ? obj.schemaVersion : '1.0',
    lastUpdated: typeof obj.lastUpdated === 'string' ? obj.lastUpdated : new Date().toISOString(),
    activeSeason: typeof obj.activeSeason === 'string' ? obj.activeSeason : '',
    totalRecords: Number.isFinite(Number(obj.totalRecords)) ? Number(obj.totalRecords) : normalizedRecords.length,
    sportsCovered,
    sourcesStatus,
    records: normalizedRecords,
  };
}

export interface MergeResult {
  records: SportRecord[];
  entities: Record<string, Entity>;
  maxYear: number;
  stats: {
    remoteCount: number;
    replacedById: number;
    dedupedCrossSource: number;
    addedEntities: number;
  };
}

export function mergeRemoteDatabase(
  coreRecords: SportRecord[],
  customRecords: SportRecord[],
  remoteDb: RemoteStatsDatabase | null,
  coreEntities: Record<string, Entity>,
  customEntities: Record<string, Entity>,
): MergeResult {
  const entities: Record<string, Entity> = { ...coreEntities, ...customEntities };
  const byId = new Map<string, SportRecord>();

  for (const r of coreRecords) byId.set(r.id, r);
  for (const r of customRecords) byId.set(r.id, r);

  let replacedById = 0;
  let addedEntities = 0;
  const remoteRecords = remoteDb?.records || [];

  for (const rawRec of remoteRecords) {
    const canonicalId = resolveCanonicalEntityId(rawRec, entities);
    const nat = normalizeCountryCode(rawRec.countryCode);
    const logoCandidate = isSafeHttpUrl(rawRec.advancedStats?.logo) ? rawRec.advancedStats.logo : undefined;

    if (!entities[canonicalId]) {
      addedEntities++;
      const fallbackName =
        rawRec.entityType === 'country'
          ? nat.name || rawRec.entityName || canonicalId
          : rawRec.entityName || canonicalId.replace(/_/g, ' ');
      const short = fallbackName
        .split(/\s+/)
        .map((w) => w[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 3) || fallbackName.slice(0, 3).toUpperCase();

      entities[canonicalId] = {
        id: canonicalId,
        name: fallbackName,
        short: short.length >= 2 ? short : fallbackName.slice(0, 3).toUpperCase(),
        type: rawRec.entityType,
        countryCode: nat.code,
        flag: nat.flag,
        c1: rawRec.sport === 'hockey' ? '#0EA5E9' : '#06B6D4',
        c2: '#1E293B',
        sport: rawRec.entityType === 'club' ? rawRec.sport : undefined,
        logoUrl: logoCandidate,
      };
    } else if (logoCandidate && !entities[canonicalId].logoUrl) {
      entities[canonicalId] = {
        ...entities[canonicalId],
        logoUrl: logoCandidate,
      };
    }

    const mappedRecord: SportRecord = {
      ...rawRec,
      entityId: canonicalId,
      countryCode: entities[canonicalId].countryCode || nat.code,
    };

    if (byId.has(mappedRecord.id)) replacedById++;
    byId.set(mappedRecord.id, mappedRecord);
  }

  // Cross-source deduplication:
  // If multiple sources cover the same entity + year + sport + normalized competition
  // (e.g. thesportsdb vs api-sports on Ligue 1 / Premier League), keep highest-priority source (api-sports > thesportsdb > core).
  const seasonSlotMap = new Map<string, SportRecord>();
  let dedupedCrossSource = 0;

  for (const rec of byId.values()) {
    const compKey = normalizeCompetitionKey(rec.competition);
    const slotKey = `${rec.entityId}__${rec.year}__${rec.sport}__${compKey}`;
    const existing = seasonSlotMap.get(slotKey);

    if (!existing) {
      seasonSlotMap.set(slotKey, rec);
      continue;
    }

    // Same source with distinct IDs (e.g. multiple manual entries): keep both under unique slot
    if (existing.source === rec.source && rec.source === 'manual') {
      seasonSlotMap.set(`${slotKey}__${rec.id}`, rec);
      continue;
    }

    const pExisting = SOURCE_PRIORITY[existing.source || 'core'] ?? 2;
    const pNew = SOURCE_PRIORITY[rec.source || 'core'] ?? 2;

    if (pNew > pExisting) {
      seasonSlotMap.set(slotKey, rec);
      dedupedCrossSource++;
    } else if (pNew < pExisting) {
      dedupedCrossSource++;
    } else {
      // Equal priority: prefer the one with richer advancedStats
      const keysExisting = Object.keys(existing.advancedStats || {}).length;
      const keysNew = Object.keys(rec.advancedStats || {}).length;
      if (keysNew >= keysExisting) {
        seasonSlotMap.set(slotKey, rec);
      }
      dedupedCrossSource++;
    }
  }

  const mergedRecords = Array.from(seasonSlotMap.values());
  let maxYear = 2026;
  for (const r of mergedRecords) {
    if (r.year > maxYear) maxYear = r.year;
  }

  return {
    records: mergedRecords,
    entities,
    maxYear,
    stats: {
      remoteCount: remoteRecords.length,
      replacedById,
      dedupedCrossSource,
      addedEntities,
    },
  };
}
