const form = document.querySelector('#workout-form');
const list = document.querySelector('#workouts');
const status = document.querySelector('#status');
const dateInput = form.elements.date;
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
dateInput.value = today();
let workouts = [];

function render() {
  list.replaceChildren();
  document.querySelector('#count').textContent = `Iš viso: ${workouts.length}`;
  if (!workouts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Dar nėra treniruočių. Pridėkite pirmąją!';
    list.append(empty);
  }
  for (const workout of [...workouts].sort((a, b) => b.date.localeCompare(a.date))) {
    const card = document.createElement('article');
    const heading = document.createElement('h3');
    heading.textContent = workout.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${workout.date} · ${workout.minutes} min.`;
    card.append(heading, meta);
    if (workout.notes) {
      const notes = document.createElement('p');
      notes.textContent = workout.notes;
      card.append(notes);
    }
    list.append(card);
  }
}

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
  render();
} catch { list.textContent = 'Nepavyko įkelti treniruočių. Atnaujinkite puslapį.'; }
