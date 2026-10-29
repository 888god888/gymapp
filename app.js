'use strict';
(() => {
  const DATA = window.GYM_DATA;
  const app = document.getElementById('app');
  if (!Array.isArray(DATA)) {
    app.innerHTML = '<p class="empty">動作資料未載入，請連線後重新整理。</p>';
    return;
  }
  const DB_REVISION = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';
  const PHOTO_ROOT = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${DB_REVISION}/exercises/`;
  const EXERCISES = DATA.flatMap(part => part.x.map((exercise, index) => ({ ...exercise, part: part.k, partName: part.n, index })));
  const EQUIPMENT = { body: '徒手／單雙槓', dumbbell: '啞鈴／壺鈴', barbell: '槓鈴／EZ 槓', cable: '滑輪', machine: '固定器械', other: '其他' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const link = (url, label, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  const urlFor = x => `#exercise/${encodeURIComponent(x.id)}`;
  const videosFor = x => (Array.isArray(window.V?.[x.id]) ? window.V[x.id] : []).filter(v => v && /^[\w-]{11}$/.test(v.id) && /^https:\/\//.test(v.source));
  let saved = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem('gym-favorites-v1') || '[]');
    if (Array.isArray(stored)) saved = new Set(stored.filter(id => EXERCISES.some(x => x.id === id)));
  } catch { /* Storage can be unavailable or contain malformed data. */ }
  const state = { query: '', part: '', equipment: '', media: '', onlySaved: false };
  let returnHash = '#';
  let toastTimer;
  let mediaCleanups = [];
  function toast(message) {
    const el = document.getElementById('notice');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  function footer() {
    return `<footer class="footer"><p>動作幅度與器材設定需依身體比例、活動度及機型調整。先以輕重量練習；如有疼痛，停止並請合格教練或醫療人員協助。</p><p>v10 · 逐步教學與片段重播 · 內容整理：2026.10.29　${link('https://github.com/888god888/gymapp', '專案與更新紀錄')}</p></footer>`;
  }
  function library() {
    document.title = '健身資源庫｜看懂動作，再開始練';
    app.innerHTML = `<div id="update-slot"></div><div class="hero"><p class="eyebrow">MOVE WITH CONFIDENCE</p><h1>${state.onlySaved ? '你的常練動作' : '看懂動作，<br>再開始練。'}</h1><p class="sub">先找器材，再看示範。把正確的操作重點帶進每一組。</p><div class="stats"><span class="tag">${EXERCISES.length} 個動作</span><span class="tag accent">${EXERCISES.filter(x => videosFor(x).length).length} 個附真人影片</span><span class="tag">☆ 可收藏</span></div></div>
      <div class="search-box"><span aria-hidden="true">⌕</span><label class="sr-only" for="search">搜尋動作、肌群或器材</label><input id="search" type="search" placeholder="搜尋動作、肌群或器材，例如：划船" value="${esc(state.query)}" autocomplete="off"></div>
      <span class="filter-label">訓練部位</span><div class="chips" aria-label="訓練部位篩選"><button class="chip" data-part="" aria-pressed="${!state.part}">全部</button>${DATA.map(p => `<button class="chip" data-part="${p.k}" aria-pressed="${state.part === p.k}">${p.e} ${p.n}</button>`).join('')}</div>
      <div class="filters-row"><label>器材<select id="equipment"><option value="">全部器材</option>${Object.entries(EQUIPMENT).map(([key, name]) => `<option value="${key}" ${state.equipment === key ? 'selected' : ''}>${name}</option>`).join('')}</select></label><label>示範內容<select id="media"><option value="">全部動作</option><option value="video" ${state.media === 'video' ? 'selected' : ''}>附真人影片</option></select></label></div>
      <div class="section-head"><h2>${state.onlySaved ? '已收藏' : '動作一覽'}</h2><div class="section-actions"><span id="result-count" class="count" role="status"></span><button id="reset">清除篩選</button></div></div><p class="results-note">點開動作查看要領。影片標示來源；照片是姿勢參考，不能呈現完整動作軌跡。</p><div id="results" class="results"></div>${footer()}`;
    document.getElementById('search').addEventListener('input', e => { state.query = e.target.value; renderResults(); });
    document.getElementById('equipment').addEventListener('change', e => { state.equipment = e.target.value; renderResults(); });
    document.getElementById('media').addEventListener('change', e => { state.media = e.target.value; renderResults(); });
    renderResults();
    renderUpdate();
  }
  function renderResults() {
    const terms = state.query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = EXERCISES.filter(x => {
      const haystack = `${x.n} ${x.q} ${x.eq} ${x.m} ${x.partName}`.normalize('NFKC').toLocaleLowerCase();
      return terms.every(t => haystack.includes(t)) && (!state.part || x.part === state.part) && (!state.equipment || x.equipment === state.equipment) && (!state.media || videosFor(x).length) && (!state.onlySaved || saved.has(x.id));
    });
    document.getElementById('result-count').textContent = `${matches.length} 個動作`;
    document.getElementById('results').innerHTML = matches.length ? matches.map(x => `<a class="item" href="${urlFor(x)}">${x.photoId ? `<img class="thumb" loading="lazy" src="${PHOTO_ROOT}${encodeURIComponent(x.photoId)}/0.jpg" alt="${esc(x.n)} 姿勢參考">` : `<span class="thumb-placeholder" aria-hidden="true">🏋️</span>`}<div class="text"><b>${esc(x.n)}${saved.has(x.id) ? ' ☆' : ''}</b><small>${esc(x.eq)}</small><small>${esc(x.m)}</small><span class="media-tag">${videosFor(x).length ? '▶ 真人影片' : x.photoId ? '▧ 真人照片' : '☰ 文字步驟'}</span></div></a>`).join('') : `<div class="empty">${state.onlySaved && !saved.size ? '還沒有收藏。點開常練動作，按右上方 ☆ 即可加入。' : '沒有符合的動作，試試減少關鍵字或清除篩選。'}</div>`;
  }
  function videoCard(v, index) {
    const params = new URLSearchParams({rel:'0', playsinline:'1', enablejsapi:'1', origin:location.origin});
    return `<div class="panel video-card" data-video-card="${index}"><h3>${esc(v.title)} <small>${v.duration ? `${v.duration} 秒原片` : '完整原片'}</small></h3><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?${esc(params)}" title="${esc(v.publisher)}：${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
      <div class="player-tools"><button data-player-action="replay" data-needs-player disabled>↻ 重播</button><button data-player-action="last-ten" data-needs-player disabled>重播剛才 10 秒</button><label>速度<select data-rate data-needs-player disabled><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option></select></label><label class="check-inline"><input type="checkbox" data-repeat data-needs-player disabled checked>循環</label></div>
      <p class="player-status caption" data-player-status role="status">可直接在頁面內播放。正在連接慢速與片段工具…</p>
      <details class="clip-editor"><summary>只看某一段：設定起點／終點</summary><p class="caption">看完完整動作後，可設定自己想重看的區段。這是播放範圍，不會下載影片。</p><div class="clip-fields"><label>起點（秒）<input type="number" min="0" step="0.1" value="0" data-clip-start data-needs-player disabled></label><button data-player-action="mark-start" data-needs-player disabled>用目前時間作起點</button><label>終點（秒）<input type="number" min="1" step="0.1" data-clip-end data-needs-player disabled></label><button data-player-action="mark-end" data-needs-player disabled>用目前時間作終點</button></div><div class="player-tools"><button data-player-action="apply" data-needs-player disabled>循環這一段</button><button data-player-action="full" data-needs-player disabled>恢復完整原片</button></div></details>
      <div class="video-links">${link(`https://www.youtube.com/watch?v=${v.id}`, '在 YouTube 開啟')}${link(v.source, `${v.publisher} 來源`)}</div><p class="caption">${esc(v.publisher)} · 保留原播放器。影片需連線，可能受發布者、廣告或地區限制；無法嵌入時使用上方連結。</p></div>`;
  }
  function guideMarkup(g) {
    const phases = [
      ['調器材、取重量', g.setup], ['擺好起始姿勢', [g.position]],
      ['完成動作、判斷幅度', [g.drive, g.limit]], ['控制回程', [g.return]],
      ['安全收尾', [g.finish]]
    ];
    return `<section id="steps"><div class="section-head"><h2>照著做：從準備到收尾</h2><button id="practice-toggle" aria-pressed="false">逐步練習</button></div><p class="caption">先讀完並以輕重量試做。逐步模式可一張一張確認；它不會判讀你的實際姿勢。</p><ol class="steps phase-list">${phases.map(([title, lines],i) => `<li class="step-card ${i === 0 ? 'is-current' : ''}"><span class="phase-number">${i+1}</span><div><h3>${title}</h3>${lines.map(line => `<p>${esc(line)}</p>`).join('')}</div></li>`).join('')}</ol><div id="practice-controls" class="practice-controls" hidden><button id="practice-prev">上一步</button><span id="practice-progress" role="status"></span><button id="practice-next">下一步</button></div><div class="two-col"><div class="panel"><h3>呼吸怎麼配</h3><p>${esc(g.breathing)}</p></div><div class="panel"><h3>先用這個節奏練控制</h3><p>${esc(g.tempo)}</p></div></div></section>
    <section id="checks"><h2>做錯時，怎麼改</h2><div class="panel corrections">${g.corrections.map(c => `<div><h3>${esc(c.problem)}</h3><p><b>修正：</b>${esc(c.fix)}</p></div>`).join('')}</div><div class="two-col"><div class="panel"><h3>可能的出力感受</h3><p>${esc(g.feel)}</p><p class="caption">沒有痠感不等於沒練到；以路徑、控制與無疼痛為優先。</p></div><div class="panel easier"><h3>控制不了，先退一階</h3><p>${esc(g.easier)}</p></div></div></section>`;
  }
  function detail(x) {
    document.title = `${x.n}｜健身資源庫`;
    const videos = videosFor(x);
    const g = x.guide;
    const sourceUrl = x.photoId ? `https://github.com/yuhonas/free-exercise-db/blob/${DB_REVISION}/exercises/${encodeURIComponent(x.photoId)}.json` : '';
    app.innerHTML = `<a class="back" href="${esc(returnHash)}">‹ 返回動作列表</a><div class="detail-header"><div><p class="eyebrow">${esc(x.partName)} / EXERCISE GUIDE</p><h1>${esc(x.n)}</h1><p class="sub">${esc(x.q)}</p></div><button class="star" id="save" aria-pressed="${saved.has(x.id)}" aria-label="${saved.has(x.id) ? '取消收藏' : '收藏動作'}">${saved.has(x.id) ? '★' : '☆'}</button></div><div><span class="tag">${esc(x.eq)}</span> <span class="tag">${esc(x.m)}</span></div>
      <div class="cue"><small>這個動作，先記這一句</small><p>${esc(g.checklist[1])}</p></div>
      <nav class="anchor-nav" aria-label="動作內容"><a href="#prep" data-scroll="prep">組前確認</a><a href="#demo" data-scroll="demo">真人示範</a><a href="#steps" data-scroll="steps">逐步操作</a><a href="#checks" data-scroll="checks">訣竅與錯誤</a><a href="#sources" data-scroll="sources">參考來源</a></nav>
      <section id="prep"><h2>每組開始前，確認這 3 件事</h2><div class="panel prep-panel">${g.checklist.map((line,i) => `<label class="prep-check"><input type="checkbox" data-prep="${i}"><span>${esc(line)}</span></label>`).join('')}<p class="caption" id="prep-status" role="status">已確認 0 / 3 · 每次開啟動作會重新開始，不代表姿勢已通過檢測。</p></div></section>
      <section id="demo"><div class="section-head"><h2>真人示範</h2><span class="count">${videos.length ? '頁內播放 · 可慢速重播' : '姿勢參考'}</span></div>${videos.length ? videos.map(videoCard).join('') : '<div class="no-video"><p>此動作尚未收錄對應的真人影片。</p><p class="caption">先參考下方照片與步驟；不以其他版本的動作代替示範。</p></div>'}
      ${x.photoId ? `<details class="photo-panel"><summary>真人姿勢照片（點開參考）</summary><div class="pair">${[0, 1].map(i => `<figure><a href="${PHOTO_ROOT}${encodeURIComponent(x.photoId)}/${i}.jpg" target="_blank" rel="noopener noreferrer" aria-label="放大${esc(x.n)}姿勢照片 ${i + 1}"><img src="${PHOTO_ROOT}${encodeURIComponent(x.photoId)}/${i}.jpg" alt="${esc(x.n)} 姿勢照片 ${i + 1}" loading="lazy"></a><figcaption>姿勢 ${i === 0 ? 'A' : 'B'} · 點圖放大</figcaption></figure>`).join('')}</div><p class="caption">照片來源：free-exercise-db／${esc(x.photoName)}。兩張靜態照片不是連續動圖，也不表示唯一正確幅度；器械外觀與機型可能不同。</p></details>` : '<p class="caption">目前沒有相同版本的照片。</p>'}</section>
      ${guideMarkup(g)}
      <section id="sources"><h2>參考來源</h2><div class="panel">${x.sources.map(s => link(s.url, s.label, 'source-link')).join('')}${videos.map(v => link(v.source, `${v.publisher}：影片出處（${v.checked} 核對來源）`, 'source-link')).join('')}${x.photoId ? link(sourceUrl, `照片與原始動作資料：${x.photoName}`, 'source-link') : ''}${link('https://www.acefitness.org/resources/everyone/exercise-library/', 'ACE 動作資料庫（延伸閱讀）', 'source-link')}</div><p class="caption">文字為中文整理；參考來源不代表逐項經該機構審核。影片、照片可能採用不同教學節奏與幅度。</p></section>
      <section><h3>想找其他教學？</h3><p class="caption">以下是搜尋結果，未逐支核對內容。</p><div class="video-links">${link(`https://www.youtube.com/results?search_query=${encodeURIComponent(x.n + ' 教學 正確姿勢')}`, '搜尋中文教學')}${link(`https://www.youtube.com/results?search_query=${encodeURIComponent(x.q + ' tutorial')}`, '搜尋英文教學')}</div></section>${footer()}`;
    document.getElementById('save').addEventListener('click', e => {
      const next = new Set(saved);
      if (next.has(x.id)) next.delete(x.id); else next.add(x.id);
      let persisted = true;
      try { localStorage.setItem('gym-favorites-v1', JSON.stringify([...next])); } catch { persisted = false; }
      saved = next;
      e.currentTarget.setAttribute('aria-pressed', String(saved.has(x.id)));
      e.currentTarget.setAttribute('aria-label', saved.has(x.id) ? '取消收藏' : '收藏動作');
      e.currentTarget.textContent = saved.has(x.id) ? '★' : '☆';
      toast(persisted ? (saved.has(x.id) ? '已加入收藏' : '已取消收藏') : '此瀏覽器無法儲存，收藏僅在本次開啟保留');
    });
    app.querySelectorAll('[data-prep]').forEach(input => input.addEventListener('change', () => {
      const count = app.querySelectorAll('[data-prep]:checked').length;
      document.getElementById('prep-status').textContent = `已確認 ${count} / 3 · 每次開啟動作會重新開始，不代表姿勢已通過檢測。`;
    }));
    let practice = false, phase = 0;
    const phaseList = app.querySelector('.phase-list');
    const cards = [...app.querySelectorAll('.step-card')];
    const drawPractice = () => {
      phaseList.classList.toggle('practice-active', practice);
      document.getElementById('practice-controls').hidden = !practice;
      const toggle = document.getElementById('practice-toggle');
      toggle.setAttribute('aria-pressed', String(practice));
      toggle.textContent = practice ? '顯示完整流程' : '逐步練習';
      cards.forEach((card,i) => card.classList.toggle('is-current', i === phase));
      document.getElementById('practice-progress').textContent = `步驟 ${phase + 1} / ${cards.length}`;
      document.getElementById('practice-prev').disabled = phase === 0;
      document.getElementById('practice-next').disabled = phase === cards.length - 1;
    };
    document.getElementById('practice-toggle').onclick = () => { practice = !practice; drawPractice(); };
    document.getElementById('practice-prev').onclick = () => { phase = Math.max(0,phase-1); drawPractice(); };
    document.getElementById('practice-next').onclick = () => { phase = Math.min(cards.length-1,phase+1); drawPractice(); };
    app.querySelectorAll('[data-video-card]').forEach(card => {
      mediaCleanups.push(window.GymClips.mount(card, videos[Number(card.dataset.videoCard)]));
    });
  }
  app.addEventListener('click', e => {
    const scroll = e.target.closest('[data-scroll]');
    if (scroll) { e.preventDefault(); document.getElementById(scroll.dataset.scroll)?.scrollIntoView(); return; }
    const part = e.target.closest('[data-part]');
    if (part) {
      state.part = part.dataset.part;
      app.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.part === state.part)));
      renderResults();
    }
    if (e.target.closest('#reset')) {
      Object.assign(state, { query: '', equipment: '', part: '', media: '' });
      library();
    }
  });
  app.addEventListener('error', e => {
    if (e.target.tagName !== 'IMG') return;
    const image = e.target;
    const replacement = document.createElement('span');
    if (image.classList.contains('thumb')) { replacement.className = 'thumb-placeholder'; replacement.textContent = '🏋️'; }
    else { replacement.className = 'photo-error'; replacement.textContent = '圖片暫時無法載入，請參考步驟或來源連結。'; }
    image.replaceWith(replacement);
  }, true);
  function route() {
    mediaCleanups.forEach(cleanup => cleanup());
    mediaCleanups = [];
    const hash = location.hash.slice(1);
    let parts;
    try { parts = hash.split('/').map(decodeURIComponent); } catch { parts = []; }
    let x;
    if (parts[0] === 'exercise' && parts.length === 2) x = EXERCISES.find(x => x.id === parts[1]);
    else if (parts.length === 2 && /^\d+$/.test(parts[1])) x = EXERCISES.find(x => x.part === parts[0] && x.index === Number(parts[1]));
    if (x) {
      if (!document.getElementById('results')) returnHash = DATA.some(p => p.k === parts[0]) ? `#${x.part}` : '#';
      detail(x);
    } else if (parts.length === 1 && ['', 'saved', ...DATA.map(p => p.k)].includes(parts[0])) {
      state.onlySaved = parts[0] === 'saved';
      if (DATA.some(p => p.k === parts[0])) state.part = parts[0];
      returnHash = location.hash || '#';
      library();
    } else {
      document.title = '找不到動作｜健身資源庫';
      app.innerHTML = '<div class="empty"><h1>找不到這個動作</h1><p>連結可能不完整，請回到列表重新選擇。</p><a href="#">回到動作列表</a></div>';
    }
    window.scrollTo(0, 0);
  }
  let updateAvailable = false;
  function renderUpdate() {
    const slot = document.getElementById('update-slot');
    if (slot && updateAvailable) {
      slot.innerHTML = '<div class="update"><span>新版已準備好，重新整理即可套用。</span><button id="apply-update">更新 APP</button></div>';
      document.getElementById('apply-update').onclick = () => location.reload();
    }
  }
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator) {
    const alreadyControlled = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(registration => registration.update()).catch(() => { /* Online browsing still works without offline cache. */ });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (alreadyControlled) { updateAvailable = true; renderUpdate(); }
    });
  }
})();
