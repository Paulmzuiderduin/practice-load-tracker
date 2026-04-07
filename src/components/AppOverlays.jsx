import React from 'react';

const AppOverlays = ({
  confirmDialog,
  setConfirmDialog,
  promptDialog,
  setPromptDialog,
  toasts
}) => (
  <>
    {confirmDialog && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/35 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
          <h3 className="text-sm font-semibold text-slate-800">Please confirm</h3>
          <p className="mt-2 text-sm text-slate-600">{confirmDialog.message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                const dialog = confirmDialog;
                setConfirmDialog(null);
                dialog.resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className="wp-primary-bg rounded-lg px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                const dialog = confirmDialog;
                setConfirmDialog(null);
                dialog.resolve(true);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {promptDialog && (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/35 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
          <h3 className="text-sm font-semibold text-slate-800">{promptDialog.message}</h3>
          <input
            autoFocus
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={promptDialog.value}
            onChange={(event) =>
              setPromptDialog((prev) => (prev ? { ...prev, value: event.target.value } : prev))
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const dialog = promptDialog;
                setPromptDialog(null);
                dialog.resolve(dialog.value);
              }
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                const dialog = promptDialog;
                setPromptDialog(null);
                dialog.resolve(null);
              }}
            >
              Cancel
            </button>
            <button
              className="wp-primary-bg rounded-lg px-3 py-2 text-sm font-semibold text-white"
              onClick={() => {
                const dialog = promptDialog;
                setPromptDialog(null);
                dialog.resolve(dialog.value);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="fixed right-4 top-4 z-[130] flex w-[min(360px,95vw)] flex-col gap-2">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg px-3 py-2 text-sm font-medium shadow-lg ${
            item.type === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  </>
);

export default AppOverlays;
