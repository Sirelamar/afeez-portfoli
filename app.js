/* Afeez Oyewumi portfolio: interactions + "You Draw It" data game. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var cssVar = function (n) { return getComputedStyle(doc).getPropertyValue(n).trim(); };

  /* ---------- Loader ---------- */
  (function loader() {
    if (!doc.classList.contains('is-loading')) return;
    var el = $('.loader'), msg = $('#loaderMsg');
    var msgs = ['Loading data…', 'Cleaning 10,000+ records…', 'Running regressions…', 'Rendering dashboard…'];
    var i = 0, timer = setInterval(function () { i = (i + 1) % msgs.length; if (msg) msg.textContent = msgs[i]; }, 340);
    var finish = function () {
      clearInterval(timer);
      if (el) el.classList.add('done');
      setTimeout(function () { doc.classList.remove('is-loading'); }, 500);
      try { sessionStorage.setItem('loaded', '1'); } catch (e) {}
      revealVisibleNow();
    };
    setTimeout(finish, reduceMotion ? 200 : 1400);
  })();

  /* ---------- Year ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  var themeBtn = $('#themeToggle');
  function setTheme(t) {
    doc.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    var meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', t === 'light' ? '#fbf8f3' : '#0b0f17');
    drawSpark(); if (game) game.draw();
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    setTheme(doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menuBtn'), links = $('#navLinks');
  function closeMenu() { if (!links) return; links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) { if (!links.contains(e.target) && e.target !== menuBtn) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Scroll: nav state, progress bar, back-to-top ---------- */
  var nav = $('#nav'), bar = $('#progressBar'), toTop = $('#toTop'), ticking = false;
  function onScroll() {
    var st = window.scrollY || doc.scrollTop, h = doc.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', st > 10);
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', st > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  reveals.forEach(function (el, i) {
    el.style.transitionDelay = (el.closest('.hero') ? i * 70 : 0) + 'ms';
    if (io) io.observe(el); else el.classList.add('in');
  });
  function revealVisibleNow() {
    reveals.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); });
  }
  if (!doc.classList.contains('is-loading')) revealVisibleNow();

  /* ---------- Active nav link ---------- */
  if ('IntersectionObserver' in window && links) {
    var map = {};
    $$('a[href^="#"]', links).forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          Object.keys(map).forEach(function (k) { map[k].classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }

  /* ---------- Typed roles ---------- */
  var typedEl = $('#typed');
  if (typedEl && !reduceMotion) {
    var roles = ['dashboards', 'data pipelines', 'SQL databases', 'statistical tests', "insights on Nigeria's economy"];
    var r = 0, c = roles[0].length, deleting = true;
    var tick = function () {
      var delay;
      if (deleting) {
        c--; typedEl.textContent = roles[r].slice(0, c) || '\u00a0';
        if (c <= 0) { deleting = false; r = (r + 1) % roles.length; }
        delay = 40;
      } else {
        c++; typedEl.textContent = roles[r].slice(0, c);
        if (c >= roles[r].length) { deleting = true; delay = 1800; } else delay = 75;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- Counters ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 1400;
    if (reduceMotion) { el.textContent = end.toLocaleString('en-US') + suf; return; }
    (function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-US') + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { runCounter(x.target); cObs.unobserve(x.target); } }); }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Copy email ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(m) { if (!toastEl) return; toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200); }
  var copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');
    var done = function () { toast('Email copied: ' + email); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email); done(); });
    else { fallbackCopy(email); done(); }
  });
  function fallbackCopy(t) { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); }

  /* ---------- Hero sparkline (fuel share of imports, 2010-2025) ---------- */
  var FUEL = [1.36, 9.89, 2.37, 20.17, 16.34, 18.51, 28.58, 27.95, 29.71, 15.56, 15.29, 31.01, 39.57, 33.44, 38.02, 33.18];
  function drawSpark() {
    var cv = $('#spark'); if (!cv || !cv.getContext) return;
    var dpr = window.devicePixelRatio || 1, w = 150, h = 40; cv.width = w * dpr; cv.height = h * dpr;
    var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var max = 40, pts = FUEL.map(function (v, i) { return [i * (w - 4) / (FUEL.length - 1) + 2, h - 3 - (v / max) * (h - 6)]; });
    var g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, cssVar('--accent')); g.addColorStop(1, cssVar('--accent-2'));
    ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    var last = pts[pts.length - 1]; ctx.beginPath(); ctx.arc(last[0], last[1], 3, 0, Math.PI * 2); ctx.fillStyle = cssVar('--accent-2'); ctx.fill();
  }
  drawSpark();

  /* ================= "You Draw It" game ================= */
  var DATA = {
    naira: {
      title: 'Naira per US dollar (official, yearly average)',
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      values: [150.3, 153.9, 157.5, 157.3, 158.6, 192.4, 253.5, 305.8, 306.1, 306.9, 358.8, 401.2, 426.0, 645.2, 1479.0, 1518.4],
      known: 7, yMax: 1600,
      fmt: function (v) { return '₦' + Math.round(v).toLocaleString('en-US'); },
      axis: function (v) { return '₦' + Math.round(v).toLocaleString('en-US'); },
      insight: 'The official rate barely moved from 2017 to 2019, then the 2023 FX unification took it from ₦426 (2022) to ₦1,479 in 2024.',
      source: 'Source: World Bank WDI (PA.NUS.FCRF), from my Nigeria Import Trends project.'
    },
    fuel: {
      title: "Mineral fuels as a share of Nigeria's imports",
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      values: FUEL, known: 6, yMax: 40,
      fmt: function (v) { return v.toFixed(1) + '%'; },
      axis: function (v) { return Math.round(v) + '%'; },
      insight: 'Nigeria exports crude oil but imports refined fuel. The share swung from 15% in 2020 to a peak of 39.6% in 2022.',
      source: 'Source: UN Comtrade, HS chapter 27, from my Nigeria Import Trends project.'
    },
    btc: {
      title: 'Bitcoin price at year end (US$)',
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      values: [3702.9, 7195.2, 28923.6, 46216.9, 16542.4, 42283.6, 93576.0, 87648.2],
      known: 2, yMax: 100000,
      fmt: function (v) { return '$' + Math.round(v).toLocaleString('en-US'); },
      axis: function (v) { return v >= 1000 ? '$' + Math.round(v / 1000) + 'k' : '$' + Math.round(v); },
      insight: 'Bitcoin fell 64% in 2022, then more than doubled in both 2023 and 2024 before slipping 6% in 2025.',
      source: 'Source: Binance BTC/USDT daily closes, from my Nigeria Crypto project.'
    }
  };

  var game = null;
  var cv = $('#game');
  if (cv && cv.getContext) game = createGame(cv);

  function createGame(canvas) {
    var ctx = canvas.getContext('2d');
    var ds = DATA.naira, guesses = [], revealed = false, progress = 0, drawing = false, lastIdx = null, W = 0, H = 0;
    var revealBtn = $('#revealBtn'), resetBtn = $('#resetBtn'), result = $('#result'), hint = $('#drawHint');
    var titleEl = $('#gameTitle'), hintEl = $('#gameHint'), srcEl = $('#gameSource');

    function pad() { return W < 480 ? { l: 50, r: 14, t: 18, b: 30 } : { l: 64, r: 22, t: 22, b: 34 }; }
    function xOf(i) { var p = pad(); return p.l + i * (W - p.l - p.r) / (ds.years.length - 1); }
    function yOf(v) { var p = pad(); return p.t + (1 - v / ds.yMax) * (H - p.t - p.b); }
    function vOf(py) { var p = pad(); return Math.max(0, Math.min(ds.yMax, (1 - (py - p.t) / (H - p.t - p.b)) * ds.yMax)); }

    function resize() {
      var rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function load(key) {
      ds = DATA[key]; guesses = ds.years.map(function () { return null; });
      revealed = false; progress = 0; lastIdx = null;
      if (titleEl) titleEl.textContent = ds.title;
      if (hintEl) hintEl.textContent = 'Shown up to ' + ds.years[ds.known] + '. Drag across the shaded area to draw ' + ds.years[ds.known + 1] + '–' + ds.years[ds.years.length - 1] + '.';
      if (srcEl) srcEl.textContent = ds.source;
      if (result) result.innerHTML = '';
      if (hint) hint.classList.remove('hide');
      if (revealBtn) revealBtn.disabled = true;
      draw();
    }

    function line(points, color, width, dash) {
      if (points.length < 2) return;
      ctx.save(); ctx.beginPath();
      points.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (dash) ctx.setLineDash(dash);
      ctx.stroke(); ctx.restore();
    }
    function dot(x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }

    function draw() {
      if (!W) return;
      var p = pad(), n = ds.years.length;
      var muted = cssVar('--muted'), border = cssVar('--border'), accent = cssVar('--accent'), accent2 = cssVar('--accent-2'), data = cssVar('--data'), text = cssVar('--text');
      ctx.clearRect(0, 0, W, H);
      ctx.font = '11px "JetBrains Mono", monospace';

      // draw zone
      var zx = xOf(ds.known);
      ctx.fillStyle = 'rgba(242,165,65,0.07)'; ctx.fillRect(zx, p.t, W - p.r - zx, H - p.t - p.b);
      ctx.save(); ctx.setLineDash([4, 5]); ctx.strokeStyle = accent2; ctx.globalAlpha = .6;
      ctx.beginPath(); ctx.moveTo(zx, p.t); ctx.lineTo(zx, H - p.b); ctx.stroke(); ctx.restore();

      // grid + y labels
      ctx.fillStyle = muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (var g = 0; g <= 4; g++) {
        var v = ds.yMax * g / 4, yy = yOf(v);
        ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.l, yy); ctx.lineTo(W - p.r, yy); ctx.stroke();
        ctx.fillText(ds.axis(v), p.l - 8, yy);
      }
      // x labels
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      var every = W < 420 ? (n > 10 ? 3 : 2) : (W < 700 && n > 10 ? 2 : 1);
      ds.years.forEach(function (yr, i) { if (i % every === 0 || i === n - 1) ctx.fillText(W < 480 ? "'" + String(yr).slice(2) : yr, xOf(i), H - p.b + 9); });

      // known line
      var known = [];
      for (var i = 0; i <= ds.known; i++) known.push([xOf(i), yOf(ds.values[i])]);
      line(known, accent, 3);
      known.forEach(function (pt) { dot(pt[0], pt[1], 3.5, accent); });

      // user guess
      var gpts = [[xOf(ds.known), yOf(ds.values[ds.known])]];
      for (var j = ds.known + 1; j < n; j++) { if (guesses[j] == null) break; gpts.push([xOf(j), yOf(guesses[j])]); }
      line(gpts, data, 3, revealed ? [7, 6] : null);
      gpts.slice(1).forEach(function (pt) { dot(pt[0], pt[1], 3, data); });

      // actual (animated)
      if (revealed) {
        var segs = (n - 1 - ds.known) * progress, act = [[xOf(ds.known), yOf(ds.values[ds.known])]];
        for (var k = ds.known + 1; k < n; k++) {
          var f = Math.min(1, Math.max(0, segs - (k - ds.known - 1)));
          if (f <= 0) break;
          var x0 = xOf(k - 1), y0 = yOf(ds.values[k - 1]), x1 = xOf(k), y1 = yOf(ds.values[k]);
          act.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
          if (f < 1) break;
        }
        line(act, accent2, 3.5);
        act.slice(1).forEach(function (pt) { dot(pt[0], pt[1], 3.5, accent2); });
        if (progress >= 1) {
          var lx = xOf(n - 1), ly = yOf(ds.values[n - 1]);
          ctx.fillStyle = text; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.font = '600 12px Inter, sans-serif';
          var below = ly < p.t + 40; ctx.textBaseline = below ? 'top' : 'bottom'; ctx.fillText('Actual ' + ds.fmt(ds.values[n - 1]), lx - 6, below ? ly + 10 : ly - 8);
        }
      }
      // legend
      ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      var lgx = p.l + 8, lgy = p.t + 10;
      [[accent, 'Shown'], [data, 'Your guess']].concat(revealed ? [[accent2, 'Actual']] : []).forEach(function (it) {
        ctx.fillStyle = it[0]; ctx.fillRect(lgx, lgy - 2, 14, 4); ctx.fillStyle = muted; ctx.fillText(it[1], lgx + 19, lgy); lgx += ctx.measureText(it[1]).width + 38;
      });
    }

    function point(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function setGuess(pt) {
      var p = pad(), n = ds.years.length, step = (W - p.l - p.r) / (n - 1);
      var idx = Math.round((pt.x - p.l) / step);
      if (idx <= ds.known) idx = ds.known + 1;
      if (idx > n - 1) idx = n - 1;
      var v = vOf(pt.y);
      if (lastIdx != null && Math.abs(idx - lastIdx) > 1) {
        var a = Math.min(idx, lastIdx), b = Math.max(idx, lastIdx), va = guesses[lastIdx];
        for (var i = a + 1; i < b; i++) { var t = (i - lastIdx) / (idx - lastIdx); guesses[i] = va + (v - va) * t; }
      }
      // fill any gap between the last shown year and the first drawn point
      for (var j = ds.known + 1; j < idx; j++) if (guesses[j] == null) {
        var from = ds.values[ds.known], tt = (j - ds.known) / (idx - ds.known); guesses[j] = from + (v - from) * tt;
      }
      guesses[idx] = v; lastIdx = idx;
      if (hint) hint.classList.add('hide');
      var complete = guesses.slice(ds.known + 1).every(function (g) { return g != null; });
      if (revealBtn) revealBtn.disabled = !complete;
      if (hintEl && !complete) hintEl.textContent = 'Keep going to ' + ds.years[n - 1] + ' to unlock the reveal.';
      if (hintEl && complete) hintEl.textContent = 'Happy with it? Hit "Reveal the truth", or keep adjusting.';
      draw();
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (revealed) return;
      drawing = true; lastIdx = null;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      setGuess(point(e)); e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) { if (drawing && !revealed) { setGuess(point(e)); e.preventDefault(); } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { canvas.addEventListener(ev, function () { drawing = false; lastIdx = null; }); });

    function reveal() {
      if (revealed) return;
      revealed = true; if (revealBtn) revealBtn.disabled = true;
      var errs = [];
      for (var i = ds.known + 1; i < ds.years.length; i++) {
        var a = ds.values[i]; errs.push(Math.min(1, Math.abs(guesses[i] - a) / Math.max(a, ds.yMax * 0.05)));
      }
      var score = Math.round(100 * (1 - errs.reduce(function (s, x) { return s + x; }, 0) / errs.length));
      var verdict = score >= 85 ? 'Data whisperer. Hire this person!' : score >= 65 ? 'Sharp analyst instincts.' : score >= 40 ? 'Decent read, but the data had surprises.' : 'The data fooled you. That’s why we check it!';
      var t0 = null, dur = reduceMotion ? 1 : 1100;
      (function anim(ts) {
        if (!t0) t0 = ts;
        progress = Math.min(1, (ts - t0) / dur); draw();
        if (progress < 1) requestAnimationFrame(anim);
        else if (result) result.innerHTML = '<strong>' + score + '%</strong> accuracy · ' + verdict + '<br><span class="muted small">' + ds.insight + '</span>';
      })(performance.now());
      if (hintEl) hintEl.textContent = 'Try another dataset, or reset and draw again.';
    }

    if (revealBtn) revealBtn.addEventListener('click', reveal);
    if (resetBtn) resetBtn.addEventListener('click', function () { var active = $('.tab.active'); load(active ? active.getAttribute('data-ds') : 'naira'); });
    $$('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('.tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        load(tab.getAttribute('data-ds'));
      });
    });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    load('naira'); resize();
    return { draw: draw };
  }
})();
