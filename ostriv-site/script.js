(function () {
  /* Сторінки */
  var views = document.querySelectorAll('[data-view]');
  var links = document.querySelectorAll('[data-link]');
  var names = ['home', 'menu'];
  function route() {
    var h = (location.hash || '').replace('#', '');
    if (names.indexOf(h) === -1) h = 'home';
    views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== h; });
    links.forEach(function (a) {
      if (a.getAttribute('data-link') === h) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  /* Вікно контактів */
  var overlay = document.getElementById('contacts-overlay');
  overlay.hidden = true;
  var closeBtn = document.getElementById('contacts-close');
  var lastFocus = null;
  function openContacts() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeContacts() {
    overlay.hidden = true;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-contacts]').forEach(function (b) {
    b.addEventListener('click', openContacts);
  });
  closeBtn.addEventListener('click', closeContacts);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeContacts(); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { closeContacts(); return; }
    if (e.key === 'Tab') {
      var f = overlay.querySelectorAll('a[href], button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Острів із контурних ліній */
  var svg = document.getElementById('island');
  var NS = 'http://www.w3.org/2000/svg';
  function ring(r, seed) {
    var d = '', n = 140;
    for (var i = 0; i <= n; i++) {
      var a = (i / n) * Math.PI * 2;
      var k = 1 + 0.10 * Math.sin(3 * a + seed) + 0.06 * Math.sin(5 * a + seed * 2.1) + 0.035 * Math.sin(9 * a + seed * 3.3);
      var x = Math.cos(a) * r * k, y = Math.sin(a) * r * k * 0.92;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + 'Z';
  }
  function add(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    svg.appendChild(el);
    return el;
  }
  var radii = [270, 238, 206, 174, 142, 110, 78];
  radii.forEach(function (r, i) {
    add('path', {
      d: ring(r, 0.6 + i * 0.07),
      fill: i === radii.length - 1 ? '#1d3a3d' : 'none',
      stroke: i > 4 ? '#3f6a6d' : '#2b4a4d',
      'stroke-width': i === radii.length - 1 ? 2 : 1.4
    });
  });
  add('circle', { cx: 6, cy: -4, r: 7, fill: '#ff6b2c', 'class': 'pulse' });
  add('circle', { cx: 6, cy: -4, r: 7, fill: '#ff6b2c' });
  var t = add('text', { x: 24, y: 2 });
  t.textContent = 'Ми тут';

  /* Відчинено чи зачинено зараз (час за Києвом) */
  function kyivHour() {
    var zones = ['Europe/Kyiv', 'Europe/Kiev'];
    for (var z = 0; z < zones.length; z++) {
      try {
        var parts = new Intl.DateTimeFormat('en-GB', { timeZone: zones[z], hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
        var hh = 0, mm = 0;
        parts.forEach(function (p) { if (p.type === 'hour') hh = (+p.value) % 24; if (p.type === 'minute') mm = +p.value; });
        return hh + mm / 60;
      } catch (e) { /* пробуємо наступну назву зони */ }
    }
    return null;
  }
  function updateStatus() {
    var h = kyivHour();
    if (h === null) return;
    var open = h >= 8 && h < 22;
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.hidden = false;
      el.className = 'status ' + (open ? 'open' : 'closed');
      el.querySelector('span').textContent = open ? 'Зараз відчинено, працюємо до 22:00' : 'Зараз зачинено, відчиняємось о 8:00';
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* Маленька мапа в стилі сайту (схематична) */
  var blocks = [[18,16,92,52],[126,16,66,52],[212,16,84,52],[316,16,70,52],[18,112,70,48],[104,120,70,40],[300,100,86,44],[18,186,80,40],[300,176,86,50]];
  var roads = [
    ['M-10 92 L410 118', 7], ['M112 -10 L150 250', 5], ['M270 -10 L246 250', 5],
    ['M-10 168 L410 70', 3], ['M0 40 L400 30', 2], ['M-10 214 L410 220', 2]
  ];
  var html = '<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="240" fill="#102226"/>';
  blocks.forEach(function (b) { html += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="6" fill="#16292d"/>'; });
  html += '<path d="M-10 196 C70 150 140 236 230 204 S350 150 410 176" fill="none" stroke="#1b4146" stroke-width="20" stroke-linecap="round"/>';
  roads.forEach(function (r) { html += '<path d="' + r[0] + '" fill="none" stroke="#2f5256" stroke-width="' + r[1] + '" stroke-linecap="round"/>'; });
  html += '<circle cx="204" cy="104" r="10" fill="#ff6b2c" class="pulse"/><circle cx="204" cy="104" r="10" fill="#ff6b2c"/><circle cx="204" cy="104" r="3.6" fill="#1a0d06"/></svg>';
  document.querySelectorAll('[data-minimap]').forEach(function (box) { box.innerHTML = html; });
})();
