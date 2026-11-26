import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { ScoringWeights } from '../types/omnistats';
import { DEFAULT_WEIGHTS } from '../data/sports';

interface CoefficientsModalProps {
  open: boolean;
  weights: ScoringWeights;
  onChange: (next: ScoringWeights) => void;
  onClose: () => void;
}

const SLIDERS: Array<{ key: keyof ScoringWeights; label: string; min: number; max: number; group: 'palmares' | 'domination' }> = [
  { key: 't1Title', label: 'Tier 1 · Titre / Médaille d’Or', min: 20, max: 200, group: 'palmares' },
  { key: 't1Final', label: 'Tier 1 · Finale / Argent', min: 10, max: 120, group: 'palmares' },
  { key: 't1Podium', label: 'Tier 1 · Demi-finale / Bronze', min: 5, max: 80, group: 'palmares' },
  { key: 't2Title', label: 'Tier 2 · Championnat Majeur / Continental', min: 10, max: 120, group: 'palmares' },
  { key: 't2Final', label: 'Tier 2 · Finale / 2e place', min: 5, max: 60, group: 'palmares' },
  { key: 't3Title', label: 'Tier 3 · Coupe Nationale', min: 5, max: 60, group: 'palmares' },
  { key: 'domElo', label: 'Domination · Poids Indice Elo (%)', min: 0, max: 100, group: 'domination' },
  { key: 'domWin', label: 'Domination · Poids % Victoires (%)', min: 0, max: 100, group: 'domination' },
  { key: 'domMargin', label: 'Domination · Poids Régularité / Séries (%)', min: 0, max: 100, group: 'domination' },
];

export const CoefficientsModal: React.FC<CoefficientsModalProps> = ({
  open,
  weights,
  onChange,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Personnaliser les coefficients de classement"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[760px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-[18px] font-extrabold">Personnaliser les coefficients</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Tous les scores, podiums et graphiques se recalculent instantanément
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les coefficients"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SLIDERS.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F31] p-3"
            >
              <div className="flex items-center justify-between gap-2 text-[13px] font-semibold mb-1.5">
                <label htmlFor={`coeff-${s.key}`}>{s.label}</label>
                <span className="font-mono-num font-bold text-cyan-700 dark:text-cyan-400">
                  {weights[s.key]}
                </span>
              </div>
              <input
                id={`coeff-${s.key}`}
                type="range"
                min={s.min}
                max={s.max}
                value={weights[s.key]}
                onChange={(e) => onChange({ ...weights, [s.key]: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-[13px] hover:border-cyan-500"
          >
            <RotateCcw size={14} />
            <span>Rétablir valeurs par défaut</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[13px]"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};
