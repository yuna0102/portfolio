(function () {
  // ────────────────────────────────────────
  //  ⚙️  Supabase 설정 — 값 입력 필요
  // ────────────────────────────────────────
  var SURL = 'https://rvknxniwsrhstwtdwrcl.supabase.co';
  var SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a254bml3c3Joc3R3dGR3cmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzYzNDksImV4cCI6MjA5ODY1MjM0OX0.ikfpw7nAlLCMpka1pd6jfrLn3W8VNYDY9SxgdN1UwN8';
  // ────────────────────────────────────────

  // 세션 ID (탭 단위 유지)
  var sid = sessionStorage.getItem('_sid');
  if (!sid) {
    sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    sessionStorage.setItem('_sid', sid);
  }

  // 내 기기 등록: URL에 ?_own=1 붙여서 접속하면 이후 모든 방문에 is_own=true 기록
  if (location.search.indexOf('_own=1') !== -1) localStorage.setItem('_own', '1');
  var isOwn = localStorage.getItem('_own') === '1';

  // 재방문 여부
  var isReturn = !!localStorage.getItem('_pv');
  localStorage.setItem('_pv', '1');

  // 기기 감지
  var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  var page = location.pathname;

  function send(table, body) {
    fetch(SURL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        apikey: SKEY,
        Authorization: 'Bearer ' + SKEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(body)
    }).catch(function () {});
  }

  // 페이지 뷰
  send('pv', {
    page: page,
    sid: sid,
    device: device,
    referrer: document.referrer || null,
    is_return: isReturn,
    is_own: isOwn
  });

  // 스크롤 깊이 (25 / 50 / 75 / 100%)
  var scrolled = {};
  window.addEventListener('scroll', function () {
    var el = document.documentElement;
    var pct = Math.round(window.scrollY / Math.max(el.scrollHeight - el.clientHeight, 1) * 100);
    [25, 50, 75, 100].forEach(function (t) {
      if (pct >= t && !scrolled[t]) {
        scrolled[t] = true;
        send('ev', { sid: sid, page: page, type: 'scroll', val: t, is_own: isOwn });
      }
    });
  }, { passive: true });

  // 클릭 이벤트
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button, [data-track]');
    if (!el) return;
    var label = (el.getAttribute('data-track') || el.innerText || '').trim().slice(0, 100);
    var href = el.href || null;
    send('ev', { sid: sid, page: page, type: 'click', label: label, href: href, is_own: isOwn });
  });
})();
