import fs from 'node:fs';
import path from 'node:path';
import { AgentState } from '../types.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'state.json');

type Db = { agents: Record<string, AgentState> };

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ agents: {} }, null, 2));
}

function readDb(): Db {
  ensureDataFile();
  const raw = fs.readFileSync(FILE_PATH, 'utf-8');
  try { return JSON.parse(raw) as Db; } catch { return { agents: {} }; }
}

function writeDb(db: Db) {
  ensureDataFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(db, null, 2));
}

export const store = {
  getAgent(userId: string): AgentState | null {
    const db = readDb();
    return db.agents[userId] ?? null;
  },
  putAgent(state: AgentState) {
    const db = readDb();
    db.agents[state.userId] = state;
    writeDb(db);
  },
};
