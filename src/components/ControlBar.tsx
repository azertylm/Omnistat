import React from 'react';
import { Calendar, CloudOff, Database, RefreshCw, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { AlgoMode, EntityType, RemoteSyncState, SportId } from '../types/omnistats';
import { PURE_METRICS_BY_SPORT, SPORT_IDS, SPORTS_MAP } from '../data/sports';
import { formatShortFrenchDateTime } from '../services/githubSync';

interface ControlBarProps {
  startYear: number;
  endYear: number;
  maxYear: number;
  onChangeRange: (start: number, end: number) => void;
  entityType: EntityType;
  onChangeEntityType: (t: EntityType) => void;
  sport: SportId;
  onChangeSport: (s: SportId) => void;
  algo: AlgoMode;
  onChangeAlgo: (a: AlgoMode) => void;
  pureMetric: string;
  onChangePureMetric: (m: string) => void;
  search: string;
  onChangeSearch: (q: string) => void;
  onlyFavs: boolean;
  favCount: number;
  onToggleOnlyFavs: () => void;
  onOpenCoefficients: () => void;
  simpleMode: boolean;
  totalRecordsCount: number;
  remoteSync: RemoteSyncState;
  onOpenSources: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  startYear,
  endYear,
  maxYear,
  onChangeRange,
  entityType,
  onChangeEntityType,
  sport,
  onChangeSport,
  algo,
  onChangeAlgo,
  pureMetric,
  onChangePureMetric,
  search,
  onChangeSearch,
  onlyFavs,
  favCount,
  onToggleOnlyFavs,
  onOpenCoefficients,
  simpleMode,
  totalRecordsCount,
  remoteSync,
  onOpenSources,
}) => {
  const minY = 1950;
  const maxY = Math.max(2026, maxYear);
  const clampedStart = Math.min(Math.max(startYear, minY), maxY);
  const clampedEnd = Math.min(Math.max(endYear, clampedStart), maxY);
  const leftPct = ((clampedStart - minY) / (maxY - minY)) * 100;
  const rightPct = ((clampedEnd - minY) / (maxY - minY)) * 100;
  const spanYears = clampedEnd - clampedStart + 1;
  const pureMetrics = PURE_METRICS_BY_SPORT[sport] || PURE_METRICS_BY_SPORT.all;

  const presets = [
    { label: 'Dernière saison', start: maxY, end: maxY },
    { label: '5 ans', start: Math.max(minY, maxY - 4), end: maxY },
    { label: '10 ans', start: Math.max(minY, maxY - 9), end: maxY },
    { label: 'Années 2010', start: 2010, end: 2019 },
    { label: 'Années 2000', start: 2000, end: 2009 },
    { label: 'Depuis 1990', start: 1990, end: maxY },
    { label: 'All-Time', start: minY, end: maxY },
  ];

  const handleStartInput = (val: number) => {
    const clamped = Math.min(val, clampedEnd);
    onChangeRange(clamped, clampedEnd);
  };

  const handleEndInput = (val: number) => {
    const clamped = Math.max(val, clampedStart);
    onChangeRange(clampedStart, clamped);
  };

  // Freshness indicator pill config
  const remoteUpdatedLabel = formatShortFrenchDateTime(
    remoteSync.database?.lastUpdated || remoteSync.savedAt,
  );
  const remoteCount = remoteSync.database?.records.length ?? 0;

  let pillClass =
    'border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-cyan-500';
  let dotClass = 'bg-slate-400';
  let pillLabel = `Base intégrée · ${totalRecordsCount} entrées`;
  let pillTitle = 'Cliquer pour configurer la synchronisation automatique GitHub Actions';

  if (remoteSync.health === 'loading') {
    pillClass =
      'border-cyan-500/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 hover:border-cyan-400';
    dotClass = 'bg-cyan-500 animate-pulse';
    pillLabel = 'Sync Auto · Chargement…';
    pillTitle = 'Synchronisation avec la base GitHub en cours';
  } else if (remoteSync.health === 'synced') {
    pillClass =
      'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400';
    dotClass = 'bg-emerald-500';
    pillLabel = `Sync Auto · Maj ${remoteUpdatedLabel} · ${remoteCount} entrées`;
    pillTitle = `Base distante synchronisée (${totalRecordsCount} entrées actives au total). Cliquer pour voir le diagnostic.`;
  } else if (remoteSync.health === 'cache-offline') {
    pillClass =
      'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:border-amber-400';
    dotClass = 'bg-amber-500';
    pillLabel = `Hors ligne (Cache · Maj ${remoteUpdatedLabel})`;
    pillTitle = remoteSync.error || 'Mode cache hors ligne actif. Cliquer pour diagnostiquer.';
  } else if (remoteSync.health === 'error') {
    pillClass =
      'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:border-amber-400';
    dotClass = 'bg-amber-500';
    pillLabel = 'Hors ligne (Base intégrée · Erreur Sync)';
    pillTitle = remoteSync.error || 'Impossible de joindre la base distante. Cliquer pour vérifier.';
  }

  return (
    <section
      aria-label="Barre de contrôle analytique globale"
      className="no-print border-b border-slate-200 dark:border-[#1F2937] bg-white/90 dark:bg-[#0E1422]/90 backdrop-blur-md"
    >
      <div className="max-w-[1480px] mx-auto px-3 sm:px-5 py-2.5 space-y-2.5">
        {/* Bandeau compact de fraîcheur des données */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Moteur historique multi-sports · <span className="font-mono-num font-bold text-slate-700 dark:text-slate-200">{minY}–{maxY}</span>
          </div>
          <button
            type="button"
            onClick={onOpenSources}
            title={pillTitle}
            aria-label={`Statut de fraîcheur des données : ${pillLabel}. Ouvrir Sources et Sync`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] sm:text-[11.5px] font-bold transition-colors max-w-full ${pillClass}`}
          >
            {remoteSync.health === 'loading' ? (
              <RefreshCw size={12} className="animate-spin shrink-0" />
            ) : remoteSync.health === 'cache-offline' || remoteSync.health === 'error' ? (
              <CloudOff size={12} className="shrink-0" />
            ) : (
              <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />
            )}
            <span className="truncate tabular-nums">{pillLabel}</span>
            <Database size={11} className="shrink-0 opacity-70 ml-0.5" aria-hidden="true" />
          </button>
        </div>

        {/* Ligne 1 : Timeline + Entity Mode + Search + Favs */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_auto_auto] gap-3 items-center">
          {/* Double Slider Temporel */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#111827] px-3.5 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 font-bold text-cyan-700 dark:text-cyan-400">
                <Calendar size={15} className="shrink-0" />
                <span className="font-mono-num text-[15px] tracking-tight">
                  {clampedStart} — {clampedEnd}
                </span>
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                  ({spanYears} {spanYears > 1 ? 'ans' : 'an'})
                </span>
              </div>

              <div className="flex flex-wrap gap-1" role="group" aria-label="Périodes rapides">
                {presets.map((p) => {
                  const active = clampedStart === p.start && clampedEnd === p.end;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => onChangeRange(p.start, p.end)}
                      className={`px-2 py-1 rounded-md text-[11.5px] font-semibold whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative h-7 flex items-center">
              <div className="absolute left-0 right-0 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div
                className="absolute h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                style={{ left: `${leftPct}%`, width: `${Math.max(1, rightPct - leftPct)}%` }}
              />
              <input
                type="range"
                min={minY}
                max={maxY}
                value={clampedStart}
                onChange={(e) => handleStartInput(Number(e.target.value))}
                aria-label="Année de début"
                className="dual-range-input"
              />
              <input
                type="range"
                min={minY}
                max={maxY}
                value={clampedEnd}
                onChange={(e) => handleEndInput(Number(e.target.value))}
                aria-label="Année de fin"
                className="dual-range-input"
              />
            </div>
          </div>

          {/* Bascule Clubs vs Pays */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap">
            <div
              className="inline-flex p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-100 dark:bg-[#111827]"
              role="group"
              aria-label="Mode d'entité"
            >
              <button
                type="button"
                onClick={() => onChangeEntityType('club')}
                aria-pressed={entityType === 'club'}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold whitespace-nowrap transition-colors ${
                  entityType === 'club'
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Clubs &amp; Équipes
              </button>
              <button
                type="button"
                onClick={() => onChangeEntityType('country')}
                aria-pressed={entityType === 'country'}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold whitespace-nowrap transition-colors ${
                  entityType === 'country'
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pays &amp; Nations
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleOnlyFavs}
              aria-pressed={onlyFavs}
              aria-label="Filtrer par entités favorites"
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-colors ${
                onlyFavs
                  ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-amber-500/60'
              }`}
            >
              <Star size={14} className={onlyFavs ? 'fill-amber-400 text-amber-400' : ''} />
              <span className="tabular-nums">Favoris ({favCount})</span>
            </button>
          </div>

          {/* Recherche rapide */}
          <div className="relative flex items-center w-full lg:w-[230px]">
            <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Club, pays, compétition..."
              aria-label="Rechercher un club, pays ou compétition"
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => onChangeSearch('')}
                aria-label="Effacer la recherche"
                className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Ligne 2 : Sélecteur de Discipline + Algorithmes */}
        <div className="flex flex-col xl:flex-row xl:flex-wrap xl:items-center justify-between gap-2">
          {/* Disciplines */}
          <div
            className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5"
            role="tablist"
            aria-label="Disciplines sportives"
          >
            {SPORT_IDS.map((sid) => {
              const meta = SPORTS_MAP[sid];
              const active = sport === sid;
              return (
                <button
                  key={sid}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChangeSport(sid)}
                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11.5px] sm:text-[12px] font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                    active
                      ? 'bg-violet-600/15 border-violet-500 text-violet-800 dark:text-violet-200'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <span aria-hidden="true">{meta.icon}</span>
                  <span>{sid === 'all' ? 'Tous les sports' : meta.name}</span>
                </button>
              );
            })}
          </div>

          {/* Algorithmes + Personnaliser coefficients */}
          {!simpleMode && (
            <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap shrink-0">
              <div
                className="inline-flex p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-100 dark:bg-[#111827]"
                role="group"
                aria-label="Algorithme de classement"
              >
                {(
                  [
                    { id: 'palmares', label: 'Palmarès' },
                    { id: 'domination', label: 'Domination' },
                    { id: 'stats', label: 'Stats pures' },
                  ] as const
                ).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onChangeAlgo(a.id)}
                    aria-pressed={algo === a.id}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11.5px] sm:text-[12px] font-bold whitespace-nowrap transition-colors ${
                      algo === a.id
                        ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {algo === 'stats' && (
                <select
                  value={pureMetric}
                  onChange={(e) => onChangePureMetric(e.target.value)}
                  aria-label="Choisir une statistique brute"
                  className="px-2 py-1.5 rounded-lg border border-cyan-500/60 bg-white dark:bg-[#111827] text-[12px] font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {pureMetrics.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={onOpenCoefficients}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] hover:border-cyan-500 text-[11.5px] sm:text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap transition-colors"
              >
                <SlidersHorizontal size={13} />
                <span>Coefficients</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

