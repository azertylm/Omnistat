import { PureMetricOption, ScoringWeights, SpecificSportId, SportId } from '../types/omnistats';

export interface SportMeta {
  id: SportId;
  name: string;
  short: string;
  icon: string;
  color: string;
}

export const SPORTS_MAP: Record<SportId, SportMeta> = {
  all: { id: 'all', name: 'Tous les sports', short: 'Omnisports', icon: '🌐', color: '#06B6D4' },
  football: { id: 'football', name: 'Football', short: 'Foot', icon: '⚽', color: '#10B981' },
  basketball: { id: 'basketball', name: 'Basketball', short: 'Basket', icon: '🏀', color: '#F59E0B' },
  f1: { id: 'f1', name: 'Formule 1', short: 'F1', icon: '🏎️', color: '#EF4444' },
  hockey: { id: 'hockey', name: 'Hockey', short: 'NHL', icon: '🏒', color: '#0EA5E9' },
  tennis: { id: 'tennis', name: 'Tennis', short: 'Tennis', icon: '🎾', color: '#84CC16' },
  rugby: { id: 'rugby', name: 'Rugby', short: 'Rugby', icon: '🏉', color: '#8B5CF6' },
  olympics: { id: 'olympics', name: 'Jeux Olympiques', short: 'JO / Athlé', icon: '🏅', color: '#EC4899' },
  handball: { id: 'handball', name: 'Handball', short: 'Hand', icon: '🤾', color: '#3B82F6' },
  cycling: { id: 'cycling', name: 'Cyclisme', short: 'Cyclisme', icon: '🚴', color: '#F97316' },
};

export const SPORT_IDS: SportId[] = [
  'all',
  'football',
  'basketball',
  'f1',
  'hockey',
  'tennis',
  'rugby',
  'olympics',
  'handball',
  'cycling',
];

export const SPECIFIC_SPORT_IDS: SpecificSportId[] = [
  'football',
  'basketball',
  'f1',
  'hockey',
  'tennis',
  'rugby',
  'olympics',
  'handball',
  'cycling',
];

export const DEFAULT_WEIGHTS: ScoringWeights = {
  t1Title: 100,
  t1Final: 45,
  t1Podium: 20,
  t2Title: 50,
  t2Final: 22,
  t2Podium: 10,
  t3Title: 20,
  t3Final: 9,
  t3Podium: 4,
  domElo: 45,
  domWin: 35,
  domMargin: 20,
};

export const PURE_METRICS_BY_SPORT: Record<SportId, PureMetricOption[]> = {
  all: [
    { key: 'totalTitles', label: 'Titres Totaux' },
    { key: 't1Titles', label: 'Titres Majeurs (Tier 1)' },
    { key: 'winPct', label: '% de Victoires moyen', unit: '%' },
    { key: 'peakElo', label: 'Indice Elo Pic' },
    { key: 'totalPodiums', label: 'Podiums & Finales' },
  ],
  football: [
    { key: 'adv.goalsFor', label: 'Meilleure attaque (Buts cumulés)' },
    { key: 'adv.xgDiff', label: 'Meilleur différentiel xG (xG - xGA)' },
    { key: 'adv.possessionPct', label: 'Possession moyenne (%)', unit: '%' },
    { key: 'adv.cleanSheets', label: 'Clean Sheets cumulés' },
    { key: 'adv.unbeatenStreak', label: 'Série invincibilité record (matchs)' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
  ],
  basketball: [
    { key: 'adv.netRating', label: 'Net Rating moyen' },
    { key: 'adv.ptsPerGame', label: 'Points par match' },
    { key: 'adv.fgPct', label: 'Adresse au tir (FG%)', unit: '%' },
    { key: 'adv.threePtPct', label: 'Adresse à 3 points (%)', unit: '%' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
  ],
  f1: [
    { key: 'adv.points', label: 'Points Constructeur cumulés' },
    { key: 'adv.raceWins', label: 'Victoires en Grand Prix' },
    { key: 'adv.poles', label: 'Pole Positions' },
    { key: 'adv.fastestLaps', label: 'Meilleurs tours en course' },
    { key: 'adv.podiums', label: 'Podiums en Grand Prix' },
  ],
  hockey: [
    { key: 'adv.points', label: 'Points NHL cumulés' },
    { key: 'adv.goalDiff', label: 'Différentiel de buts (Diff)' },
    { key: 'adv.goalsFor', label: 'Buts marqués (BP)' },
    { key: 'adv.played', label: 'Matchs joués (MJ)' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
  ],
  tennis: [
    { key: 'adv.grandSlams', label: 'Titres du Grand Chelem' },
    { key: 'adv.masters1000', label: 'Masters 1000 / Équiv.' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
    { key: 'adv.acesPerMatch', label: 'Aces / match' },
    { key: 'adv.breakPointsConvertedPct', label: 'Balles de break converties (%)', unit: '%' },
  ],
  rugby: [
    { key: 'adv.triesScored', label: 'Essais marqués' },
    { key: 'adv.pointsDiff', label: 'Différentiel de points' },
    { key: 'adv.tackleSuccessPct', label: 'Plaquages réussis (%)', unit: '%' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
  ],
  olympics: [
    { key: 'adv.gold', label: "Médailles d'Or" },
    { key: 'adv.totalMedals', label: 'Total Médailles' },
    { key: 'adv.medalsPerMillionPop', label: 'Médailles / million d’hab.' },
    { key: 'adv.silver', label: "Médailles d'Argent" },
  ],
  handball: [
    { key: 'adv.goalsFor', label: 'Buts marqués' },
    { key: 'adv.efficiencyPct', label: 'Efficacité au tir (%)', unit: '%' },
    { key: 'winPct', label: '% de Victoires', unit: '%' },
  ],
  cycling: [
    { key: 'adv.stageWins', label: 'Victoires étapes & classiques' },
    { key: 'adv.uciPoints', label: 'Points UCI WorldTour' },
    { key: 't1Titles', label: 'Grands Tours & Mondiaux' },
  ],
};

export const ADV_STAT_LABELS: Record<string, { label: string; suffix?: string; maxRef: number }> = {
  played: { label: 'Matchs joués (MJ)', maxRef: 1200 },
  goalsFor: { label: 'Buts marqués (BP)', maxRef: 2400 },
  goalsAgainst: { label: 'Buts encaissés (BC)', maxRef: 1800 },
  goalDiff: { label: 'Différentiel de buts', maxRef: 600 },
  goalsPerMatch: { label: 'Buts / match', maxRef: 4.5 },
  xgFor: { label: 'Expected Goals (xG)', maxRef: 1100 },
  xgAgainst: { label: 'xGA concédés', maxRef: 550 },
  xgDiff: { label: 'Différentiel xG', maxRef: 600 },
  possessionPct: { label: 'Possession moyenne', suffix: '%', maxRef: 72 },
  shotsOnTarget: { label: 'Tirs cadrés', maxRef: 3000 },
  cleanSheets: { label: 'Clean Sheets', maxRef: 250 },
  unbeatenStreak: { label: 'Série invincibilité max', suffix: ' m.', maxRef: 49 },
  ptsPerGame: { label: 'Points / match', maxRef: 125 },
  oppPtsPerGame: { label: 'Pts encaissés / match', maxRef: 120 },
  fgPct: { label: 'Adresse aux tirs (FG%)', suffix: '%', maxRef: 54 },
  threePtPct: { label: 'Adresse à 3 points', suffix: '%', maxRef: 44 },
  netRating: { label: 'Net Rating', maxRef: 14 },
  winPct: { label: '% de Victoires', suffix: '%', maxRef: 100 },
  raceWins: { label: 'Victoires en GP', maxRef: 150 },
  poles: { label: 'Pole Positions', maxRef: 150 },
  fastestLaps: { label: 'Meilleurs tours', maxRef: 120 },
  podiums: { label: 'Podiums GP', maxRef: 320 },
  points: { label: 'Points cumulés', maxRef: 9000 },
  dnfRate: { label: 'Taux d’abandon (DNF)', suffix: '%', maxRef: 25 },
  constructorRank: { label: 'Rang Constructeur moy.', maxRef: 10 },
  bestDriverRank: { label: 'Meilleur rang Pilote', maxRef: 10 },
  grandSlams: { label: 'Grands Chelems', maxRef: 35 },
  masters1000: { label: 'Masters 1000', maxRef: 70 },
  acesPerMatch: { label: 'Aces / match', maxRef: 16 },
  breakPointsConvertedPct: { label: 'Breaks convertis', suffix: '%', maxRef: 52 },
  triesScored: { label: 'Essais marqués', maxRef: 800 },
  pointsDiff: { label: 'Différentiel de points', maxRef: 2200 },
  tackleSuccessPct: { label: 'Plaquages réussis', suffix: '%', maxRef: 95 },
  gold: { label: "Médailles d'Or", maxRef: 400 },
  silver: { label: "Médailles d'Argent", maxRef: 320 },
  bronze: { label: 'Médailles de Bronze', maxRef: 300 },
  totalMedals: { label: 'Total Médailles JO', maxRef: 1000 },
  medalsPerMillionPop: { label: 'Médailles / 1M hab.', maxRef: 8 },
  efficiencyPct: { label: 'Efficacité au tir', suffix: '%', maxRef: 75 },
  stageWins: { label: 'Victoires étapes / class.', maxRef: 200 },
  uciPoints: { label: 'Points UCI cumulés', maxRef: 160000 },
  grandTours: { label: 'Grands Tours remportés', maxRef: 12 },
};

export const CHART_PALETTE = [
  '#06B6D4',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#EC4899',
  '#3B82F6',
  '#84CC16',
];
