import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Database, Flame, Swords, Trophy, UserSearch, X } from 'lucide-react';
import {
  AlgoMode,
  Entity,
  EntityType,
  RemoteSyncConfig,
  RemoteSyncState,
  ScoringWeights,
  SportId,
  SportRecord,
  ToastMessage,
  ViewTabId,
} from './types/omnistats';
import { CORE_ENTITIES } from './data/entities';
import { buildCoreRecords } from './data/history';
import { PURE_METRICS_BY_SPORT, SPORTS_MAP } from './data/sports';
import {
  aggregateEntities,
  computeHallOfRecords,
  filterRecords,
  sortEntities,
} from './engine/scoring';
import { buildRawGithubUrl, mergeRemoteDatabase } from './engine/remoteSync';
import {
  clearRemoteSyncConfigAndCache,
  DEFAULT_REMOTE_CONFIG,
  fetchRemoteDatabase,
  loadRemoteSyncConfig,
  saveRemoteSyncConfig,
} from './services/githubSync';
import { localDb } from './storage/localDb';
import { AlphabetteHeader } from './components/AlphabetteHeader';
import { ControlBar } from './components/ControlBar';
import { RankingView } from './components/RankingView';
import { EvolutionView } from './components/EvolutionView';
import { VersusView } from './components/VersusView';
import { DeepProfileContent } from './components/DeepProfileContent';
import { RecordsView } from './components/RecordsView';
import { SourcesHubView } from './components/SourcesHubView';
import { CoefficientsModal } from './components/CoefficientsModal';

const CORE_RECORDS = buildCoreRecords();

export default function App() {
  // Theme & Accessibility (synced with Alphabette Double Bar)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localDb.loadTheme());
  const [bigMode, setBigMode] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);

  // Core data + IndexedDB overrides + GitHub Actions Remote Auto-Sync
  const [customRecords, setCustomRecords] = useState<SportRecord[]>([]);
  const [customEntities, setCustomEntities] = useState<Record<string, Entity>>({});
  const [remoteConfig, setRemoteConfig] = useState<RemoteSyncConfig>(() => loadRemoteSyncConfig());
  const [remoteSync, setRemoteSync] = useState<RemoteSyncState>(() => {
    const cfg = loadRemoteSyncConfig();
    const url = buildRawGithubUrl(cfg);
    return {
      health: url ? 'loading' : 'unconfigured',
      url,
      fromCache: false,
      savedAt: null,
      error: null,
      database: null,
    };
  });

  // Analytical Filters
  const [startYear, setStartYear] = useState(1995);
  const [endYear, setEndYear] = useState(2026);
  const [entityType, setEntityType] = useState<EntityType>('club');
  const [sport, setSport] = useState<SportId>('all');
  const [algo, setAlgo] = useState<AlgoMode>('palmares');
  const [pureMetric, setPureMetric] = useState('totalTitles');
  const [search, setSearch] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);

  // Navigation & Interactions
  const [activeTab, setActiveTab] = useState<ViewTabId>('ranking');
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<string[]>(() => localDb.loadFavorites());
  const [weights, setWeights] = useState<ScoringWeights>(() => localDb.loadWeights());
  const [versusIds, setVersusIds] = useState<string[]>(['real_madrid', 'fc_barcelona']);
  const [profileTabEntityId, setProfileTabEntityId] = useState<string>('real_madrid');
  const [modalEntityId, setModalEntityId] = useState<string | null>(null);
  const [coeffOpen, setCoeffOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const runRemoteSync = useCallback(
    async (cfg: RemoteSyncConfig, options?: { force?: boolean; silent?: boolean }) => {
      const url = buildRawGithubUrl(cfg);
      if (!url) {
        setRemoteSync({
          health: 'unconfigured',
          url: '',
          fromCache: false,
          savedAt: null,
          error: null,
          database: null,
        });
        return;
      }

      setRemoteSync((prev) => ({ ...prev, health: 'loading', url, error: null }));
      const res = await fetchRemoteDatabase(cfg, { force: options?.force });

      if (res.status === 'ok' && res.data) {
        setRemoteSync({
          health: 'synced',
          url: res.url,
          fromCache: res.fromCache,
          savedAt: res.savedAt,
          error: null,
          database: res.data,
        });
        if (!options?.silent) {
          notify(
            `Sync Auto réussie : ${res.data.records.length} entrées chargées (${res.fromCache ? 'cache 6 h' : 'GitHub Live'}).`,
            'success',
          );
        }
      } else if (res.status === 'stale-cache' && res.data) {
        setRemoteSync({
          health: 'cache-offline',
          url: res.url,
          fromCache: true,
          savedAt: res.savedAt,
          error: res.error,
          database: res.data,
        });
        if (!options?.silent) {
          notify('Réseau indisponible : utilisation du dernier cache GitHub sauvegardé.', 'warn');
        }
      } else {
        setRemoteSync({
          health: 'error',
          url: res.url,
          fromCache: false,
          savedAt: null,
          error: res.error,
          database: null,
        });
        if (!options?.silent) {
          notify(res.error || 'Échec de synchronisation GitHub — bascule sur la base intégrée.', 'error');
        }
      }
    },
    [notify],
  );

  // Load persisted IndexedDB custom data + auto-sync GitHub JSON on startup
  useEffect(() => {
    let active = true;
    (async () => {
      const [savedRecs, savedEnts] = await Promise.all([
        localDb.getAll<SportRecord>('customRecords'),
        localDb.getAll<Entity>('customEntities'),
      ]);
      if (!active) return;
      if (savedRecs.length > 0) setCustomRecords(savedRecs);
      if (savedEnts.length > 0) {
        const map: Record<string, Entity> = {};
        for (const e of savedEnts) map[e.id] = e;
        setCustomEntities(map);
      }
    })();

    const initialConfig = loadRemoteSyncConfig();
    if (buildRawGithubUrl(initialConfig)) {
      void runRemoteSync(initialConfig, { force: false, silent: true });
    }

    return () => {
      active = false;
    };
  }, [runRemoteSync]);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localDb.saveTheme(theme);
  }, [theme]);

  // Escape closes deep profile modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalEntityId(null);
        setCoeffOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Zero-loss, zero-duplicate merge: Core + Custom IndexedDB + Remote GitHub JSON
  const mergedData = useMemo(
    () =>
      mergeRemoteDatabase(
        CORE_RECORDS,
        customRecords,
        remoteSync.database,
        CORE_ENTITIES,
        customEntities,
      ),
    [customRecords, remoteSync.database, customEntities],
  );

  const entities = mergedData.entities;
  const allRecords = mergedData.records;
  const maxYear = mergedData.maxYear;

  // Automatically extend timeline endYear if remote database introduces years beyond previous maxYear (e.g. 2027)
  const prevMaxYearRef = useRef(2026);
  useEffect(() => {
    const prevMax = prevMaxYearRef.current;
    prevMaxYearRef.current = maxYear;
    if (maxYear > prevMax) {
      setEndYear((currentEnd) => (currentEnd >= prevMax ? maxYear : currentEnd));
    } else if (maxYear < endYear) {
      setEndYear(maxYear);
    }
  }, [maxYear, endYear]);

  const handleConnectRemote = async (nextConfig: RemoteSyncConfig) => {
    saveRemoteSyncConfig(nextConfig);
    setRemoteConfig(nextConfig);
    await runRemoteSync(nextConfig, { force: true, silent: false });
  };

  const handleForceSyncRemote = async () => {
    await runRemoteSync(remoteConfig, { force: true, silent: false });
  };

  const handleDisconnectRemote = () => {
    clearRemoteSyncConfigAndCache();
    setRemoteConfig({ ...DEFAULT_REMOTE_CONFIG });
    setRemoteSync({
      health: 'unconfigured',
      url: '',
      fromCache: false,
      savedAt: null,
      error: null,
      database: null,
    });
    notify('Pipeline GitHub Actions déconnecté. Retour sur la base intégrée.', 'info');
  };

  // Ensure pureMetric stays valid when switching sports
  const handleSportChange = (nextSport: SportId) => {
    setSport(nextSport);
    const available = PURE_METRICS_BY_SPORT[nextSport] || PURE_METRICS_BY_SPORT.all;
    if (!available.some((m) => m.key === pureMetric)) {
      setPureMetric(available[0].key);
    }
    // If user clicks Olympics or Tennis while in Club mode, automatically switch to Countries so they see rich data immediately
    if ((nextSport === 'olympics' || nextSport === 'tennis') && entityType === 'club') {
      setEntityType('country');
      setVersusIds(['US', 'FR']);
      setProfileTabEntityId('US');
      notify(`${SPORTS_MAP[nextSport].name} : bascule automatique en mode Pays & Nations.`, 'info');
    }
  };

  const handleEntityTypeChange = (nextType: EntityType) => {
    setEntityType(nextType);
    if (nextType === 'country') {
      setVersusIds(['US', 'FR']);
      setProfileTabEntityId('FR');
    } else {
      if (sport === 'olympics' || sport === 'tennis') setSport('all');
      setVersusIds(['real_madrid', 'fc_barcelona']);
      setProfileTabEntityId('real_madrid');
    }
  };

  const filteredRecords = useMemo(
    () =>
      filterRecords(allRecords, entities, {
        startYear,
        endYear,
        entityType,
        sport,
        search,
        onlyFavs,
        favorites,
      }),
    [allRecords, entities, startYear, endYear, entityType, sport, search, onlyFavs, favorites],
  );

  const aggregatedList = useMemo(
    () => aggregateEntities(filteredRecords, entities, weights, algo, pureMetric, startYear, endYear),
    [filteredRecords, entities, weights, algo, pureMetric, startYear, endYear],
  );

  const sortedList = useMemo(
    () => sortEntities(aggregatedList, sortCol, sortDir),
    [aggregatedList, sortCol, sortDir],
  );

  const hallOfRecords = useMemo(
    () => computeHallOfRecords(allRecords, filteredRecords, aggregatedList, entities, weights, startYear, endYear),
    [allRecords, filteredRecords, aggregatedList, entities, weights, startYear, endYear],
  );

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'name' ? 'asc' : 'desc');
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localDb.saveFavorites(next);
      return next;
    });
  };

  const handleToggleVersus = (id: string) => {
    setVersusIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        notify('Maximum 4 entités simultanées dans le comparateur Versus.', 'warn');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSetVersusSlot = (slotIndex: number, id: string) => {
    setVersusIds((prev) => {
      const copy = [...prev];
      if (!id) {
        copy.splice(slotIndex, 1);
      } else {
        copy[slotIndex] = id;
      }
      return Array.from(new Set(copy.filter(Boolean))).slice(0, 4);
    });
  };

  const handleWeightsChange = (next: ScoringWeights) => {
    setWeights(next);
    localDb.saveWeights(next);
  };

  const handleInjectData = async (
    newRecs: SportRecord[],
    newEnts: Entity[],
    successMessage: string,
  ) => {
    if (newEnts.length > 0) {
      await localDb.saveCustomEntities(newEnts);
      setCustomEntities((prev) => {
        const next = { ...prev };
        for (const e of newEnts) next[e.id] = e;
        return next;
      });
    }
    if (newRecs.length > 0) {
      await localDb.saveCustomRecords(newRecs);
      setCustomRecords((prev) => {
        const map = new Map<string, SportRecord>();
        for (const r of prev) map.set(r.id, r);
        for (const r of newRecs) map.set(r.id, r);
        return Array.from(map.values());
      });
    }
    notify(successMessage, 'success');
  };

  const handleResetAllData = async () => {
    await Promise.all([
      localDb.clearStore('customRecords'),
      localDb.clearStore('customEntities'),
      localDb.clearStore('apiCache'),
    ]);
    setCustomRecords([]);
    setCustomEntities({});
    notify('Base historique OmniStats réinitialisée par défaut.', 'info');
  };

  const handleInspectEntity = (id: string) => {
    setProfileTabEntityId(id);
    setModalEntityId(id);
  };

  const handleResetFilters = () => {
    setStartYear(1995);
    setEndYear(maxYear);
    setSport('all');
    setSearch('');
    setOnlyFavs(false);
    setAlgo('palmares');
  };

  const getSpeechText = () => {
    const top3 = sortedList.slice(0, 3);
    const intro = `OmniStats, classement ${entityType === 'club' ? 'des clubs et équipes' : 'des pays et nations'} en ${SPORTS_MAP[sport].name}, de ${startYear} à ${endYear}.`;
    if (top3.length === 0) return `${intro} Aucun résultat pour ces filtres.`;
    const podiumSummary = top3
      .map(
        (item, idx) =>
          `Numéro ${idx + 1}, ${item.entity.name}, avec un score de ${item.score} et ${item.t1Titles} titres majeurs.`,
      )
      .join(' ');
    return `${intro} ${podiumSummary}`;
  };

  const tabs: Array<{ id: ViewTabId; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'ranking', label: 'Podium & Classement', icon: <Trophy size={15} /> },
    { id: 'evolution', label: 'Évolution & Bar Race', icon: <BarChart3 size={15} /> },
    {
      id: 'versus',
      label: 'Comparateur Versus',
      icon: <Swords size={15} />,
      badge: `${versusIds.length}/4`,
    },
    { id: 'profile', label: 'Fiche Entité', icon: <UserSearch size={15} /> },
    { id: 'records', label: 'Hall of Records', icon: <Flame size={15} /> },
    { id: 'sources', label: 'Sources & Sync', icon: <Database size={15} /> },
  ];

  const profileOptions = Object.values(entities)
    .filter((e) => e.type === entityType)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#090D16] dark:text-[#F8FAFC]">
      {/* DOUBLE BARRE ALPHABETTE FIXE */}
      <AlphabetteHeader
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        bigMode={bigMode}
        onToggleBigMode={() => setBigMode((b) => !b)}
        simpleMode={simpleMode}
        onToggleSimpleMode={() => {
          setSimpleMode((prev) => {
            const next = !prev;
            if (next) setBigMode(true);
            notify(
              next
                ? 'Mode simple activé : affichage agrandi et contrôles épurés.'
                : 'Mode simple désactivé : tous les réglages experts sont visibles.',
              'info',
            );
            return next;
          });
        }}
        onResetHome={() => {
          setActiveTab('ranking');
          setModalEntityId(null);
        }}
        onNotify={notify}
        getSpeechText={getSpeechText}
      />

      {/* BARRE DE CONTRÔLE GLOBALE OMNISTATS */}
      <ControlBar
        startYear={startYear}
        endYear={endYear}
        maxYear={maxYear}
        onChangeRange={(s, e) => {
          setStartYear(s);
          setEndYear(e);
        }}
        entityType={entityType}
        onChangeEntityType={handleEntityTypeChange}
        sport={sport}
        onChangeSport={handleSportChange}
        algo={algo}
        onChangeAlgo={(a) => {
          setAlgo(a);
          setSortCol('score');
          setSortDir('desc');
        }}
        pureMetric={pureMetric}
        onChangePureMetric={setPureMetric}
        search={search}
        onChangeSearch={setSearch}
        onlyFavs={onlyFavs}
        favCount={favorites.length}
        onToggleOnlyFavs={() => setOnlyFavs((f) => !f)}
        onOpenCoefficients={() => setCoeffOpen(true)}
        simpleMode={simpleMode}
        totalRecordsCount={allRecords.length}
        remoteSync={remoteSync}
        onOpenSources={() => setActiveTab('sources')}
      />

      {/* CORPS PRINCIPAL (ISOLÉ POUR LE MODE BIG) */}
      <main className={`omnistats-main flex-1 w-full max-w-[1480px] mx-auto px-3 sm:px-5 py-5 ${bigMode ? 'big-mode' : ''}`}>
        {/* Navigation par onglets des 6 Vues */}
        <nav
          aria-label="Vues principales OmniStats"
          className="no-print flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-[#1F2937] mb-5 pb-0.5"
          role="tablist"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-[13.5px] font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  active
                    ? 'border-cyan-500 text-cyan-700 dark:text-cyan-400 bg-cyan-500/5'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="font-mono-num text-[11.5px] text-cyan-700 dark:text-cyan-300">
                    ({tab.badge})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Vue 1 : Podium & Classement Maître */}
        {activeTab === 'ranking' && (
          <RankingView
            filteredRecords={filteredRecords}
            sortedList={sortedList}
            startYear={startYear}
            endYear={endYear}
            entityType={entityType}
            sport={sport}
            algo={algo}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            versusIds={versusIds}
            onToggleVersus={handleToggleVersus}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onInspectEntity={handleInspectEntity}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Vue 2 : Évolution & Bar Chart Race */}
        {activeTab === 'evolution' && (
          <EvolutionView
            filteredRecords={filteredRecords}
            sortedList={sortedList}
            entities={entities}
            weights={weights}
            algo={algo}
            startYear={startYear}
            endYear={endYear}
          />
        )}

        {/* Vue 3 : Comparateur Face-à-Face (Versus) */}
        {activeTab === 'versus' && (
          <VersusView
            entities={entities}
            entityType={entityType}
            computedList={aggregatedList}
            versusIds={versusIds}
            onSetSlot={handleSetVersusSlot}
            startYear={startYear}
            endYear={endYear}
          />
        )}

        {/* Vue 4 : Fiche Statistique Profonde (Onglet dédié) */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] px-5 py-3.5">
              <label htmlFor="profile-entity-select" className="font-extrabold text-[15px]">
                Explorer la fiche détaillée :
              </label>
              <select
                id="profile-entity-select"
                value={profileTabEntityId}
                onChange={(e) => setProfileTabEntityId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-[14px] min-w-[240px]"
              >
                {profileOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.flag} {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5">
              <DeepProfileContent
                entityId={profileTabEntityId}
                entities={entities}
                allRecords={allRecords}
                sortedList={sortedList}
                weights={weights}
                algo={algo}
                pureMetric={pureMetric}
                sport={sport}
                startYear={startYear}
                endYear={endYear}
                isFavorite={favorites.includes(profileTabEntityId)}
                onToggleFavorite={handleToggleFavorite}
                onAddToVersus={(id) => {
                  handleToggleVersus(id);
                  setActiveTab('versus');
                }}
              />
            </div>
          </div>
        )}

        {/* Vue 5 : Hall of Records */}
        {activeTab === 'records' && (
          <RecordsView
            recordsData={hallOfRecords}
            startYear={startYear}
            endYear={endYear}
            onInspectEntity={handleInspectEntity}
          />
        )}

        {/* Vue 6 : Sources, API Live & Données */}
        {activeTab === 'sources' && (
          <SourcesHubView
            entities={entities}
            allRecords={allRecords}
            maxYear={maxYear}
            remoteConfig={remoteConfig}
            remoteSync={remoteSync}
            mergeStats={mergedData.stats}
            onConnectRemote={handleConnectRemote}
            onForceSyncRemote={handleForceSyncRemote}
            onDisconnectRemote={handleDisconnectRemote}
            onInjectData={handleInjectData}
            onResetAllData={handleResetAllData}
            onNotify={notify}
          />
        )}
      </main>

      {/* Modale Fiche Statistique Profonde (déclenchée au clic sur un club/pays) */}
      {modalEntityId && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start"
          role="dialog"
          aria-modal="true"
          aria-label="Fiche statistique approfondie"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalEntityId(null);
          }}
        >
          <div className="w-full max-w-[1140px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#090D16] p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setModalEntityId(null)}
                aria-label="Fermer la fiche"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[13px] font-semibold hover:border-cyan-500"
              >
                <X size={15} />
                <span>Fermer</span>
              </button>
            </div>
            <DeepProfileContent
              entityId={modalEntityId}
              entities={entities}
              allRecords={allRecords}
              sortedList={sortedList}
              weights={weights}
              algo={algo}
              pureMetric={pureMetric}
              sport={sport}
              startYear={startYear}
              endYear={endYear}
              isFavorite={favorites.includes(modalEntityId)}
              onToggleFavorite={handleToggleFavorite}
              onAddToVersus={(id) => {
                if (!versusIds.includes(id)) handleToggleVersus(id);
                setModalEntityId(null);
                setActiveTab('versus');
              }}
            />
          </div>
        </div>
      )}

      {/* Modale Coefficients */}
      <CoefficientsModal
        open={coeffOpen}
        weights={weights}
        onChange={handleWeightsChange}
        onClose={() => setCoeffOpen(false)}
      />

      {/* Notifications Toast */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border px-4 py-3 text-[13px] font-semibold shadow-xl bg-white dark:bg-[#111827] ${
                t.tone === 'success'
                  ? 'border-emerald-500/60 text-emerald-800 dark:text-emerald-300'
                  : t.tone === 'error'
                    ? 'border-red-500/60 text-red-700 dark:text-red-300'
                    : t.tone === 'warn'
                      ? 'border-amber-500/60 text-amber-800 dark:text-amber-300'
                      : 'border-cyan-500/60 text-slate-900 dark:text-slate-100'
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
