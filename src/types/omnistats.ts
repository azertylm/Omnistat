export type SportId =
  | 'all'
  | 'football'
  | 'basketball'
  | 'f1'
  | 'hockey'
  | 'tennis'
  | 'rugby'
  | 'olympics'
  | 'handball'
  | 'cycling';

export type SpecificSportId = Exclude<SportId, 'all'>;

export type EntityType = 'club' | 'country';

export type AlgoMode = 'palmares' | 'domination' | 'stats';

export type ViewTabId =
  | 'ranking'
  | 'evolution'
  | 'versus'
  | 'profile'
  | 'records'
  | 'sources';

export interface Entity {
  id: string;
  name: string;
  short: string;
  type: EntityType;
  countryCode: string;
  flag: string;
  c1: string;
  c2: string;
  sport?: SpecificSportId;
  pop?: number; // Millions of inhabitants (for countries)
  logoUrl?: string;
  stadium?: string;
}

export interface AdvancedStats {
  // Football, Handball & Hockey
  played?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDiff?: number;
  goalsPerMatch?: number;
  xgFor?: number;
  xgAgainst?: number;
  xgDiff?: number;
  possessionPct?: number;
  shotsOnTarget?: number;
  cleanSheets?: number;
  unbeatenStreak?: number;
  efficiencyPct?: number;
  form?: string;
  logo?: string | null;
  // Basketball
  ptsPerGame?: number;
  oppPtsPerGame?: number;
  fgPct?: number;
  threePtPct?: number;
  netRating?: number;
  winPct?: number;
  // Formula 1
  raceWins?: number;
  poles?: number;
  fastestLaps?: number;
  podiums?: number;
  points?: number;
  dnfRate?: number;
  constructorRank?: number;
  bestDriverRank?: number;
  // Tennis
  grandSlams?: number;
  masters1000?: number;
  acesPerMatch?: number;
  breakPointsConvertedPct?: number;
  // Rugby
  triesScored?: number;
  pointsDiff?: number;
  tackleSuccessPct?: number;
  // Olympics
  gold?: number;
  silver?: number;
  bronze?: number;
  totalMedals?: number;
  medalsPerMillionPop?: number;
  // Cycling
  stageWins?: number;
  uciPoints?: number;
  grandTours?: number;
  [key: string]: number | string | null | undefined;
}

export type RecordSource =
  | 'core'
  | 'jolpica'
  | 'jolpica-f1'
  | 'thesportsdb'
  | 'nhl-api'
  | 'api-sports'
  | 'apisports'
  | 'manual'
  | 'import';

export interface SportRecord {
  id: string;
  year: number;
  date: string;
  sport: SpecificSportId;
  competition: string;
  tier: 1 | 2 | 3;
  entityId: string;
  entityName?: string;
  entityType: EntityType;
  countryCode: string;
  rank: number;
  wins: number;
  draws: number;
  losses: number;
  titles: number;
  finals: number;
  podiums: number;
  eloRating: number;
  advancedStats: AdvancedStats;
  source?: RecordSource | string;
}

export interface RemoteSourceStatus {
  status: 'ok' | 'skipped' | 'error';
  fetchedCount: number;
  updatedAt: string;
  error?: string;
}

export interface RemoteStatsDatabase {
  schemaVersion: string;
  lastUpdated: string;
  activeSeason: string;
  totalRecords: number;
  sportsCovered: string[];
  sourcesStatus: Record<string, RemoteSourceStatus>;
  records: SportRecord[];
}

export interface RemoteSyncConfig {
  mode: 'github' | 'url';
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  customUrl: string;
}

export type RemoteSyncHealth = 'unconfigured' | 'loading' | 'synced' | 'cache-offline' | 'error';

export interface RemoteSyncState {
  health: RemoteSyncHealth;
  url: string;
  fromCache: boolean;
  savedAt: number | null;
  error: string | null;
  database: RemoteStatsDatabase | null;
}

export interface ScoringWeights {
  t1Title: number;
  t1Final: number;
  t1Podium: number;
  t2Title: number;
  t2Final: number;
  t2Podium: number;
  t3Title: number;
  t3Final: number;
  t3Podium: number;
  domElo: number;
  domWin: number;
  domMargin: number;
}

export interface AggregatedEntity {
  entity: Entity;
  records: SportRecord[];
  sports: SpecificSportId[];
  palmaresScore: number;
  dominationScore: number;
  score: number;
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
  winPct: number;
  avgElo: number;
  peakElo: number;
  yearsCount: number;
  yearlyPalmares: Record<number, number>;
  spark: number[];
  adv: Record<string, number>;
  formulaDetail: string;
}

export interface PureMetricOption {
  key: string;
  label: string;
  unit?: string;
}

export interface HallOfRecordsData {
  bestSeason: {
    entity: Entity;
    year: number;
    score: number;
    details: string;
  } | null;
  topDynasty: {
    entity: Entity;
    t1Titles: number;
    totalTitles: number;
    palmaresScore: number;
  } | null;
  highestWinPct: {
    entity: Entity;
    winPct: number;
    wins: number;
    matches: number;
  } | null;
  mostVersatileNation: {
    entity: Entity;
    sportsWithT1: SpecificSportId[];
    t1Titles: number;
  } | null;
  extremes: Array<{
    id: string;
    title: string;
    metricLabel: string;
    entries: Array<{
      entity: Entity;
      value: number;
      formatted: string;
      context: string;
    }>;
  }>;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'error' | 'warn';
}
