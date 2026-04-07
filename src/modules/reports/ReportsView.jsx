import React, { useEffect, useMemo, useState } from 'react';
import ModuleHeader from '../../components/ModuleHeader';
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

const ReportsView = ({ teamId, seasonName, teamName }) => {
  const [sessions, setSessions] = useState([]);
  const [roster, setRoster] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [settings, setSettings] = useState(loadTeamSettings(teamId));
  const [selectedWeek, setSelectedWeek] = useState('');

  const reload = () => {
    setSessions(loadSessions(teamId));
    setRoster(loadRoster(teamId));
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

  const playerRows = roster.map((player) => {
    const rows = summaries.players[player.id] || [];
    const rowIndex = rows.findIndex((row) => row.weekStart === selectedWeek);
    const row = rowIndex >= 0 ? rows[rowIndex] : null;
    const prev = rowIndex > 0 ? rows[rowIndex - 1] : null;
    const spike = row ? calculateLoadSpikePct(row.totalLoad, prev?.totalLoad || 0) : 0;
    return {
      playerName: player.name,
      totalMinutes: row?.totalMinutes || 0,
      avgRpe: row?.avgRpe || 0,
      totalLoad: row?.totalLoad || 0,
      prehabPct: row?.avgPrehabPct || 0,
      spikePct: spike
    };
  });

  const exportCsv = () => {
    if (!selectedWeek) return;
    const header = [
      'week_start',
      'player',
      'minutes',
      'avg_rpe',
      'load',
      'prehab_pct',
      'spike_pct'
    ];
    const rows = playerRows.map((row) =>
      [
        selectedWeek,
        row.playerName,
        row.totalMinutes,
        row.avgRpe,
        row.totalLoad,
        row.prehabPct,
        row.spikePct
      ].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `weekly-load-${selectedWeek}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!selectedWeek || !teamSummary) return;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    const ensureSpace = (height) => {
      if (y + height > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    const sectionTitle = (label) => {
      ensureSpace(26);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.text(label, margin, y);
      y += 8;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 14;
    };

    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 64, 10, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Weekly Practice Load Report', margin + 16, y + 24);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${seasonName || 'Season'} · ${teamName || 'Team'}`, margin + 16, y + 42);
    y += 90;

    sectionTitle('Team summary');
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Week: ${getWeekLabel(selectedWeek)}`, margin, y);
    y += 16;
    pdf.text(`Total minutes: ${teamSummary.totalMinutes}`, margin, y);
    y += 14;
    pdf.text(`Average RPE: ${teamSummary.avgRpe}`, margin, y);
    y += 14;
    pdf.text(`Total load: ${teamSummary.totalLoad}`, margin, y);
    y += 14;
    pdf.text(`Spike vs last week: ${teamSpike}%`, margin, y);
    y += 14;
    pdf.text(`Prehab compliance: ${teamSummary.avgPrehabPct}%`, margin, y);
    y += 20;

    sectionTitle('Player load');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Player', margin, y);
    pdf.text('Min', margin + 220, y);
    pdf.text('RPE', margin + 280, y);
    pdf.text('Load', margin + 330, y);
    pdf.text('Spike', margin + 390, y);
    y += 12;
    pdf.setFont('helvetica', 'normal');
    playerRows.forEach((row) => {
      ensureSpace(18);
      pdf.text(row.playerName, margin, y);
      pdf.text(String(row.totalMinutes), margin + 220, y);
      pdf.text(String(row.avgRpe), margin + 280, y);
      pdf.text(String(row.totalLoad), margin + 330, y);
      pdf.text(`${row.spikePct}%`, margin + 390, y);
      y += 14;
    });

    sectionTitle('Injury watch');
    if (!injuries.length) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('No injuries logged for this team.', margin, y);
      y += 14;
    } else {
      injuries.slice(0, 8).forEach((injury) => {
        ensureSpace(16);
        const playerName =
          roster.find((player) => player.id === injury.playerId)?.name || 'Unknown';
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.text(
          `${playerName} · ${injury.bodyPart} · ${injury.type} · return ${injury.returnDate || 'TBD'}`,
          margin,
          y
        );
        y += 14;
      });
    }

    pdf.save(`weekly-load-${selectedWeek}.pdf`);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Reports"
        title="Weekly export"
        description="Download PDF summaries for staff meetings and CSV exports for analysis."
      />

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Select week</h3>
            <p className="text-xs text-slate-500">Exports include team totals, player loads, and injuries.</p>
          </div>
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

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={exportPdf}
            disabled={!selectedWeek}
          >
            Export PDF
          </button>
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={exportCsv}
            disabled={!selectedWeek}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
