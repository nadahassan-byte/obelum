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

  /* --- Hero motion toggle -------------------------------------------------- */
  const mediaToggle = $('[data-media-toggle]');
  const hero = $('.hero');
  if (mediaToggle && hero) {
    const video = $('[data-hero-video]', hero);
    // Reflect the real starting state: reduced-motion users begin paused.
    let paused = reduced;
    const apply = () => {
      hero.classList.toggle('is-paused', paused);
      mediaToggle.setAttribute('aria-pressed', String(paused));
      mediaToggle.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
      if (video) paused ? video.pause() : video.play().catch(() => {});
    };
    apply();
    mediaToggle.addEventListener('click', () => { paused = !paused; apply(); });
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

  /* --- Hero search tabs -------------------------------------------------- */
  const search = $('[data-search]');
  if (search) {
    const tabs = $$('[data-tab]', search);
    const priceLabel = $('[data-price-label]', search);
    // Rent swaps the price axis from capital value to annual rent.
    const labels = {
      buy: 'Max price (AED)',
      rent: 'Max rent (AED / yr)',
      offplan: 'Max price (AED)',
    };
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        if (priceLabel) priceLabel.textContent = labels[tab.dataset.tab] || labels.buy;
      });
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

  /* --- Stat counters ----------------------------------------------------- */
  const stats = $$('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const duration = 1500;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = prefix + value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  if (!reduced && 'IntersectionObserver' in window) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        statIO.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    stats.forEach((el) => statIO.observe(el));
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

  /* --- Footer year -------------------------------------------------------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
