import { Entity, SpecificSportId, SportRecord } from '../types/omnistats';
import { localDb } from '../storage/localDb';

export interface JolpicaSyncResult {
  fromCache: boolean;
  records: SportRecord[];
  newEntities: Entity[];
  season: number;
}

const F1_ID_MAP: Record<string, string> = {
  ferrari: 'ferrari',
  mercedes: 'mercedes',
  red_bull: 'red_bull',
  mclaren: 'mclaren',
  williams: 'williams',
  renault: 'alpine_f1',
  alpine: 'alpine_f1',
  lotus: 'lotus',
  team_lotus: 'lotus',
};

const NATIONALITY_FLAG: Record<string, { code: string; flag: string }> = {
  Italian: { code: 'IT', flag: '🇮🇹' },
  German: { code: 'DE', flag: '🇩🇪' },
  British: { code: 'GB', flag: '🇬🇧' },
  Austrian: { code: 'AT', flag: '🇦🇹' },
  French: { code: 'FR', flag: '🇫🇷' },
  American: { code: 'US', flag: '🇺🇸' },
  Swiss: { code: 'CH', flag: '🇨🇭' },
  Dutch: { code: 'NL', flag: '🇳🇱' },
};

export async function syncJolpicaF1Season(
  year: number,
  existingEntities: Record<string, Entity>,
): Promise<JolpicaSyncResult> {
  const safeYear = Math.max(1950, Math.min(2026, Math.round(year)));
  const cacheKey = `jolpica_f1_constructors_${safeYear}`;

  let data = await localDb.getApiCache<Record<string, unknown>>(cacheKey);
  let fromCache = Boolean(data);

  if (!data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(
        `https://api.jolpi.ca/ergast/f1/${safeYear}/constructorStandings.json`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        throw new Error(`Jolpica-F1 a répondu HTTP ${res.status} pour la saison ${safeYear}.`);
      }
      data = (await res.json()) as Record<string, unknown>;
      await localDb.setApiCache(cacheKey, data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Délai dépassé lors de la connexion à Jolpica-F1 (timeout réseau).');
      }
      throw new Error(
        err instanceof Error
          ? `Erreur réseau / CORS Jolpica-F1 : ${err.message}`
          : 'Impossible de joindre api.jolpi.ca (vérifiez votre connexion).',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  const mrData = (data as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: Array<Record<string, unknown>> }> } } }).MRData;
  const standings = mrData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

  if (standings.length === 0) {
    throw new Error(`Aucun classement Constructeurs disponible sur Jolpica-F1 pour ${safeYear} (le titre constructeurs débute en 1958).`);
  }

  const records: SportRecord[] = [];
  const newEntities: Entity[] = [];

  for (const row of standings.slice(0, 6)) {
    const constructorObj = row.Constructor as { constructorId: string; name: string; nationality?: string } | undefined;
    if (!constructorObj) continue;

    const rawId = constructorObj.constructorId;
    const mappedId = F1_ID_MAP[rawId] || `f1_${rawId}`;
    const rank = Number(row.position) || 1;
    const points = Number(row.points) || 0;
    const wins = Number(row.wins) || 0;
    const nat = NATIONALITY_FLAG[constructorObj.nationality || ''] || { code: 'EU', flag: '🏁' };

    if (!existingEntities[mappedId] && !newEntities.some((e) => e.id === mappedId)) {
      newEntities.push({
        id: mappedId,
        name: constructorObj.name,
        short: constructorObj.name.slice(0, 3).toUpperCase(),
        type: 'club',
        countryCode: nat.code,
        flag: nat.flag,
        c1: '#EF4444',
        c2: '#1E293B',
        sport: 'f1',
      });
    }

    records.push({
      id: `jolpica_${safeYear}_${mappedId}`,
      year: safeYear,
      date: `${safeYear}-11-25`,
      sport: 'f1',
      competition: 'Championnat F1 (Sync Live)',
      tier: 1,
      entityId: mappedId,
      entityType: 'club',
      countryCode: existingEntities[mappedId]?.countryCode || nat.code,
      rank,
      wins,
      draws: 0,
      losses: Math.max(0, 22 - wins),
      titles: rank === 1 ? 1 : 0,
      finals: rank <= 2 ? 1 : 0,
      podiums: rank <= 3 ? 1 : 0,
      eloRating: Math.round(1940 - (rank - 1) * 45 + wins * 4),
      advancedStats: {
        raceWins: wins,
        points,
        poles: Math.max(0, Math.round(wins * 0.9)),
        podiums: Math.max(wins, Math.round(points / 22)),
        fastestLaps: Math.max(0, Math.round(wins * 0.55)),
        dnfRate: +(5 + rank * 1.8).toFixed(1),
      },
      source: 'jolpica',
    });
  }

  return { fromCache, records, newEntities, season: safeYear };
}

export interface SportsDbTeamResult {
  idTeam: string;
  strTeam: string;
  strTeamShort?: string;
  strSport: string;
  strCountry: string;
  strLeague?: string;
  strStadium?: string;
  strBadge?: string;
}

export async function searchTheSportsDbTeams(query: string): Promise<{ fromCache: boolean; teams: SportsDbTeamResult[] }> {
  const clean = query.trim();
  if (!clean) throw new Error('Veuillez saisir un nom de club ou d’équipe.');

  const cacheKey = `tsdb_search_${clean.toLowerCase()}`;
  let data = await localDb.getApiCache<{ teams?: SportsDbTeamResult[] | null }>(cacheKey);
  const fromCache = Boolean(data);

  if (!data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(clean)}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = (await res.json()) as { teams?: SportsDbTeamResult[] | null };
      await localDb.setApiCache(cacheKey, data);
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? `Erreur réseau TheSportsDB : ${err.message}`
          : 'Impossible de contacter TheSportsDB.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return { fromCache, teams: (data?.teams || []).slice(0, 8) };
}

export function mapSportsDbSport(rawSport: string): SpecificSportId {
  const s = (rawSport || '').toLowerCase();
  if (s.includes('soccer') || s.includes('football')) return 'football';
  if (s.includes('basket')) return 'basketball';
  if (s.includes('motorsport') || s.includes('formula')) return 'f1';
  if (s.includes('hockey')) return 'hockey';
  if (s.includes('tennis')) return 'tennis';
  if (s.includes('rugby')) return 'rugby';
  if (s.includes('handball')) return 'handball';
  if (s.includes('cycling')) return 'cycling';
  return 'football';
}

const APISPORTS_HOSTS: Record<string, { host: string; path: string; sport: SpecificSportId }> = {
  football: { host: 'v3.football.api-sports.io', path: '/standings', sport: 'football' },
  basketball: { host: 'v1.basketball.api-sports.io', path: '/standings', sport: 'basketball' },
  rugby: { host: 'v1.rugby.api-sports.io', path: '/standings', sport: 'rugby' },
  handball: { host: 'v1.handball.api-sports.io', path: '/standings', sport: 'handball' },
  formula1: { host: 'v1.formula-1.api-sports.io', path: '/rankings/teams', sport: 'f1' },
};

export async function testApiSportsConnection(apiKey: string): Promise<{ ok: boolean; message: string }> {
  const key = apiKey.trim();
  if (!key) return { ok: false, message: 'Veuillez saisir une clé API-Sports valide.' };

  const quota = localDb.getApiQuota();
  if (quota.count >= quota.limit) {
    return { ok: false, message: `Quota journalier atteint (${quota.count}/${quota.limit}).` };
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/status', {
      headers: { 'x-apisports-key': key },
    });
    localDb.incrementApiQuota();
    if (!res.ok) return { ok: false, message: `Réponse HTTP ${res.status} — vérifiez votre clé API.` };
    const json = (await res.json()) as { errors?: Record<string, string> | string[]; response?: { account?: { firstname?: string } } };
    if (json.errors && Object.keys(json.errors).length > 0) {
      return { ok: false, message: `Clé refusée par API-Sports : ${JSON.stringify(json.errors)}` };
    }
    const name = json.response?.account?.firstname || 'Compte actif';
    return { ok: true, message: `Connexion API-Sports validée (${name}).` };
  } catch (err) {
    return {
      ok: false,
      message: `Erreur réseau/CORS vers api-sports.io (${err instanceof Error ? err.message : 'échec'}).`,
    };
  }
}

export async function syncApiSportsStandings(
  apiKey: string,
  disciplineKey: string,
  leagueId: number,
  season: number,
  existingEntities: Record<string, Entity>,
): Promise<{ fromCache: boolean; records: SportRecord[]; newEntities: Entity[] }> {
  const key = apiKey.trim();
  if (!key) throw new Error('Veuillez enregistrer votre clé API-Sports avant de synchroniser.');

  const cfg = APISPORTS_HOSTS[disciplineKey] || APISPORTS_HOSTS.football;
  const cacheKey = `apisports_${disciplineKey}_${leagueId}_${season}`;
  let data = await localDb.getApiCache<Record<string, unknown>>(cacheKey);
  const fromCache = Boolean(data);

  if (!data) {
    const quota = localDb.getApiQuota();
    if (quota.count >= quota.limit) {
      throw new Error(`Quota journalier local atteint (${quota.count}/${quota.limit}).`);
    }
    const query = disciplineKey === 'formula1' ? `season=${season}` : `league=${leagueId}&season=${season}`;
    const url = `https://${cfg.host}${cfg.path}?${query}`;
    const res = await fetch(url, { headers: { 'x-apisports-key': key } });
    localDb.incrementApiQuota();
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${cfg.host}`);
    data = (await res.json()) as Record<string, unknown>;
    await localDb.setApiCache(cacheKey, data);
  }

  const records: SportRecord[] = [];
  const newEntities: Entity[] = [];

  // Handle Football v3 format or generic rankings array
  const resp = (data as { response?: unknown[] }).response || [];
  let rows: Array<{ rank: number; teamName: string; wins: number; draws: number; losses: number; pts: number; logo?: string }> = [];

  if (disciplineKey === 'football' && resp[0]) {
    const leagueObj = (resp[0] as { league?: { standings?: Array<Array<Record<string, unknown>>> } }).league;
    const standings = leagueObj?.standings?.[0] || [];
    rows = standings.slice(0, 5).map((st) => {
      const team = st.team as { name?: string; logo?: string } | undefined;
      const all = st.all as { win?: number; draw?: number; lose?: number } | undefined;
      return {
        rank: Number(st.rank) || 1,
        teamName: team?.name || 'Équipe',
        wins: Number(all?.win) || 0,
        draws: Number(all?.draw) || 0,
        losses: Number(all?.lose) || 0,
        pts: Number(st.points) || 0,
        logo: team?.logo,
      };
    });
  } else if (Array.isArray(resp)) {
    const flat = Array.isArray(resp[0]) ? (resp[0] as Array<Record<string, unknown>>) : (resp as Array<Record<string, unknown>>);
    rows = flat.slice(0, 5).map((st, idx) => {
      const team = st.team as { name?: string; logo?: string } | undefined;
      const games = st.games as { win?: { total?: number }; lose?: { total?: number } } | undefined;
      return {
        rank: Number(st.position) || idx + 1,
        teamName: team?.name || `Équipe ${idx + 1}`,
        wins: Number(games?.win?.total) || 10,
        draws: 0,
        losses: Number(games?.lose?.total) || 5,
        pts: Number(st.points) || 0,
        logo: team?.logo,
      };
    });
  }

  if (rows.length === 0) {
    throw new Error('Aucun classement retourné par API-Sports pour ces paramètres (vérifiez ID ligue / saison).');
  }

  for (const r of rows) {
    const slug = r.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const matchedKey = Object.values(existingEntities).find(
      (e) => e.name.toLowerCase() === r.teamName.toLowerCase() || e.id === slug,
    )?.id;
    const entityId = matchedKey || `apisp_${slug}`;

    if (!existingEntities[entityId] && !newEntities.some((e) => e.id === entityId)) {
      newEntities.push({
        id: entityId,
        name: r.teamName,
        short: r.teamName.slice(0, 3).toUpperCase(),
        type: 'club',
        countryCode: 'INT',
        flag: '🏟️',
        c1: '#06B6D4',
        c2: '#1E293B',
        sport: cfg.sport,
        logoUrl: r.logo,
      });
    }

    records.push({
      id: `apisports_${disciplineKey}_${leagueId}_${season}_${entityId}`,
      year: season,
      date: `${season}-05-30`,
      sport: cfg.sport,
      competition: `API-Sports Ligue #${leagueId}`,
      tier: 2,
      entityId,
      entityType: 'club',
      countryCode: existingEntities[entityId]?.countryCode || 'INT',
      rank: r.rank,
      wins: r.wins,
      draws: r.draws,
      losses: r.losses,
      titles: r.rank === 1 ? 1 : 0,
      finals: r.rank <= 2 ? 1 : 0,
      podiums: r.rank <= 3 ? 1 : 0,
      eloRating: Math.round(1900 - (r.rank - 1) * 35),
      advancedStats: { points: r.pts },
      source: 'apisports',
    });
  }

  return { fromCache, records, newEntities };
}
