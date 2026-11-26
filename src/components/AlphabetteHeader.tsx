import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart2,
  Crown,
  Heart,
  LayoutGrid,
  Moon,
  MoreHorizontal,
  Star,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface AlphabetteHeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  bigMode: boolean;
  onToggleBigMode: () => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  onResetHome: () => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warn') => void;
  getSpeechText: () => string;
}

interface SuiteAppItem {
  id: string;
  name: string;
  desc: string;
  url: string;
  isNew?: boolean;
}

const SUITE_APPS: SuiteAppItem[] = [
  { id: 'omnistats', name: 'OmniStats', desc: 'Classement historique multi-sports (1950–2026) & analytique Opta', url: 'https://alphabette.fr', isNew: true },
  { id: 'infoperso', name: 'Info Perso', desc: 'Coffre-fort local pour vos documents et démarches administratives', url: 'https://alphabette.fr' },
  { id: 'chronos', name: 'Chronos Histoire', desc: 'Frises chronologiques interactives et repères historiques', url: 'https://alphabette.fr', isNew: true },
  { id: 'budgetclair', name: 'Budget Clair', desc: 'Suivi de dépenses 100 % local sans connexion bancaire', url: 'https://alphabette.fr' },
  { id: 'medmemo', name: 'MédMémo', desc: 'Carnet de suivi santé, rappels et ordonnances hors ligne', url: 'https://alphabette.fr', isNew: true },
  { id: 'lexiquefr', name: 'Lexique & Orthographe', desc: 'Entraînement quotidien et règles de français accessibles', url: 'https://alphabette.fr' },
  { id: 'cuisinote', name: 'CuisiNote', desc: 'Recettes de famille, portions ajustables et liste de courses', url: 'https://alphabette.fr' },
  { id: 'atelierlab', name: 'Laboratoire .eu', desc: 'Prototypes expérimentaux de la suite européenne Alphabette', url: 'https://alphabette.eu' },
];

type ActiveModal = null | 'apps' | 'news' | 'subscription' | 'donate' | 'install' | 'feedback' | 'language';

export const AlphabetteHeader: React.FC<AlphabetteHeaderProps> = ({
  theme,
  onToggleTheme,
  bigMode,
  onToggleBigMode,
  simpleMode,
  onToggleSimpleMode,
  onResetHome,
  onNotify,
  getSpeechText,
}) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pinned, setPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alphabette_pinned_omnistats') === '1';
    } catch {
      return false;
    }
  });
  const [favApps, setFavApps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alphabette_suite_favs');
      return saved ? (JSON.parse(saved) as string[]) : ['omnistats'];
    } catch {
      return ['omnistats'];
    }
  });
  const [language, setLanguage] = useState<'FR' | 'EN' | 'ES'>('FR');
  const [feedbackText, setFeedbackText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setActiveModal(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAppFavorite = (id: string) => {
    setFavApps((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('alphabette_suite_favs', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem('alphabette_pinned_omnistats', next ? '1' : '0');
    } catch {
      // ignore
    }
    setMenuOpen(false);
    onNotify(next ? 'OmniStats épinglée dans vos favoris.' : 'OmniStats retirée des applis épinglées.', 'info');
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onNotify('La synthèse vocale n’est pas supportée sur ce navigateur.', 'warn');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = getSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackText('');
    setActiveModal(null);
    onNotify('Merci ! Votre avis sur OmniStats a bien été enregistré localement.', 'success');
  };

  const isDark = theme === 'dark';

  return (
    <>
      <header
        className="alphabette-header no-print sticky top-0 z-40 w-full select-none"
        style={{ fontSize: '16px', lineHeight: 1.2 }}
      >
        {/* 1. BARRE SUPÉRIEURE (Top Bar Écosystème) — Dimensions strictes en px */}
        <div
          className="w-full flex items-center justify-between flex-nowrap h-[46px] sm:h-[50px] px-[8px] sm:px-[16px] gap-[4px] sm:gap-[8px]"
          style={{
            backgroundColor: isDark ? '#0b1220' : '#182334',
            color: '#ffffff',
          }}
        >
          {/* Bloc gauche */}
          <div className="flex items-center flex-nowrap gap-[4px] sm:gap-[10px] min-w-0">
            <a
              href="https://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[5px] sm:gap-[7px] shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-[8px] py-[2px]"
              aria-label="Portail Alphabette.fr"
            >
              <span
                className="inline-flex items-center justify-center rounded-full font-extrabold text-white shrink-0 w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] text-[14px] sm:text-[16px]"
                style={{ backgroundColor: '#3355d1' }}
              >
                a
              </span>
              <span className="font-bold lowercase tracking-tight text-white text-[14px] sm:text-[17px] whitespace-nowrap">
                alphabette
              </span>
            </a>

            <a
              href="https://alphabette.eu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Laboratoire Alphabette.eu"
              className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold text-white/95 hover:bg-white/20 transition-colors w-[31px] h-[31px] sm:w-[36px] sm:h-[36px] text-[11.5px] sm:text-[13px] focus-visible:outline-2 focus-visible:outline-amber-400"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.10)' }}
            >
              .eu
            </a>

            <button
              type="button"
              onClick={() => setActiveModal('apps')}
              aria-label="Toutes les applis de la suite Alphabette"
              className="inline-flex items-center justify-center gap-[6px] rounded-full shrink-0 text-white hover:bg-white/20 transition-colors w-[31px] h-[31px] sm:w-auto sm:h-[36px] sm:px-[10px] focus-visible:outline-2 focus-visible:outline-amber-400"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.10)' }}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline font-semibold text-[12.5px] whitespace-nowrap">
                Toutes les applis
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('news')}
              aria-label="Nouveautés de la suite Alphabette"
              className="inline-flex items-center justify-center rounded-full shrink-0 hover:bg-white/20 transition-colors w-[31px] h-[31px] sm:w-[36px] sm:h-[36px] focus-visible:outline-2 focus-visible:outline-amber-400"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.10)' }}
            >
              <span className="inline-flex items-center justify-center rounded-[4px] px-[3.5px] py-[2px] bg-gradient-to-b from-sky-200 to-sky-400 text-[#0f172a] font-extrabold uppercase text-[8.5px] sm:text-[9px] leading-none tracking-tight">
                NEW
              </span>
            </button>
          </div>

          {/* Bloc droit : Abonnement */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal('subscription')}
              aria-label="Informations sur l'abonnement Alphabette"
              className="inline-flex items-center gap-[4px] sm:gap-[5px] rounded-full shrink-0 h-[32px] sm:h-[36px] px-[8px] sm:px-[14px] hover:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.10)',
                border: '1.5px solid #f59e0b',
              }}
            >
              <Crown size={13} color="#f59e0b" />
              <span
                className="font-bold whitespace-nowrap text-[11.5px] sm:text-[13.5px]"
                style={{ color: '#fbbf24' }}
              >
                Abonnement
              </span>
            </button>
          </div>
        </div>

        {/* 2. BARRE INFÉRIEURE (Barre d'Application & Accessibilité) — Dimensions strictes en px */}
        <div
          className="w-full flex items-center justify-between flex-nowrap h-[54px] sm:h-[58px] px-[8px] sm:px-[16px] gap-[6px]"
          style={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          }}
        >
          {/* Bloc gauche : Titre + sous-titre */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <button
              type="button"
              onClick={onResetHome}
              className="inline-flex items-center gap-[5px] text-left min-w-0 max-w-full focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-[4px]"
              aria-label="Retour à l'accueil OmniStats"
            >
              <span
                className="font-extrabold tracking-tight truncate text-[15px] sm:text-[20px] leading-tight"
                style={{ color: isDark ? '#ffffff' : '#3f51b5' }}
              >
                OmniStats
              </span>
              {pinned && (
                <Star
                  size={13}
                  fill="#f59e0b"
                  color="#f59e0b"
                  className="shrink-0"
                  aria-label="Application épinglée"
                />
              )}
            </button>
            <span
              className="uppercase truncate font-semibold text-[9px] sm:text-[10.5px] leading-tight mt-[1px]"
              style={{
                color: isDark ? '#94a3b8' : '#64748b',
                letterSpacing: '0.04em',
              }}
            >
              STATS MULTI-SPORTS
            </span>
          </div>

          {/* Bloc droit : Exactement les 5 boutons réglementaires */}
          <div className="flex items-center flex-nowrap shrink-0 gap-[4px] sm:gap-[7px]">
            {/* 1. Bouton Don */}
            <button
              type="button"
              onClick={() => setActiveModal('donate')}
              aria-label="Soutenir Alphabette par un don"
              className="inline-flex items-center justify-center shrink-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] sm:rounded-[11px] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-pink-400"
              style={{ backgroundColor: '#db2777', color: '#ffffff' }}
            >
              <Heart size={17} fill="#ffffff" color="#ffffff" />
            </button>

            {/* 2. Bouton BIG */}
            <button
              type="button"
              onClick={onToggleBigMode}
              aria-pressed={bigMode}
              aria-label="Activer ou désactiver le mode grand texte BIG"
              className="inline-flex items-center justify-center gap-[3px] shrink-0 h-[34px] sm:h-[38px] px-[8px] sm:px-[11px] rounded-[10px] sm:rounded-[11px] font-extrabold text-white transition-all focus-visible:outline-2 focus-visible:outline-indigo-300"
              style={{
                backgroundColor: bigMode ? '#312e81' : '#4338ca',
                boxShadow: bigMode ? 'inset 0 0 0 2px #a5b4fc' : 'none',
              }}
            >
              <span className="text-[12px] sm:text-[14px] tracking-tight">BIG</span>
              <BarChart2 size={14} />
            </button>

            {/* 3. Bouton Mode Nuit / Jour */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Passer en mode jour haute lisibilité' : 'Passer en mode nuit'}
              className="inline-flex items-center justify-center rounded-full shrink-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                color: isDark ? '#fbbf24' : '#334155',
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* 4. Bouton Lecture à haute voix */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              aria-pressed={isSpeaking}
              aria-label={isSpeaking ? 'Arrêter la lecture à haute voix' : 'Lire la page à haute voix'}
              className="inline-flex items-center justify-center rounded-full shrink-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400"
              style={{
                backgroundColor: isSpeaking ? '#047857' : isDark ? '#1e293b' : '#f1f5f9',
                border: isSpeaking
                  ? '1px solid #059669'
                  : isDark
                    ? '1px solid #334155'
                    : '1px solid #e2e8f0',
                color: isSpeaking ? '#ffffff' : isDark ? '#e2e8f0' : '#334155',
              }}
            >
              {isSpeaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            {/* 5. Bouton Plus d'options (...) */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Plus d'options"
                className="inline-flex items-center justify-center rounded-full shrink-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDark ? '#e2e8f0' : '#334155',
                }}
              >
                <MoreHorizontal size={17} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Options de l'application"
                  className="absolute right-0 mt-[8px] w-[260px] rounded-[12px] py-[6px] shadow-2xl z-50"
                  style={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '14px',
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={togglePin}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>⭐ Épingler cette appli</span>
                    {pinned && <span className="text-[11px] font-bold text-amber-500">Actif</span>}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('subscription');
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>👤 Mon inscription</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleSimpleMode();
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>🧘 Mode simple</span>
                    {simpleMode && <span className="text-[11px] font-bold text-emerald-500">Actif</span>}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('install');
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>📱 Installer sur mon téléphone</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('feedback');
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>💬 Donner mon avis</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      window.print();
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>🖨️ Imprimer</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('language');
                    }}
                    className="w-full flex items-center justify-between px-[14px] py-[10px] text-left hover:bg-slate-500/15 transition-colors"
                  >
                    <span>🌐 Langue</span>
                    <span className="text-[12px] font-bold text-cyan-500">{language}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODALES AUTONOMES DE LA DOUBLE BARRE ALPHABETTE */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="w-full max-w-[520px] rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-[18px] font-bold">
                {activeModal === 'apps' && 'Toutes les applis Alphabette'}
                {activeModal === 'news' && 'Nouveautés de la suite'}
                {activeModal === 'subscription' && 'Abonnement Alphabette'}
                {activeModal === 'donate' && 'Soutenir le projet Alphabette'}
                {activeModal === 'install' && 'Installer sur mon téléphone'}
                {activeModal === 'feedback' && 'Donner mon avis'}
                {activeModal === 'language' && 'Choix de la langue'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Fermer la fenêtre"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto text-[15px]">
              {activeModal === 'apps' && (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {SUITE_APPS.map((app) => {
                    const isFav = favApps.includes(app.id);
                    return (
                      <li key={app.id} className="py-3 flex items-center justify-between gap-3">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 flex-1 hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                          <div className="font-bold">{app.name}</div>
                          <div className="text-[13px] text-slate-600 dark:text-slate-400">{app.desc}</div>
                        </a>
                        <button
                          type="button"
                          onClick={() => toggleAppFavorite(app.id)}
                          aria-label={isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`}
                          className="text-[20px] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {activeModal === 'news' && (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {SUITE_APPS.filter((a) => a.isNew).map((app) => {
                    const isFav = favApps.includes(app.id);
                    return (
                      <li key={app.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold flex items-center gap-2">
                            <span>{app.name}</span>
                            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">NOUVEAU</span>
                          </div>
                          <div className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">{app.desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleAppFavorite(app.id)}
                          aria-label={isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`}
                          className="text-[20px] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {activeModal === 'subscription' && (
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Lancement de l’abonnement payant le <strong>7 mai</strong> au tarif de{' '}
                    <strong className="text-amber-600 dark:text-amber-400">15 € / an</strong> pour une appli, ou{' '}
                    <strong className="text-amber-600 dark:text-amber-400">40 € / an</strong> pour toutes les applis de
                    l’écosystème Alphabette.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                      <div className="font-bold text-[15px]">Une application</div>
                      <div className="text-[22px] font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                        15 € / an
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1">
                        Accès complet et synchronisation locale sur votre appli préférée.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-500/60 bg-amber-500/10">
                      <div className="font-bold text-[15px]">Suite Complète</div>
                      <div className="text-[22px] font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                        40 € / an
                      </div>
                      <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1">
                        Accès illimité à toutes les applis Alphabette sans aucune publicité.
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    OmniStats reste aujourd’hui utilisable gratuitement et sans compte.
                  </p>
                </div>
              )}

              {activeModal === 'donate' && (
                <div className="space-y-4">
                  <p className="leading-relaxed">
                    Alphabette conçoit des outils utiles, sobres, sans publicité et respectueux de votre vie privée.
                    Votre soutien aide à financer l’hébergement indépendant et l’enrichissement continu des bases de données.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['5 €', '10 €', '25 €'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setActiveModal(null);
                          onNotify(`Merci pour votre intention de soutien (${amt}) envers Alphabette !`, 'success');
                        }}
                        className="px-4 py-2 rounded-lg font-bold bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        Soutenir · {amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'install' && (
                <div className="space-y-3 leading-relaxed">
                  <p>Installez <strong>OmniStats</strong> sur l’écran d’accueil de votre téléphone pour un accès instantané :</p>
                  <ul className="list-disc pl-5 space-y-2 text-[14px] text-slate-700 dark:text-slate-300">
                    <li><strong>Sur Android (Chrome) :</strong> ouvrez le menu ⋮ en haut à droite puis sélectionnez <em>« Ajouter à l’écran d’accueil »</em>.</li>
                    <li><strong>Sur iPhone (Safari) :</strong> appuyez sur l’icône Partager en bas puis choisissez <em>« Sur l’écran d’accueil »</em>.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'feedback' && (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <label htmlFor="alphabetteFeedback" className="block text-[14px] font-semibold">
                    Une suggestion de sport, de compétition ou d’amélioration ?
                  </label>
                  <textarea
                    id="alphabetteFeedback"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Partagez votre retour sur OmniStats..."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 text-[14px] focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      Envoyer mon avis
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'language' && (
                <div className="space-y-2">
                  {(['FR', 'EN', 'ES'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setLanguage(code);
                        setActiveModal(null);
                        onNotify(
                          code === 'FR'
                            ? 'Langue définie sur Français (FR).'
                            : `Préférence enregistrée (${code}) — l’interface OmniStats est optimisée en français.`,
                          'info',
                        );
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left font-semibold ${
                        language === code
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{code === 'FR' ? 'Français (Principal)' : code === 'EN' ? 'English' : 'Español'}</span>
                      <span className="font-mono-num text-[13px]">{code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[14px]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
