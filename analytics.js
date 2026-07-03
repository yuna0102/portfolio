(function () {
  // ────────────────────────────────────────
  //  ⚙️  Supabase 설정
  // ────────────────────────────────────────
  var SURL = 'https://rvknxniwsrhstwtdwrcl.supabase.co';
  var SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a254bml3c3Joc3R3dGR3cmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzYzNDksImV4cCI6MjA5ODY1MjM0OX0.ikfpw7nAlLCMpka1pd6jfrLn3W8VNYDY9SxgdN1UwN8';
  // ────────────────────────────────────────

  // 세션 ID
  var sid = sessionStorage.getItem('_sid');
  if (!sid) {
    sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    sessionStorage.setItem('_sid', sid);
  }

  // 내 기기 등록: ?_own=1 붙여서 접속
  if (location.search.indexOf('_own=1') !== -1) localStorage.setItem('_own', '1');
  var isOwn = localStorage.getItem('_own') === '1';

  // 재방문 여부
  var isReturn = !!localStorage.getItem('_pv');
  localStorage.setItem('_pv', '1');

  // 기기 감지
  var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  var page = location.pathname;

  // UTM 파라미터 (PDF 등 외부 링크 추적용)
  var params = new URLSearchParams(location.search);
  var utmSource   = params.get('utm_source')   || null;
  var utmMedium   = params.get('utm_medium')   || null;
  var utmCampaign = params.get('utm_campaign') || null;

  function send(table, body, keepalive) {
    fetch(SURL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        apikey: SKEY,
        Authorization: 'Bearer ' + SKEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(body),
      keepalive: !!keepalive
    }).catch(function () {});
  }

  // 페이지 뷰
  send('pv', {
    page: page,
    sid: sid,
    device: device,
    referrer: document.referrer || null,
    is_return: isReturn,
    is_own: isOwn,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign
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

  // 체류시간: 페이지 떠날 때 기록 (keepalive로 안정적 전송)
  var startTime = Date.now();
  var durationSent = false;
  function sendDuration() {
    if (durationSent) return;
    durationSent = true;
    var sec = Math.round((Date.now() - startTime) / 1000);
    if (sec < 2) return;
    send('ev', { sid: sid, page: page, type: 'duration', val: sec, is_own: isOwn }, true);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendDuration();
  });
  window.addEventListener('pagehide', sendDuration);
})();
