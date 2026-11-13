// Calendar calculations use UTC so daylight-saving changes cannot shift a day.
export function moveDate(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function weeklyReport(workouts, date) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const start = moveDate(date, -((weekday + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => ({
    date: moveDate(start, index), count: 0, minutes: 0,
  }));
  const end = days[6].date;
  const types = new Map();
  let count = 0;
  let minutes = 0;
  for (const workout of workouts) {
    const day = days.find(day => day.date === workout.date);
    if (!day) continue;
    count += 1;
    minutes += workout.minutes;
    day.count += 1;
    day.minutes += workout.minutes;
    const type = workout.type || 'Kita';
    const group = types.get(type) || { type, count: 0, minutes: 0 };
    group.count += 1;
    group.minutes += workout.minutes;
    types.set(type, group);
  }
  return {
    start, end, days, count, minutes,
    activeDays: days.filter(day => day.count > 0).length,
    averageMinutes: count ? Math.round(minutes / count) : 0,
    types: [...types.values()].sort((a, b) => b.minutes - a.minutes || a.type.localeCompare(b.type, 'lt')),
  };
}
