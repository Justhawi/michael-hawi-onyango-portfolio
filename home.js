(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight;
  window.addEventListener('resize', function () { vh = window.innerHeight; });

  /* ---------- Hero: name rises in ---------- */
  var nameLetters = document.querySelectorAll('.hero-name span');
  if (!reduce) {
    nameLetters.forEach(function (s, i) { s.style.setProperty('--ty', '40%'); s.style.transitionDelay = (i * 0.08) + 's'; });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      nameLetters.forEach(function (s) { s.style.setProperty('--ty', '0%'); });
    }); });
  }

  /* ---------- Hero: neural-network dots ---------- */
  var canvas = document.querySelector('.hero-net');
  var hero = document.querySelector('.hero');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [], mouse = { x: -9999, y: -9999 }, running = false, raf = 0;
    var LINK = 140;
    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(34, (W * H) / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: Math.random() * 1.4 + 0.6 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduce) {
          var dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < 32000) { p.vx += dx * 0.00004; p.vy += dy * 0.00004; }
          p.vx *= 0.995; p.vy *= 0.995;
          if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
          if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, d = Math.sqrt(ex * ex + ey * ey);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(160,190,255,' + (0.22 * (1 - d / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 0.7;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        var md = Math.sqrt((mouse.x - p.x) * (mouse.x - p.x) + (mouse.y - p.y) * (mouse.y - p.y));
        if (md < 170) {
          ctx.strokeStyle = 'rgba(127,224,238,' + (0.45 * (1 - md / 170)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = md < 170 ? 'rgba(127,224,238,.95)' : 'rgba(241,236,226,.7)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(draw); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); draw();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(); }, 150); });
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(hero);
    } else { start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }

  /* ---------- Kinetic headline: split into letters ---------- */
  var chars = [];
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.split(' ');
    el.textContent = '';
    words.forEach(function (w, wi) {
      var ws = document.createElement('span'); ws.className = 'w'; ws.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < w.length; i++) {
        var c = document.createElement('span'); c.className = 'ch'; c.textContent = w[i];
        ws.appendChild(c); chars.push(c);
      }
      el.appendChild(ws);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  var kinetic = document.querySelector('.kinetic');

  /* ---------- Scroll-driven effects ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.home .shot-in'));
  var dock = document.querySelector('.dock');
  var contact = document.getElementById('contact');
  var ticking = false;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function frame() {
    ticking = false;
    var y = window.scrollY;

    if (kinetic && !reduce) {
      var r = kinetic.getBoundingClientRect();
      var total = r.height - vh;
      var p = clamp((-r.top + vh * 0.35) / (total + vh * 0.35), 0, 1);
      var n = chars.length;
      for (var i = 0; i < n; i++) {
        var t = clamp(p * (n + 6) / 1.0 - i * 0.92, 0, 6) / 6; // each letter eases in over a window
        var e = 1 - Math.pow(1 - t, 3);
        chars[i].style.opacity = (0.12 + 0.88 * e).toFixed(3);
        chars[i].style.transform = 'translateY(' + ((1 - e) * 38).toFixed(1) + '%) scale(' + (0.72 + 0.28 * e).toFixed(3) + ')';
      }
    }

    if (!reduce) {
      for (var k = 0; k < shots.length; k++) {
        var sr = shots[k].getBoundingClientRect();
        var q = clamp((sr.top - vh * 0.25) / (vh * 0.75), 0, 1);
        shots[k].style.setProperty('--rx', (q * 28).toFixed(2) + 'deg');
        shots[k].style.setProperty('--sc', (1 - q * 0.08).toFixed(3));
      }
    }

    if (dock) {
      var heroH = hero ? hero.offsetHeight : 600;
      var cr = contact ? contact.getBoundingClientRect().top : 99999;
      dock.classList.toggle('show', y > heroH * 0.7 && cr > vh * 0.6);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();
