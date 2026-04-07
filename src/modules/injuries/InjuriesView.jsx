import React, { useEffect, useMemo, useState } from 'react';
import ModuleEmptyState from '../../components/ModuleEmptyState';
import ModuleHeader from '../../components/ModuleHeader';
import {
  loadInjuries,
  loadRoster,
  notifyPracticeDataUpdated,
  saveInjuries
} from '../../lib/practice/storage';

const severityOptions = ['Low', 'Moderate', 'High'];
const typeOptions = ['Strain', 'Sprain', 'Tendinopathy', 'Impact', 'Overuse', 'Other'];

const emptyForm = {
  id: '',
  playerId: '',
  date: new Date().toISOString().slice(0, 10),
  bodyPart: '',
  type: typeOptions[0],
  severity: severityOptions[0],
  timeLossDays: '',
  returnDate: '',
  notes: ''
};

const InjuriesView = ({ teamId, toast, confirmAction }) => {
  const [injuries, setInjuries] = useState([]);
  const [roster, setRoster] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const reload = () => {
    setInjuries(loadInjuries(teamId));
    setRoster(loadRoster(teamId));
  };

  useEffect(() => {
    if (!teamId) return;
    reload();
    const handler = () => reload();
    window.addEventListener('practice-data-updated', handler);
    return () => window.removeEventListener('practice-data-updated', handler);
  }, [teamId]);

  const sortedInjuries = useMemo(
    () => [...injuries].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [injuries]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
  };

  const validateForm = () => {
    if (!form.playerId) return 'Select a player.';
    if (!form.bodyPart.trim()) return 'Add a body part.';
    return '';
  };

  const saveInjury = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const payload = {
      ...form,
      timeLossDays: form.timeLossDays ? Number(form.timeLossDays) : null,
      updated_at: new Date().toISOString(),
      created_at: form.created_at || new Date().toISOString()
    };
    const next = form.id
      ? injuries.map((injury) => (injury.id === form.id ? payload : injury))
      : [
          ...injuries,
          {
            ...payload,
            id: `injury_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
          }
        ];
    setInjuries(next);
    saveInjuries(teamId, next);
    notifyPracticeDataUpdated();
    resetForm();
    toast?.('Injury saved.', 'success');
  };

  const editInjury = (injury) => {
    setForm({
      ...injury,
      timeLossDays: injury.timeLossDays != null ? String(injury.timeLossDays) : ''
    });
  };

  const deleteInjury = async (injuryId) => {
    if (!(await confirmAction?.('Delete this injury entry?'))) return;
    const next = injuries.filter((injury) => injury.id !== injuryId);
    setInjuries(next);
    saveInjuries(teamId, next);
    notifyPracticeDataUpdated();
    toast?.('Injury deleted.', 'success');
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Injuries"
        title="Injury log"
        description="Track body part, severity, time-loss estimates, and return-to-play dates."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">{form.id ? 'Edit injury' : 'New injury'}</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Player
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.playerId}
                onChange={(event) => setForm((prev) => ({ ...prev, playerId: event.target.value }))}
              >
                <option value="">Select player</option>
                {roster.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>
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
              Body part
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.bodyPart}
                onChange={(event) => setForm((prev) => ({ ...prev, bodyPart: event.target.value }))}
                placeholder="e.g. Hamstring"
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Type
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Severity
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.severity}
                onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))}
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Estimated time-loss (days)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min="0"
                value={form.timeLossDays}
                onChange={(event) => setForm((prev) => ({ ...prev, timeLossDays: event.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Return date
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                type="date"
                value={form.returnDate}
                onChange={(event) => setForm((prev) => ({ ...prev, returnDate: event.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold text-slate-500">
              Notes
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Optional notes or rehab milestones."
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
              onClick={saveInjury}
            >
              {form.id ? 'Save changes' : 'Save injury'}
            </button>
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={resetForm}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Recent injuries</h3>
          {sortedInjuries.length ? (
            <div className="mt-4 space-y-3">
              {sortedInjuries.map((injury) => {
                const playerName = roster.find((player) => player.id === injury.playerId)?.name || 'Unknown';
                return (
                  <div key={injury.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{playerName}</div>
                        <div className="text-xs text-slate-500">
                          {injury.date} · {injury.bodyPart} · {injury.type} · {injury.severity}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Return {injury.returnDate || 'TBD'}
                      </div>
                    </div>
                    {injury.notes && <p className="mt-2 text-xs text-slate-500">{injury.notes}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                        onClick={() => editInjury(injury)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        onClick={() => deleteInjury(injury.id)}
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
              title="No injuries logged"
              description="Add an injury entry to keep return-to-play timelines updated."
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InjuriesView;
