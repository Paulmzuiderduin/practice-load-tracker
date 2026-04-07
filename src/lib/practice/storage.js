const STORAGE_PREFIX = 'practice_load';

const buildKey = (suffix) => `${STORAGE_PREFIX}_${suffix}`;

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures (e.g., quota exceeded) to keep UI responsive.
  }
};

export const DEFAULT_PREHAB_ITEMS = [
  { id: 'nordic', label: 'Nordic hamstrings' },
  { id: 'balance', label: 'Balance / proprioception' },
  { id: 'shoulder', label: 'Shoulder stability' },
  { id: 'core', label: 'Core / trunk' },
  { id: 'calf', label: 'Calf / Achilles' }
];

export const DEFAULT_TEAM_SETTINGS = {
  loadSpikeThresholdPct: 25,
  minPrehabCompliancePct: 70,
  prehabItems: DEFAULT_PREHAB_ITEMS
};

const seasonsKey = buildKey('seasons');

export const loadSeasons = () => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(seasonsKey), []);
};

export const saveSeasons = (seasons) => {
  safeWrite(seasonsKey, seasons);
};

export const createSeason = (name) => {
  const seasons = loadSeasons();
  const id = `season_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const season = { id, name, teams: [], created_at: new Date().toISOString() };
  const next = [...seasons, season];
  saveSeasons(next);
  return { season, seasons: next };
};

export const renameSeason = (seasonId, name) => {
  const seasons = loadSeasons();
  const next = seasons.map((season) => (season.id === seasonId ? { ...season, name } : season));
  saveSeasons(next);
  return next;
};

export const deleteSeason = (seasonId) => {
  const seasons = loadSeasons();
  const next = seasons.filter((season) => season.id !== seasonId);
  saveSeasons(next);
  return next;
};

export const createTeam = (seasonId, name) => {
  const seasons = loadSeasons();
  const id = `team_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const team = { id, name, season_id: seasonId, created_at: new Date().toISOString() };
  const next = seasons.map((season) =>
    season.id === seasonId ? { ...season, teams: [...(season.teams || []), team] } : season
  );
  saveSeasons(next);
  return { team, seasons: next };
};

export const renameTeam = (seasonId, teamId, name) => {
  const seasons = loadSeasons();
  const next = seasons.map((season) => {
    if (season.id !== seasonId) return season;
    const teams = (season.teams || []).map((team) => (team.id === teamId ? { ...team, name } : team));
    return { ...season, teams };
  });
  saveSeasons(next);
  return next;
};

export const deleteTeam = (seasonId, teamId) => {
  const seasons = loadSeasons();
  const next = seasons.map((season) => {
    if (season.id !== seasonId) return season;
    const teams = (season.teams || []).filter((team) => team.id !== teamId);
    return { ...season, teams };
  });
  saveSeasons(next);
  return next;
};

const rosterKey = (teamId) => buildKey(`roster_${teamId}`);
const sessionsKey = (teamId) => buildKey(`sessions_${teamId}`);
const injuriesKey = (teamId) => buildKey(`injuries_${teamId}`);
const settingsKey = (teamId) => buildKey(`settings_${teamId}`);

export const loadRoster = (teamId) => {
  if (!teamId || typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(rosterKey(teamId)), []);
};

export const saveRoster = (teamId, roster) => {
  if (!teamId) return;
  safeWrite(rosterKey(teamId), roster);
};

export const loadSessions = (teamId) => {
  if (!teamId || typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(sessionsKey(teamId)), []);
};

export const saveSessions = (teamId, sessions) => {
  if (!teamId) return;
  safeWrite(sessionsKey(teamId), sessions);
};

export const loadInjuries = (teamId) => {
  if (!teamId || typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(injuriesKey(teamId)), []);
};

export const saveInjuries = (teamId, injuries) => {
  if (!teamId) return;
  safeWrite(injuriesKey(teamId), injuries);
};

export const loadTeamSettings = (teamId) => {
  if (!teamId || typeof window === 'undefined') return DEFAULT_TEAM_SETTINGS;
  const stored = safeParse(window.localStorage.getItem(settingsKey(teamId)), {});
  return {
    ...DEFAULT_TEAM_SETTINGS,
    ...stored,
    prehabItems: stored.prehabItems || DEFAULT_TEAM_SETTINGS.prehabItems
  };
};

export const saveTeamSettings = (teamId, settings) => {
  if (!teamId) return;
  safeWrite(settingsKey(teamId), settings);
};

export const notifyPracticeDataUpdated = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('practice-data-updated'));
};
