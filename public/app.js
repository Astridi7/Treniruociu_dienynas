import { moveDate, weeklyReport } from './weekly-report.js';

const form = document.querySelector('#workout-form');
const list = document.querySelector('#workouts');
const status = document.querySelector('#status');
const typeFilter = document.querySelector('#type-filter');
const dateInput = form.elements.date;
const weekDate = document.querySelector('#week-date');
const weeklyContent = document.querySelector('#weekly-content');
let loaded = false;
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
dateInput.value = today();
weekDate.value = today();
let workouts = [];

function renderWeeklyReport() {
  if (!loaded) return;
  const report = weeklyReport(workouts, weekDate.value);
  weeklyContent.replaceChildren();
  const range = document.createElement('p');
  range.className = 'week-range';
  range.textContent = `${report.start} – ${report.end}`;
  const stats = document.createElement('dl');
  stats.className = 'week-stats';
  for (const [label, value] of [
    ['Treniruočių', report.count], ['Bendra trukmė', `${report.minutes} min.`],
    ['Aktyvių dienų', `${report.activeDays} / 7`], ['Vidutinė trukmė', `${report.averageMinutes} min.`],
  ]) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    group.append(term, detail);
    stats.append(group);
  }
  weeklyContent.append(range, stats);
  if (!report.count) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Šią savaitę treniruočių nėra.';
    weeklyContent.append(empty);
    return;
  }
  const breakdowns = document.createElement('div');
  breakdowns.className = 'week-breakdowns';
  for (const [caption, firstColumn, rows] of [
    ['Pagal dieną', 'Diena', report.days.map((day, index) => [
      `${['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'][index]} · ${day.date}`, day.count, day.minutes,
    ])],
    ['Pagal tipą', 'Tipas', report.types.map(group => [group.type, group.count, group.minutes])],
  ]) {
    const table = document.createElement('table');
    const title = table.createCaption();
    title.textContent = caption;
    const heading = table.createTHead().insertRow();
    for (const name of [firstColumn, 'Kiekis', 'Min.']) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = name;
      heading.append(cell);
    }
    const body = table.createTBody();
    for (const values of rows) {
      const row = body.insertRow();
      values.forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = value;
        row.append(cell);
      });
    }
    breakdowns.append(table);
  }
  weeklyContent.append(breakdowns);
}

weekDate.addEventListener('change', () => {
  if (!weekDate.value || !weekDate.validity.valid) return;
  renderWeeklyReport();
});
for (const [selector, offset] of [['#previous-week', -7], ['#next-week', 7]]) {
  document.querySelector(selector).addEventListener('click', () => {
    weekDate.value = moveDate(weekDate.value || today(), offset);
    renderWeeklyReport();
  });
}
document.querySelector('#current-week').addEventListener('click', () => {
  weekDate.value = today();
  renderWeeklyReport();
});

function render() {
  if (!weekDate.value) weekDate.value = today();
  renderWeeklyReport();
  list.replaceChildren();
  const filteredWorkouts = workouts.filter(workout => !typeFilter.value || (workout.type || 'Kita') === typeFilter.value);
  document.querySelector('#count').textContent = `Iš viso: ${filteredWorkouts.length}`;
  if (!filteredWorkouts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = workouts.length ? 'Pasirinkto tipo treniruočių nėra.' : 'Dar nėra treniruočių. Pridėkite pirmąją!';
    list.append(empty);
  }
  for (const workout of filteredWorkouts.sort((a, b) => b.date.localeCompare(a.date))) {
    const card = document.createElement('article');
    const heading = document.createElement('h3');
    heading.textContent = workout.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${workout.date} · ${workout.minutes} min. · ${workout.type || 'Kita'}`;
    card.append(heading, meta);
    if (workout.notes) {
      const notes = document.createElement('p');
      notes.textContent = workout.notes;
      card.append(notes);
    }
    list.append(card);
  }
}

typeFilter.addEventListener('change', render);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Saugoma…';
  try {
    const data = Object.fromEntries(new FormData(form));
    data.minutes = Number(data.minutes);
    const response = await fetch('/api/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Nepavyko išsaugoti.');
    workouts.push(result);
    render();
    form.reset();
    dateInput.value = today();
    status.textContent = 'Treniruotė pridėta!';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});

try {
  const response = await fetch('/api/workouts');
  if (!response.ok) throw new Error('Nepavyko įkelti treniruočių.');
  workouts = await response.json();
  loaded = true;
  render();
} catch {
  list.textContent = 'Nepavyko įkelti treniruočių. Atnaujinkite puslapį.';
  weeklyContent.textContent = 'Nepavyko įkelti savaitės suvestinės. Atnaujinkite puslapį.';
}
