'use strict';
(() => {
  let apiPromise;
  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      let done = false;
      const finish = error => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        if (error) { tag.remove(); apiPromise = undefined; reject(error); }
        else resolve(window.YT);
      };
      const timeout = setTimeout(() => finish(new Error('API timeout')), 12000);
      window.onYouTubeIframeAPIReady = () => finish();
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => finish(new Error('API unavailable'));
      document.head.append(tag);
    });
    return apiPromise;
  }
  function validateRange(start, end, duration) {
    if (String(start).trim() === '' || String(end).trim() === '') return null;
    const a = Number(start), b = Number(end);
    return Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b - a >= 1 && duration > 0 && b <= duration ? { start:a, end:b } : null;
  }
  function mount(card, video) {
    const frame = card.querySelector('iframe');
    const status = card.querySelector('[data-player-status]');
    const startInput = card.querySelector('[data-clip-start]');
    const endInput = card.querySelector('[data-clip-end]');
    const repeat = card.querySelector('[data-repeat]');
    const rate = card.querySelector('[data-rate]');
    const message = text => { if (active) status.textContent = text; };
    let player, active = true, ready = false, timer, duration = 0, range = null, jumping = false;
    const storageKey = `gym-clip-v1:${video.id}`;
    const controls = card.querySelectorAll('[data-needs-player]');
    function boundsText() { return range ? `${range.start.toFixed(1)}–${range.end.toFixed(1)} 秒` : '完整示範'; }
    function applyRate() {
      const requested = Number(rate.value);
      player.setPlaybackRate(requested);
      const actual = player.getPlaybackRate();
      if (actual !== requested) { rate.value = String(actual); message('此影片暫不支援所選速度，已使用可用速度。'); }
    }
    function restart() {
      if (!ready || jumping) return;
      jumping = true;
      player.seekTo(range?.start || 0, true);
      player.playVideo();
    }
    function saveRange() {
      try { localStorage.setItem(storageKey, JSON.stringify(range)); }
      catch { message('此瀏覽器無法儲存片段，設定僅在本次頁面保留。'); }
    }
    card.addEventListener('click', event => {
      const action = event.target.closest('[data-player-action]')?.dataset.playerAction;
      if (!action || !ready) return;
      if (action === 'replay') { restart(); message(`重播：${boundsText()}。`); }
      if (action === 'mark-start') startInput.value = player.getCurrentTime().toFixed(1);
      if (action === 'mark-end') endInput.value = Math.min(duration, player.getCurrentTime()).toFixed(1);
      if (action === 'apply') {
        const next = validateRange(startInput.value, endInput.value, duration);
        if (!next) { message(`起點需大於等於 0，終點需晚至少 1 秒且不超過影片長度 ${duration.toFixed(1)} 秒。`); return; }
        range = next; repeat.checked = true; restart();
        message(`已設定循環：${boundsText()}。`); saveRange();
      }
      if (action === 'last-ten') {
        const end = Math.min(duration, player.getCurrentTime());
        if (end < 1) { message('先播放至少 1 秒，再重播剛才片段。'); return; }
        range = { start:Math.max(0,end-10), end };
        startInput.value = range.start.toFixed(1); endInput.value = range.end.toFixed(1);
        repeat.checked = true; restart(); message(`循環剛才片段：${boundsText()}。`); saveRange();
      }
      if (action === 'full') {
        range = null; startInput.value = '0'; endInput.value = duration.toFixed(1);
        restart(); message('已切回完整原片。'); saveRange();
      }
    });
    rate.addEventListener('change', () => { if (ready) applyRate(); });
    repeat.addEventListener('change', () => message(repeat.checked ? `循環已開啟：${boundsText()}。` : '循環已關閉，可使用原播放器自由觀看。'));
    loadAPI().then(YT => {
      if (!active) return;
      player = new YT.Player(frame, {
        events: {
          onReady: () => {
            if (!active) return;
            duration = player.getDuration(); ready = duration > 0;
            controls.forEach(el => { el.disabled = !ready; });
            if (!ready) { message('播放器尚未提供片長，請使用原播放器操作。'); return; }
            const rates = player.getAvailablePlaybackRates();
            [...rate.options].forEach(option => { option.disabled = !rates.includes(Number(option.value)); });
            try {
              const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
              if (stored) range = validateRange(stored.start, stored.end, duration);
            } catch { /* Invalid or unavailable storage leaves full-video playback intact. */ }
            startInput.value = String(range?.start || 0); endInput.value = (range?.end || duration).toFixed(1);
            message(range ? `已載入你的片段：${boundsText()}。按重播開始。` : `原片 ${duration.toFixed(0)} 秒，直接按影片播放；可慢速或重播剛才 10 秒。`);
            timer = setInterval(() => {
              if (!active || !repeat.checked || !range) return;
              const time = player.getCurrentTime();
              if (jumping) { if (time < range.end - 0.2) jumping = false; return; }
              if (player.getPlayerState() === 1 && time >= range.end) restart();
            }, 200);
          },
          onStateChange: event => {
            if (!active || !ready) return;
            if (event.data === 1) { jumping = false; applyRate(); }
            if (event.data === 0 && repeat.checked) { jumping = false; restart(); }
          },
          onAutoplayBlocked: () => message('瀏覽器暫停了自動重播，請點影片的播放鍵繼續。'),
          onError: event => {
            if (!active) return;
            ready = false; clearInterval(timer); controls.forEach(el => { el.disabled = true; });
            message([101,150].includes(event.data) ? '發布者限制站內播放，請使用下方 YouTube 連結。' : '影片暫時無法播放，請使用下方 YouTube 或來源連結；文字教學仍可使用。');
          }
        }
      });
    }).catch(() => message('附加播放工具暫時無法載入；可直接操作上方播放器，或用下方 YouTube 連結。'));
    return () => {
      active = false; clearInterval(timer);
      if (player?.destroy) { try { player.destroy(); } catch { /* Detached iframe. */ } }
    };
  }
  window.GymClips = { mount, validateRange };
})();
