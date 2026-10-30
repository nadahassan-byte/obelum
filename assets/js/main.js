/* Obelum Properties — homepage behaviour.
   Progressive enhancement only: every section works with JavaScript off. */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Header ------------------------------------------------------------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-stuck', window.scrollY > Math.max(innerHeight * 0.7, 240));
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  /* --- Mobile navigation --------------------------------------------------- */
  const burger = $('[data-burger]');
  const mobileNav = $('[data-mobile-nav]');
  if (burger && mobileNav) {
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    mobileNav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setOpen(false); burger.focus(); }
    });
  }

  /* --- Hero slides --------------------------------------------------------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero);
    const HOLD = 6500;
    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let timer = null;

    const advance = () => {
      if (slides.length < 2) return;
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      const next = slides[index];
      // Restart the drift so each slide arrives on its own motion.
      next.style.animation = 'none';
      void next.offsetWidth;
      next.style.animation = '';
      next.classList.add('is-active');
    };
    const stop  = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!reduced && slides.length > 1 && !document.hidden) timer = setInterval(advance, HOLD); };

    start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* --- Listings filter ----------------------------------------------------- */
  const catTabs = $$('.cats__tab');
  const tileWrap = $('[data-tiles]');
  if (catTabs.length && tileWrap) {
    const lets = $$('.let', tileWrap);
    const empty = document.createElement('p');
    empty.className = 'lead';
    empty.hidden = true;
    empty.textContent = 'Nothing in that community this week.';
    tileWrap.appendChild(empty);

    const show = (cat) => {
      let shown = 0;
      lets.forEach((el) => {
        const match = (el.dataset.cats || '').split(/\s+/).includes(cat);
        el.hidden = !match;
        if (match) shown++;
      });
      empty.hidden = shown > 0;
    };
    catTabs.forEach((tab) => tab.addEventListener('click', () => {
      catTabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      show(tab.dataset.cat);
    }));
    show((catTabs.find((t) => t.getAttribute('aria-selected') === 'true') || catTabs[0]).dataset.cat);
  }

  /* --- Feed carousel ------------------------------------------------------- */
  const feedTrack = $('[data-feed-track]');
  if (feedTrack) {
    const arrows = $$('[data-feed]');
    const step = () => {
      const first = feedTrack.firstElementChild;
      if (!first) return feedTrack.clientWidth;
      const gap = parseFloat(getComputedStyle(feedTrack).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    };
    // Grey the arrows at each end rather than letting them do nothing.
    const sync = () => {
      const max = feedTrack.scrollWidth - feedTrack.clientWidth;
      const x = feedTrack.scrollLeft;
      arrows.forEach((a) => a.toggleAttribute('disabled',
        a.dataset.feed === 'next' ? x >= max - 2 : x <= 2));
    };
    arrows.forEach((a) => a.addEventListener('click', () => {
      feedTrack.scrollBy({ left: a.dataset.feed === 'next' ? step() : -step(),
                           behavior: reduced ? 'auto' : 'smooth' });
    }));
    feedTrack.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    addEventListener('load', sync);
    sync();
  }

  /* --- Service worker ------------------------------------------------------ */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* --- Footer year --------------------------------------------------------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
