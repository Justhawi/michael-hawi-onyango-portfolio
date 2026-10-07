(function () {
  var root = document.documentElement;

  /* ---- Theme toggle ---- */
  var themeBtn = document.getElementById('theme-toggle');
  var metaThemes = document.querySelectorAll('meta[name="theme-color"]');
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    var dark = t === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    metaThemes.forEach(function (m) { m.setAttribute('content', dark ? '#141312' : '#ff5a2d'); });
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  themeBtn.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onSystem = function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  };
  if (mq.addEventListener) mq.addEventListener('change', onSystem);

  /* ---- Header background after the hero ---- */
  var header = document.getElementById('site-header');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var limit = hero ? hero.offsetHeight - 70 : 40;
    header.classList.toggle('scrolled', document.body.classList.contains('subpage') || window.scrollY > limit || nav.classList.contains('open'));
  }

  /* ---- Mobile menu ---- */
  var nav = document.getElementById('main-nav');
  var menuBtn = document.getElementById('menu-toggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    onScroll();
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Highlight the current section in the nav ---- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          var h = l.getAttribute('href');
          if (h.charAt(0) !== '#') return;
          if (h === '#' + en.target.id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) {
      var h = l.getAttribute('href');
      if (!h || h.charAt(0) !== '#') return;
      var s = document.querySelector(h);
      if (s) io.observe(s);
    });
  }

  /* ---- Tabs (experience / education / beyond code) ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t, false); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
})();
