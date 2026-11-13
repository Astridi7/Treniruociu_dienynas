import http from 'node:http';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.resolve(root, process.env.DATA_FILE || 'data/workouts.json');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
let queue = Promise.resolve();

async function loadWorkouts() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (url.pathname === '/api/workouts' && req.method === 'GET') {
      await queue;
      return json(res, 200, await loadWorkouts());
    }
    if (url.pathname === '/api/workouts' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 16384) return json(res, 413, { error: 'Per daug duomenų.' });
      }
      let input;
      try { input = JSON.parse(body); } catch { return json(res, 400, { error: 'Netinkamas JSON.' }); }
      const { title, date, minutes, notes = '' } = input || {};
      if (typeof title !== 'string' || !title.trim() || title.length > 100 ||
          typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date ||
          !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 ||
          typeof notes !== 'string' || notes.length > 2000) {
        return json(res, 400, { error: 'Patikrinkite pavadinimą, datą ir trukmę (1–1440 min.).' });
      }
      const workout = { id: randomUUID(), title: title.trim(), date, minutes, notes: notes.trim() };
      const save = queue.then(async () => {
        const workouts = await loadWorkouts();
        workouts.push(workout);
        await mkdir(path.dirname(dataFile), { recursive: true });
        await writeFile(`${dataFile}.tmp`, JSON.stringify(workouts, null, 2), 'utf8');
        await rename(`${dataFile}.tmp`, dataFile);
      });
      queue = save.catch(() => {});
      await save;
      return json(res, 201, workout);
    }
    if (req.method === 'GET' && assets[url.pathname]) {
      const [file, type] = assets[url.pathname];
      const body = await readFile(path.join(root, 'public', file));
      res.writeHead(200, { 'Content-Type': type });
      return res.end(body);
    }
    json(res, 404, { error: 'Nerasta.' });
  } catch (error) {
    console.error('Užklausos klaida:', error.message);
    json(res, 500, { error: 'Nepavyko apdoroti užklausos.' });
  }
});

server.listen(port, host, () => console.log(`Treniruočių dienynas: http://${host}:${port}`));
