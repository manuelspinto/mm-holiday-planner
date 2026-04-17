import { get, put } from 'aws-amplify/api';

const API = 'mmPlannerApi';
const PATH = '/planner';
const LS_KEY = 'mm-planner-data';

let cache = null;        // in-memory mirror of remote state
let fetchPromise = null; // deduplicate concurrent initial loads
let saveTimer = null;

async function fetchRemote() {
  const { body } = await get({ apiName: API, path: PATH }).response;
  return body.json();
}

async function ensureCache() {
  if (cache !== null) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetchRemote()
    .then((data) => { cache = data || {}; })
    .catch(() => {
      try { cache = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { cache = {}; }
    })
    .finally(() => { fetchPromise = null; });
  return fetchPromise;
}

function localFallback(key) {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}')?.[key] ?? null; } catch { return null; }
}

const storage = {
  async get(key) {
    await ensureCache();
    return cache[key] ?? localFallback(key);
  },

  async set(key, value) {
    if (!cache) cache = {};
    cache[key] = value;

    try {
      const local = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      localStorage.setItem(LS_KEY, JSON.stringify({ ...local, [key]: value }));
    } catch {}

    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await put({ apiName: API, path: PATH, options: { body: cache } }).response;
      } catch (err) {
        console.warn('[storage] remote save failed, data is safe in localStorage', err);
      }
    }, 800);
  },

  reset() {
    cache = null;
    fetchPromise = null;
    clearTimeout(saveTimer);
  },
};

export default storage;
