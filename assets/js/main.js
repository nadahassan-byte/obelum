/* Obelum Properties — homepage behaviour
   Progressive enhancement only: every section is readable with JS disabled. */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Sticky header + hero nav ------------------------------------------ */
  const header = $('[data-header]');
  const heroNav = $('.hero-nav');
  if (header) {
    const threshold = () => Math.max(window.innerHeight * 0.72, 260);
    const onScroll = () => {
      const stuck = window.scrollY > threshold();
      header.classList.toggle('is-stuck', stuck);
      // The nav only exists at the foot of the hero, so it rides up into the
      // condensed bar rather than scrolling out of reach.
      if (heroNav) heroNav.classList.toggle('is-stuck', stuck);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }

  /* --- Hero slideshow + motion toggle ------------------------------------- */
  const mediaToggle = $('[data-media-toggle]');
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero);
    const video = $('[data-hero-video]', hero);
    const HOLD = 6500;                   // time each slide is held before the fade
    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let timer = null;
    // Reduced-motion visitors start paused on the first frame.
    let paused = reduced;

    const advance = () => {
      if (slides.length < 2) return;
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      const next = slides[index];
      // Restart the drift so each slide pushes in from its own starting scale.
      next.style.animation = 'none';
      void next.offsetWidth;
      next.style.animation = '';
      next.classList.add('is-active');
    };

    const stop = () => { clearInterval(timer); timer = null; };
    const start_ = () => {
      stop();
      if (!paused && slides.length > 1 && !document.hidden) timer = setInterval(advance, HOLD);
    };

    const apply = () => {
      hero.classList.toggle('is-paused', paused);
      if (mediaToggle) {
        mediaToggle.setAttribute('aria-pressed', String(paused));
        mediaToggle.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
      }
      if (video) paused ? video.pause() : video.play().catch(() => {});
      start_();
    };

    apply();
    if (mediaToggle) {
      mediaToggle.addEventListener('click', () => { paused = !paused; apply(); });
    }
    // Don't burn cycles fading images nobody is looking at.
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start_(); });
  }

  /* --- Mobile navigation ------------------------------------------------ */
  const burger = $('[data-burger]');
  const mobileNav = $('[data-mobile-nav]');
  if (burger && mobileNav) {
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };
    burger.addEventListener('click', () => {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });
  }

  /* --- Scroll reveal ----------------------------------------------------- */
  const revealables = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach((el) => io.observe(el));
  }

  /* --- Listing category filter --------------------------------------------- */
  const catTabs = $$('.cats__tab');
  const tileWrap = $('[data-tiles]');
  if (catTabs.length && tileWrap) {
    const tiles = $$('.tile', tileWrap);
    const empty = document.createElement('p');
    empty.className = 'tiles__empty';
    empty.hidden = true;
    empty.textContent = 'Nothing in this category right now.';
    tileWrap.appendChild(empty);

    const show = (cat) => {
      let shown = 0;
      tiles.forEach((t) => {
        const match = (t.dataset.cats || '').split(/\s+/).includes(cat);
        t.hidden = !match;
        if (match) shown++;
      });
      empty.hidden = shown > 0;
    };

    catTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        catTabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        show(tab.dataset.cat);
      });
    });

    const initial = catTabs.find((t) => t.getAttribute('aria-selected') === 'true') || catTabs[0];
    show(initial.dataset.cat);
  }

  /* --- Tour selector ----------------------------------------------------- */
  const tours = $$('[data-tour]');
  if (tours.length) {
    const img     = $('[data-stage-img]');
    const title   = $('[data-stage-title]');
    const meta    = $('[data-stage-meta]');
    const eyebrow = $('[data-stage-eyebrow]');

    tours.forEach((btn) => {
      btn.addEventListener('click', () => {
        tours.forEach((b) => b.setAttribute('aria-current', String(b === btn)));
        if (img)     img.src = btn.dataset.img;
        if (title)   title.textContent = btn.dataset.title;
        if (meta)    meta.textContent = btn.dataset.meta;
        if (eyebrow) eyebrow.textContent = 'Now showing';
      });
    });
  }

  /* --- Testimonials ------------------------------------------------------ */
  const quotesRoot = $('[data-quotes]');
  if (quotesRoot) {
    const quotes = $$('[data-quote]', quotesRoot);
    const dots = $('.quotes__dots', quotesRoot);
    let index = 0;
    let timer = null;

    const show = (next) => {
      index = (next + quotes.length) % quotes.length;
      quotes.forEach((q, i) => q.classList.toggle('is-active', i === index));
      $$('button', dots).forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    };

    quotes.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.setAttribute('aria-current', String(i === 0));
      dot.addEventListener('click', () => { show(i); restart(); });
      dots.appendChild(dot);
    });

    const restart = () => {
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 7000);
    };

    quotesRoot.addEventListener('mouseenter', () => clearInterval(timer));
    quotesRoot.addEventListener('mouseleave', restart);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? clearInterval(timer) : restart();
    });
    restart();
  }

  /* --- Service worker ------------------------------------------------------ */
  // Only over http(s); registering from file:// throws.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* --- Footer year -------------------------------------------------------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
