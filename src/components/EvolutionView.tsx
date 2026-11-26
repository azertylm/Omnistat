import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { AggregatedEntity, AlgoMode, Entity, ScoringWeights, SportRecord } from '../types/omnistats';
import { buildTimelineSeries, computeBarRaceFrame } from '../engine/scoring';

interface EvolutionViewProps {
  filteredRecords: SportRecord[];
  sortedList: AggregatedEntity[];
  entities: Record<string, Entity>;
  weights: ScoringWeights;
  algo: AlgoMode;
  startYear: number;
  endYear: number;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  filteredRecords,
  sortedList,
  entities,
  weights,
  algo,
  startYear,
  endYear,
}) => {
  const [raceMode, setRaceMode] = useState<'cumulative' | 'annual'>('cumulative');
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(500);
  const [currentYear, setCurrentYear] = useState(endYear);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    setPlaying(false);
    setCurrentYear(endYear);
  }, [startYear, endYear, filteredRecords.length]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= endYear) {
          setPlaying(false);
          return endYear;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(id);
  }, [playing, speedMs, endYear]);

  const handleTogglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (currentYear >= endYear) setCurrentYear(startYear);
      setPlaying(true);
    }
  };

  const raceRows = useMemo(
    () => computeBarRaceFrame(filteredRecords, entities, weights, algo, raceMode, currentYear),
    [filteredRecords, entities, weights, algo, raceMode, currentYear],
  );

  const timeline = useMemo(
    () => buildTimelineSeries(filteredRecords, sortedList, weights, algo, startYear, endYear),
    [filteredRecords, sortedList, weights, algo, startYear, endYear],
  );

  const maxBarValue = Math.max(...raceRows.map((r) => r.value), 10);

  // SVG multi-line geometry
  const W = 980;
  const H = 310;
  const padL = 54;
  const padR = 24;
  const padT = 20;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const allVals = timeline.series.flatMap((s) =>
    s.points.map((p) => (raceMode === 'cumulative' ? p.cumulative : p.annual)),
  );
  const maxLineVal = Math.max(...allVals, 10);

  const xFor = (i: number) =>
    timeline.years.length <= 1 ? padL + plotW / 2 : padL + (i / (timeline.years.length - 1)) * plotW;
  const yFor = (v: number) => padT + plotH - (v / maxLineVal) * plotH;
  const xStep = Math.max(1, Math.ceil(timeline.years.length / 10));

  return (
    <div className="space-y-5">
      {/* Bar Chart Race Chronologique */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[18px] font-extrabold">Bar Chart Race Chronologique</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Visualisez les dynasties naître, régner et s’effondrer année après année ({startYear}–{endYear})
            </p>
          </div>
          <div className="inline-flex p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setRaceMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold ${
                raceMode === 'cumulative'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Score cumulé
            </button>
            <button
              type="button"
              onClick={() => setRaceMode('annual')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold ${
                raceMode === 'annual'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Score annuel
            </button>
          </div>
        </div>

        {/* Lecteur */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#161F31] border border-slate-200 dark:border-[#1F2937] mb-5">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[13px]"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            <span>{playing ? 'Pause' : 'Lecture'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setCurrentYear(startYear);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-[13px] hover:border-cyan-500"
          >
            <RotateCcw size={14} />
            <span>Début</span>
          </button>

          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            aria-label="Vitesse du lecteur chronologique"
            className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[12.5px] font-semibold"
          >
            <option value={850}>Vitesse 0.5x</option>
            <option value={500}>Vitesse 1x</option>
            <option value={240}>Vitesse 2x</option>
          </select>

          <input
            type="range"
            min={startYear}
            max={endYear}
            value={currentYear}
            onChange={(e) => {
              setPlaying(false);
              setCurrentYear(Number(e.target.value));
            }}
            aria-label="Curseur d'année Bar Chart Race"
            className="flex-1 min-w-[140px] accent-cyan-500"
          />

          <div
            className="font-mono-num text-[28px] font-extrabold text-cyan-700 dark:text-cyan-400 tracking-tight ml-auto"
            data-testid="race-current-year"
          >
            {currentYear}
          </div>
        </div>

        {/* Barres animées */}
        {raceRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun point enregistré pour l’année {currentYear} avec les filtres actifs.
          </div>
        ) : (
          <div className="relative" style={{ height: `${Math.max(240, raceRows.length * 42)}px` }}>
            {raceRows.map((row, idx) => {
              const pct = Math.max(6, Math.round((row.value / maxBarValue) * 86));
              const fillColor =
                row.entity.c1 === '#111827' || row.entity.c1 === '#1E293B' || row.entity.c1 === '#E2E8F0'
                  ? '#06B6D4'
                  : row.entity.c1;
              return (
                <div
                  key={row.entity.id}
                  className="absolute left-0 right-0 h-9 flex items-center gap-3 transition-transform duration-300 ease-out"
                  style={{ transform: `translateY(${idx * 42}px)` }}
                >
                  <div className="w-[125px] sm:w-[175px] shrink-0 flex items-center justify-end gap-1.5 text-right text-[13px] font-bold truncate">
                    <span>{row.entity.flag}</span>
                    <span className="truncate">{row.entity.name}</span>
                  </div>
                  <div className="flex-1 h-7 rounded-md bg-slate-100 dark:bg-slate-800/80 flex items-center overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-300 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: fillColor }}
                    />
                    <span className="ml-2 font-mono-num text-[12.5px] font-bold text-slate-800 dark:text-slate-100 pr-2 shrink-0">
                      {row.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Graphique Multi-Courbes Top 8 */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
        <div className="mb-4">
          <h2 className="text-[18px] font-extrabold">Évolution Historique du Top 8</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Survolez la courbe pour lire les scores exacts par année ({raceMode === 'cumulative' ? 'cumulés' : 'annuels'})
          </p>
        </div>

        {timeline.series.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Données insuffisantes pour tracer les courbes.
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto block select-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const relX = ((e.clientX - rect.left) / rect.width) * W;
                const ratio = Math.max(0, Math.min(1, (relX - padL) / plotW));
                setHoverIdx(Math.round(ratio * Math.max(0, timeline.years.length - 1)));
              }}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* Grid Y */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const val = Math.round(maxLineVal * f);
                const y = yFor(val);
                return (
                  <g key={f}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeDasharray="3,3"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10.5"
                      className="fill-slate-500 dark:fill-slate-400 font-mono-num"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X labels */}
              {timeline.years.map((yr, idx) =>
                idx % xStep === 0 || idx === timeline.years.length - 1 ? (
                  <text
                    key={yr}
                    x={xFor(idx)}
                    y={H - 10}
                    textAnchor="middle"
                    fontSize="10.5"
                    className="fill-slate-500 dark:fill-slate-400 font-mono-num"
                  >
                    {yr}
                  </text>
                ) : null,
              )}

              {/* Curves */}
              {timeline.series.map((s) => {
                const pts = s.points
                  .map((p, idx) => `${xFor(idx).toFixed(1)},${yFor(raceMode === 'cumulative' ? p.cumulative : p.annual).toFixed(1)}`)
                  .join(' ');
                return (
                  <polyline
                    key={s.entity.id}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pts}
                  />
                );
              })}

              {/* Crosshair */}
              {hoverIdx !== null && timeline.years[hoverIdx] !== undefined && (
                <line
                  x1={xFor(hoverIdx)}
                  y1={padT}
                  x2={xFor(hoverIdx)}
                  y2={H - padB}
                  stroke="#06B6D4"
                  strokeWidth="1.2"
                  strokeDasharray="3,2"
                />
              )}
            </svg>

            {hoverIdx !== null && timeline.years[hoverIdx] !== undefined && (
              <div className="absolute top-2 right-2 rounded-xl bg-slate-950/95 text-slate-100 border border-slate-700 px-3 py-2 text-[12px] pointer-events-none shadow-xl">
                <div className="font-mono-num font-bold text-cyan-400 mb-1">
                  Année {timeline.years[hoverIdx]}
                </div>
                {timeline.series
                  .map((s) => ({
                    short: s.entity.short,
                    color: s.color,
                    val: raceMode === 'cumulative' ? s.points[hoverIdx].cumulative : s.points[hoverIdx].annual,
                  }))
                  .sort((a, b) => b.val - a.val)
                  .map((item) => (
                    <div key={item.short} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.short}</span>
                      </span>
                      <span className="font-mono-num font-bold">{item.val}</span>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-[#1F2937]">
              {timeline.series.map((s) => (
                <div key={s.entity.id} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.entity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
