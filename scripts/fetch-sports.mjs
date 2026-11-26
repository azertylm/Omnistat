import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'stats-database.json');
const API_SPORTS_KEY = process.env.API_SPORTS_KEY?.trim() || '';
const F1_YEARS = (process.env.F1_YEARS || '2024,2025,2026')
  .split(',')
  .map((y) => y.trim())
  .filter(Boolean);

const TODAY = new Date().toISOString().slice(0, 10);
const CURRENT_YEAR = new Date().getUTCFullYear();
const CURRENT_MONTH = new Date().getUTCMonth() + 1;

// Calcule la saison européenne en cours (ex: "2026-2027" dès août 2026)
const ACTIVE_SEASON_START = CURRENT_MONTH >= 8 ? CURRENT_YEAR : CURRENT_YEAR - 1;
const ACTIVE_SEASON_STR = `${ACTIVE_SEASON_START}-${ACTIVE_SEASON_START + 1}`;

const NATIONALITY_TO_ISO3 = {
  British: 'GBR',
  Italian: 'ITA',
  Austrian: 'AUT',
  German: 'DEU',
  French: 'FRA',
  American: 'USA',
  Dutch: 'NLD',
  Spanish: 'ESP',
  Monegasque: 'MCO',
  Australian: 'AUS',
  Japanese: 'JPN',
  Swiss: 'CHE',
  Canadian: 'CAN',
  Mexican: 'MEX',
  Finnish: 'FIN',
  Danish: 'DNK',
  Thai: 'THA',
  Chinese: 'CHN',
  Brazilian: 'BRA',
  Argentine: 'ARG',
  'New Zealander': 'NZL',
  England: 'GBR',
  France: 'FRA',
  Spain: 'ESP',
  Italy: 'ITA',
  Germany: 'DEU',
  USA: 'USA',
  Canada: 'CAN',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(str) {
  return String(str || 'unknown')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function estimateElo(winPct, rank, tier) {
  const base = tier === 1 ? 1650 : tier === 2 ? 1550 : 1480;
  const winBonus = Math.round((winPct - 50) * 6);
  const rankBonus = Math.max(0, 10 - rank) * 14;
  return Math.max(1200, Math.min(2200, base + winBonus + rankBonus));
}

async function fetchJson(url, headers = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'OmniStats-SyncBot/1.0',
          Accept: 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.status === 429 && attempt < retries) {
        await sleep(2500 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} sur ${url}`);
      }

      return await response.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
}

// ============================================================================
// SOURCE 1 : JOLPICA-F1 (Gratuit, sans clé, historique depuis 1950)
// ============================================================================
async function syncJolpicaF1() {
  const records = [];

  for (const yearStr of F1_YEARS) {
    const year = Number(yearStr);
    if (!Number.isFinite(year)) continue;

    // 1A. Championnat Constructeurs (Clubs / Écuries)
    const ctorUrl = `https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`;
    const ctorData = await fetchJson(ctorUrl);
    const ctorList =
      ctorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    for (const item of ctorList) {
      const rank = Number(item.position) || 99;
      const wins = Number(item.wins) || 0;
      const points = Number(item.points) || 0;
      const name = item.Constructor?.name || 'Unknown';
      const entityId = `f1_team_${slugify(item.Constructor?.constructorId || name)}`;
      const countryCode = NATIONALITY_TO_ISO3[item.Constructor?.nationality] || 'INT';
      const winPct = Math.min(100, Number(((wins / 24) * 100).toFixed(1)));

      records.push({
        id: `f1_ctor_${year}_${entityId}`,
        year,
        date: `${year}-12-01`,
        sport: 'f1',
        competition: 'Formule 1 - Constructeurs',
        tier: 1,
        entityId,
        entityName: name,
        entityType: 'club',
        countryCode,
        rank,
        wins,
        draws: 0,
        losses: Math.max(0, 24 - wins),
        titles: rank === 1 ? 1 : 0,
        finals: rank <= 2 ? 1 : 0,
        podiums: rank <= 3 ? 1 : 0,
        eloRating: estimateElo(winPct + (rank <= 3 ? 25 : 0), rank, 1),
        source: 'jolpica-f1',
        advancedStats: {
          raceWins: wins,
          points,
          constructorRank: rank,
        },
      });
    }

    await sleep(450);

    // 1B. Agrégation par Pays via les Pilotes
    const driverUrl = `https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`;
    const driverData = await fetchJson(driverUrl);
    const driverList =
      driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    const countryAgg = new Map();
    for (const d of driverList) {
      const iso = NATIONALITY_TO_ISO3[d.Driver?.nationality] || null;
      if (!iso) continue;

      const current = countryAgg.get(iso) || {
        wins: 0,
        points: 0,
        titles: 0,
        podiums: 0,
        bestRank: 99,
      };
      const pos = Number(d.position) || 99;
      current.wins += Number(d.wins) || 0;
      current.points += Number(d.points) || 0;
      if (pos === 1) current.titles += 1;
      if (pos <= 3) current.podiums += 1;
      current.bestRank = Math.min(current.bestRank, pos);
      countryAgg.set(iso, current);
    }

    const sortedCountries = [...countryAgg.entries()].sort((a, b) => b[1].points - a[1].points);
    sortedCountries.forEach(([iso, stats], idx) => {
      const rank = idx + 1;
      const winPct = Math.min(100, Number(((stats.wins / 24) * 100).toFixed(1)));
      records.push({
        id: `f1_country_${year}_${iso}`,
        year,
        date: `${year}-12-01`,
        sport: 'f1',
        competition: 'Formule 1 - Nations (Pilotes)',
        tier: 1,
        entityId: `country_${iso.toLowerCase()}`,
        entityName: iso,
        entityType: 'country',
        countryCode: iso,
        rank,
        wins: stats.wins,
        draws: 0,
        losses: 0,
        titles: stats.titles,
        finals: stats.bestRank <= 2 ? 1 : 0,
        podiums: stats.podiums,
        eloRating: estimateElo(winPct + (rank <= 3 ? 20 : 0), rank, 1),
        source: 'jolpica-f1',
        advancedStats: {
          raceWins: stats.wins,
          points: Number(stats.points.toFixed(1)),
          bestDriverRank: stats.bestRank,
        },
      });
    });

    await sleep(450);
  }

  return records;
}

// ============================================================================
// SOURCE 2 : THESPORTSDB (Clé publique gratuite "3" - Top classements Foot/NBA)
// ============================================================================
async function syncTheSportsDB() {
  const records = [];
  const leagues = [
    { id: '4328', name: 'Premier League', sport: 'football', country: 'GBR', tier: 2 },
    { id: '4334', name: 'Ligue 1', sport: 'football', country: 'FRA', tier: 2 },
    { id: '4335', name: 'La Liga', sport: 'football', country: 'ESP', tier: 2 },
    { id: '4332', name: 'Serie A', sport: 'football', country: 'ITA', tier: 2 },
    { id: '4331', name: 'Bundesliga', sport: 'football', country: 'DEU', tier: 2 },
    { id: '4387', name: 'NBA', sport: 'basketball', country: 'USA', tier: 1 },
  ];

  for (const league of leagues) {
    const url = `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${league.id}&s=${ACTIVE_SEASON_STR}`;
    const data = await fetchJson(url);
    const rows = data?.table || [];

    for (const row of rows) {
      const rank = Number(row.intRank) || 99;
      const played = Number(row.intPlayed) || 0;
      const wins = Number(row.intWin) || 0;
      const draws = Number(row.intDraw) || 0;
      const losses = Number(row.intLoss) || 0;
      const goalsFor = Number(row.intGoalsFor) || 0;
      const goalsAgainst = Number(row.intGoalsAgainst) || 0;
      const points = Number(row.intPoints) || 0;
      const winPct = played > 0 ? Number(((wins / played) * 100).toFixed(1)) : 0;
      const teamName = row.strTeam || 'Unknown';
      const entityId = `${league.sport}_club_${slugify(teamName)}`;

      records.push({
        id: `tsdb_${league.id}_${ACTIVE_SEASON_START}_${entityId}`,
        year: ACTIVE_SEASON_START + 1,
        date: TODAY,
        sport: league.sport,
        competition: league.name,
        tier: league.tier,
        entityId,
        entityName: teamName,
        entityType: 'club',
        countryCode: league.country,
        rank,
        wins,
        draws,
        losses,
        titles: rank === 1 ? 1 : 0,
        finals: rank <= 2 ? 1 : 0,
        podiums: rank <= 3 ? 1 : 0,
        eloRating: estimateElo(winPct, rank, league.tier),
        source: 'thesportsdb',
        advancedStats:
          league.sport === 'football'
            ? {
                played,
                points,
                goalsFor,
                goalsAgainst,
                goalDiff: goalsFor - goalsAgainst,
                goalsPerMatch: played > 0 ? Number((goalsFor / played).toFixed(2)) : 0,
                winPct,
                form: row.strForm || '',
              }
            : {
                played,
                winPct,
                pointsDiff: goalsFor - goalsAgainst,
              },
      });
    }

    await sleep(600);
  }

  return records;
}

// ============================================================================
// SOURCE 3 : NHL API OFFICIELLE (Gratuit, sans clé, classement complet)
// ============================================================================
async function syncNHL() {
  const records = [];
  const data = await fetchJson('https://api-web.nhle.com/v1/standings/now');
  const standings = data?.standings || [];

  for (const team of standings) {
    const rank = Number(team.leagueSequence) || 99;
    const wins = Number(team.wins) || 0;
    const losses = Number(team.losses) || 0;
    const otLosses = Number(team.otLosses) || 0;
    const gamesPlayed = Number(team.gamesPlayed) || wins + losses + otLosses;
    const winPct = Number(((Number(team.winPctg) || 0) * 100).toFixed(1));
    const name = team.teamName?.default || team.teamAbbrev?.default || 'Unknown';
    const entityId = `hockey_club_${slugify(name)}`;

    records.push({
      id: `nhl_${ACTIVE_SEASON_START}_${entityId}`,
      year: ACTIVE_SEASON_START + 1,
      date: TODAY,
      sport: 'hockey',
      competition: 'NHL',
      tier: 1,
      entityId,
      entityName: name,
      entityType: 'club',
      countryCode: team.countryCode || 'USA',
      rank,
      wins,
      draws: otLosses,
      losses,
      titles: rank === 1 ? 1 : 0,
      finals: rank <= 2 ? 1 : 0,
      podiums: rank <= 3 ? 1 : 0,
      eloRating: estimateElo(winPct, rank, 1),
      source: 'nhl-api',
      advancedStats: {
        played: gamesPlayed,
        points: Number(team.points) || 0,
        goalsFor: Number(team.goalFor) || 0,
        goalsAgainst: Number(team.goalAgainst) || 0,
        goalDiff: Number(team.goalDifferential) || 0,
        winPct,
      },
    });
  }

  return records;
}

// ============================================================================
// SOURCE 4 : API-SPORTS (Optionnelle via secret GitHub API_SPORTS_KEY)
// Respecte strictement le quota gratuit (seulement 6 requêtes / nuit)
// ============================================================================
async function syncApiSports() {
  if (!API_SPORTS_KEY) return [];
  const records = [];
  const apiErrors = [];
  const noteErrors = (label, data) => {
    const e = data?.errors;
    const msg = Array.isArray(e) ? e.join('; ') : e && typeof e === 'object' ? Object.values(e).join('; ') : '';
    if (msg) apiErrors.push(`${label}: ${msg}`);
  };
  const headers = { 'x-apisports-key': API_SPORTS_KEY };

  const footballLeagues = [
    { id: 2, name: 'UEFA Champions League', country: 'EUR', tier: 1 },
    { id: 39, name: 'Premier League', country: 'GBR', tier: 2 },
    { id: 61, name: 'Ligue 1', country: 'FRA', tier: 2 },
    { id: 140, name: 'La Liga', country: 'ESP', tier: 2 },
    { id: 135, name: 'Serie A', country: 'ITA', tier: 2 },
    { id: 78, name: 'Bundesliga', country: 'DEU', tier: 2 },
  ];

  for (const league of footballLeagues) {
    const url = `https://v3.football.api-sports.io/standings?league=${league.id}&season=${ACTIVE_SEASON_START}`;
    const data = await fetchJson(url, headers);
    noteErrors(league.name, data);
    const groups = data?.response?.[0]?.league?.standings || [];

    for (const group of groups) {
      for (const row of group) {
        const rank = Number(row.rank) || 99;
        const played = Number(row.all?.played) || 0;
        const wins = Number(row.all?.win) || 0;
        const draws = Number(row.all?.draw) || 0;
        const losses = Number(row.all?.lose) || 0;
        const goalsFor = Number(row.all?.goals?.for) || 0;
        const goalsAgainst = Number(row.all?.goals?.against) || 0;
        const winPct = played > 0 ? Number(((wins / played) * 100).toFixed(1)) : 0;
        const teamName = row.team?.name || 'Unknown';
        const entityId = `football_club_${slugify(teamName)}`;

        records.push({
          id: `apisports_fb_${league.id}_${ACTIVE_SEASON_START}_${entityId}`,
          year: ACTIVE_SEASON_START + 1,
          date: TODAY,
          sport: 'football',
          competition: league.name,
          tier: league.tier,
          entityId,
          entityName: teamName,
          entityType: 'club',
          countryCode: league.country,
          rank,
          wins,
          draws,
          losses,
          titles: rank === 1 ? 1 : 0,
          finals: rank <= 2 ? 1 : 0,
          podiums: rank <= 3 ? 1 : 0,
          eloRating: estimateElo(winPct, rank, league.tier),
          source: 'api-sports',
          advancedStats: {
            played,
            points: Number(row.points) || 0,
            goalsFor,
            goalsAgainst,
            goalDiff: Number(row.goalsDiff) || goalsFor - goalsAgainst,
            goalsPerMatch: played > 0 ? Number((goalsFor / played).toFixed(2)) : 0,
            winPct,
            form: row.form || '',
            logo: row.team?.logo || null,
          },
        });
      }
    }

    await sleep(500);
  }

  // NBA (API-Sports Basketball : API distincte avec son propre quota, 1 requête/nuit)
  try {
    const nbaUrl = `https://v1.basketball.api-sports.io/standings?league=12&season=${ACTIVE_SEASON_STR}`;
    const nbaData = await fetchJson(nbaUrl, headers);
    noteErrors('NBA', nbaData);
    const nbaRows = (nbaData?.response || []).flat();

    for (const row of nbaRows) {
      const rank = Number(row.position) || 99;
      const played = Number(row.games?.played) || 0;
      const wins = Number(row.games?.win?.total) || 0;
      const losses = Number(row.games?.lose?.total) || 0;
      const pointsFor = Number(row.points?.for) || 0;
      const pointsAgainst = Number(row.points?.against) || 0;
      const winPct = played > 0 ? Number(((wins / played) * 100).toFixed(1)) : 0;
      const teamName = row.team?.name || 'Unknown';
      const entityId = `basketball_club_${slugify(teamName)}`;

      records.push({
        id: `apisports_nba_12_${ACTIVE_SEASON_START}_${entityId}`,
        year: ACTIVE_SEASON_START + 1,
        date: TODAY,
        sport: 'basketball',
        competition: 'NBA',
        tier: 1,
        entityId,
        entityName: teamName,
        entityType: 'club',
        countryCode: 'USA',
        rank,
        wins,
        draws: 0,
        losses,
        titles: rank === 1 ? 1 : 0,
        finals: rank <= 2 ? 1 : 0,
        podiums: rank <= 3 ? 1 : 0,
        eloRating: estimateElo(winPct, rank, 1),
        source: 'api-sports',
        advancedStats: {
          played,
          winPct,
          pointsDiff: pointsFor - pointsAgainst,
          logo: row.team?.logo || null,
        },
      });
    }
  } catch (err) {
    console.error('API-Sports NBA :', err.message);
    apiErrors.push(`NBA: ${err.message}`);
  }

  if (records.length === 0 && apiErrors.length > 0) {
    throw new Error(apiErrors.slice(0, 3).join(' | '));
  }
  return records;
}

// ============================================================================
// ORCHESTRATION & FUSION SANS PERTE D'HISTORIQUE
// ============================================================================
async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Charge la base existante pour ne jamais perdre l'historique si une API échoue
  let existingRecords = [];
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      existingRecords = Array.isArray(raw.records) ? raw.records : [];
    } catch {
      console.warn('Fichier existant illisible, recréation propre.');
    }
  }

  const recordMap = new Map(existingRecords.map((r) => [r.id, r]));
  const sourcesStatus = {};

  const runners = [
    { name: 'jolpica-f1', fn: syncJolpicaF1 },
    { name: 'thesportsdb', fn: syncTheSportsDB },
    { name: 'nhl-api', fn: syncNHL },
    { name: 'api-sports', fn: syncApiSports },
  ];

  for (const runner of runners) {
    try {
      console.log(`Synchronisation : ${runner.name}...`);
      const fetched = await runner.fn();
      for (const rec of fetched) {
        recordMap.set(rec.id, rec);
      }
      sourcesStatus[runner.name] = {
        status: fetched.length > 0 ? 'ok' : 'skipped',
        fetchedCount: fetched.length,
        updatedAt: new Date().toISOString(),
      };
      console.log(`-> ${runner.name} : ${fetched.length} entrées traitées.`);
    } catch (error) {
      console.error(`Erreur sur ${runner.name} :`, error.message);
      sourcesStatus[runner.name] = {
        status: 'error',
        error: error.message,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  const mergedRecords = [...recordMap.values()].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (a.sport !== b.sport) return a.sport.localeCompare(b.sport);
    return a.rank - b.rank;
  });

  const payload = {
    schemaVersion: '1.0',
    lastUpdated: new Date().toISOString(),
    activeSeason: ACTIVE_SEASON_STR,
    totalRecords: mergedRecords.length,
    sportsCovered: [...new Set(mergedRecords.map((r) => r.sport))].sort(),
    sourcesStatus,
    records: mergedRecords,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Terminé : ${mergedRecords.length} enregistrements écrits dans ${DB_FILE}.`);
}

main();
