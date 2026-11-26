import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Info, Star } from 'lucide-react';
import { AggregatedEntity, AlgoMode, EntityType, SportId, SportRecord } from '../types/omnistats';
import { SPORTS_MAP } from '../data/sports';
import { EntityBadge } from './EntityBadge';

interface RankingViewProps {
  filteredRecords: SportRecord[];
  sortedList: AggregatedEntity[];
  startYear: number;
  endYear: number;
  entityType: EntityType;
  sport: SportId;
  algo: AlgoMode;
  sortCol: string;
  sortDir: 'asc' | 'desc';
  onSort: (col: string) => void;
  versusIds: string[];
  onToggleVersus: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onInspectEntity: (id: string) => void;
  onResetFilters: () => void;
}

interface DynamicColumn {
  key: string;
  label: string;
  format: (row: AggregatedEntity) => string;
}

function isValidNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function fmtNum(v: unknown, suffix = ''): string {
  return isValidNum(v) ? `${v}${suffix}` : '—';
}

function fmtSigned(v: unknown): string {
  if (!isValidNum(v)) return '—';
  return v > 0 ? `+${v}` : `${v}`;
}

function getDynamicColumns(sport: SportId): DynamicColumn[] {
  switch (sport) {
    case 'football':
      return [
        { key: 'adv.goalsFor', label: 'Buts', format: (r) => fmtNum(r.adv.goalsFor) },
        { key: 'adv.xgDiff', label: 'Diff xG', format: (r) => fmtSigned(r.adv.xgDiff) },
        { key: 'adv.possessionPct', label: 'Poss. %', format: (r) => fmtNum(r.adv.possessionPct, '%') },
      ];
    case 'basketball':
      return [
        { key: 'adv.ptsPerGame', label: 'PTS/m', format: (r) => fmtNum(r.adv.ptsPerGame) },
        { key: 'adv.netRating', label: 'Net Rtg', format: (r) => fmtSigned(r.adv.netRating) },
        { key: 'adv.threePtPct', label: '3PT %', format: (r) => fmtNum(r.adv.threePtPct, '%') },
      ];
    case 'f1':
      return [
        { key: 'adv.raceWins', label: 'GP Gagnés', format: (r) => fmtNum(r.adv.raceWins) },
        { key: 'adv.poles', label: 'Poles', format: (r) => fmtNum(r.adv.poles) },
        { key: 'adv.points', label: 'Points', format: (r) => fmtNum(r.adv.points) },
      ];
    case 'hockey':
      return [
        { key: 'adv.played', label: 'MJ', format: (r) => fmtNum(r.adv.played) },
        { key: 'adv.points', label: 'Pts', format: (r) => fmtNum(r.adv.points) },
        {
          key: 'adv.goalsFor',
          label: 'BP/BC',
          format: (r) =>
            isValidNum(r.adv.goalsFor) || isValidNum(r.adv.goalsAgainst)
              ? `${fmtNum(r.adv.goalsFor)}/${fmtNum(r.adv.goalsAgainst)}`
              : '—',
        },
        { key: 'adv.goalDiff', label: 'Diff', format: (r) => fmtSigned(r.adv.goalDiff) },
      ];
    case 'tennis':
      return [
        { key: 'adv.grandSlams', label: 'Grands Chelems', format: (r) => fmtNum(r.adv.grandSlams) },
        { key: 'adv.masters1000', label: 'M1000', format: (r) => fmtNum(r.adv.masters1000) },
        { key: 'adv.acesPerMatch', label: 'Aces/m', format: (r) => fmtNum(r.adv.acesPerMatch) },
      ];
    case 'rugby':
      return [
        { key: 'adv.triesScored', label: 'Essais', format: (r) => fmtNum(r.adv.triesScored) },
        { key: 'adv.pointsDiff', label: 'Diff Pts', format: (r) => fmtSigned(r.adv.pointsDiff) },
        { key: 'adv.tackleSuccessPct', label: 'Plaq. %', format: (r) => fmtNum(r.adv.tackleSuccessPct, '%') },
      ];
    case 'olympics':
      return [
        { key: 'adv.gold', label: 'Or', format: (r) => fmtNum(r.adv.gold) },
        { key: 'adv.silver', label: 'Argent', format: (r) => fmtNum(r.adv.silver) },
        { key: 'adv.bronze', label: 'Bronze', format: (r) => fmtNum(r.adv.bronze) },
        { key: 'adv.medalsPerMillionPop', label: 'Méd./1M hab', format: (r) => fmtNum(r.adv.medalsPerMillionPop) },
      ];
    case 'handball':
      return [
        { key: 'adv.goalsFor', label: 'Buts', format: (r) => fmtNum(r.adv.goalsFor) },
        { key: 'adv.efficiencyPct', label: 'Effic. %', format: (r) => fmtNum(r.adv.efficiencyPct, '%') },
      ];
    case 'cycling':
      return [
        { key: 'adv.stageWins', label: 'Étapes / Class.', format: (r) => fmtNum(r.adv.stageWins) },
        { key: 'adv.uciPoints', label: 'Pts UCI', format: (r) => fmtNum(r.adv.uciPoints) },
      ];
    default:
      return [
        {
          key: 'sportsCount',
          label: 'Sports',
          format: (r) => `${r.sports.length} · ${r.sports.slice(0, 2).map((s) => SPORTS_MAP[s]?.short || s).join('/')}`,
        },
        { key: 'avgElo', label: 'Elo Moy.', format: (r) => fmtNum(r.avgElo) },
      ];
  }
}

function getSignatureLine(item: AggregatedEntity, sport: SportId): string {
  if (sport === 'f1' && isValidNum(item.adv.raceWins)) {
    return `${item.adv.raceWins} GP gagnés · ${isValidNum(item.adv.poles) ? `${item.adv.poles} poles` : `${fmtNum(item.adv.points)} pts`}`;
  }
  if (sport === 'hockey' && isValidNum(item.adv.points)) {
    return `${item.adv.points} pts NHL · Diff ${fmtSigned(item.adv.goalDiff)}`;
  }
  if (sport === 'olympics' && isValidNum(item.adv.gold)) {
    return `${item.adv.gold} Or · ${fmtNum(item.adv.totalMedals)} médailles`;
  }
  if (sport === 'football' && isValidNum(item.adv.xgDiff)) {
    return `${fmtNum(item.winPct, '%')} victoires · xG ${fmtSigned(item.adv.xgDiff)}`;
  }
  return `${fmtNum(item.winPct, '%')} victoires · ${item.t1Titles} titre${item.t1Titles > 1 ? 's' : ''} Tier 1`;
}

const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (!values || values.length < 2) {
    return <span className="text-slate-400">—</span>;
  }
  const w = 78;
  const h = 24;
  const pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block align-middle" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};

export const RankingView: React.FC<RankingViewProps> = ({
  filteredRecords,
  sortedList,
  startYear,
  endYear,
  entityType,
  sport,
  algo,
  sortCol,
  sortDir,
  onSort,
  versusIds,
  onToggleVersus,
  favorites,
  onToggleFavorite,
  onInspectEntity,
  onResetFilters,
}) => {
  const totalTitles = filteredRecords.filter((r) => r.rank === 1).length;
  const sportCounts: Record<string, number> = {};
  for (const r of filteredRecords) {
    sportCounts[r.sport] = (sportCounts[r.sport] || 0) + 1;
  }
  const topSportId = (Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'football') as SportId;
  const leader = sortedList[0];

  const midYear = Math.floor((startYear + endYear) / 2);
  let bestProg = { name: '—', delta: 0 };
  for (const item of sortedList.slice(0, 18)) {
    let h1 = 0;
    let h2 = 0;
    for (const [yStr, val] of Object.entries(item.yearlyPalmares)) {
      if (Number(yStr) <= midYear) h1 += val;
      else h2 += val;
    }
    if (h2 - h1 > bestProg.delta) {
      bestProg = { name: item.entity.name, delta: Math.round(h2 - h1) };
    }
  }

  const dynCols = getDynamicColumns(sport);
  const maxScore = Math.max(...sortedList.map((x) => x.score), 1);

  const renderSortIcon = (colKey: string) => {
    if (sortCol !== colKey) return null;
    return sortDir === 'desc' ? (
      <ArrowDown size={12} className="inline ml-1 text-cyan-500" />
    ) : (
      <ArrowUp size={12} className="inline ml-1 text-cyan-500" />
    );
  };

  if (sortedList.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-10 text-center space-y-3">
        <p className="text-lg font-bold">Aucune entité trouvée sur {startYear}–{endYear}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Aucun résultat ne correspond à cette combinaison de période, discipline et recherche. Essayez d’élargir la plage temporelle ou de passer en mode Omnisports.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  const podiumStyles = [
    {
      ring: 'border-amber-500/60 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-500/12 dark:via-[#111827] dark:to-[#111827]',
      label: 'N°1 · Or',
      labelColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      ring: 'border-slate-300 dark:border-slate-600/80 bg-gradient-to-br from-slate-200/40 via-white to-white dark:from-slate-400/10 dark:via-[#111827] dark:to-[#111827]',
      label: 'N°2 · Argent',
      labelColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      ring: 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-white to-white dark:from-orange-600/10 dark:via-[#111827] dark:to-[#111827]',
      label: 'N°3 · Bronze',
      labelColor: 'text-orange-700 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Bandeau KPI de la période */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4">
          <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Titres analysés</div>
          <div className="font-mono-num text-2xl font-bold mt-1">{totalTitles}</div>
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {filteredRecords.length} entrées · {startYear}–{endYear}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4">
          <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Sport le plus disputé</div>
          <div className="text-xl font-extrabold mt-1 truncate">
            {SPORTS_MAP[topSportId]?.icon} {SPORTS_MAP[topSportId]?.name}
          </div>
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {sportCounts[topSportId] || 0} podiums recensés
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4">
          <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Entité dominante</div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 truncate">
            {leader ? leader.entity.name : '—'}
          </div>
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {leader ? `Score ${leader.score} · Elo pic ${leader.peakElo}` : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4">
          <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Plus forte progression</div>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 truncate">
            {bestProg.name}
          </div>
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            +{bestProg.delta} pts sur la 2e moitié de période
          </div>
        </div>
      </div>

      {/* Podium Visuel Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="podium-grid">
        {sortedList.slice(0, 3).map((item, idx) => {
          const st = podiumStyles[idx];
          return (
            <article
              key={item.entity.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${st.ring}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <EntityBadge entity={item.entity} size={46} />
                  <div className="min-w-0">
                    <div className={`text-[12px] font-bold ${st.labelColor}`}>{st.label}</div>
                    <h3 className="text-[18px] font-extrabold tracking-tight truncate">
                      {item.entity.name}
                    </h3>
                    <div className="text-[12.5px] text-slate-500 dark:text-slate-400 truncate">
                      {item.entity.flag} {item.sports.map((s) => SPORTS_MAP[s].short).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {algo === 'palmares' ? 'Palmarès' : algo === 'domination' ? 'Domination' : 'Stat Opta'}
                  </div>
                  <div className="font-mono-num text-[19px] font-bold text-cyan-700 dark:text-cyan-400">
                    {item.score}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Titres Tier 1</div>
                  <div className="font-mono-num text-[19px] font-bold text-amber-600 dark:text-amber-400">
                    {item.t1Titles}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Elo Pic</div>
                  <div className="font-mono-num text-[19px] font-bold text-violet-700 dark:text-violet-400">
                    {item.peakElo}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                  {getSignatureLine(item, sport)}
                </span>
                <button
                  type="button"
                  onClick={() => onInspectEntity(item.entity.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold text-[12.5px] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
                >
                  <span>Analyser</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Tableau Haute Densité style sport-stats.fr */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-[#1F2937]">
          <div>
            <h2 className="text-[16px] font-extrabold">
              Classement Maître · {entityType === 'club' ? 'Clubs & Équipes' : 'Pays & Nations'}
            </h2>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 tabular-nums">
              {sortedList.length} entités classées · {SPORTS_MAP[sport].name} ({startYear}–{endYear})
            </p>
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">
            Cliquez sur une ligne pour la fiche complète · Cochez pour comparer en Versus
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#161F31] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-[#1F2937] text-[11.5px] font-bold">
                <th className="py-2.5 px-3 text-center w-12">Rg</th>
                <th className="py-2.5 px-3 text-left sticky left-0 z-10 bg-slate-50 dark:bg-[#161F31] border-r border-slate-200 dark:border-[#1F2937] min-w-[180px]">
                  <button type="button" onClick={() => onSort('name')} className="hover:text-cyan-500 font-bold">
                    Entité {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => onSort('score')} className="hover:text-cyan-500 font-bold">
                    {algo === 'palmares' ? 'Score Palmarès' : algo === 'domination' ? 'Domination /100' : 'Stat Pure'}
                    {renderSortIcon('score')}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => onSort('t1Titles')} className="hover:text-cyan-500 font-bold">
                    Tier 1 {renderSortIcon('t1Titles')}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => onSort('totalTitles')} className="hover:text-cyan-500 font-bold">
                    Trophées {renderSortIcon('totalTitles')}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => onSort('winPct')} className="hover:text-cyan-500 font-bold">
                    % Vict. {renderSortIcon('winPct')}
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => onSort('peakElo')} className="hover:text-cyan-500 font-bold">
                    Elo Pic {renderSortIcon('peakElo')}
                  </button>
                </th>
                {dynCols.map((c) => (
                  <th key={c.key} className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => onSort(c.key)} className="hover:text-cyan-500 font-bold">
                      {c.label} {renderSortIcon(c.key)}
                    </button>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center">Tendance</th>
                <th className="py-2.5 px-3 text-center">VS / Fav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#1F2937]">
              {sortedList.map((row, idx) => {
                const barPct = Math.max(4, Math.min(100, Math.round((row.score / maxScore) * 100)));
                const isVs = versusIds.includes(row.entity.id);
                const isFav = favorites.includes(row.entity.id);
                const sparkColor =
                  row.entity.c1 === '#111827' || row.entity.c1 === '#1E293B' || row.entity.c1 === '#E2E8F0'
                    ? '#06B6D4'
                    : row.entity.c1;

                return (
                  <tr
                    key={row.entity.id}
                    className="hover:bg-cyan-500/5 transition-colors group"
                  >
                    <td
                      className={`py-2.5 px-3 text-center font-mono-num font-bold ${
                        idx === 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : idx === 1
                            ? 'text-slate-600 dark:text-slate-300'
                            : idx === 2
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 sticky left-0 z-10 bg-white dark:bg-[#111827] group-hover:bg-slate-50 dark:group-hover:bg-[#152033] border-r border-slate-200 dark:border-[#1F2937]">
                      <button
                        type="button"
                        onClick={() => onInspectEntity(row.entity.id)}
                        className="flex items-center gap-2.5 text-left w-full focus-visible:outline-2 focus-visible:outline-cyan-500 rounded-md"
                      >
                        <EntityBadge entity={row.entity} size={28} />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate max-w-[160px] sm:max-w-[220px]">
                            {row.entity.name}
                          </div>
                          <div className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
                            {row.entity.flag} {row.sports.slice(0, 3).map((s) => SPORTS_MAP[s].short).join(' · ')} ·{' '}
                            <span className="tabular-nums">{row.yearsCount} sais.</span>
                          </div>
                        </div>
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="relative inline-flex items-center justify-end gap-2 group/tip">
                        <div className="hidden sm:block w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <span className="font-mono-num font-bold text-cyan-700 dark:text-cyan-400">
                          {row.score}
                        </span>
                        <Info size={13} className="text-slate-400 shrink-0" />
                        <div
                          role="tooltip"
                          className="hidden group-hover/tip:block absolute bottom-full right-0 mb-2 z-30 w-64 rounded-xl bg-slate-950 text-slate-100 border border-slate-700 p-3 text-left text-[12px] shadow-xl pointer-events-none"
                        >
                          <div className="font-bold text-cyan-400 mb-1">Détail formule ({row.entity.short})</div>
                          <div className="text-slate-300 leading-snug">{row.formulaDetail}</div>
                          <div className="mt-1.5 text-emerald-400 font-mono-num">
                            Domination : {row.dominationScore}/100 (Elo moy. {row.avgElo})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono-num font-bold text-amber-600 dark:text-amber-400">
                      {row.t1Titles}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num">
                      {row.totalTitles}
                      <span className="text-slate-400 text-[11.5px]"> / {row.totalPodiums}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                      {row.winPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-semibold text-violet-700 dark:text-violet-400">
                      {row.peakElo}
                    </td>

                    {dynCols.map((c) => (
                      <td key={c.key} className="py-2.5 px-3 text-right font-mono-num text-slate-700 dark:text-slate-200">
                        {c.format(row)}
                      </td>
                    ))}

                    <td className="py-2.5 px-3 text-center">
                      <Sparkline values={row.spark} color={sparkColor} />
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isVs}
                          onChange={() => onToggleVersus(row.entity.id)}
                          aria-label={`Ajouter ${row.entity.name} au comparateur Versus`}
                          className="w-4 h-4 accent-cyan-500 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(row.entity.id)}
                          aria-label={isFav ? `Retirer ${row.entity.name} des favoris` : `Mettre ${row.entity.name} en favori`}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                        >
                          <Star
                            size={15}
                            className={isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
