const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.createContext(context);
for (const file of ['data.js', 'guides.js', 'machines.js', 'videos.js', 'media.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
const data = context.window.GYM_DATA;
const exercises = data.flatMap(p => p.x);
const videos = context.window.V;
test('all original 71 links retain their exercise, with 20 appended machine guides', () => {
  const legacy=JSON.parse(fs.readFileSync('tests/legacy-ids.json','utf8'));
  for(const p of legacy) assert.deepEqual(Array.from(data.find(part=>part.k===p.k).x.slice(0,p.ids.length),x=>x.id),p.ids);
  assert.equal(exercises.length,91);
  assert.equal(new Set(exercises.map(x=>x.id)).size,91);
  assert.equal(exercises.filter(x=>x.added==='2026-11-09').length,20);
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
    caches: { keys: async () => ['gym-v8', prefix + 'v8', prefix + 'v11', prefix + 'media-v1', 'another-app-cache'], delete: async key => removed.push(key) },
    URL, Request, Response,
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), worker);
  let work;
  handlers.activate({ waitUntil: p => { work = p; } });
  await work;
  assert.deepEqual(removed.sort(), ['gym-v8', prefix + 'v8'].sort());
  assert.ok(claimed);
});

test('every exercise includes setup, path, range, return, safe exit and actionable corrections', () => {
  for (const x of exercises) {
    const g=x.guide;
    for (const f of ['position','drive','limit','return','finish','breathing','tempo','feel','easier']) assert.ok(typeof g[f] === 'string' && g[f].trim().length > 0, `${x.id}: ${f}`);
    assert.equal(g.checklist.length,3);
    assert.ok(g.setup.length>=2);
    assert.ok(g.corrections.length>=2 && g.corrections.every(c=>c.problem && c.fix.length>12));
  }
  assert.equal(new Set(exercises.map(x=>x.guide.drive)).size,91);
});
test('clip times must be finite, ordered and inside the actual duration', () => {
  const validate=context.window.GymClips.validateRange;
  assert.equal(validate('',10,25),null);
  assert.equal(validate(0,'',25),null);
  for(const [a,b,d] of [[-1,5,25],[5,4,25],[0,30,25],[0,Infinity,25],[NaN,10,25],[0,10,0],[1,1.5,25]]) assert.equal(validate(a,b,d),null);
  assert.equal(validate(3,13,25).start,3);
  assert.equal(validate(0,25,25).end,25);
});
test('all new assets are included in the versioned offline shell', () => {
  const shell=fs.readFileSync('sw.js','utf8'),html=fs.readFileSync('index.html','utf8');
  for(const file of ['guides.js','machines.js','media.js','data.js','videos.js','app.js','styles.css']) {
    assert.ok(shell.includes(file+'?v=11')); assert.ok(html.includes(file+'?v=11'));
  }
});

test('machine categories include dedicated cable stations and distinguish assisted loads', () => {
  const byID=Object.fromEntries(exercises.map(x=>[x.id,x]));
  assert.equal(byID['Wide-Grip_Lat_Pulldown'].equipment,'machine');
  assert.equal(byID.Seated_Cable_Rows.equipment,'machine');
  assert.equal(byID.Smith_Machine_Squat.equipment,'smith');
  assert.equal(byID.Cable_Crossover.equipment,'cable');
  for(const id of ['M_Assisted_Pullup','M_Assisted_Dip']) {
    assert.match(byID[id].machineTip,/越(?:大|重).*越多/);
    assert.match(byID[id].guide.finish,/固定台階|固定台/);
    assert.equal(byID[id].loading,'配重提供輔助');
  }
  assert.match(byID.Thigh_Abductor.machineTip,/外展.*向外/);
  assert.match(byID.Thigh_Adductor.machineTip,/內收.*向內/);
  for(const x of exercises.filter(x=>x.added)) {
    assert.ok(x.recognize && x.machineTip && x.sources[0]?.url);
    assert.ok(['machine','smith'].includes(x.equipment));
  }
});
test('new demonstrations must not substitute seated and lying leg-curl versions', () => {
  assert.equal(videos.Lying_Leg_Curls[0].id,'Dq5y4WEcqqo');
  assert.notEqual(videos.Lying_Leg_Curls[0].id,videos.Seated_Leg_Curl[0].id);
  assert.equal(videos.Calf_Press_On_The_Leg_Press_Machine[0].id,'8k435cj30gc');
});
