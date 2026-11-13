import test from 'node:test';
import assert from 'node:assert/strict';
import { moveDate, weeklyReport } from '../public/weekly-report.js';

test('counts Monday through Sunday, excludes adjacent weeks and groups legacy workouts', () => {
  const workouts = [
    { date: '2026-11-08', minutes: 100, type: 'Joga' },
    { date: '2026-11-09', minutes: 30, type: 'Jėga' },
    { date: '2026-11-09', minutes: 45, type: 'Jėga' },
    { date: '2026-11-15', minutes: 20 },
    { date: '2026-11-16', minutes: 100, type: 'Joga' },
  ];
  const report = weeklyReport(workouts, '2026-11-13');
  assert.equal(report.start, '2026-11-09');
  assert.equal(report.end, '2026-11-15');
  assert.equal(report.count, 3);
  assert.equal(report.minutes, 95);
  assert.equal(report.activeDays, 2);
  assert.equal(report.averageMinutes, 32);
  assert.deepEqual(report.days[0], { date: '2026-11-09', count: 2, minutes: 75 });
  assert.deepEqual(report.days[6], { date: '2026-11-15', count: 1, minutes: 20 });
  assert.deepEqual(report.types, [
    { type: 'Jėga', count: 2, minutes: 75 }, { type: 'Kita', count: 1, minutes: 20 },
  ]);
  assert.deepEqual(weeklyReport(workouts, '2026-11-15'), report);
});

test('empty week crossing a year has seven days and zero totals', () => {
  const report = weeklyReport([], '2027-01-01');
  assert.equal(report.start, '2026-12-28');
  assert.equal(report.end, '2027-01-03');
  assert.equal(report.days.length, 7);
  for (const key of ['count', 'minutes', 'activeDays', 'averageMinutes']) assert.equal(report[key], 0);
  assert.deepEqual(report.types, []);
});

test('calendar navigation handles leap days and daylight-saving transitions', () => {
  assert.equal(moveDate('2024-02-28', 1), '2024-02-29');
  assert.equal(moveDate('2024-03-01', -1), '2024-02-29');
  assert.equal(moveDate('2026-03-23', 7), '2026-03-30');
  assert.equal(moveDate('2026-10-26', -7), '2026-10-19');
  const report = weeklyReport([], '2026-03-29');
  assert.equal(report.start, '2026-03-23');
  assert.equal(report.end, '2026-03-29');
});
