import React from 'react';
import ModuleHeader from '../../components/ModuleHeader';

const HelpView = () => (
  <div className="space-y-6">
    <ModuleHeader
      eyebrow="Help"
      title="Getting started, data model, and FAQ"
      description="Everything you need to understand the workflow, storage model, and exports."
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Getting started</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Create a season and team folder.</li>
            <li>Add players in Roster.</li>
            <li>Log sessions with RPE, attendance, and prehab checklists.</li>
            <li>Review weekly load summaries and alerts.</li>
            <li>Export PDF/CSV reports for staff meetings.</li>
          </ol>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Data model</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Season</span>: id, name, teams[]
            </div>
            <div>
              <span className="font-semibold text-slate-800">Team</span>: id, season_id, name
            </div>
            <div>
              <span className="font-semibold text-slate-800">Player</span>: id, name, position, status, notes
            </div>
            <div>
              <span className="font-semibold text-slate-800">Session</span>: date, durationMinutes, focus,
              attendance{`{playerId: status}`}, rpeByPlayer{`{playerId: 1-10}`}, prehab{`{itemId: boolean}`}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Injury</span>: playerId, date, bodyPart, type, severity,
              timeLossDays, returnDate
            </div>
            <div>
              <span className="font-semibold text-slate-800">Settings</span>: loadSpikeThresholdPct,
              minPrehabCompliancePct, prehabItems[]
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">UI layout</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>`Dashboard` shows weekly totals, trends, and active injuries.</li>
            <li>`Sessions` is the primary log for RPE, attendance, and prehab.</li>
            <li>`Load` surfaces team + player weekly summaries and spikes.</li>
            <li>`Injuries` tracks body part, severity, and return dates.</li>
            <li>`Alerts` highlights spike and compliance thresholds.</li>
            <li>`Reports` exports weekly PDF and CSV.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Export logic</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              Weekly PDF exports include team totals, player loads, and injury watch lists. CSV exports contain a row
              per player for the selected week.
            </p>
            <p className="text-xs text-slate-500">
              File names follow `weekly-load-YYYY-MM-DD.pdf` and `weekly-load-YYYY-MM-DD.csv`.
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Error handling</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Form validation highlights missing required fields before saving.</p>
            <p>Local storage reads are guarded; invalid JSON falls back to safe defaults.</p>
            <p>Toast notifications confirm saves and deletions.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Tests</h3>
          <div className="mt-3 text-sm text-slate-600">
            Load calculations (weekly totals, spikes, and week-start logic) are covered by unit tests in
            `tests/unit/loadCalculations.test.mjs`.
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HelpView;
