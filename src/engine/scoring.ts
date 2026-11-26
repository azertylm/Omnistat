import {
  AggregatedEntity,
  AlgoMode,
  Entity,
  EntityType,
  HallOfRecordsData,
  ScoringWeights,
  SpecificSportId,
  SportId,
  SportRecord,
} from '../types/omnistats';
import { CHART_PALETTE, SPECIFIC_SPORT_IDS, SPORTS_MAP } from '../data/sports';

const AVG_STAT_KEYS = new Set([
  'possessionPct',
  'fgPct',
  'threePtPct',
  'netRating',
  'winPct',
  'dnfRate',
  'acesPerMatch',
  'breakPointsConvertedPct',
  'tackleSuccessPct',
  'efficiencyPct',
  'ptsPerGame',
  'oppPtsPerGame',
  'medalsPerMillionPop',
  'goalsPerMatch',
  'constructorRank',
  'bestDriverRank',
]);

const MAX_STAT_KEYS = new Set(['unbeatenStreak']);

export function scoreRecordPalmares(record: SportRecord, weights: ScoringWeights): number {
  const tier = record.tier || 2;
  const isTitle = record.rank === 1;
  const isFinal = record.rank === 2;
  const isPodium = record.rank === 3;

  if (tier === 1) {
    return isTitle ? weights.t1Title : isFinal ? weights.t1Final : isPodium ? weights.t1Podium : 6;
  }
  if (tier === 2) {
    return isTitle ? weights.t2Title : isFinal ? weights.t2Final : isPodium ? weights.t2Podium : 3;
  }
  return isTitle ? weights.t3Title : isFinal ? weights.t3Final : isPodium ? weights.t3Podium : 1;
}

export interface FilterCriteria {
  startYear: number;
  endYear: number;
  entityType: EntityType;
  sport: SportId;
  search?: string;
  onlyFavs?: boolean;
  favorites?: string[];
}

export function filterRecords(
  records: SportRecord[],
  entities: Record<string, Entity>,
  criteria: FilterCriteria,
): SportRecord[] {
  const q = (criteria.search || '').trim().toLowerCase();
  const favSet = criteria.onlyFavs ? new Set(criteria.favorites || []) : null;

  return records.filter((r) => {
    if (r.year < criteria.startYear || r.year > criteria.endYear) return false;
    if (r.entityType !== criteria.entityType) return false;
    if (criteria.sport !== 'all' && r.sport !== criteria.sport) return false;
    if (favSet && !favSet.has(r.entityId)) return false;
    if (q) {
      const ent = entities[r.entityId];
      const sportName = SPORTS_MAP[r.sport]?.name || r.sport;
      const haystack = `${ent?.name || r.entityId} ${ent?.short || ''} ${r.countryCode} ${r.competition} ${sportName}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function extractPureMetric(item: AggregatedEntity, metricKey: string): number {
  if (!metricKey) return item.palmaresScore;
  if (metricKey.startsWith('adv.')) {
    const k = metricKey.slice(4);
    return item.adv[k] !== undefined ? item.adv[k] : 0;
  }
  const val = (item as unknown as Record<string, unknown>)[metricKey];
  return typeof val === 'number' ? val : 0;
}

export function aggregateEntities(
  records: SportRecord[],
  entities: Record<string, Entity>,
  weights: ScoringWeights,
  algo: AlgoMode,
  pureMetric: string,
  startYear: number,
  endYear: number,
): AggregatedEntity[] {
  interface Accumulator {
    entity: Entity;
    records: SportRecord[];
    sportsSet: Set<SpecificSportId>;
    palmaresScore: number;
    t1Titles: number;
    t1Finals: number;
    t1Podiums: number;
    t2Titles: number;
    t2Finals: number;
    t2Podiums: number;
    t3Titles: number;
    totalTitles: number;
    totalPodiums: number;
    wins: number;
    draws: number;
    losses: number;
    eloSum: number;
    peakElo: number;
    yearsActive: Set<number>;
    yearlyPalmares: Record<number, number>;
    advTotals: Record<string, number>;
    advCounts: Record<string, number>;
    advMax: Record<string, number>;
  }

  const map = new Map<string, Accumulator>();

  for (const r of records) {
    const ent = entities[r.entityId];
    if (!ent) continue;

    let g = map.get(r.entityId);
    if (!g) {
      g = {
        entity: ent,
        records: [],
        sportsSet: new Set<SpecificSportId>(),
        palmaresScore: 0,
        t1Titles: 0,
        t1Finals: 0,
        t1Podiums: 0,
        t2Titles: 0,
        t2Finals: 0,
        t2Podiums: 0,
        t3Titles: 0,
        totalTitles: 0,
        totalPodiums: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        eloSum: 0,
        peakElo: 0,
        yearsActive: new Set<number>(),
        yearlyPalmares: {},
        advTotals: {},
        advCounts: {},
        advMax: {},
      };
      map.set(r.entityId, g);
    }

    g.records.push(r);
    g.sportsSet.add(r.sport);
    g.yearsActive.add(r.year);

    const pts = scoreRecordPalmares(r, weights);
    g.palmaresScore += pts;
    g.yearlyPalmares[r.year] = (g.yearlyPalmares[r.year] || 0) + pts;

    if (r.tier === 1) {
      if (r.rank === 1) g.t1Titles++;
      else if (r.rank === 2) g.t1Finals++;
      else if (r.rank === 3) g.t1Podiums++;
    } else if (r.tier === 2) {
      if (r.rank === 1) g.t2Titles++;
      else if (r.rank === 2) g.t2Finals++;
      else if (r.rank === 3) g.t2Podiums++;
    } else if (r.rank === 1) {
      g.t3Titles++;
    }

    if (r.rank === 1) g.totalTitles++;
    if (r.rank <= 3) g.totalPodiums++;

    g.wins += r.wins || 0;
    g.draws += r.draws || 0;
    g.losses += r.losses || 0;
    const elo = r.eloRating || 1700;
    g.eloSum += elo;
    if (elo > g.peakElo) g.peakElo = elo;

    if (r.advancedStats) {
      for (const [k, v] of Object.entries(r.advancedStats)) {
        if (typeof v === 'number' && Number.isFinite(v)) {
          g.advTotals[k] = (g.advTotals[k] || 0) + v;
          g.advCounts[k] = (g.advCounts[k] || 0) + 1;
          g.advMax[k] = Math.max(g.advMax[k] ?? -Infinity, v);
        }
      }
    }
  }

  const list: AggregatedEntity[] = [];
  const span = Math.max(1, endYear - startYear + 1);
  const buckets = Math.min(10, span);

  for (const g of map.values()) {
    const matches = Math.max(1, g.wins + g.draws + g.losses);
    const winPct = +((g.wins / matches) * 100).toFixed(1);
    const avgElo = Math.round(g.eloSum / g.records.length);

    const eloNorm = Math.max(0, Math.min(100, ((avgElo - 1650) / 420) * 100));
    const winNorm = Math.max(0, Math.min(100, winPct));
    const marginNorm =
      g.advMax.unbeatenStreak !== undefined
        ? Math.min(100, g.advMax.unbeatenStreak * 2.2)
        : Math.min(100, (g.totalPodiums / g.records.length) * 95);
    const wSum = Math.max(1, weights.domElo + weights.domWin + weights.domMargin);
    const dominationScore = +(
      (eloNorm * weights.domElo + winNorm * weights.domWin + marginNorm * weights.domMargin) /
      wSum
    ).toFixed(1);

    const adv: Record<string, number> = {};
    for (const k of Object.keys(g.advTotals)) {
      if (MAX_STAT_KEYS.has(k)) {
        adv[k] = +g.advMax[k].toFixed(1);
      } else if (AVG_STAT_KEYS.has(k)) {
        adv[k] = +(g.advTotals[k] / g.advCounts[k]).toFixed(1);
      } else {
        adv[k] = +g.advTotals[k].toFixed(1);
      }
    }

    const spark: number[] = [];
    for (let b = 0; b < buckets; b++) {
      const y0 = startYear + Math.floor((b * span) / buckets);
      const y1 = startYear + Math.floor(((b + 1) * span) / buckets) - 1;
      let sum = 0;
      for (let y = y0; y <= Math.max(y0, y1); y++) {
        sum += g.yearlyPalmares[y] || 0;
      }
      spark.push(sum);
    }

    const formulaDetail = `Tier 1: ${g.t1Titles}×${weights.t1Title} + ${g.t1Finals}×${weights.t1Final} + ${g.t1Podiums}×${weights.t1Podium} | Tier 2: ${g.t2Titles}×${weights.t2Title} + ${g.t2Finals}×${weights.t2Final} + ${g.t2Podiums}×${weights.t2Podium} | Tier 3: ${g.t3Titles}×${weights.t3Title}`;

    const row: AggregatedEntity = {
      entity: g.entity,
      records: g.records,
      sports: Array.from(g.sportsSet),
      palmaresScore: Math.round(g.palmaresScore),
      dominationScore,
      score: 0,
      t1Titles: g.t1Titles,
      t1Finals: g.t1Finals,
      t1Podiums: g.t1Podiums,
      t2Titles: g.t2Titles,
      t2Finals: g.t2Finals,
      t2Podiums: g.t2Podiums,
      t3Titles: g.t3Titles,
      totalTitles: g.totalTitles,
      totalPodiums: g.totalPodiums,
      wins: g.wins,
      draws: g.draws,
      losses: g.losses,
      winPct,
      avgElo,
      peakElo: g.peakElo,
      yearsCount: g.yearsActive.size,
      yearlyPalmares: g.yearlyPalmares,
      spark,
      adv,
      formulaDetail,
    };

    if (algo === 'palmares') {
      row.score = row.palmaresScore;
    } else if (algo === 'domination') {
      row.score = row.dominationScore;
    } else {
      row.score = extractPureMetric(row, pureMetric);
    }

    list.push(row);
  }

  return list;
}

export function sortEntities(
  list: AggregatedEntity[],
  sortCol: string,
  sortDir: 'asc' | 'desc',
): AggregatedEntity[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  return list.slice().sort((a, b) => {
    if (sortCol === 'name') {
      return a.entity.name.localeCompare(b.entity.name, 'fr') * dir;
    }
    let va = 0;
    let vb = 0;
    if (sortCol === 'sportsCount') {
      va = a.sports.length;
      vb = b.sports.length;
    } else if (sortCol.startsWith('adv.')) {
      const k = sortCol.slice(4);
      va = a.adv[k] ?? -99999;
      vb = b.adv[k] ?? -99999;
    } else {
      const rawA = (a as unknown as Record<string, unknown>)[sortCol];
      const rawB = (b as unknown as Record<string, unknown>)[sortCol];
      va = typeof rawA === 'number' ? rawA : 0;
      vb = typeof rawB === 'number' ? rawB : 0;
    }
    if (va === vb) {
      return b.t1Titles - a.t1Titles || b.peakElo - a.peakElo || a.entity.name.localeCompare(b.entity.name, 'fr');
    }
    return (va - vb) * dir;
  });
}

export interface TimelineSeriesResult {
  years: number[];
  series: Array<{
    entity: Entity;
    color: string;
    points: Array<{ year: number; annual: number; cumulative: number }>;
  }>;
}

export function buildTimelineSeries(
  filteredRecords: SportRecord[],
  sortedList: AggregatedEntity[],
  weights: ScoringWeights,
  algo: AlgoMode,
  startYear: number,
  endYear: number,
): TimelineSeriesResult {
  const top8 = sortedList.slice(0, 8);
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const entityYearMap: Record<string, Record<number, number>> = {};
  for (const r of filteredRecords) {
    if (!entityYearMap[r.entityId]) entityYearMap[r.entityId] = {};
    const val = algo === 'domination' ? Math.max(10, (r.eloRating - 1600) / 4) : scoreRecordPalmares(r, weights);
    entityYearMap[r.entityId][r.year] = (entityYearMap[r.entityId][r.year] || 0) + val;
  }

  const series = top8.map((item, idx) => {
    let cumul = 0;
    const points = years.map((y) => {
      const ann = Math.round(entityYearMap[item.entity.id]?.[y] || 0);
      cumul += ann;
      return { year: y, annual: ann, cumulative: cumul };
    });
    return {
      entity: item.entity,
      color: CHART_PALETTE[idx % CHART_PALETTE.length],
      points,
    };
  });

  return { years, series };
}

export interface BarRaceRow {
  entity: Entity;
  value: number;
  t1Count: number;
}

export function computeBarRaceFrame(
  filteredRecords: SportRecord[],
  entities: Record<string, Entity>,
  weights: ScoringWeights,
  algo: AlgoMode,
  raceMode: 'cumulative' | 'annual',
  targetYear: number,
): BarRaceRow[] {
  const scores = new Map<string, { value: number; t1Count: number }>();

  for (const r of filteredRecords) {
    if (raceMode === 'cumulative' && r.year > targetYear) continue;
    if (raceMode === 'annual' && r.year !== targetYear) continue;

    const pts = algo === 'domination' ? Math.max(10, Math.round((r.eloRating - 1600) / 4)) : scoreRecordPalmares(r, weights);
    const cur = scores.get(r.entityId) || { value: 0, t1Count: 0 };
    cur.value += pts;
    if (r.tier === 1 && r.rank === 1) cur.t1Count += 1;
    scores.set(r.entityId, cur);
  }

  return Array.from(scores.entries())
    .map(([id, data]) => ({ entity: entities[id], value: Math.round(data.value), t1Count: data.t1Count }))
    .filter((x) => Boolean(x.entity) && x.value > 0)
    .sort((a, b) => b.value - a.value || b.t1Count - a.t1Count)
    .slice(0, 10);
}

export function computeHallOfRecords(
  allRecords: SportRecord[],
  filteredRecords: SportRecord[],
  aggregatedList: AggregatedEntity[],
  entities: Record<string, Entity>,
  weights: ScoringWeights,
  startYear: number,
  endYear: number,
): HallOfRecordsData {
  // 1. Best single season (entity + year)
  const seasonMap = new Map<string, { entity: Entity; year: number; score: number; comps: string[] }>();
  for (const r of filteredRecords) {
    const ent = entities[r.entityId];
    if (!ent) continue;
    const key = `${r.entityId}__${r.year}`;
    const pts = scoreRecordPalmares(r, weights);
    const cur = seasonMap.get(key) || { entity: ent, year: r.year, score: 0, comps: [] };
    cur.score += pts;
    if (r.rank === 1) cur.comps.push(r.competition);
    seasonMap.set(key, cur);
  }
  const bestSeasonRaw = Array.from(seasonMap.values()).sort((a, b) => b.score - a.score)[0] || null;
  const bestSeason = bestSeasonRaw
    ? {
        entity: bestSeasonRaw.entity,
        year: bestSeasonRaw.year,
        score: Math.round(bestSeasonRaw.score),
        details: bestSeasonRaw.comps.length ? bestSeasonRaw.comps.slice(0, 3).join(' + ') : 'Pic de performance annuelle',
      }
    : null;

  // 2. Top Dynasty (most Tier 1 titles)
  const topDynastyRaw = aggregatedList
    .slice()
    .sort((a, b) => b.t1Titles - a.t1Titles || b.palmaresScore - a.palmaresScore)[0];
  const topDynasty = topDynastyRaw
    ? {
        entity: topDynastyRaw.entity,
        t1Titles: topDynastyRaw.t1Titles,
        totalTitles: topDynastyRaw.totalTitles,
        palmaresScore: topDynastyRaw.palmaresScore,
      }
    : null;

  // 3. Highest Win % (min 2 seasons or fallback to min 1)
  const winCandidates = aggregatedList.filter((x) => x.yearsCount >= 2);
  const winPool = winCandidates.length > 0 ? winCandidates : aggregatedList;
  const bestWinRaw = winPool.slice().sort((a, b) => b.winPct - a.winPct || b.wins - a.wins)[0];
  const highestWinPct = bestWinRaw
    ? {
        entity: bestWinRaw.entity,
        winPct: bestWinRaw.winPct,
        wins: bestWinRaw.wins,
        matches: bestWinRaw.wins + bestWinRaw.draws + bestWinRaw.losses,
      }
    : null;

  // 4. Most versatile nation on the selected year span (always evaluates countries across all sports)
  const nationT1Map = new Map<string, { sports: Set<SpecificSportId>; t1Titles: number }>();
  for (const r of allRecords) {
    if (r.entityType !== 'country' || r.year < startYear || r.year > endYear) continue;
    if (r.tier === 1 && r.rank === 1) {
      const cur = nationT1Map.get(r.entityId) || { sports: new Set<SpecificSportId>(), t1Titles: 0 };
      cur.sports.add(r.sport);
      cur.t1Titles++;
      nationT1Map.set(r.entityId, cur);
    }
  }
  const topVersatileRaw = Array.from(nationT1Map.entries())
    .map(([id, v]) => ({ entity: entities[id], sportsWithT1: Array.from(v.sports), t1Titles: v.t1Titles }))
    .filter((x) => Boolean(x.entity))
    .sort((a, b) => b.sportsWithT1.length - a.sportsWithT1.length || b.t1Titles - a.t1Titles)[0];

  // 5. Extreme stats leaderboards
  const buildExtreme = (
    id: string,
    title: string,
    metricLabel: string,
    extractor: (x: AggregatedEntity) => number | undefined,
    formatter: (v: number) => string,
    contextFn: (x: AggregatedEntity) => string,
  ) => {
    const entries = aggregatedList
      .map((x) => ({ x, v: extractor(x) }))
      .filter((item): item is { x: AggregatedEntity; v: number } => typeof item.v === 'number' && !Number.isNaN(item.v) && item.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, 5)
      .map(({ x, v }) => ({
        entity: x.entity,
        value: v,
        formatted: formatter(v),
        context: contextFn(x),
      }));
    return { id, title, metricLabel, entries };
  };

  const extremes = [
    buildExtreme(
      'peak_elo',
      'Pics Indice Elo Absolus',
      'Elo Max',
      (x) => x.peakElo,
      (v) => `${v}`,
      (x) => `${x.t1Titles} Tier 1 · ${x.winPct}% vict.`,
    ),
    buildExtreme(
      'xg_diff',
      'Top Différentiel Expected Goals (Football)',
      'xG Diff',
      (x) => x.adv.xgDiff,
      (v) => (v > 0 ? `+${v}` : `${v}`),
      (x) => `${x.adv.goalsFor || 0} buts · ${x.adv.possessionPct || 0}% poss.`,
    ),
    buildExtreme(
      'f1_poles',
      'Rois des Qualifications (Formule 1)',
      'Poles',
      (x) => x.adv.poles,
      (v) => `${v}`,
      (x) => `${x.adv.raceWins || 0} GP gagnés · ${x.adv.points || 0} pts`,
    ),
    buildExtreme(
      'olympic_gold',
      "Moisson Olympique (Médailles d'Or)",
      'Or JO',
      (x) => x.adv.gold,
      (v) => `${v}`,
      (x) => `${x.adv.totalMedals || 0} total · ${x.adv.medalsPerMillionPop || 0}/1M hab.`,
    ),
    buildExtreme(
      'football_attack',
      'Meilleures Attaques Cumulées',
      'Buts',
      (x) => x.adv.goalsFor,
      (v) => `${v}`,
      (x) => `${x.adv.cleanSheets || 0} clean sheets`,
    ),
    buildExtreme(
      'nba_net',
      'Meilleur Net Rating (Basketball)',
      'Net Rtg',
      (x) => x.adv.netRating,
      (v) => (v > 0 ? `+${v}` : `${v}`),
      (x) => `${x.adv.ptsPerGame ?? '—'} pts/m · ${x.adv.threePtPct ?? '—'}% 3PT`,
    ),
    buildExtreme(
      'nhl_goal_diff',
      'Meilleur Différentiel de Buts (Hockey NHL)',
      'Diff NHL',
      (x) => (x.sports.includes('hockey') ? x.adv.goalDiff : undefined),
      (v) => (v > 0 ? `+${v}` : `${v}`),
      (x) => `${x.adv.points ?? '—'} pts · ${x.adv.goalsFor ?? '—'} BP`,
    ),
  ].filter((cat) => cat.entries.length > 0);

  return {
    bestSeason,
    topDynasty,
    highestWinPct,
    mostVersatileNation: topVersatileRaw || null,
    extremes,
  };
}

export function getCsvTemplate(): string {
  return [
    'year,sport,competition,tier,entityId,entityName,entityType,countryCode,rank,wins,draws,losses,eloRating',
    '2026,football,Ligue des Champions,1,real_madrid,Real Madrid,club,ES,1,11,2,0,2045',
    '2026,f1,Championnat F1,1,ferrari,Scuderia Ferrari,club,IT,1,12,0,12,1995',
    '2026,rugby,Tournoi des 6 Nations,2,FR,France,country,FR,1,5,0,0,1940',
  ].join('\n');
}

export function parseCsvRecords(
  csvText: string,
  existingEntities: Record<string, Entity>,
): { records: SportRecord[]; newEntities: Entity[]; errors: string[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { records: [], newEntities: [], errors: ['Le fichier CSV doit contenir une ligne d’en-tête et au moins une donnée.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idxOf = (name: string) => headers.indexOf(name.toLowerCase());

  const requiredCols = ['year', 'sport', 'competition', 'entityid', 'entitytype', 'rank'];
  const missing = requiredCols.filter((c) => idxOf(c) === -1);
  if (missing.length > 0) {
    return { records: [], newEntities: [], errors: [`Colonnes requises manquantes : ${missing.join(', ')}`] };
  }

  const records: SportRecord[] = [];
  const newEntities: Entity[] = [];
  const errors: string[] = [];
  const createdIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const year = Number(cols[idxOf('year')]);
    const sportRaw = (cols[idxOf('sport')] || '').toLowerCase() as SpecificSportId;
    const competition = cols[idxOf('competition')] || 'Compétition importée';
    const tierRaw = Number(cols[idxOf('tier')] || 2);
    const tier = (tierRaw === 1 || tierRaw === 2 || tierRaw === 3 ? tierRaw : 2) as 1 | 2 | 3;
    const entityId = cols[idxOf('entityid')];
    const entityName = idxOf('entityname') >= 0 ? cols[idxOf('entityname')] || entityId : entityId;
    const entityTypeRaw = (cols[idxOf('entitytype')] || 'club').toLowerCase();
    const entityType: EntityType = entityTypeRaw === 'country' ? 'country' : 'club';
    const countryCode = (idxOf('countrycode') >= 0 ? cols[idxOf('countrycode')] : 'FR') || 'FR';
    const rank = Math.max(1, Number(cols[idxOf('rank')] || 1));
    const wins = Math.max(0, Number(idxOf('wins') >= 0 ? cols[idxOf('wins')] : 10));
    const draws = Math.max(0, Number(idxOf('draws') >= 0 ? cols[idxOf('draws')] : 0));
    const losses = Math.max(0, Number(idxOf('losses') >= 0 ? cols[idxOf('losses')] : 2));
    const eloRating = Math.max(1200, Number(idxOf('elorating') >= 0 ? cols[idxOf('elorating')] : 1850));

    if (!Number.isFinite(year) || year < 1950 || year > 2030) {
      errors.push(`Ligne ${i + 1} ignorée : année invalide (${cols[idxOf('year')]})`);
      continue;
    }
    if (!SPECIFIC_SPORT_IDS.includes(sportRaw)) {
      errors.push(`Ligne ${i + 1} ignorée : sport inconnu (${sportRaw})`);
      continue;
    }
    if (!entityId) {
      errors.push(`Ligne ${i + 1} ignorée : entityId vide`);
      continue;
    }

    if (!existingEntities[entityId] && !createdIds.has(entityId)) {
      createdIds.add(entityId);
      newEntities.push({
        id: entityId,
        name: entityName,
        short: entityName.slice(0, 3).toUpperCase(),
        type: entityType,
        countryCode: countryCode.toUpperCase(),
        flag: '🏳️',
        c1: '#06B6D4',
        c2: '#1E293B',
        sport: entityType === 'club' ? sportRaw : undefined,
      });
    }

    records.push({
      id: `imp_${Date.now()}_${i}_${entityId}`,
      year,
      date: `${year}-06-15`,
      sport: sportRaw,
      competition,
      tier,
      entityId,
      entityType,
      countryCode: countryCode.toUpperCase(),
      rank,
      wins,
      draws,
      losses,
      titles: rank === 1 ? 1 : 0,
      finals: rank <= 2 ? 1 : 0,
      podiums: rank <= 3 ? 1 : 0,
      eloRating,
      advancedStats: {},
      source: 'import',
    });
  }

  return { records, newEntities, errors };
}
