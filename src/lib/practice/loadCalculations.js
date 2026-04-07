const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const ATTENDANCE_WEIGHTS = {
  present: 1,
  limited: 0.5,
  absent: 0
};

const clampNumber = (value, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
};

export const calculateSessionLoad = (durationMinutes, rpe) => {
  const minutes = clampNumber(durationMinutes, 0, 600);
  const effort = clampNumber(rpe, 0, 10);
  return minutes * effort;
};

export const getWeekStart = (dateInput) => {
  const date = new Date(`${dateInput}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
};

export const getWeekLabel = (weekStart) => {
  if (!weekStart) return '';
  const start = new Date(weekStart);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + 6 * MS_PER_DAY);
  const format = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return `${format(start)} - ${format(end)}`;
};

export const calculatePrehabCompliance = (prehabMap = {}, prehabItems = []) => {
  if (!prehabItems.length) return { completed: 0, total: 0, pct: 0 };
  const completed = prehabItems.reduce((acc, item) => acc + (prehabMap[item.id] ? 1 : 0), 0);
  const total = prehabItems.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct };
};

export const groupSessionsByWeek = (sessions = []) => {
  const map = new Map();
  sessions.forEach((session) => {
    const weekStart = getWeekStart(session.date);
    if (!weekStart) return;
    if (!map.has(weekStart)) map.set(weekStart, []);
    map.get(weekStart).push(session);
  });
  return map;
};

const summarizeWeekTeam = (sessions, prehabItems) => {
  const totals = sessions.reduce(
    (acc, session) => {
      const duration = Number(session.durationMinutes || 0);
      const rpe = Number(session.rpe || 0);
      const load = calculateSessionLoad(duration, rpe);
      const compliance = calculatePrehabCompliance(session.prehab || {}, prehabItems);
      acc.minutes += duration;
      acc.load += load;
      acc.rpeWeighted += rpe * duration;
      acc.prehabPctTotal += compliance.pct;
      acc.sessionCount += 1;
      return acc;
    },
    { minutes: 0, load: 0, rpeWeighted: 0, prehabPctTotal: 0, sessionCount: 0 }
  );
  const avgRpe = totals.minutes ? totals.rpeWeighted / totals.minutes : 0;
  const avgPrehab = totals.sessionCount ? totals.prehabPctTotal / totals.sessionCount : 0;
  return {
    totalMinutes: Math.round(totals.minutes),
    avgRpe: Number(avgRpe.toFixed(1)),
    totalLoad: Math.round(totals.load),
    avgPrehabPct: Math.round(avgPrehab)
  };
};

const summarizeWeekPlayer = (sessions, playerId, prehabItems) => {
  const totals = sessions.reduce(
    (acc, session) => {
      const status = session.attendance?.[playerId] || 'absent';
      const weight = ATTENDANCE_WEIGHTS[status] ?? 0;
      if (weight <= 0) return acc;
      const duration = Number(session.durationMinutes || 0) * weight;
      const rpe = Number(session.rpe || 0);
      const load = calculateSessionLoad(duration, rpe);
      acc.minutes += duration;
      acc.load += load;
      acc.rpeWeighted += rpe * duration;
      acc.sessionCount += 1;
      acc.prehabPctTotal += calculatePrehabCompliance(session.prehab || {}, prehabItems).pct;
      return acc;
    },
    { minutes: 0, load: 0, rpeWeighted: 0, sessionCount: 0, prehabPctTotal: 0 }
  );
  const avgRpe = totals.minutes ? totals.rpeWeighted / totals.minutes : 0;
  const avgPrehab = totals.sessionCount ? totals.prehabPctTotal / totals.sessionCount : 0;
  return {
    totalMinutes: Math.round(totals.minutes),
    avgRpe: Number(avgRpe.toFixed(1)),
    totalLoad: Math.round(totals.load),
    avgPrehabPct: Math.round(avgPrehab)
  };
};

export const buildWeeklySummaries = ({ sessions = [], roster = [], prehabItems = [] }) => {
  const grouped = groupSessionsByWeek(sessions);
  const weeks = Array.from(grouped.keys()).sort();
  const team = weeks.map((weekStart) => ({
    weekStart,
    ...summarizeWeekTeam(grouped.get(weekStart) || [], prehabItems)
  }));
  const players = roster.reduce((acc, player) => {
    acc[player.id] = weeks.map((weekStart) => ({
      weekStart,
      ...summarizeWeekPlayer(grouped.get(weekStart) || [], player.id, prehabItems)
    }));
    return acc;
  }, {});
  return { weeks, team, players };
};

export const calculateLoadSpikePct = (current, previous) => {
  const prev = Number(previous || 0);
  const curr = Number(current || 0);
  if (prev <= 0) return 0;
  return Math.round(((curr - prev) / prev) * 100);
};

export const getLatestWeekKey = (weeks = []) => {
  if (!weeks.length) return '';
  return [...weeks].sort().slice(-1)[0];
};
