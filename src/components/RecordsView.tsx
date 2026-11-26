import React from 'react';
import { Award, Flame, Globe2, Trophy } from 'lucide-react';
import { HallOfRecordsData } from '../types/omnistats';
import { SPORTS_MAP } from '../data/sports';
import { EntityBadge } from './EntityBadge';

interface RecordsViewProps {
  recordsData: HallOfRecordsData;
  startYear: number;
  endYear: number;
  onInspectEntity: (id: string) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  recordsData,
  startYear,
  endYear,
  onInspectEntity,
}) => {
  return (
    <div className="space-y-5">
      {/* 4 Records Absolus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meilleure saison individuelle */}
        <article className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[13px] font-bold">
            <Flame size={16} />
            <span>Meilleure saison individuelle ({startYear}–{endYear})</span>
          </div>
          {recordsData.bestSeason ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onInspectEntity(recordsData.bestSeason!.entity.id)}
                className="flex items-center gap-3 text-left group min-w-0"
              >
                <EntityBadge entity={recordsData.bestSeason.entity} size={48} />
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold group-hover:text-cyan-500 truncate">
                    {recordsData.bestSeason.entity.name} ({recordsData.bestSeason.year})
                  </div>
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 truncate">
                    {recordsData.bestSeason.details}
                  </div>
                </div>
              </button>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {recordsData.bestSeason.score}
                </div>
                <div className="text-[11px] text-slate-500">pts en 1 an</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
          )}
        </article>

        {/* Dynastie la plus dominante */}
        <article className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 text-[13px] font-bold">
            <Trophy size={16} />
            <span>Dynastie la plus dominante</span>
          </div>
          {recordsData.topDynasty ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onInspectEntity(recordsData.topDynasty!.entity.id)}
                className="flex items-center gap-3 text-left group min-w-0"
              >
                <EntityBadge entity={recordsData.topDynasty.entity} size={48} />
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold group-hover:text-cyan-500 truncate">
                    {recordsData.topDynasty.entity.name}
                  </div>
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {recordsData.topDynasty.totalTitles} titres totaux · {recordsData.topDynasty.palmaresScore} pts
                  </div>
                </div>
              </button>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-2xl font-extrabold text-cyan-700 dark:text-cyan-400">
                  {recordsData.topDynasty.t1Titles}
                </div>
                <div className="text-[11px] text-slate-500">Titres Tier 1</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
          )}
        </article>

        {/* Plus haut pourcentage de victoires */}
        <article className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[13px] font-bold">
            <Award size={16} />
            <span>Plus haut pourcentage de victoires</span>
          </div>
          {recordsData.highestWinPct ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onInspectEntity(recordsData.highestWinPct!.entity.id)}
                className="flex items-center gap-3 text-left group min-w-0"
              >
                <EntityBadge entity={recordsData.highestWinPct.entity} size={48} />
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold group-hover:text-cyan-500 truncate">
                    {recordsData.highestWinPct.entity.name}
                  </div>
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {recordsData.highestWinPct.wins} victoires sur {recordsData.highestWinPct.matches} matchs/épreuves
                  </div>
                </div>
              </button>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {recordsData.highestWinPct.winPct}%
                </div>
                <div className="text-[11px] text-slate-500">taux de succès</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
          )}
        </article>

        {/* Nation la plus polyvalente */}
        <article className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 text-[13px] font-bold">
            <Globe2 size={16} />
            <span>Nation la plus polyvalente (Titres Tier 1 multi-sports)</span>
          </div>
          {recordsData.mostVersatileNation ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onInspectEntity(recordsData.mostVersatileNation!.entity.id)}
                className="flex items-center gap-3 text-left group min-w-0"
              >
                <EntityBadge entity={recordsData.mostVersatileNation.entity} size={48} />
                <div className="min-w-0">
                  <div className="text-[18px] font-extrabold group-hover:text-cyan-500 truncate">
                    {recordsData.mostVersatileNation.entity.name}
                  </div>
                  <div className="text-[13px] text-slate-500 dark:text-slate-400 truncate">
                    {recordsData.mostVersatileNation.sportsWithT1
                      .map((s) => `${SPORTS_MAP[s].icon} ${SPORTS_MAP[s].short}`)
                      .join(' · ')}
                  </div>
                </div>
              </button>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-2xl font-extrabold text-violet-700 dark:text-violet-400">
                  {recordsData.mostVersatileNation.sportsWithT1.length}
                </div>
                <div className="text-[11px] text-slate-500">sports Tier 1</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune nation Tier 1 sur cette plage.</p>
          )}
        </article>
      </div>

      {/* Classements Statistiques Extrêmes */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
        <div className="mb-4">
          <h2 className="text-[18px] font-extrabold">Explorateur des Statistiques Extrêmes</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Top 5 par spécialité calculé dynamiquement sur {startYear}–{endYear}
          </p>
        </div>

        {recordsData.extremes.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun record statistique extrême pour le filtre actif.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recordsData.extremes.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F31] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-[14.5px]">{cat.title}</h3>
                  <span className="text-[11.5px] font-mono-num font-semibold text-slate-500 dark:text-slate-400">
                    {cat.metricLabel}
                  </span>
                </div>
                <ol className="space-y-2">
                  {cat.entries.map((entry, idx) => (
                    <li key={entry.entity.id} className="flex items-center justify-between gap-2 text-[13px]">
                      <button
                        type="button"
                        onClick={() => onInspectEntity(entry.entity.id)}
                        className="flex items-center gap-2 min-w-0 text-left hover:text-cyan-500"
                      >
                        <span className="font-mono-num text-[12px] w-4 text-slate-400 font-bold">{idx + 1}.</span>
                        <EntityBadge entity={entry.entity} size={22} />
                        <span className="font-bold truncate">{entry.entity.name}</span>
                        <span className="text-[11.5px] text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                          · {entry.context}
                        </span>
                      </button>
                      <span className="font-mono-num font-extrabold text-cyan-700 dark:text-cyan-400 shrink-0">
                        {entry.formatted}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
