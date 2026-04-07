import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeeklySummaries,
  calculateLoadSpikePct,
  calculateSessionLoad,
  getWeekStart
} from '../../src/lib/practice/loadCalculations.js';

test('calculateSessionLoad multiplies duration and RPE', () => {
  assert.equal(calculateSessionLoad(60, 5), 300);
});

test('getWeekStart returns Monday for a midweek date', () => {
  assert.equal(getWeekStart('2026-03-25'), '2026-03-23');
});

test('buildWeeklySummaries aggregates team and player load', () => {
  const roster = [
    { id: 'p1', name: 'A' },
    { id: 'p2', name: 'B' }
  ];
  const sessions = [
    {
      date: '2026-03-23',
      durationMinutes: 60,
      attendance: { p1: 'present', p2: 'absent' },
      rpeByPlayer: { p1: 5 },
      prehab: { nordic: true }
    },
    {
      date: '2026-03-25',
      durationMinutes: 30,
      attendance: { p1: 'limited', p2: 'present' },
      rpeByPlayer: { p1: 4, p2: 4 },
      prehab: { nordic: false }
    },
    {
      date: '2026-03-30',
      durationMinutes: 60,
      attendance: { p1: 'present', p2: 'absent' },
      rpeByPlayer: { p1: 6 },
      prehab: { nordic: true }
    }
  ];

  const summaries = buildWeeklySummaries({
    sessions,
    roster,
    prehabItems: [{ id: 'nordic', label: 'Nordic' }]
  });

  assert.equal(summaries.weeks.length, 2);
  const weekOne = summaries.team.find((item) => item.weekStart === '2026-03-23');
  assert.equal(weekOne.totalMinutes, 90);
  assert.equal(weekOne.totalLoad, 420);
  assert.equal(weekOne.avgRpe, 4.7);

  const playerOneWeek = summaries.players.p1.find((item) => item.weekStart === '2026-03-23');
  assert.equal(playerOneWeek.totalMinutes, 75);
  assert.equal(playerOneWeek.totalLoad, 360);

  const playerTwoWeek = summaries.players.p2.find((item) => item.weekStart === '2026-03-23');
  assert.equal(playerTwoWeek.totalMinutes, 30);
  assert.equal(playerTwoWeek.totalLoad, 120);
});

test('calculateLoadSpikePct returns percentage change', () => {
  assert.equal(calculateLoadSpikePct(200, 100), 100);
});
