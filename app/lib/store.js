import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readList(file) {
  await ensureDir();
  const p = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

async function appendTo(file, entry) {
  const list = await readList(file);
  const row = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString(), ...entry };
  list.push(row);
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(list, null, 2));
  return row;
}

export const store = { readList, appendTo };
