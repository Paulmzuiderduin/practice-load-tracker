import React from 'react';

const SettingsView = ({ moduleConfig, moduleVisibility, onToggle, onReset, preferences, onSetPreference }) => {
  const coreModules = moduleConfig.filter((item) => !item.alwaysVisible && !item.advanced);
  const advancedModules = moduleConfig.filter((item) => item.advanced);

  const renderModuleToggle = (item) => {
    const enabled = moduleVisibility[item.key] !== false;
    return (
      <label
        key={item.key}
        className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {item.icon}
          {item.label}
        </span>
        <input type="checkbox" checked={enabled} onChange={() => onToggle(item.key)} />
      </label>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Settings</p>
        <h2 className="text-2xl font-semibold text-slate-900">Workspace preferences</h2>
        <p className="mt-2 text-sm text-slate-500">
          Configure module visibility and onboarding preferences for your coaching staff.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">Core modules</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {coreModules.map(renderModuleToggle)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            onClick={onReset}
          >
            Reset visibility
          </button>
        </div>
      </div>

      {advancedModules.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Advanced modules</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {advancedModules.map(renderModuleToggle)}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">UI preferences</h3>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <span>Remember last tab</span>
            <input
              type="checkbox"
              checked={preferences.rememberLastTab}
              onChange={(event) => onSetPreference('rememberLastTab', event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <span>Show onboarding tips</span>
            <input
              type="checkbox"
              checked={preferences.showHubTips}
              onChange={(event) => onSetPreference('showHubTips', event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
            <span>Show tooltips</span>
            <input
              type="checkbox"
              checked={preferences.showStatTooltips}
              onChange={(event) => onSetPreference('showStatTooltips', event.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
