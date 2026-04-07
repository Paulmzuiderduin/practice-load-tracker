import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import ModuleHeader from '../../components/ModuleHeader';
import {
  calculatePrehabCompliance,
  calculateSessionLoad
} from '../../lib/practice/loadCalculations';
import {
  loadRoster,
  loadSessions,
  loadTeamSettings,
  notifyPracticeDataUpdated,
  saveSessions
} from '../../lib/practice/storage';

const focusOptions = ['Technical', 'Tactical', 'Conditioning', 'Strength', 'Recovery', 'Mixed'];

const emptyForm = (prehabItems) => ({
  id: '',
  date: new Date().toISOString().slice(0, 10),
  durationMinutes: '',
  focus: focusOptions[0],
  notes: '',
  attendance: {},
  rpeByPlayer: {},
  prehab: prehabItems.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {})
});

const SessionsView = ({ teamId, toast, confirmAction }) => {
  const [sessions, setSessions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [settings, setSettings] = useState(loadTeamSettings(teamId));
  const [form, setForm] = useState(emptyForm(settings.prehabItems));
  const [error, setError] = useState('');

  const reload = () => {
    setRoster(loadRoster(teamId));
    setSessions(loadSessions(teamId));
    const nextSettings = loadTeamSettings(teamId);
    setSettings(nextSettings);
    setForm((prev) => (prev.id ? prev : emptyForm(nextSettings.prehabItems)));
  };

  useEffect(() => {
    if (!teamId) return;
    reload();
    const handler = () => reload();
    window.addEventListener('practice-data-updated', handler);
    return () => window.removeEventListener('practice-data-updated', handler);
  }, [teamId]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [sessions]
  );

  const getSessionTotals = (session) => {
    const duration = Number(session.durationMinutes || 0);
    if (!roster.length || !duration) {
      return { totalMinutes: duration, totalLoad: calculateSessionLoad(duration, 0), avgRpe: 0 };
    }
    const totals = roster.reduce(
      (acc, player) => {
        const status = session.attendance?.[player.id] || 'absent';
        const weight = status === 'present' ? 1 : status === 'limited' ? 0.5 : 0;
        if (weight <= 0) return acc;
        const minutes = duration * weight;
        const rpe = Number(session.rpeByPlayer?.[player.id] || 0);
        acc.totalMinutes += minutes;
        acc.totalLoad += calculateSessionLoad(minutes, rpe);
        return acc;
      },
      { totalMinutes: 0, totalLoad: 0 }
    );
    const avgRpe = totals.totalMinutes ? totals.totalLoad / totals.totalMinutes : 0;
    return { ...totals, avgRpe };
  };

  const handleAttendanceChange = (playerId, status) => {
    setForm((prev) => {
      const nextRpeByPlayer = { ...prev.rpeByPlayer };
      if (status === 'absent') {
        delete nextRpeByPlayer[playerId];
      } else if (!nextRpeByPlayer[playerId]) {
        nextRpeByPlayer[playerId] = 5;
      }
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [playerId]: status
        },
        rpeByPlayer: nextRpeByPlayer
      };
    });
  };

  const handleRpeChange = (playerId, value) => {
    const parsed = Number(value);
    setForm((prev) => ({
      ...prev,
      rpeByPlayer: {
        ...prev.rpeByPlayer,
        [playerId]: Number.isFinite(parsed) ? parsed : ''
      }
    }));
  };

  const handlePrehabToggle = (itemId) => {
    setForm((prev) => ({
      ...prev,
      prehab: {
        ...prev.prehab,
        [itemId]: !prev.prehab[itemId]
      }
    }));
  };

  const resetForm = () => {
    setForm(emptyForm(settings.prehabItems));
    setError('');
  };

  const validateForm = () => {
    if (!form.date) return 'Select a session date.';
    const duration = Number(form.durationMinutes);
    if (!Number.isFinite(duration) || duration <= 0) return 'Enter a valid duration in minutes.';
    const requiresRpe = Object.entries(form.attendance).filter(
      ([, status]) => status === 'present' || status === 'limited'
    );
    for (const [playerId] of requiresRpe) {
      const rpe = Number(form.rpeByPlayer?.[playerId]);
      if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
        return 'Enter a 1-10 RPE for every present/limited player.';
      }
    }
    return '';
  };

  const saveSession = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      rpeByPlayer: form.rpeByPlayer || {},
      updated_at: new Date().toISOString(),
      created_at: form.created_at || new Date().toISOString()
    };
    const nextSessions = form.id
      ? sessions.map((session) => (session.id === form.id ? payload : session))
      : [
          ...sessions,
          {
            ...payload,
            id: `session_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
          }
        ];
    setSessions(nextSessions);
    saveSessions(teamId, nextSessions);
    notifyPracticeDataUpdated();
    setError('');
    resetForm();
    toast?.('Session saved.', 'success');
  };

  const editSession = (session) => {
    setForm({
      ...session,
      durationMinutes: String(session.durationMinutes || ''),
      rpeByPlayer: session.rpeByPlayer || {},
      attendance: session.attendance || {},
      prehab: session.prehab || {}
    });
    setError('');
  };

  const deleteSession = async (sessionId) => {
    if (!(await confirmAction?.('Delete this session?'))) return;
    const next = sessions.filter((session) => session.id !== sessionId);
    setSessions(next);
    saveSessions(teamId, next);
    notifyPracticeDataUpdated();
    toast?.('Session deleted.', 'success');
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Sessions"
        title="Training session log"
        description="Capture duration, RPE, focus, attendance, and prehab compliance for each practice."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">
            {form.id ? 'Edit session' : 'New session'}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Date
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Duration (minutes)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={(event) => setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Focus
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.focus}
                onChange={(event) => setForm((prev) => ({ ...prev, focus: event.target.value }))}
              >
                {focusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Notes
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Optional notes about intensity, weather, or constraints."
              />
            </label>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prehab checklist</h4>
            <div className="mt-3 space-y-2">
              {settings.prehabItems.map((item) => (
                <label key={item.id} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(form.prehab[item.id])}
                    onChange={() => handlePrehabToggle(item.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attendance</h4>
            {roster.length ? (
              <div className="mt-3 space-y-2">
                {roster.map((player) => (
                  <div key={player.id} className="flex items-center justify-between text-sm text-slate-600">
                    <span className="min-w-[120px]">{player.name}</span>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                        value={form.attendance[player.id] || 'absent'}
                        onChange={(event) => handleAttendanceChange(player.id, event.target.value)}
                      >
                        <option value="present">Present</option>
                        <option value="limited">Limited</option>
                        <option value="absent">Absent</option>
                      </select>
                      <input
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="RPE"
                        value={form.rpeByPlayer[player.id] ?? ''}
                        onChange={(event) => handleRpeChange(player.id, event.target.value)}
                        disabled={form.attendance[player.id] === 'absent' || !form.attendance[player.id]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ModuleEmptyState
                title="No roster yet"
                description="Add players first so you can track attendance per session."
                actions={[{ label: 'Add roster', onClick: () => window.scrollTo(0, 0) }]}
                compact
              />
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={saveSession}
            >
              {form.id ? 'Save changes' : 'Save session'}
            </button>
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={resetForm}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Recent sessions</h3>
          {sortedSessions.length ? (
            <div className="mt-4 space-y-3">
              {sortedSessions.map((session) => {
                const compliance = calculatePrehabCompliance(session.prehab, settings.prehabItems);
                const totals = getSessionTotals(session);
                const avgRpeLabel = totals.avgRpe ? totals.avgRpe.toFixed(1) : '—';
                return (
                  <div key={session.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {session.date} · {session.focus}
                        </div>
                        <div className="text-xs text-slate-500">
                          {session.durationMinutes} min · Avg RPE {avgRpeLabel} · Team load {Math.round(totals.totalLoad)}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Prehab {compliance.pct}%
                      </div>
                    </div>
                    {session.notes && <p className="mt-2 text-xs text-slate-500">{session.notes}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                        onClick={() => editSession(session)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        onClick={() => deleteSession(session.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ModuleEmptyState
              title="No sessions logged"
              description="Use the form to add your first training session."
              actions={[{ label: 'Add session', onClick: () => window.scrollTo(0, 0) }]}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsView;
