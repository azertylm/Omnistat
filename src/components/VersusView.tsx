import React from 'react';
import { AggregatedEntity, Entity, EntityType } from '../types/omnistats';
import { CHART_PALETTE } from '../data/sports';
import { EntityBadge } from './EntityBadge';

interface VersusViewProps {
  entities: Record<string, Entity>;
  entityType: EntityType;
  computedList: AggregatedEntity[];
  versusIds: string[];
  onSetSlot: (slotIndex: number, entityId: string) => void;
  startYear: number;
  endYear: number;
}

export const VersusView: React.FC<VersusViewProps> = ({
  entities,
  entityType,
  computedList,
  versusIds,
  onSetSlot,
  startYear,
  endYear,
}) => {
  const modeEntities = Object.values(entities)
    .filter((e) => e.type === entityType)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const selectedItems = versusIds
    .map((id) => computedList.find((x) => x.entity.id === id))
    .filter((x): x is AggregatedEntity => Boolean(x));

  const maxT1 = Math.max(...computedList.map((x) => x.t1Titles), 1);
  const maxPal = Math.max(...computedList.map((x) => x.palmaresScore), 1);
  const maxYears = Math.max(...computedList.map((x) => x.yearsCount), 1);

  const axes = [
    { label: 'Palmarès Majeur', fn: (it: AggregatedEntity) => Math.min(100, Math.round((it.t1Titles / maxT1) * 100)) },
    { label: 'Régularité', fn: (it: AggregatedEntity) => Math.min(100, Math.round(it.winPct)) },
    { label: 'Puissance', fn: (it: AggregatedEntity) => Math.min(100, Math.round((it.palmaresScore / maxPal) * 100)) },
    { label: 'Solidité / Dom.', fn: (it: AggregatedEntity) => Math.min(100, Math.round(it.dominationScore)) },
    {
      label: 'Pic Elo',
      fn: (it: AggregatedEntity) => Math.max(10, Math.min(100, Math.round(((it.peakElo - 1650) / 430) * 100))),
    },
    { label: 'Longévité', fn: (it: AggregatedEntity) => Math.min(100, Math.round((it.yearsCount / maxYears) * 100)) },
  ];

  const metrics: Array<{ label: string; fn: (it: AggregatedEntity) => number; suffix?: string }> = [
    { label: 'Score Palmarès', fn: (it) => it.palmaresScore },
    { label: 'Indice Domination /100', fn: (it) => it.dominationScore },
    { label: 'Titres Majeurs (Tier 1)', fn: (it) => it.t1Titles },
    { label: 'Total Trophées / Titres', fn: (it) => it.totalTitles },
    { label: 'Podiums & Finales', fn: (it) => it.totalPodiums },
    { label: '% de Victoires', fn: (it) => it.winPct, suffix: '%' },
    { label: 'Pic Indice Elo', fn: (it) => it.peakElo },
    { label: 'Saisons au Top', fn: (it) => it.yearsCount },
  ];

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const R = 112;

  const winsCount = new Array(selectedItems.length).fill(0);
  const rowsData = metrics.map((m) => {
    const vals = selectedItems.map(m.fn);
    const maxV = Math.max(...vals);
    const ties = vals.filter((v) => v === maxV).length;
    vals.forEach((v, idx) => {
      if (v === maxV) winsCount[idx]++;
    });
    return { ...m, vals, maxV, ties };
  });

  const bestIdx = winsCount.indexOf(Math.max(...winsCount, 0));
  const winner = selectedItems[bestIdx];
  const others = selectedItems.filter((_, i) => i !== bestIdx);

  return (
    <div className="space-y-5">
      {/* 4 slots de sélection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((slot) => {
          const cur = versusIds[slot] || '';
          const col = CHART_PALETTE[slot];
          return (
            <div
              key={slot}
              className="rounded-xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-3"
            >
              <label
                htmlFor={`vs-slot-${slot}`}
                className="block text-[12px] font-bold mb-1.5"
                style={{ color: col }}
              >
                Profil #{slot + 1}
              </label>
              <select
                id={`vs-slot-${slot}`}
                value={cur}
                onChange={(e) => onSetSlot(slot, e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px] font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="">— Aucun —</option>
                {modeEntities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.flag} {e.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {selectedItems.length < 2 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Sélectionnez au moins 2 entités ayant des performances sur {startYear}–{endYear} pour lancer le duel Versus.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-5 items-start">
          {/* Radar 6 axes */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
            <h2 className="text-[17px] font-extrabold">Radar Multi-Critères (6 Axes /100)</h2>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mb-3">
              Profils normalisés sur la période {startYear}–{endYear}
            </p>

            <div className="flex justify-center">
              <svg width="350" height="330" viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
                {[0.25, 0.5, 0.75, 1].map((f) => {
                  const pts = axes
                    .map((_, i) => {
                      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
                      return `${(cx + R * f * Math.cos(ang)).toFixed(1)},${(cy + R * f * Math.sin(ang)).toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={f}
                      points={pts}
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-300 dark:text-slate-700"
                      strokeWidth="1"
                    />
                  );
                })}

                {axes.map((ax, i) => {
                  const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
                  const x2 = cx + R * Math.cos(ang);
                  const y2 = cy + R * Math.sin(ang);
                  const lx = cx + (R + 28) * Math.cos(ang);
                  const ly = cy + (R + 19) * Math.sin(ang);
                  return (
                    <g key={ax.label}>
                      <line
                        x1={cx}
                        y1={cy}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10.5"
                        fontWeight="700"
                        className="fill-slate-600 dark:fill-slate-300"
                      >
                        {ax.label}
                      </text>
                    </g>
                  );
                })}

                {selectedItems.map((it, idx) => {
                  const col = CHART_PALETTE[idx];
                  const pts = axes
                    .map((ax, i) => {
                      const ratio = ax.fn(it) / 100;
                      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
                      return `${(cx + R * ratio * Math.cos(ang)).toFixed(1)},${(cy + R * ratio * Math.sin(ang)).toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={it.entity.id}
                      points={pts}
                      fill={col}
                      fillOpacity={0.22}
                      stroke={col}
                      strokeWidth="2.3"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-[#1F2937]">
              {selectedItems.map((it, idx) => (
                <div key={it.entity.id} className="inline-flex items-center gap-2 text-[13px] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_PALETTE[idx] }} />
                  <EntityBadge entity={it.entity} size={22} />
                  <span>{it.entity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau Stat par Stat + Verdict */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-4">
            <div>
              <h2 className="text-[17px] font-extrabold">Duel Statistique Critère par Critère</h2>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                Le vainqueur de chaque ligne est mis en évidence en vert émeraude
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1F2937] bg-slate-50 dark:bg-[#161F31] text-[12px]">
                    <th className="py-2.5 px-3 text-left font-bold text-slate-600 dark:text-slate-300">Critère</th>
                    {selectedItems.map((it, idx) => (
                      <th key={it.entity.id} className="py-2.5 px-3 text-right font-extrabold" style={{ color: CHART_PALETTE[idx] }}>
                        {it.entity.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-[#1F2937]">
                  {rowsData.map((r) => (
                    <tr key={r.label}>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">{r.label}</td>
                      {r.vals.map((v, idx) => {
                        const isUniqueWin = v === r.maxV && r.ties < selectedItems.length;
                        return (
                          <td
                            key={selectedItems[idx].entity.id}
                            className={`py-2.5 px-3 text-right font-mono-num ${
                              isUniqueWin
                                ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-extrabold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {v}
                            {r.suffix || ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {winner && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-[13.5px] leading-relaxed">
                <div className="font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                  Verdict Analytique OmniStats ({startYear}–{endYear})
                </div>
                <p>
                  <strong>{winner.entity.name}</strong> domine ce duel en remportant{' '}
                  <strong className="font-mono-num">{winsCount[bestIdx]}</strong> des {metrics.length} indicateurs clés
                  face à {others.map((o) => o.entity.name).join(', ')}. Son avantage repose sur un indice Palmarès de{' '}
                  <strong className="font-mono-num">{winner.palmaresScore} pts</strong> ({winner.t1Titles} titre
                  {winner.t1Titles > 1 ? 's' : ''} Tier 1) et un pic Elo de{' '}
                  <strong className="font-mono-num">{winner.peakElo}</strong>
                  {others[0]
                    ? `, contre ${others[0].palmaresScore} pts et ${others[0].peakElo} Elo pour ${others[0].entity.name}.`
                    : '.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
