import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import ModuleHeader from '../../components/ModuleHeader';
import {
  buildWeeklySummaries,
  getWeekLabel
} from '../../lib/practice/loadCalculations';
import {
  loadRoster,
  loadSessions,
  loadTeamSettings,
  notifyPracticeDataUpdated,
  saveTeamSettings
} from '../../lib/practice/storage';

const PrehabView = ({ teamId, toast }) => {
  const [settings, setSettings] = useState(loadTeamSettings(teamId));
  const [sessions, setSessions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [newItem, setNewItem] = useState('');

  const reload = () => {
    setSettings(loadTeamSettings(teamId));
    setSessions(loadSessions(teamId));
    setRoster(loadRoster(teamId));
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

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const nextItems = [...settings.prehabItems, { id: `${id}-${Date.now()}`, label: trimmed }];
    const nextSettings = { ...settings, prehabItems: nextItems };
    setSettings(nextSettings);
    saveTeamSettings(teamId, nextSettings);
    notifyPracticeDataUpdated();
    setNewItem('');
    toast?.('Checklist updated.', 'success');
  };

  const removeItem = (itemId) => {
    const nextItems = settings.prehabItems.filter((item) => item.id !== itemId);
    const nextSettings = { ...settings, prehabItems: nextItems };
    setSettings(nextSettings);
    saveTeamSettings(teamId, nextSettings);
    notifyPracticeDataUpdated();
    toast?.('Checklist item removed.', 'success');
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Prehab"
        title="Checklist & compliance"
        description="Manage prehab checklist items and review weekly compliance trends."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Checklist items</h3>
          <div className="mt-3 space-y-2">
            {settings.prehabItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600">
                <span>{item.label}</span>
                <button
                  className="text-xs font-semibold text-red-600"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Add checklist item"
              value={newItem}
              onChange={(event) => setNewItem(event.target.value)}
            />
            <button
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              onClick={addItem}
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Weekly compliance trend</h3>
          {summaries.team.length ? (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {summaries.team.slice(-6).map((week) => (
                <div key={week.weekStart} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span>{getWeekLabel(week.weekStart)}</span>
                  <span className="font-semibold text-slate-700">{week.avgPrehabPct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <ModuleEmptyState
              title="No sessions yet"
              description="Log sessions with prehab checklists to see compliance trends."
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrehabView;
