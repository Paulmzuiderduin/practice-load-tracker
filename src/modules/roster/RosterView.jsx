import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import ModuleHeader from '../../components/ModuleHeader';
import {
  loadRoster,
  notifyPracticeDataUpdated,
  saveRoster
} from '../../lib/practice/storage';

const emptyForm = {
  id: '',
  name: '',
  position: '',
  status: 'active',
  notes: ''
};

const RosterView = ({ teamId, toast, confirmAction }) => {
  const [roster, setRoster] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const reload = () => {
    setRoster(loadRoster(teamId));
  };

  useEffect(() => {
    if (!teamId) return;
    reload();
    const handler = () => reload();
    window.addEventListener('practice-data-updated', handler);
    return () => window.removeEventListener('practice-data-updated', handler);
  }, [teamId]);

  const sortedRoster = useMemo(
    () => [...roster].sort((a, b) => a.name.localeCompare(b.name)),
    [roster]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Player name is required.';
    return '';
  };

  const savePlayer = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      updated_at: new Date().toISOString(),
      created_at: form.created_at || new Date().toISOString()
    };
    const next = form.id
      ? roster.map((player) => (player.id === form.id ? payload : player))
      : [
          ...roster,
          {
            ...payload,
            id: `player_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
          }
        ];
    setRoster(next);
    saveRoster(teamId, next);
    notifyPracticeDataUpdated();
    resetForm();
    toast?.('Player saved.', 'success');
  };

  const editPlayer = (player) => {
    setForm(player);
    setError('');
  };

  const deletePlayer = async (playerId) => {
    if (!(await confirmAction?.('Delete this player?'))) return;
    const next = roster.filter((player) => player.id !== playerId);
    setRoster(next);
    saveRoster(teamId, next);
    notifyPracticeDataUpdated();
    toast?.('Player removed.', 'success');
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Roster"
        title="Team roster"
        description="Manage players for attendance, prehab tracking, and injury logging."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">{form.id ? 'Edit player' : 'Add player'}</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Name
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Position / role
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.position}
                onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                placeholder="e.g. Defender"
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Status
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="active">Active</option>
                <option value="limited">Limited</option>
                <option value="rehab">Rehab</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Notes
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Optional context or rehab notes."
              />
            </label>
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={savePlayer}
            >
              {form.id ? 'Save changes' : 'Save player'}
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
          <h3 className="text-sm font-semibold text-slate-700">Roster list</h3>
          {sortedRoster.length ? (
            <div className="mt-4 space-y-3">
              {sortedRoster.map((player) => (
                <div key={player.id} className="rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{player.name}</div>
                      <div className="text-xs text-slate-500">
                        {player.position || 'Role unassigned'} · {player.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                        onClick={() => editPlayer(player)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        onClick={() => deletePlayer(player.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {player.notes && <p className="mt-2 text-xs text-slate-500">{player.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <ModuleEmptyState
              title="No players yet"
              description="Add your first player to start tracking attendance and load."
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterView;
