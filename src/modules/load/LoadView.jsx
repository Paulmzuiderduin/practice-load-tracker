import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import ModuleHeader from '../../components/ModuleHeader';
import {
  buildWeeklySummaries,
  calculateLoadSpikePct,
  getLatestWeekKey,
  getWeekLabel
} from '../../lib/practice/loadCalculations';
import {
  loadRoster,
  loadSessions,
  loadTeamSettings
} from '../../lib/practice/storage';

const LoadView = ({ teamId }) => {
  const [roster, setRoster] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(loadTeamSettings(teamId));
  const [selectedWeek, setSelectedWeek] = useState('');

  const reload = () => {
    setRoster(loadRoster(teamId));
    setSessions(loadSessions(teamId));
    setSettings(loadTeamSettings(teamId));
  };

  useEffect(() => {
    if (!teamId) return;
    reload();
    const handler = () => reload();
    window.addEventListener('practice-data-updated', handler);
    return () => window.removeEventListener('practice-data-updated', handler);
  }, [teamId]);

  const summaries = useMemo(
    () => buildWeeklySummaries({ sessions, roster, prehabItems: settings.prehabItems }),
    [sessions, roster, settings.prehabItems]
  );

  useEffect(() => {
    if (!summaries.weeks.length) {
      setSelectedWeek('');
      return;
    }
    setSelectedWeek((prev) => prev || getLatestWeekKey(summaries.weeks));
  }, [summaries.weeks]);

  const selectedIndex = summaries.team.findIndex((week) => week.weekStart === selectedWeek);
  const teamSummary = selectedIndex >= 0 ? summaries.team[selectedIndex] : null;
  const previousTeam = selectedIndex > 0 ? summaries.team[selectedIndex - 1] : null;
  const teamSpike = teamSummary
    ? calculateLoadSpikePct(teamSummary.totalLoad, previousTeam?.totalLoad || 0)
    : 0;

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Load"
        title="Weekly load summary"
        description="Compare total minutes, average RPE, and load spikes versus the previous week."
      />

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Team overview</h3>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(event.target.value)}
          >
            {summaries.weeks.map((week) => (
              <option key={week} value={week}>
                {getWeekLabel(week)}
              </option>
            ))}
          </select>
        </div>
        {teamSummary ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Total minutes</div>
              <div className="text-lg font-semibold text-slate-900">{teamSummary.totalMinutes}</div>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Average RPE</div>
              <div className="text-lg font-semibold text-slate-900">{teamSummary.avgRpe}</div>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Session load</div>
              <div className="text-lg font-semibold text-slate-900">{teamSummary.totalLoad}</div>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Spike vs last week</div>
              <div className="text-lg font-semibold text-slate-900">
                {teamSummary.totalLoad ? `${teamSpike}%` : '—'}
              </div>
              <div className="text-xs text-slate-500">Alert at {settings.loadSpikeThresholdPct}%</div>
            </div>
          </div>
        ) : (
          <ModuleEmptyState
            title="No sessions logged"
            description="Add sessions to calculate weekly load summaries."
            compact
          />
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">Player load breakdown</h3>
        {roster.length && summaries.weeks.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Minutes</th>
                  <th className="px-3 py-2">Avg RPE</th>
                  <th className="px-3 py-2">Load</th>
                  <th className="px-3 py-2">Spike %</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {roster.map((player) => {
                  const rows = summaries.players[player.id] || [];
                  const rowIndex = rows.findIndex((row) => row.weekStart === selectedWeek);
                  const row = rowIndex >= 0 ? rows[rowIndex] : null;
                  const prev = rowIndex > 0 ? rows[rowIndex - 1] : null;
                  const spike = row ? calculateLoadSpikePct(row.totalLoad, prev?.totalLoad || 0) : 0;
                  return (
                    <tr key={player.id} className="border-t border-slate-100">
                      <td className="px-3 py-3 font-semibold text-slate-700">{player.name}</td>
                      <td className="px-3 py-3">{row ? row.totalMinutes : '—'}</td>
                      <td className="px-3 py-3">{row ? row.avgRpe : '—'}</td>
                      <td className="px-3 py-3">{row ? row.totalLoad : '—'}</td>
                      <td className="px-3 py-3">{row && row.totalLoad ? `${spike}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <ModuleEmptyState
            title="No player data yet"
            description="Add roster entries and log sessions to see player load summaries."
            compact
          />
        )}
      </div>
    </div>
  );
};

export default LoadView;
