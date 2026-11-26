import test from 'node:test';
import assert from 'node:assert/strict';
import { CORE_ENTITIES } from '../data/entities';
import { buildCoreRecords } from '../data/history';
import { DEFAULT_WEIGHTS } from '../data/sports';
import {
  aggregateEntities,
  computeBarRaceFrame,
  computeHallOfRecords,
  filterRecords,
  getCsvTemplate,
  parseCsvRecords,
  scoreRecordPalmares,
  sortEntities,
} from './scoring';
import {
  buildRawGithubUrl,
  mergeRemoteDatabase,
  normalizeRemoteDatabase,
} from './remoteSync';

const allCore = buildCoreRecords();

test('core dataset covers 1950-2026 across all 9 sports including hockey', () => {
  assert.ok(allCore.length > 500, `Expected >500 core records, got ${allCore.length}`);
  const sportsFound = new Set(allCore.map((r) => r.sport));
  assert.equal(sportsFound.size, 9);
  assert.ok(sportsFound.has('hockey'));
  const years = allCore.map((r) => r.year);
  assert.ok(Math.min(...years) <= 1952);
  assert.equal(Math.max(...years), 2026);
});

test('scoreRecordPalmares computes weighted tier points accurately', () => {
  const t1Champ = allCore.find((r) => r.tier === 1 && r.rank === 1)!;
  const t1Final = allCore.find((r) => r.tier === 1 && r.rank === 2)!;
  const t2Champ = allCore.find((r) => r.tier === 2 && r.rank === 1)!;

  assert.equal(scoreRecordPalmares(t1Champ, DEFAULT_WEIGHTS), 100);
  assert.equal(scoreRecordPalmares(t1Final, DEFAULT_WEIGHTS), 45);
  assert.equal(scoreRecordPalmares(t2Champ, DEFAULT_WEIGHTS), 50);

  const customWeights = { ...DEFAULT_WEIGHTS, t1Title: 200 };
  assert.equal(scoreRecordPalmares(t1Champ, customWeights), 200);
});

test('timeline filtering changes ranking leaders accurately between eras', () => {
  // F1 2014-2020: Mercedes dominance
  const f1MercEra = filterRecords(allCore, CORE_ENTITIES, {
    startYear: 2014,
    endYear: 2020,
    entityType: 'club',
    sport: 'f1',
  });
  const aggMerc = sortEntities(
    aggregateEntities(f1MercEra, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'totalTitles', 2014, 2020),
    'score',
    'desc',
  );
  assert.equal(aggMerc[0].entity.id, 'mercedes');
  assert.equal(aggMerc[0].t1Titles, 7);

  // F1 2000-2004: Ferrari dominance
  const f1FerEra = filterRecords(allCore, CORE_ENTITIES, {
    startYear: 2000,
    endYear: 2004,
    entityType: 'club',
    sport: 'f1',
  });
  const aggFer = sortEntities(
    aggregateEntities(f1FerEra, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'totalTitles', 2000, 2004),
    'score',
    'desc',
  );
  assert.equal(aggFer[0].entity.id, 'ferrari');
  assert.equal(aggFer[0].t1Titles, 5);
});

test('hockey NHL records aggregate played, points, goalDiff and winPct without NaN', () => {
  const nhlRecs = filterRecords(allCore, CORE_ENTITIES, {
    startYear: 2020,
    endYear: 2026,
    entityType: 'club',
    sport: 'hockey',
  });
  assert.ok(nhlRecs.length >= 10);
  const agg = sortEntities(
    aggregateEntities(nhlRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'adv.points', 2020, 2026),
    'score',
    'desc',
  );
  assert.ok(agg.length >= 5);
  assert.ok(Number.isFinite(agg[0].adv.played) && agg[0].adv.played >= 82);
  assert.ok(Number.isFinite(agg[0].adv.points) && agg[0].adv.points >= 90);
  assert.ok(Number.isFinite(agg[0].adv.goalDiff));
  assert.ok(Number.isFinite(agg[0].winPct));
});

test('domination and pure statistical ranking modes work for countries & olympics', () => {
  const olympicsRecs = filterRecords(allCore, CORE_ENTITIES, {
    startYear: 2000,
    endYear: 2024,
    entityType: 'country',
    sport: 'olympics',
  });
  const aggGold = sortEntities(
    aggregateEntities(olympicsRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'stats', 'adv.gold', 2000, 2024),
    'score',
    'desc',
  );
  assert.equal(aggGold[0].entity.id, 'US');
  assert.ok(aggGold[0].adv.gold > 250);

  const aggDom = aggregateEntities(olympicsRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'domination', 'adv.gold', 2000, 2024);
  assert.ok(aggDom.every((e) => e.dominationScore >= 0 && e.dominationScore <= 100));
});

test('Bar Chart Race frame accumulates properly and Hall of Records identifies records', () => {
  const clubRecs = filterRecords(allCore, CORE_ENTITIES, {
    startYear: 2010,
    endYear: 2024,
    entityType: 'club',
    sport: 'football',
  });
  const frame2015 = computeBarRaceFrame(clubRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'cumulative', 2015);
  const frame2024 = computeBarRaceFrame(clubRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'cumulative', 2024);
  assert.ok(frame2015.length > 0);
  assert.ok(frame2024[0].value > frame2015[0].value);

  const agg = aggregateEntities(clubRecs, CORE_ENTITIES, DEFAULT_WEIGHTS, 'palmares', 'totalTitles', 2010, 2024);
  const hall = computeHallOfRecords(allCore, clubRecs, agg, CORE_ENTITIES, DEFAULT_WEIGHTS, 2010, 2024);
  assert.ok(hall.bestSeason !== null);
  assert.ok(hall.topDynasty !== null);
  assert.ok(hall.mostVersatileNation !== null);
  assert.ok(hall.mostVersatileNation!.sportsWithT1.length >= 2);
});

test('CSV template parses cleanly without errors', () => {
  const csv = getCsvTemplate();
  const parsed = parseCsvRecords(csv, CORE_ENTITIES);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.records.length, 3);
  assert.equal(parsed.records[0].entityId, 'real_madrid');
});

test('buildRawGithubUrl builds raw GitHub URLs and validates custom URLs', () => {
  const ghUrl = buildRawGithubUrl({
    mode: 'github',
    owner: 'alphabette',
    repo: 'omnistats-data',
    branch: 'main',
    filePath: 'data/stats-database.json',
    customUrl: '',
  });
  assert.equal(
    ghUrl,
    'https://raw.githubusercontent.com/alphabette/omnistats-data/main/data/stats-database.json',
  );

  const customUrl = buildRawGithubUrl({
    mode: 'url',
    owner: '',
    repo: '',
    branch: 'main',
    filePath: '',
    customUrl: 'https://example.com/stats-database.json',
  });
  assert.equal(customUrl, 'https://example.com/stats-database.json');

  const invalid = buildRawGithubUrl({
    mode: 'url',
    owner: '',
    repo: '',
    branch: 'main',
    filePath: '',
    customUrl: 'javascript:alert(1)',
  });
  assert.equal(invalid, '');
});

test('mergeRemoteDatabase deduplicates api-sports over thesportsdb, attaches logos, and extends maxYear to 2027', () => {
  const rawPayload = {
    schemaVersion: '1.0',
    lastUpdated: '2027-02-15T03:35:00.000Z',
    activeSeason: '2026-2027',
    totalRecords: 3,
    sportsCovered: ['football', 'hockey'],
    sourcesStatus: {
      'jolpica-f1': { status: 'ok', fetchedCount: 30, updatedAt: '2027-02-15T03:31:00.000Z' },
      thesportsdb: { status: 'ok', fetchedCount: 40, updatedAt: '2027-02-15T03:32:00.000Z' },
      'nhl-api': { status: 'ok', fetchedCount: 32, updatedAt: '2027-02-15T03:33:00.000Z' },
      'api-sports': { status: 'ok', fetchedCount: 60, updatedAt: '2027-02-15T03:34:00.000Z' },
    },
    records: [
      {
        id: 'tsdb_football_ligue_1_2027_paris_saint_germain',
        year: 2027,
        date: '2027-02-15',
        sport: 'football',
        competition: 'Ligue 1',
        tier: 2,
        entityId: 'football_club_paris_saint_germain',
        entityName: 'Paris Saint-Germain',
        entityType: 'club',
        countryCode: 'FRA',
        rank: 1,
        wins: 24,
        draws: 4,
        losses: 2,
        titles: 1,
        finals: 1,
        podiums: 1,
        eloRating: 1960,
        advancedStats: { played: 30, points: 76, goalsFor: 70, goalsAgainst: 22, goalDiff: 48 },
        source: 'thesportsdb',
      },
      {
        id: 'apisports_football_ligue_1_2027_paris_saint_germain',
        year: 2027,
        date: '2027-02-15',
        sport: 'football',
        competition: 'Ligue 1',
        tier: 2,
        entityId: 'football_club_paris_saint_germain',
        entityName: 'Paris Saint-Germain',
        entityType: 'club',
        countryCode: 'FRA',
        rank: 1,
        wins: 25,
        draws: 4,
        losses: 1,
        titles: 1,
        finals: 1,
        podiums: 1,
        eloRating: 1988,
        advancedStats: {
          played: 30,
          points: 79,
          goalsFor: 74,
          goalsAgainst: 19,
          goalDiff: 55,
          form: 'WWDWW',
          logo: 'https://media.api-sports.io/football/teams/85.png',
        },
        source: 'api-sports',
      },
      {
        id: 'nhl_2027_utah_hockey_club',
        year: 2027,
        date: '2027-02-15',
        sport: 'hockey',
        competition: 'NHL',
        tier: 1,
        entityId: 'hockey_club_utah_hockey_club',
        entityName: 'Utah Hockey Club',
        entityType: 'club',
        countryCode: 'USA',
        rank: 3,
        wins: 48,
        draws: 8,
        losses: 26,
        titles: 0,
        finals: 0,
        podiums: 1,
        eloRating: 1842,
        advancedStats: {
          played: 82,
          points: 104,
          goalsFor: 268,
          goalsAgainst: 224,
          goalDiff: 44,
          winPct: 58.5,
          logo: 'https://assets.nhle.com/logos/nhl/svg/UTA_light.svg',
        },
        source: 'nhl-api',
      },
    ],
  };

  const normalized = normalizeRemoteDatabase(rawPayload);
  const merged = mergeRemoteDatabase(allCore, [], normalized, CORE_ENTITIES, {});

  assert.equal(merged.maxYear, 2027);
  assert.ok(merged.stats.dedupedCrossSource >= 1);
  assert.equal(merged.stats.addedEntities, 1);

  // PSG 2027 Ligue 1 should exist once and come from api-sports (79 pts), not duplicated by thesportsdb
  const psg2027 = merged.records.filter(
    (r) => r.entityId === 'psg' && r.year === 2027 && r.sport === 'football',
  );
  assert.equal(psg2027.length, 1);
  assert.equal(psg2027[0].source, 'api-sports');
  assert.equal(psg2027[0].advancedStats.points, 79);
  assert.equal(merged.entities.psg.logoUrl, 'https://media.api-sports.io/football/teams/85.png');

  // New NHL club should be created cleanly with ISO-2 countryCode and logo
  const utah = merged.entities.hockey_club_utah_hockey_club;
  assert.ok(utah);
  assert.equal(utah.countryCode, 'US');
  assert.equal(utah.logoUrl, 'https://assets.nhle.com/logos/nhl/svg/UTA_light.svg');
});

