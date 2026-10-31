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
    let docked = 0;
    // Hand the nav over to the pinned bar exactly as it would slide underneath
    // it, so the menu appears to stick rather than jump. Measured, not a guess
    // at the hero's height: a fixed fraction of the viewport docked it early
    // and the nav teleported up while still plainly in view.
    const threshold = () => {
      if (heroNav && heroNav.offsetParent) {
        const top = heroNav.getBoundingClientRect().top + window.scrollY;
        return Math.max(top - header.offsetHeight, 0);
      }
      return Math.max(window.innerHeight * 0.72, 260);
    };
    const onScroll = () => {
      // Read the threshold off the unstuck layout only; once the nav is fixed
      // its own rect no longer tracks the page and the test would never clear.
      if (!header.classList.contains('is-stuck')) docked = threshold();
      const stuck = window.scrollY > docked;
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
  const world = $('.world');
  // The toggle lives in the world panel and pauses its drift, and will drive a
  // <video data-world-video> there if one is ever added.
  if (mediaToggle && world) {
    const wv = $('[data-world-video]', world);
    let paused = reduced;
    const apply = () => {
      world.classList.toggle('is-paused', paused);
      mediaToggle.setAttribute('aria-pressed', String(paused));
      mediaToggle.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
      if (wv) paused ? wv.pause() : wv.play().catch(() => {});
    };
    apply();
    mediaToggle.addEventListener('click', () => { paused = !paused; apply(); });
  }

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
      if (video) paused ? video.pause() : video.play().catch(() => {});
      start_();
    };

    apply();
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

  /* --- Brief form: the panel follows the chosen intent ------------------- */
  const brief = $('[data-brief]');
  if (brief) {
    const copyBox = $('[data-intent-copy]');
    const submit  = $('[data-brief-submit]', brief);
    const note    = $('[data-brief-note]', brief);
    const defaultSubmit = submit ? submit.textContent.trim() : '';
    const defaultNote   = note ? note.textContent.trim() : '';

    const show = (key) => {
      if (copyBox) {
        const blocks = $$('[data-for]', copyBox);
        const wanted = blocks.find(b => b.dataset.for === key)
                    || blocks.find(b => b.dataset.for === 'default');
        blocks.forEach(b => {
          const on = b === wanted;
          b.hidden = !on;
          // Re-trigger the entrance each time rather than only on first paint.
          if (on) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
        });
      }
      const picked = $(`.intent__input[value="${key}"]`, brief);
      if (submit) submit.textContent = (picked && picked.dataset.submit) || defaultSubmit;
      if (note)   note.textContent   = (picked && picked.dataset.note)   || defaultNote;
    };

    $$('.intent__input', brief).forEach(r => {
      r.addEventListener('change', () => r.checked && show(r.value));
    });
    // A back/forward restore can hand us a radio already checked.
    const preset = $('.intent__input:checked', brief);
    if (preset) show(preset.value);

    // No endpoint behind this either. Say so rather than reloading the page
    // and dropping whatever they typed, which is what action="#" did.
    // On the button's click, not the form's submit: submit only fires once the
    // browser's own required-field checks pass, so asking for an intent there
    // made people fill in four fields before being told to pick one first.
    if (submit) {
      submit.addEventListener('click', (e) => {
        if (brief.getAttribute('action')) return;
        if ($('.intent__input:checked', brief)) return;
        e.preventDefault();
        if (note) note.textContent = 'Pick one of the four above so we know who should reply.';
        const first = $('.intent__input', brief);
        if (first) first.focus();
      });
    }

    brief.addEventListener('submit', (e) => {
      if (brief.getAttribute('action')) return;
      e.preventDefault();
      if (!$('.intent__input:checked', brief)) return;
      if (note) {
        note.innerHTML = 'Thanks \u2014 nothing is connected behind this form yet. ' +
          'Email <a href="mailto:hello@obelum.ae?subject=Brief">hello@obelum.ae</a> ' +
          'and an advisor will pick it up.';
      }
    });
  }

  /* --- Signup ------------------------------------------------------------- */
  // There is no mailing list behind this yet. Rather than drop the address on
  // the floor or claim a subscription that did not happen, send people to an
  // inbox that exists. Remove this block once the form has a real action.
  const signup = $('[data-signup]');
  if (signup) {
    const note = $('[data-signup-note]', signup);
    signup.addEventListener('submit', (e) => {
      if (signup.getAttribute('action')) return;   // a provider is wired in
      e.preventDefault();
      const email = $('#signup-email', signup);
      if (!email.value.trim() || !email.checkValidity()) {
        if (note) note.textContent = 'Please enter a valid email address.';
        email.focus();
        return;
      }
      if (note) {
        note.innerHTML = 'Our list is not open yet \u2014 email ' +
          '<a href="mailto:hello@obelum.ae?subject=Newsletter">hello@obelum.ae</a> ' +
          'and we will add you.';
      }
    });
  }

  /* --- Instagram feed carousel --------------------------------------------- */
  const feedTrack = $('[data-feed-track]');
  if (feedTrack) {
    const arrows = $$('[data-feed]');
    const step = () => {
      const first = feedTrack.firstElementChild;
      if (!first) return feedTrack.clientWidth;
      const gap = parseFloat(getComputedStyle(feedTrack).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    };

    // Grey the arrows out at each end rather than letting them do nothing.
    const sync = () => {
      const max = feedTrack.scrollWidth - feedTrack.clientWidth;
      const x = feedTrack.scrollLeft;
      arrows.forEach((a) => {
        const atEnd = a.dataset.feed === 'next' ? x >= max - 2 : x <= 2;
        a.toggleAttribute('disabled', atEnd);
      });
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
  // Only over http(s); registering from file:// throws.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // When a new worker takes control, reload once so the page is never left
    // showing markup from the previous deploy.
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
    addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* --- Footer year -------------------------------------------------------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
