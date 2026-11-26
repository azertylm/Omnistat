import React, { useMemo } from 'react';
import { Award, Star, Trophy } from 'lucide-react';
import {
  AggregatedEntity,
  AlgoMode,
  Entity,
  ScoringWeights,
  SportId,
  SportRecord,
} from '../types/omnistats';
import { ADV_STAT_LABELS, CHART_PALETTE, SPORTS_MAP } from '../data/sports';
import { aggregateEntities, scoreRecordPalmares } from '../engine/scoring';
import { EntityBadge } from './EntityBadge';

interface DeepProfileContentProps {
  entityId: string;
  entities: Record<string, Entity>;
  allRecords: SportRecord[];
  sortedList: AggregatedEntity[];
  weights: ScoringWeights;
  algo: AlgoMode;
  pureMetric: string;
  sport: SportId;
  startYear: number;
  endYear: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToVersus: (id: string) => void;
}

export const DeepProfileContent: React.FC<DeepProfileContentProps> = ({
  entityId,
  entities,
  allRecords,
  sortedList,
  weights,
  algo,
  pureMetric,
  sport,
  startYear,
  endYear,
  isFavorite,
  onToggleFavorite,
  onAddToVersus,
}) => {
  const ent = entities[entityId];

  const recs = useMemo(
    () =>
      allRecords
        .filter(
          (r) =>
            r.entityId === entityId &&
            r.year >= startYear &&
            r.year <= endYear &&
            (sport === 'all' || r.sport === sport),
        )
        .sort((a, b) => b.year - a.year || a.tier - b.tier),
    [allRecords, entityId, startYear, endYear, sport],
  );

  const agg = useMemo(
    () => aggregateEntities(recs, entities, weights, algo, pureMetric, startYear, endYear)[0] || null,
    [recs, entities, weights, algo, pureMetric, startYear, endYear],
  );

  const rankPos = sortedList.findIndex((x) => x.entity.id === entityId) + 1;

  if (!ent) {
    return <div className="p-6 text-sm text-slate-500">Entité introuvable.</div>;
  }

  if (!agg) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <EntityBadge entity={ent} size={56} />
          <div>
            <h2 className="text-2xl font-extrabold">{ent.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ent.flag} Aucune donnée enregistrée entre {startYear} et {endYear} pour le filtre actif.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prime Year
  let primeYear = startYear;
  let primePts = -1;
  for (const [yStr, pts] of Object.entries(agg.yearlyPalmares)) {
    if (pts > primePts) {
      primePts = pts;
      primeYear = Number(yStr);
    }
  }

  // Trophy Cabinet grouped by competition & tier
  const compMap = new Map<
    string,
    { comp: string; tier: 1 | 2 | 3; sport: SportRecord['sport']; titles: number[]; finals: number[]; podiums: number[] }
  >();
  for (const r of recs) {
    if (r.rank > 3) continue;
    const key = `${r.competition}__${r.tier}`;
    const cur = compMap.get(key) || {
      comp: r.competition,
      tier: r.tier,
      sport: r.sport,
      titles: [],
      finals: [],
      podiums: [],
    };
    if (r.rank === 1) cur.titles.push(r.year);
    else if (r.rank === 2) cur.finals.push(r.year);
    else cur.podiums.push(r.year);
    compMap.set(key, cur);
  }
  const cabinet = Array.from(compMap.values()).sort((a, b) => a.tier - b.tier || b.titles.length - a.titles.length);

  // Donut breakdown (by sport for countries / Omnisports, or by competition for clubs)
  const donutMap = new Map<string, number>();
  for (const r of recs) {
    const label = ent.type === 'country' ? SPORTS_MAP[r.sport]?.name || r.sport : r.competition;
    donutMap.set(label, (donutMap.get(label) || 0) + scoreRecordPalmares(r, weights));
  }
  const donutEntries = Array.from(donutMap.entries()).sort((a, b) => b[1] - a[1]);
  const donutTotal = Math.max(
    1,
    donutEntries.reduce((sum, [, val]) => sum + val, 0),
  );

  // Build SVG Donut arcs
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  const donutSegments = donutEntries.map(([label, val], idx) => {
    const pct = (val / donutTotal) * 100;
    const dashLen = (val / donutTotal) * circumference;
    const seg = {
      label,
      pct: pct.toFixed(1),
      color: CHART_PALETTE[idx % CHART_PALETTE.length],
      dashArray: `${dashLen} ${circumference - dashLen}`,
      dashOffset: -offsetAcc,
    };
    offsetAcc += dashLen;
    return seg;
  });

  // Season-by-season timeline aggregated by year
  const seasonByYear = Array.from(
    recs.reduce((m, r) => {
      const list = m.get(r.year) || [];
      list.push(r);
      m.set(r.year, list);
      return m;
    }, new Map<number, SportRecord[]>()),
  ).sort((a, b) => b[0] - a[0]);

  const advEntries = Object.entries(agg.adv);

  return (
    <div className="space-y-6">
      {/* Hero Entité */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1F2937]">
        <div className="flex items-center gap-4 min-w-0">
          <EntityBadge entity={ent} size={60} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight">{ent.name}</h2>
              <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400 font-mono-num">
                {rankPos > 0 ? `Rang #${rankPos}` : 'Hors top filtre'}
              </span>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <span className="text-[13px] font-bold text-cyan-700 dark:text-cyan-400 font-mono-num">
                Prime Year : {primeYear} ({Math.round(primePts)} pts)
              </span>
            </div>
            <div className="text-[13.5px] text-slate-600 dark:text-slate-400 mt-1">
              {ent.flag} Période {startYear}–{endYear} ·{' '}
              {agg.sports.map((s) => `${SPORTS_MAP[s].icon} ${SPORTS_MAP[s].name}`).join(' · ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onAddToVersus(ent.id)}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[13px]"
          >
            Comparer en Versus
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(ent.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-[13px] hover:border-amber-500"
          >
            <Star size={14} className={isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
            <span>{isFavorite ? 'Favori' : 'Ajouter favori'}</span>
          </button>
        </div>
      </div>

      {/* Synthèse Chiffrée */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#161F31] p-3.5">
          <div className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">Indice Palmarès</div>
          <div className="font-mono-num text-2xl font-bold text-cyan-700 dark:text-cyan-400">{agg.palmaresScore}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#161F31] p-3.5">
          <div className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">Domination /100</div>
          <div className="font-mono-num text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {agg.dominationScore}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#161F31] p-3.5">
          <div className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">Pic Indice Elo</div>
          <div className="font-mono-num text-2xl font-bold text-violet-700 dark:text-violet-400">{agg.peakElo}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#161F31] p-3.5">
          <div className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">% Victoires</div>
          <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400">{agg.winPct}%</div>
        </div>
      </div>

      {/* Armoire à trophées + Donut répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={17} className="text-amber-500" />
            <h3 className="text-[16px] font-extrabold">
              Armoire à Trophées ({agg.totalTitles} Titres · {agg.totalPodiums} Podiums)
            </h3>
          </div>
          {cabinet.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun podium recensé sur cette période.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cabinet.map((c) => (
                <div
                  key={`${c.comp}_${c.tier}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F31] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[13.5px] truncate">
                      {SPORTS_MAP[c.sport]?.icon} {c.comp}
                    </span>
                    <span className="text-[11px] font-mono-num font-bold text-slate-500 dark:text-slate-400">
                      Tier {c.tier}
                    </span>
                  </div>
                  {c.titles.length > 0 && (
                    <div className="text-[12.5px] font-semibold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                      🥇 {c.titles.length}× Champion ({c.titles.slice(0, 6).join(', ')}
                      {c.titles.length > 6 ? '…' : ''})
                    </div>
                  )}
                  {c.finals.length > 0 && (
                    <div className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums">
                      🥈 {c.finals.length}× Finaliste ({c.finals.slice(0, 4).join(', ')})
                    </div>
                  )}
                  {c.podiums.length > 0 && (
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      🥉 {c.podiums.length}× Podium / Demi-finale
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donut SVG Répartition */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={17} className="text-cyan-500" />
            <h3 className="text-[16px] font-extrabold">
              Répartition de Puissance ({ent.type === 'country' ? 'par discipline' : 'par compétition'})
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-[150px] h-[150px] shrink-0">
              <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="22"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.label}
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="22"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono-num text-lg font-extrabold">{agg.records.length}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">entrées</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="truncate font-medium">{seg.label}</span>
                  </span>
                  <span className="font-mono-num font-bold shrink-0">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bloc Stats Avancées Opta */}
      {advEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-[16px] font-extrabold">Télémétrie &amp; Statistiques Avancées (Style Opta)</h3>
            {(() => {
              const latestForm = recs.find(
                (r) => typeof r.advancedStats?.form === 'string' && r.advancedStats.form.trim().length > 0,
              )?.advancedStats?.form;
              if (typeof latestForm !== 'string') return null;
              return (
                <div className="inline-flex items-center gap-1 text-[11.5px] font-mono-num">
                  <span className="text-slate-500 dark:text-slate-400 mr-1">Forme récente :</span>
                  {latestForm.slice(-5).split('').map((ch, idx) => (
                    <span
                      key={`${ch}_${idx}`}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-white ${
                        ch === 'W' || ch === 'V'
                          ? 'bg-emerald-600'
                          : ch === 'D' || ch === 'N'
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                      }`}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {advEntries
              .filter(([, val]) => typeof val === 'number' && Number.isFinite(val))
              .map(([key, val]) => {
                const meta = ADV_STAT_LABELS[key] || { label: key, maxRef: 100 };
                const pct = Math.max(8, Math.min(100, Math.round((Math.abs(val) / Math.max(1, meta.maxRef)) * 100)));
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F31] p-3"
                  >
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{meta.label}</div>
                    <div className="font-mono-num text-[18px] font-extrabold mt-0.5">
                      {Number.isFinite(val) ? `${val}${meta.suffix || ''}` : '—'}
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Chronologie Saison par Saison */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
        <h3 className="text-[16px] font-extrabold mb-3">Chronologie Saison par Saison</h3>
        <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#161F31] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-[#1F2937] text-[11.5px]">
                <th className="py-2 px-3 text-left">Année</th>
                <th className="py-2 px-3 text-left">Compétitions &amp; Résultats</th>
                <th className="py-2 px-3 text-right">Bilan V-N-D</th>
                <th className="py-2 px-3 text-right">Elo</th>
                <th className="py-2 px-3 text-right">Score Palmarès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#1F2937]">
              {seasonByYear.map(([yr, yearRecs]) => {
                const yrPts = Math.round(agg.yearlyPalmares[yr] || 0);
                const isPrime = yr === primeYear;
                const w = yearRecs.reduce((s, r) => s + r.wins, 0);
                const d = yearRecs.reduce((s, r) => s + r.draws, 0);
                const l = yearRecs.reduce((s, r) => s + r.losses, 0);
                const maxElo = Math.max(...yearRecs.map((r) => r.eloRating));

                return (
                  <tr
                    key={yr}
                    className={isPrime ? 'bg-amber-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                  >
                    <td className="py-2 px-3 font-mono-num font-extrabold whitespace-nowrap">
                      {yr}
                      {isPrime && (
                        <span className="ml-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ★ Prime
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {yearRecs.map((r) => (
                          <span key={r.id} className="text-slate-700 dark:text-slate-200">
                            {SPORTS_MAP[r.sport]?.icon} {r.competition} (
                            <strong
                              className={
                                r.rank === 1
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }
                            >
                              {r.rank === 1 ? '1er' : `${r.rank}e`}
                            </strong>
                            )
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num whitespace-nowrap">
                      {w}-{d}-{l}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num text-violet-700 dark:text-violet-400">
                      {maxElo}
                    </td>
                    <td className="py-2 px-3 text-right font-mono-num font-bold text-cyan-700 dark:text-cyan-400">
                      +{yrPts}
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
