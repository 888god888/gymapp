const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.createContext(context);
for (const file of ['data.js', 'videos.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
const data = context.window.GYM_DATA;
const exercises = data.flatMap(p => p.x);
const videos = context.window.V;
test('all 71 stable exercise IDs and legacy index positions are retained', () => {
  assert.deepEqual(Array.from(data, p => p.x.length), [13, 15, 15, 9, 8, 11]);
  assert.equal(new Set(exercises.map(x => x.id)).size, 71);
  for (const x of exercises) {
    for (const field of ['id', 'n', 'q', 'eq', 'm', 'cue', 'equipment']) assert.ok(x[field], `${x.id}: ${field}`);
    for (const field of ['s', 't', 'w']) assert.ok(Array.isArray(x[field]) && x[field].every(s => s.trim()), `${x.id}: ${field}`);
    assert.ok(x.s.length >= 3);
    assert.ok(x.photoId === null || /^[\w-]+$/.test(x.photoId), x.id);
  }
});
test('videos are exercise-specific and include traceable sources', () => {
  assert.ok(Object.keys(videos).length >= 15);
  for (const [id, items] of Object.entries(videos)) {
    assert.ok(exercises.some(x => x.id === id));
    for (const v of items) {
      assert.match(v.id, /^[\w-]{11}$/);
      assert.ok(['www.nasm.org', 'www.catalystathletics.com'].includes(new URL(v.source).hostname));
      assert.ok(v.publisher && v.title && /^\d{4}-\d{2}-\d{2}$/.test(v.checked));
    }
  }
});
test('distinct variants cannot silently reuse the wrong demonstration', () => {
  const byID = Object.fromEntries(exercises.map(x => [x.id, x]));
  assert.equal(byID.Barbell_Shoulder_Press.photoId, 'Standing_Military_Press');
  assert.equal(byID.X_Seated_BB_Press.photoId, 'Seated_Barbell_Military_Press');
  assert.equal(byID.Cable_Russian_Twists.photoId, null);
  assert.notEqual(byID.Hammer_Curls.photoId, byID.Dumbbell_Bicep_Curl.photoId);
  assert.notEqual(byID.Arnold_Dumbbell_Press.photoId, byID.Dumbbell_Shoulder_Press.photoId);
  assert.match(byID.Side_Lateral_Raise.s.join(''), /拇指朝前或略朝上/);
});
test('no synthetic pose engine or unsafe HTML event handlers remain', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.doesNotMatch(html, /onclick=|const TP=|function pose\(/);
  assert.doesNotMatch(fs.readFileSync('app.js', 'utf8'), /onerror=|onclick=/);
});
test('service worker removes only legacy or old app caches and preserves unrelated data', async () => {
  const handlers = {};
  const scope = 'https://example.test/gymapp/';
  const prefix = `gym-guide-${encodeURIComponent(scope)}-`;
  const removed = [];
  let claimed = false;
  const worker = {
    self: { registration: { scope }, addEventListener: (name, fn) => { handlers[name] = fn; }, clients: { claim: async () => { claimed = true; } } },
    caches: { keys: async () => ['gym-v8', prefix + 'v8', prefix + 'v9', prefix + 'media-v1', 'another-app-cache'], delete: async key => removed.push(key) },
    URL, Request, Response,
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), worker);
  let work;
  handlers.activate({ waitUntil: p => { work = p; } });
  await work;
  assert.deepEqual(removed.sort(), ['gym-v8', prefix + 'v8'].sort());
  assert.ok(claimed);
});
