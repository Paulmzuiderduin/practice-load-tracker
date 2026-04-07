import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import StatTooltipLabel from '../../components/StatTooltipLabel';
import {
  buildWeeklySummaries,
  calculateLoadSpikePct,
  getLatestWeekKey,
  getWeekLabel
} from '../../lib/practice/loadCalculations';
import {
  loadInjuries,
  loadRoster,
  loadSessions,
  loadTeamSettings
} from '../../lib/practice/storage';

const HUB_TOOLTIPS = {
  workflow:
    'Recommended order: create roster, log sessions, then review weekly load and injury risk alerts.'
};

const isActiveInjury = (injury) => {
  if (!injury) return false;
  if (!injury.returnDate) return true;
  const returnDate = new Date(injury.returnDate);
  if (Number.isNaN(returnDate.getTime())) return true;
  return returnDate >= new Date();
};

const HubView = ({ teamId, showTips, showTooltips = true, onOpenModule }) => {
  const [roster, setRoster] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [settings, setSettings] = useState(loadTeamSettings(teamId));

  const reload = () => {
    setRoster(loadRoster(teamId));
    setSessions(loadSessions(teamId));
    setInjuries(loadInjuries(teamId));
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
  const rosterLookup = useMemo(
    () => new Map(roster.map((player) => [player.id, player.name])),
    [roster]
  );
  const latestWeek = getLatestWeekKey(summaries.weeks);
  const latestIndex = summaries.team.findIndex((item) => item.weekStart === latestWeek);
  const latestTeam = latestIndex >= 0 ? summaries.team[latestIndex] : null;
  const previousTeam = latestIndex > 0 ? summaries.team[latestIndex - 1] : null;
  const loadSpike = latestTeam
    ? calculateLoadSpikePct(latestTeam.totalLoad, previousTeam?.totalLoad || 0)
    : 0;
  const activeInjuries = injuries.filter(isActiveInjury);
  const complianceAlert =
    latestTeam && latestTeam.avgPrehabPct < settings.minPrehabCompliancePct;
  const loadSpikeAlert = latestTeam && loadSpike > settings.loadSpikeThresholdPct;

  const trendWeeks = summaries.team.slice(-4);
  const maxTrendLoad = trendWeeks.reduce((acc, item) => Math.max(acc, item.totalLoad || 0), 1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-cyan-700">Practice Load Hub</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Weekly readiness snapshot</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Monitor training load, prehab compliance, and active injuries. Alerts surface early risk signals before the
          next microcycle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">This week</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {latestTeam ? `${latestTeam.totalMinutes} min` : '—'}
          </div>
          <p className="text-sm text-slate-500">Total minutes</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average RPE</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {latestTeam ? latestTeam.avgRpe : '—'}
          </div>
          <p className="text-sm text-slate-500">Weighted by session minutes</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prehab compliance</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {latestTeam ? `${latestTeam.avgPrehabPct}%` : '—'}
          </div>
          <p className="text-sm text-slate-500">Target ≥ {settings.minPrehabCompliancePct}%</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active injuries</p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{activeInjuries.length}</div>
          <p className="text-sm text-slate-500">Currently rehab or time loss</p>
        </div>
      </div>

      {showTips && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">
              <StatTooltipLabel
                label="Getting Started"
                tooltip={HUB_TOOLTIPS.workflow}
                enabled={showTooltips}
              />
            </h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>Add players in `Roster`.</li>
              <li>Log your first session in `Sessions` with RPE + prehab checklist.</li>
              <li>Review `Load` for weekly spikes and `Alerts` for risk signals.</li>
              <li>Export the weekly PDF in `Reports` for staff check-ins.</li>
            </ol>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Quick actions</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  onClick={() => onOpenModule?.('sessions')}
                >
                  Log session
                </button>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                  onClick={() => onOpenModule?.('roster')}
                >
                  Add players
                </button>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                  onClick={() => onOpenModule?.('reports')}
                >
                  Export report
                </button>
              </div>
            </div>
            {(loadSpikeAlert || complianceAlert) && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <div className="font-semibold">Alerts this week</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {loadSpikeAlert && (
                    <li>Weekly load increased {loadSpike}% vs last week.</li>
                  )}
                  {complianceAlert && (
                    <li>Prehab compliance below {settings.minPrehabCompliancePct}%.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">4-week load trend</h3>
          {trendWeeks.length ? (
            <div className="mt-4 space-y-3">
              {trendWeeks.map((week) => (
                <div key={week.weekStart} className="flex items-center gap-3">
                  <div className="w-32 text-xs font-semibold text-slate-600">
                    {getWeekLabel(week.weekStart)}
                  </div>
                  <div className="flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-cyan-600"
                      style={{
                        width: `${Math.min(100, (week.totalLoad / maxTrendLoad) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-slate-500">{week.totalLoad}</div>
                </div>
              ))}
            </div>
          ) : (
            <ModuleEmptyState
              title="No sessions yet"
              description="Log your first session to see weekly trends here."
              actions={[
                { label: 'Log session', onClick: () => onOpenModule?.('sessions') }
              ]}
              compact
            />
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Active injury watch</h3>
          {activeInjuries.length ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {activeInjuries.slice(0, 4).map((injury) => (
                <div key={injury.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  <div className="font-semibold text-slate-800">
                    {rosterLookup.get(injury.playerId) || injury.playerName || 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {injury.bodyPart} · {injury.type} · return {injury.returnDate || 'TBD'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-500">No active injuries logged.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HubView;
