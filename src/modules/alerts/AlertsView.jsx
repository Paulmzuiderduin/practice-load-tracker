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
  loadTeamSettings,
  notifyPracticeDataUpdated,
  saveTeamSettings
} from '../../lib/practice/storage';

const AlertsView = ({ teamId, toast }) => {
  const [roster, setRoster] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState(loadTeamSettings(teamId));

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

  const latestWeek = getLatestWeekKey(summaries.weeks);
  const latestIndex = summaries.team.findIndex((week) => week.weekStart === latestWeek);
  const latestTeam = latestIndex >= 0 ? summaries.team[latestIndex] : null;
  const previousTeam = latestIndex > 0 ? summaries.team[latestIndex - 1] : null;
  const teamSpike = latestTeam
    ? calculateLoadSpikePct(latestTeam.totalLoad, previousTeam?.totalLoad || 0)
    : 0;

  const alertRows = useMemo(() => {
    if (!latestWeek) return [];
    const rows = [];
    if (latestTeam && teamSpike > settings.loadSpikeThresholdPct) {
      rows.push({
        type: 'Load spike',
        detail: `Team load increased ${teamSpike}% vs last week.`,
        week: latestWeek
      });
    }
    if (latestTeam && latestTeam.avgPrehabPct < settings.minPrehabCompliancePct) {
      rows.push({
        type: 'Low prehab',
        detail: `Team prehab compliance ${latestTeam.avgPrehabPct}% (target ${settings.minPrehabCompliancePct}%).`,
        week: latestWeek
      });
    }

    roster.forEach((player) => {
      const rowsForPlayer = summaries.players[player.id] || [];
      const rowIndex = rowsForPlayer.findIndex((row) => row.weekStart === latestWeek);
      const row = rowIndex >= 0 ? rowsForPlayer[rowIndex] : null;
      const prev = rowIndex > 0 ? rowsForPlayer[rowIndex - 1] : null;
      const spike = row ? calculateLoadSpikePct(row.totalLoad, prev?.totalLoad || 0) : 0;
      if (row && spike > settings.loadSpikeThresholdPct) {
        rows.push({
          type: 'Load spike',
          detail: `${player.name} increased ${spike}% vs last week.`,
          week: latestWeek
        });
      }
      if (row && row.avgPrehabPct < settings.minPrehabCompliancePct) {
        rows.push({
          type: 'Low prehab',
          detail: `${player.name} compliance ${row.avgPrehabPct}% (target ${settings.minPrehabCompliancePct}%).`,
          week: latestWeek
        });
      }
    });
    return rows;
  }, [latestWeek, latestTeam, roster, summaries.players, teamSpike, settings]);

  const saveSettings = () => {
    saveTeamSettings(teamId, settings);
    notifyPracticeDataUpdated();
    toast?.('Alert thresholds updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Alerts"
        title="Weekly risk signals"
        description="Trigger alerts when weekly load spikes or prehab compliance drops."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Thresholds</h3>
          <div className="mt-4 space-y-3">
            <label className="text-xs font-semibold text-slate-500">
              Load spike alert (% increase vs previous week)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min="0"
                value={settings.loadSpikeThresholdPct}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    loadSpikeThresholdPct: Number(event.target.value)
                  }))
                }
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Minimum prehab compliance (%)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min="0"
                max="100"
                value={settings.minPrehabCompliancePct}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    minPrehabCompliancePct: Number(event.target.value)
                  }))
                }
              />
            </label>
            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={saveSettings}
            >
              Save thresholds
            </button>
            {latestWeek && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Current week: {getWeekLabel(latestWeek)}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Latest alerts</h3>
          {alertRows.length ? (
            <div className="mt-4 space-y-3">
              {alertRows.map((alert, index) => (
                <div key={`${alert.type}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{alert.type}</div>
                  <div className="mt-1 text-sm text-amber-900">{alert.detail}</div>
                </div>
              ))}
            </div>
          ) : (
            <ModuleEmptyState
              title="No alerts this week"
              description="You're within target ranges. Keep logging sessions to monitor trends."
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsView;
