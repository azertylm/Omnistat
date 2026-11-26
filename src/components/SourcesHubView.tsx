import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  GitBranch,
  KeyRound,
  Link2,
  MinusCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unplug,
  Upload,
} from 'lucide-react';
import {
  Entity,
  RemoteSyncConfig,
  RemoteSyncState,
  SpecificSportId,
  SportRecord,
} from '../types/omnistats';
import { SPECIFIC_SPORT_IDS, SPORTS_MAP } from '../data/sports';
import { ApiQuotaState, localDb } from '../storage/localDb';
import {
  mapSportsDbSport,
  searchTheSportsDbTeams,
  SportsDbTeamResult,
  syncApiSportsStandings,
  syncJolpicaF1Season,
  testApiSportsConnection,
} from '../services/externalApis';
import { getCsvTemplate, parseCsvRecords } from '../engine/scoring';
import { buildRawGithubUrl, MergeResult } from '../engine/remoteSync';
import { formatShortFrenchDateTime } from '../services/githubSync';

interface SourcesHubViewProps {
  entities: Record<string, Entity>;
  allRecords: SportRecord[];
  maxYear: number;
  remoteConfig: RemoteSyncConfig;
  remoteSync: RemoteSyncState;
  mergeStats: MergeResult['stats'];
  onConnectRemote: (config: RemoteSyncConfig) => Promise<void>;
  onForceSyncRemote: () => Promise<void>;
  onDisconnectRemote: () => void;
  onInjectData: (newRecords: SportRecord[], newEntities: Entity[], successMessage: string) => Promise<void>;
  onResetAllData: () => Promise<void>;
  onNotify: (text: string, tone?: 'info' | 'success' | 'error' | 'warn') => void;
}

const PIPELINE_SOURCES_META = [
  {
    key: 'jolpica-f1',
    label: 'Jolpica-F1',
    desc: 'Constructeurs & Nations F1 (API ouverte)',
  },
  {
    key: 'thesportsdb',
    label: 'TheSportsDB',
    desc: 'Football, Basketball & Blasons officiels',
  },
  {
    key: 'nhl-api',
    label: 'NHL API',
    desc: 'Classements & buts Hockey sur glace',
  },
  {
    key: 'api-sports',
    label: 'API-Sports',
    desc: 'Enrichissement multi-ligues (Secret GitHub)',
  },
] as const;

export const SourcesHubView: React.FC<SourcesHubViewProps> = ({
  entities,
  allRecords,
  maxYear,
  remoteConfig,
  remoteSync,
  mergeStats,
  onConnectRemote,
  onForceSyncRemote,
  onDisconnectRemote,
  onInjectData,
  onResetAllData,
  onNotify,
}) => {
  // GitHub Actions Auto-Sync draft state
  const [draftConfig, setDraftConfig] = useState<RemoteSyncConfig>(remoteConfig);
  const [showLatestRecords, setShowLatestRecords] = useState(false);

  useEffect(() => {
    setDraftConfig(remoteConfig);
  }, [remoteConfig]);

  const generatedPreviewUrl = useMemo(() => buildRawGithubUrl(draftConfig), [draftConfig]);
  const isRemoteBusy = remoteSync.health === 'loading';
  const isConnected = Boolean(buildRawGithubUrl(remoteConfig));

  const latestSyncedRecords = useMemo(() => {
    const recs = remoteSync.database?.records || [];
    return [...recs]
      .sort((a, b) => (b.date || `${b.year}`).localeCompare(a.date || `${a.year}`) || a.rank - b.rank)
      .slice(0, 5);
  }, [remoteSync.database]);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedPreviewUrl) {
      onNotify(
        draftConfig.mode === 'github'
          ? 'Renseignez au moins votre pseudo GitHub et le nom du dépôt.'
          : 'Renseignez une URL HTTP/HTTPS valide vers stats-database.json.',
        'warn',
      );
      return;
    }
    await onConnectRemote(draftConfig);
  };

  // Jolpica F1
  const [jolpicaYear, setJolpicaYear] = useState(2024);
  const [jolpicaLoading, setJolpicaLoading] = useState(false);
  const [jolpicaMsg, setJolpicaMsg] = useState('Prêt pour synchronisation en direct via api.jolpi.ca (sans clé).');

  // TheSportsDB
  const [tsdbQuery, setTsdbQuery] = useState('');
  const [tsdbLoading, setTsdbLoading] = useState(false);
  const [tsdbTeams, setTsdbTeams] = useState<SportsDbTeamResult[]>([]);
  const [tsdbMsg, setTsdbMsg] = useState('');

  // API-Sports BYOK
  const [apiKey, setApiKey] = useState(() => localDb.loadApiSportsKey());
  const [apiQuota, setApiQuota] = useState<ApiQuotaState>(() => localDb.getApiQuota());
  const [apiSport, setApiSport] = useState('football');
  const [apiLeague, setApiLeague] = useState(39);
  const [apiSeason, setApiSeason] = useState(2024);
  const [apiBusy, setApiBusy] = useState(false);
  const [apiMsg, setApiMsg] = useState('');

  // Manual Entry Form
  const sortedEntityOptions = Object.values(entities).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const [manEntityId, setManEntityId] = useState(sortedEntityOptions[0]?.id || 'real_madrid');
  const [manSport, setManSport] = useState<SpecificSportId>('football');
  const [manYear, setManYear] = useState(2026);
  const [manComp, setManComp] = useState('Ligue des Champions');
  const [manTier, setManTier] = useState<1 | 2 | 3>(1);
  const [manRank, setManRank] = useState(1);
  const [manWins, setManWins] = useState(12);
  const [manLosses, setManLosses] = useState(1);
  const [manError, setManError] = useState('');

  // Cache stats
  const [cacheInfo, setCacheInfo] = useState({ customRecords: 0, customEntities: 0, apiEntries: 0, estimatedKb: 1 });

  const refreshCacheInfo = async () => {
    const summary = await localDb.getCacheSummary();
    setCacheInfo(summary);
  };

  useEffect(() => {
    void refreshCacheInfo();
  }, [allRecords.length]);

  const handleJolpicaSync = async () => {
    setJolpicaLoading(true);
    setJolpicaMsg(`Synchronisation Jolpica-F1 ${jolpicaYear} en cours...`);
    try {
      const res = await syncJolpicaF1Season(jolpicaYear, entities);
      await onInjectData(
        res.records,
        res.newEntities,
        `Jolpica-F1 ${res.season} : ${res.records.length} écuries synchronisées (${res.fromCache ? 'cache local' : 'API Live'}).`,
      );
      setJolpicaMsg(
        `Saison ${res.season} injectée (${res.records.length} constructeurs · source ${res.fromCache ? 'cache IndexedDB' : 'API Live'}).`,
      );
      await refreshCacheInfo();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue Jolpica-F1';
      setJolpicaMsg(msg);
      onNotify(msg, 'error');
    } finally {
      setJolpicaLoading(false);
    }
  };

  const handleTsdbSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsdbQuery.trim()) {
      setTsdbMsg('Saisissez un nom de club ou franchise (ex: Arsenal, Lakers, Ferrari).');
      return;
    }
    setTsdbLoading(true);
    setTsdbMsg('Recherche sur TheSportsDB...');
    try {
      const res = await searchTheSportsDbTeams(tsdbQuery);
      setTsdbTeams(res.teams);
      setTsdbMsg(
        res.teams.length > 0
          ? `${res.teams.length} équipe(s) trouvée(s) (${res.fromCache ? 'cache local' : 'API Live'}).`
          : 'Aucune équipe trouvée sur TheSportsDB.',
      );
      await refreshCacheInfo();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur TheSportsDB';
      setTsdbMsg(msg);
      onNotify(msg, 'error');
    } finally {
      setTsdbLoading(false);
    }
  };

  const handleAddTsdbTeam = async (team: SportsDbTeamResult) => {
    const sportId = mapSportsDbSport(team.strSport);
    const existing = Object.values(entities).find(
      (e) => e.name.toLowerCase() === team.strTeam.toLowerCase(),
    );
    const id = existing ? existing.id : `tsdb_${team.idTeam}`;
    const updatedEntity: Entity = existing
      ? { ...existing, logoUrl: team.strBadge || existing.logoUrl, stadium: team.strStadium || existing.stadium }
      : {
          id,
          name: team.strTeam,
          short: (team.strTeamShort || team.strTeam.slice(0, 3)).toUpperCase(),
          type: 'club',
          countryCode: (team.strCountry || 'INT').slice(0, 2).toUpperCase(),
          flag: '🏟️',
          c1: '#06B6D4',
          c2: '#1E293B',
          sport: sportId,
          logoUrl: team.strBadge,
          stadium: team.strStadium,
        };

    const rec: SportRecord = {
      id: `tsdb_rec_${id}_2025`,
      year: 2025,
      date: '2025-05-20',
      sport: sportId,
      competition: team.strLeague || 'Championnat National (TheSportsDB)',
      tier: 2,
      entityId: id,
      entityType: 'club',
      countryCode: updatedEntity.countryCode,
      rank: 2,
      wins: 22,
      draws: 7,
      losses: 9,
      titles: 0,
      finals: 1,
      podiums: 1,
      eloRating: 1845,
      advancedStats: {},
      source: 'thesportsdb',
    };

    await onInjectData(
      existing ? [] : [rec],
      [updatedEntity],
      existing
        ? `Logo officiel et métadonnées TheSportsDB associés à ${updatedEntity.name}.`
        : `${updatedEntity.name} ajoutée à la base OmniStats avec son blason officiel.`,
    );
    await refreshCacheInfo();
  };

  const handleSaveApiKey = () => {
    localDb.saveApiSportsKey(apiKey);
    onNotify('Clé API-Sports enregistrée en local uniquement (localStorage).', 'success');
  };

  const handleTestApiSports = async () => {
    setApiBusy(true);
    const res = await testApiSportsConnection(apiKey);
    setApiQuota(localDb.getApiQuota());
    setApiMsg(res.message);
    onNotify(res.message, res.ok ? 'success' : 'error');
    setApiBusy(false);
  };

  const handleSyncApiSports = async () => {
    setApiBusy(true);
    setApiMsg('Synchronisation API-Sports...');
    try {
      const res = await syncApiSportsStandings(apiKey, apiSport, apiLeague, apiSeason, entities);
      setApiQuota(localDb.getApiQuota());
      await onInjectData(
        res.records,
        res.newEntities,
        `API-Sports : ${res.records.length} classements importés (${res.fromCache ? 'cache local' : 'API Live'}).`,
      );
      setApiMsg(`${res.records.length} entrées importées avec succès.`);
      await refreshCacheInfo();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur API-Sports';
      setApiMsg(msg);
      onNotify(msg, 'error');
    } finally {
      setApiBusy(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManError('');
    const ent = entities[manEntityId];
    if (!ent) {
      setManError('Sélectionnez une entité valide.');
      return;
    }
    if (!manComp.trim()) {
      setManError('Le nom de la compétition est obligatoire.');
      return;
    }
    if (!Number.isFinite(manYear) || manYear < 1950 || manYear > Math.max(2026, maxYear)) {
      setManError(`L’année doit être comprise entre 1950 et ${Math.max(2026, maxYear)}.`);
      return;
    }

    const rec: SportRecord = {
      id: `manual_${Date.now()}_${ent.id}`,
      year: manYear,
      date: `${manYear}-06-20`,
      sport: manSport,
      competition: manComp.trim(),
      tier: manTier,
      entityId: ent.id,
      entityType: ent.type,
      countryCode: ent.countryCode,
      rank: manRank,
      wins: Math.max(0, manWins),
      draws: 0,
      losses: Math.max(0, manLosses),
      titles: manRank === 1 ? 1 : 0,
      finals: manRank <= 2 ? 1 : 0,
      podiums: manRank <= 3 ? 1 : 0,
      eloRating: Math.round(1940 - (manRank - 1) * 35),
      advancedStats: {},
      source: 'manual',
    };

    await onInjectData(
      [rec],
      [],
      `Résultat ajouté : ${ent.name} (${manRank === 1 ? '1er' : `${manRank}e`} · ${manComp} ${manYear}). Classements recalculés.`,
    );
    await refreshCacheInfo();
  };

  const handleDownloadCsvTemplate = () => {
    const blob = new Blob([getCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnistats-gabarit.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      entitiesCount: Object.keys(entities).length,
      recordsCount: allRecords.length,
      entities,
      records: allRecords,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnistats-base-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`Export JSON téléchargé (${allRecords.length} enregistrements).`, 'success');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith('.csv')) {
        const parsed = parseCsvRecords(text, entities);
        if (parsed.records.length === 0) {
          onNotify(parsed.errors[0] || 'Aucune ligne valide dans le CSV.', 'error');
        } else {
          await onInjectData(
            parsed.records,
            parsed.newEntities,
            `Import CSV réussi : ${parsed.records.length} enregistrements injectés.`,
          );
          await refreshCacheInfo();
        }
      } else {
        const json = JSON.parse(text) as { records?: SportRecord[]; entities?: Record<string, Entity> } | SportRecord[];
        const importedRecords = Array.isArray(json) ? json : json.records || [];
        const importedEntities = !Array.isArray(json) && json.entities ? Object.values(json.entities) : [];
        if (importedRecords.length === 0) {
          onNotify('Le fichier JSON ne contient aucun tableau "records" valide.', 'error');
        } else {
          await onInjectData(
            importedRecords,
            importedEntities,
            `Import JSON réussi : ${importedRecords.length} enregistrements fusionnés.`,
          );
          await refreshCacheInfo();
        }
      }
    } catch (err) {
      onNotify(`Erreur d'import : ${err instanceof Error ? err.message : 'fichier illisible'}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleClearApiCache = async () => {
    await localDb.clearStore('apiCache');
    await refreshCacheInfo();
    onNotify('Cache API local vidé.', 'info');
  };

  const sportsCovered = new Set(allRecords.map((r) => r.sport)).size;
  const effectiveMaxYear = Math.max(2026, maxYear);

  return (
    <div className="space-y-5">
      {/* 0. Pipeline GitHub Actions (Auto-Sync Nocturne) */}
      <section
        aria-label="Pipeline GitHub Actions Auto-Sync"
        className="rounded-2xl border-2 border-cyan-500/40 dark:border-cyan-500/30 bg-white dark:bg-[#111827] p-5 space-y-4 shadow-xs"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
              <GitBranch size={18} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Pipeline GitHub Actions (Auto-Sync)</span>
            </h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">
              Connectez le fichier <code>data/stats-database.json</code> généré chaque nuit à 03h30 UTC par le workflow
              GitHub Actions. Cache intelligent 6 h en local (<code>omnistats_remote_db_v1</code>) avec fusion sans
              doublon.
            </p>
          </div>

          <div
            className="inline-flex p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
            role="group"
            aria-label="Mode de connexion distante"
          >
            <button
              type="button"
              onClick={() => setDraftConfig((prev) => ({ ...prev, mode: 'github' }))}
              aria-pressed={draftConfig.mode === 'github'}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                draftConfig.mode === 'github'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dépôt GitHub
            </button>
            <button
              type="button"
              onClick={() => setDraftConfig((prev) => ({ ...prev, mode: 'url' }))}
              aria-pressed={draftConfig.mode === 'url'}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                draftConfig.mode === 'url'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              URL JSON brute
            </button>
          </div>
        </div>

        <form onSubmit={handleConnectSubmit} className="space-y-3">
          {draftConfig.mode === 'github' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="gh-owner" className="block text-[12px] font-semibold mb-1">
                  Pseudo GitHub
                </label>
                <input
                  id="gh-owner"
                  type="text"
                  value={draftConfig.owner}
                  onChange={(e) => setDraftConfig((p) => ({ ...p, owner: e.target.value }))}
                  placeholder="ex: alphabette"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
                />
              </div>
              <div>
                <label htmlFor="gh-repo" className="block text-[12px] font-semibold mb-1">
                  Nom du dépôt
                </label>
                <input
                  id="gh-repo"
                  type="text"
                  value={draftConfig.repo}
                  onChange={(e) => setDraftConfig((p) => ({ ...p, repo: e.target.value }))}
                  placeholder="ex: omnistats-data"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
                />
              </div>
              <div>
                <label htmlFor="gh-branch" className="block text-[12px] font-semibold mb-1">
                  Branche
                </label>
                <input
                  id="gh-branch"
                  type="text"
                  value={draftConfig.branch}
                  onChange={(e) => setDraftConfig((p) => ({ ...p, branch: e.target.value }))}
                  placeholder="main"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
                />
              </div>
              <div>
                <label htmlFor="gh-path" className="block text-[12px] font-semibold mb-1">
                  Chemin du fichier
                </label>
                <input
                  id="gh-path"
                  type="text"
                  value={draftConfig.filePath}
                  onChange={(e) => setDraftConfig((p) => ({ ...p, filePath: e.target.value }))}
                  placeholder="data/stats-database.json"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="gh-custom-url" className="block text-[12px] font-semibold mb-1">
                URL JSON brute (GitHub Raw ou hébergement HTTPS)
              </label>
              <input
                id="gh-custom-url"
                type="url"
                value={draftConfig.customUrl}
                onChange={(e) => setDraftConfig((p) => ({ ...p, customUrl: e.target.value }))}
                placeholder="https://raw.githubusercontent.com/pseudo/depot/main/data/stats-database.json"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>
          )}

          {/* Live generated URL preview */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-3 py-2 text-[12px]">
            <Link2 size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-semibold">URL cible :</span>
            <code className="truncate font-mono-num text-slate-800 dark:text-slate-200">
              {generatedPreviewUrl || 'Renseignez un dépôt GitHub ou une URL HTTPS valide…'}
            </code>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={isRemoteBusy || !generatedPreviewUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[13px]"
            >
              <RefreshCw size={14} className={isRemoteBusy ? 'animate-spin' : ''} />
              <span>{isRemoteBusy ? 'Synchronisation…' : 'Connecter & Synchroniser'}</span>
            </button>

            <button
              type="button"
              disabled={isRemoteBusy || !isConnected}
              onClick={onForceSyncRemote}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-cyan-500 disabled:opacity-50 font-semibold text-[12.5px]"
            >
              <RefreshCw size={13} className={isRemoteBusy ? 'animate-spin' : ''} />
              <span>Forcer la synchronisation maintenant</span>
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={onDisconnectRemote}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 font-semibold text-[12.5px]"
              >
                <Unplug size={13} />
                <span>Déconnecter</span>
              </button>
            )}
          </div>
        </form>

        {/* Error / Offline Cache Warning */}
        {remoteSync.error && (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-3.5 py-2.5 text-[12.5px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong>
                {remoteSync.health === 'cache-offline'
                  ? 'Mode hors ligne (dernier cache sauvegardé actif) :'
                  : 'Erreur de synchronisation (bascule silencieuse sur la base intégrée) :'}
              </strong>{' '}
              {remoteSync.error}
            </div>
          </div>
        )}

        {/* Diagnostic Summary Strip */}
        {remoteSync.database && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
                <span>
                  Dernière collecte :{' '}
                  <strong className="font-mono-num">
                    {formatShortFrenchDateTime(remoteSync.database.lastUpdated)}
                  </strong>
                </span>
                <span>
                  Saison active :{' '}
                  <strong className="font-mono-num">{remoteSync.database.activeSeason || '—'}</strong>
                </span>
                <span>
                  Entrées distantes :{' '}
                  <strong className="font-mono-num">{remoteSync.database.records.length}</strong>
                </span>
                <span>
                  Fusion : <strong className="font-mono-num">{mergeStats.replacedById}</strong> màj ID ·{' '}
                  <strong className="font-mono-num">{mergeStats.dedupedCrossSource}</strong> dédoublonnées ·{' '}
                  <strong className="font-mono-num">+{mergeStats.addedEntities}</strong> entité(s)
                </span>
              </div>
              <span className="text-[11.5px] font-semibold text-emerald-700 dark:text-emerald-400">
                {remoteSync.fromCache ? 'Servi depuis le cache local (6 h)' : 'Téléchargé en direct'}
              </span>
            </div>

            {remoteSync.database.sportsCovered.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Sports couverts :</span>
                {remoteSync.database.sportsCovered.map((s) => {
                  const meta = SPORTS_MAP[s as SpecificSportId];
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <span>{meta ? meta.icon : '🏅'}</span>
                      <span>{meta ? meta.name : s}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4-Card sourcesStatus Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PIPELINE_SOURCES_META.map((src) => {
            const st = remoteSync.database?.sourcesStatus?.[src.key];
            const status = st?.status;
            return (
              <div
                key={src.key}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-extrabold text-[13.5px] truncate">{src.label}</div>
                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug">
                      {src.desc}
                    </div>
                  </div>
                  {status === 'ok' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shrink-0">
                      <CheckCircle2 size={12} />
                      OK
                    </span>
                  ) : status === 'error' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-red-700 dark:text-red-300 text-[11px] font-bold shrink-0">
                      <AlertTriangle size={12} />
                      Erreur
                    </span>
                  ) : status === 'skipped' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold shrink-0">
                      <MinusCircle size={12} />
                      Ignoré / Sans clé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold shrink-0">
                      En attente
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 text-[11.5px] flex items-center justify-between gap-2 text-slate-600 dark:text-slate-400 tabular-nums">
                  <span>
                    Collectées : <strong className="font-mono-num">{st ? st.fetchedCount : '—'}</strong>
                  </span>
                  <span className="font-mono-num">
                    {st?.updatedAt ? formatShortFrenchDateTime(st.updatedAt) : '—'}
                  </span>
                </div>

                {st?.error && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium break-words">
                    {st.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Expandable preview of 5 latest synchronized records */}
        {latestSyncedRecords.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setShowLatestRecords((v) => !v)}
              aria-expanded={showLatestRecords}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
            >
              {showLatestRecords ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              <span>
                {showLatestRecords
                  ? 'Masquer les 5 derniers enregistrements synchronisés'
                  : `Voir les ${latestSyncedRecords.length} derniers enregistrements synchronisés`}
              </span>
            </button>

            {showLatestRecords && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Entité</th>
                      <th className="py-2 px-3">Sport</th>
                      <th className="py-2 px-3">Compétition</th>
                      <th className="py-2 px-3 text-right">Année</th>
                      <th className="py-2 px-3 text-right">Rang</th>
                      <th className="py-2 px-3 text-right">Pts / Diff</th>
                      <th className="py-2 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {latestSyncedRecords.map((rec) => {
                      const sportMeta = SPORTS_MAP[rec.sport];
                      const pts =
                        typeof rec.advancedStats?.points === 'number' && Number.isFinite(rec.advancedStats.points)
                          ? rec.advancedStats.points
                          : null;
                      const diff =
                        typeof rec.advancedStats?.goalDiff === 'number' && Number.isFinite(rec.advancedStats.goalDiff)
                          ? rec.advancedStats.goalDiff
                          : null;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold">
                            {rec.entityName || entities[rec.entityId]?.name || rec.entityId}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {sportMeta ? `${sportMeta.icon} ${sportMeta.name}` : rec.sport}
                          </td>
                          <td className="py-2 px-3">{rec.competition}</td>
                          <td className="py-2 px-3 text-right font-mono-num">{rec.year}</td>
                          <td className="py-2 px-3 text-right font-mono-num font-bold">#{rec.rank}</td>
                          <td className="py-2 px-3 text-right font-mono-num">
                            {pts !== null ? `${pts} pts` : '—'}
                            {diff !== null ? ` (${diff > 0 ? `+${diff}` : diff})` : ''}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono-num text-[11px] font-semibold">
                              {rec.source || 'remote'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Jolpica-F1 Live */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-3">
          <div>
            <h2 className="text-[17px] font-extrabold">Jolpica-F1 Live (API Ouverte sans clé)</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Synchronisez en direct les classements Constructeurs F1 (1958–{effectiveMaxYear}) depuis <code>api.jolpi.ca</code>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="jolpica-year" className="text-[13px] font-semibold">
              Saison F1 :
            </label>
            <input
              id="jolpica-year"
              type="number"
              min={1950}
              max={effectiveMaxYear}
              value={jolpicaYear}
              onChange={(e) => setJolpicaYear(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[14px]"
            />
            <button
              type="button"
              disabled={jolpicaLoading}
              onClick={handleJolpicaSync}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[13px]"
            >
              <RefreshCw size={14} className={jolpicaLoading ? 'animate-spin' : ''} />
              <span>{jolpicaLoading ? 'Synchronisation...' : 'Synchroniser cette saison'}</span>
            </button>
          </div>
          <p className="text-[12.5px] text-slate-600 dark:text-slate-400">{jolpicaMsg}</p>
        </section>

        {/* 2. TheSportsDB */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-3">
          <div>
            <h2 className="text-[17px] font-extrabold">TheSportsDB (Logos &amp; Équipes)</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Recherchez un club pour récupérer son blason officiel, stade et l’injecter dans OmniStats
            </p>
          </div>
          <form onSubmit={handleTsdbSearch} className="flex gap-2">
            <input
              type="text"
              value={tsdbQuery}
              onChange={(e) => setTsdbQuery(e.target.value)}
              placeholder="Ex: Real Madrid, Arsenal, Lakers..."
              aria-label="Rechercher une équipe sur TheSportsDB"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13.5px]"
            />
            <button
              type="submit"
              disabled={tsdbLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold text-[13px]"
            >
              <Search size={14} />
              <span>Chercher</span>
            </button>
          </form>
          {tsdbMsg && <p className="text-[12.5px] text-slate-600 dark:text-slate-400">{tsdbMsg}</p>}
          {tsdbTeams.length > 0 && (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 max-h-52 overflow-y-auto">
              {tsdbTeams.map((t) => (
                <li key={t.idTeam} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {t.strBadge && (
                      <img
                        src={t.strBadge}
                        alt={t.strTeam}
                        width={28}
                        height={28}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 object-contain rounded bg-white p-0.5 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-[13px] truncate">{t.strTeam}</div>
                      <div className="text-[11.5px] text-slate-500 truncate">
                        {t.strSport} · {t.strCountry} {t.strStadium ? `· ${t.strStadium}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTsdbTeam(t)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold shrink-0"
                  >
                    + Ajouter
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3. API-Sports BYOK */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[17px] font-extrabold flex items-center gap-1.5">
                <KeyRound size={16} className="text-amber-500" />
                <span>Connecteur API-Sports (BYOK)</span>
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Clé stockée uniquement dans votre navigateur avec cache local automatique
              </p>
            </div>
            <span className="font-mono-num text-[12px] font-bold text-amber-700 dark:text-amber-400">
              {apiQuota.count} / {apiQuota.limit} req aujourd’hui
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="apisports-key" className="block text-[12px] font-semibold mb-1">
                Clé API-Sports (x-apisports-key)
              </label>
              <input
                id="apisports-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Collez votre clé personnelle..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              />
            </div>
            <div>
              <label htmlFor="apisports-sport" className="block text-[12px] font-semibold mb-1">
                Discipline
              </label>
              <select
                id="apisports-sport"
                value={apiSport}
                onChange={(e) => setApiSport(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              >
                <option value="football">Football (v3)</option>
                <option value="basketball">Basketball (v1)</option>
                <option value="rugby">Rugby (v1)</option>
                <option value="handball">Handball (v1)</option>
                <option value="formula1">Formule 1 (v1)</option>
              </select>
            </div>
            <div>
              <label htmlFor="apisports-league" className="block text-[12px] font-semibold mb-1">
                ID Ligue (39 PL, 61 L1, 12 NBA)
              </label>
              <input
                id="apisports-league"
                type="number"
                value={apiLeague}
                onChange={(e) => setApiLeague(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>
            <div>
              <label htmlFor="apisports-season" className="block text-[12px] font-semibold mb-1">
                Saison
              </label>
              <input
                id="apisports-season"
                type="number"
                value={apiSeason}
                onChange={(e) => setApiSeason(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-[12.5px] font-semibold hover:border-cyan-500"
            >
              Enregistrer clé
            </button>
            <button
              type="button"
              disabled={apiBusy}
              onClick={handleTestApiSports}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-[12.5px] font-semibold hover:border-cyan-500"
            >
              Tester connexion
            </button>
            <button
              type="button"
              disabled={apiBusy}
              onClick={handleSyncApiSports}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[12.5px]"
            >
              Importer classements
            </button>
          </div>
          {apiMsg && <p className="text-[12.5px] text-slate-600 dark:text-slate-400">{apiMsg}</p>}
        </section>

        {/* 4. Ajout Manuel d'un résultat */}
        <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-3">
          <div>
            <h2 className="text-[17px] font-extrabold">Ajout Manuel d’un Résultat / Saison</h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Injectez une nouvelle performance et observez instantanément le recalcul des classements
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="man-entity" className="block text-[12px] font-semibold mb-1">
                Entité
              </label>
              <select
                id="man-entity"
                value={manEntityId}
                onChange={(e) => setManEntityId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              >
                {sortedEntityOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.flag} {e.name} ({e.type === 'club' ? 'Club' : 'Pays'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="man-sport" className="block text-[12px] font-semibold mb-1">
                Sport
              </label>
              <select
                id="man-sport"
                value={manSport}
                onChange={(e) => setManSport(e.target.value as SpecificSportId)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              >
                {SPECIFIC_SPORT_IDS.map((sid) => (
                  <option key={sid} value={sid}>
                    {SPORTS_MAP[sid].icon} {SPORTS_MAP[sid].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="man-year" className="block text-[12px] font-semibold mb-1">
                Année (1950–{effectiveMaxYear})
              </label>
              <input
                id="man-year"
                type="number"
                min={1950}
                max={effectiveMaxYear}
                value={manYear}
                onChange={(e) => setManYear(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>

            <div>
              <label htmlFor="man-comp" className="block text-[12px] font-semibold mb-1">
                Compétition
              </label>
              <input
                id="man-comp"
                type="text"
                value={manComp}
                onChange={(e) => setManComp(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              />
            </div>

            <div>
              <label htmlFor="man-tier" className="block text-[12px] font-semibold mb-1">
                Prestige (Tier)
              </label>
              <select
                id="man-tier"
                value={manTier}
                onChange={(e) => setManTier(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              >
                <option value={1}>Tier 1 (Mondial / JO / C1 / NBA / F1 / GC)</option>
                <option value={2}>Tier 2 (Championnat majeur / Continental)</option>
                <option value={3}>Tier 3 (Coupe nationale / Podium)</option>
              </select>
            </div>

            <div>
              <label htmlFor="man-rank" className="block text-[12px] font-semibold mb-1">
                Classement final
              </label>
              <select
                id="man-rank"
                value={manRank}
                onChange={(e) => setManRank(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px]"
              >
                <option value={1}>1er — Champion / Or</option>
                <option value={2}>2e — Finaliste / Argent</option>
                <option value={3}>3e — Demi-finaliste / Bronze</option>
                <option value={4}>4e — Top 4</option>
              </select>
            </div>

            <div>
              <label htmlFor="man-wins" className="block text-[12px] font-semibold mb-1">
                Victoires
              </label>
              <input
                id="man-wins"
                type="number"
                min={0}
                value={manWins}
                onChange={(e) => setManWins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>

            <div>
              <label htmlFor="man-losses" className="block text-[12px] font-semibold mb-1">
                Défaites
              </label>
              <input
                id="man-losses"
                type="number"
                min={0}
                value={manLosses}
                onChange={(e) => setManLosses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono-num text-[13px]"
              />
            </div>

            {manError && (
              <p className="sm:col-span-2 text-[12.5px] font-semibold text-red-600 dark:text-red-400">
                {manError}
              </p>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px]"
              >
                <Plus size={15} />
                <span>Ajouter &amp; Recalculer</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* 5. Cache local & Import/Export Universel */}
      <section className="rounded-2xl border border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-extrabold flex items-center gap-2">
              <Database size={17} className="text-cyan-500" />
              <span>Cache Local &amp; Import / Export Universel</span>
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
              Base active : <strong>{allRecords.length}</strong> enregistrements · <strong>{sportsCovered}</strong>{' '}
              disciplines · <strong>{cacheInfo.customRecords}</strong> ajouts locaux ·{' '}
              <strong>{cacheInfo.apiEntries}</strong> réponses API en cache (~{cacheInfo.estimatedKb} Ko)
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-[12.5px] font-semibold hover:border-cyan-500"
            >
              <Download size={14} />
              <span>Gabarit CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold text-[12.5px]"
            >
              <Download size={14} />
              <span>Exporter JSON</span>
            </button>
            <button
              type="button"
              onClick={handleClearApiCache}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-[12.5px] font-semibold hover:border-amber-500"
            >
              <Trash2 size={14} />
              <span>Vider cache API</span>
            </button>
            <button
              type="button"
              onClick={onResetAllData}
              className="px-3 py-2 rounded-lg bg-red-600/15 border border-red-500/40 text-red-700 dark:text-red-400 font-bold text-[12.5px] hover:bg-red-600/25"
            >
              Réinitialiser base par défaut
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-[#1F2937]">
          <label
            htmlFor="omnistats-file-import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-bold text-[13px] cursor-pointer hover:bg-cyan-500/20"
          >
            <Upload size={15} />
            <span>Importer un fichier JSON ou CSV</span>
          </label>
          <input
            id="omnistats-file-import"
            type="file"
            accept=".json,.csv"
            onChange={handleFileImport}
            className="sr-only"
          />
          <span className="text-[12.5px] text-slate-500 dark:text-slate-400">
            Les fichiers importés sont persistés dans IndexedDB et fusionnés instantanément.
          </span>
        </div>
      </section>
    </div>
  );
};
