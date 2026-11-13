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
  // A page without a hero (contact) marks its header data-pinned: the bar
  // and nav stay condensed from the start and never wait for a scroll.
  if (header && header.hasAttribute('data-pinned')) {
    header.classList.add('is-stuck');
    if (heroNav) heroNav.classList.add('is-stuck');
  } else if (header) {
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

  /* --- Parallax: the scene lags the page as you scroll past it ----------- */
  // Each [data-parallax] element is translated by a fraction of how far its
  // own section has travelled up the viewport, so the photograph drifts
  // slower than the content over it. The value is that fraction; the element
  // needs enough overhang (see .hero__media) to cover the distance it moves.
  const parallax = $$('[data-parallax]');
  if (parallax.length && !reduced) {
    let queued = false;
    const place = () => {
      queued = false;
      for (const el of parallax) {
        const host = el.parentElement;
        const r = host.getBoundingClientRect();
        // Off-screen sections cost nothing and keep whatever offset they had.
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const depth = parseFloat(el.dataset.parallax) || 0.12;
        // How far the section has climbed past the top of the viewport,
        // clamped so the offset settles once the section has fully gone.
        const climbed = Math.min(Math.max(-r.top, 0), r.height);
        el.style.transform = 'translate3d(0,' + (climbed * depth).toFixed(1) + 'px,0)';
      }
    };
    // rAF-throttled: scroll fires far faster than the screen refreshes, and
    // reading a rect in the handler itself would force layout every event.
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    place();
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
    let inView = true;

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
      clearInterval(timer);
      if (reduced || !inView) return;
      timer = setInterval(() => show(index + 1), 7000);
    };

    const prev = $('[data-quote-prev]', quotesRoot);
    const next = $('[data-quote-next]', quotesRoot);
    if (prev) prev.addEventListener('click', () => { show(index - 1); restart(); });
    if (next) next.addEventListener('click', () => { show(index + 1); restart(); });

    // Hover-pause is scoped to the controls. It used to sit on the whole
    // section, which is 92% of the viewport wide and 378px tall — resting the
    // pointer anywhere in that band stopped the rotation for good, so it only
    // ever moved when someone pressed an arrow.
    [prev, next, dots].forEach((el) => {
      if (!el) return;
      el.addEventListener('mouseenter', () => clearInterval(timer));
      el.addEventListener('mouseleave', restart);
    });
    // Someone reading with the keyboard should not have it move under them.
    quotesRoot.addEventListener('focusin', () => clearInterval(timer));
    quotesRoot.addEventListener('focusout', restart);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? clearInterval(timer) : restart();
    });
    // No point rotating a section nobody is looking at — and it means the set
    // starts from wherever it was when you arrive, not mid-cycle.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        inView ? restart() : clearInterval(timer);
      }, { threshold: 0.25 }).observe(quotesRoot);
    }
    restart();
  }

  /* --- Form validation ----------------------------------------------------- */
  // Every field carries data-rule; each rule returns '' when the value is fine
  // or the message to show under the field. Checked when a field is left, again
  // live while it is wrong, and all together on submit.
  // Phone numbers: the country is picked from a list, the number is checked
  // against that country's length (and pattern, where we know it), and a
  // leading 0 or a pasted +code is handled rather than rejected.
  // [ISO, name, dialling code, min digits, max digits, optional pattern]
  const COUNTRIES = [
    ['AE','United Arab Emirates','971',8,9,/^(5[0-9]\d{7}|[2-9]\d{7})$/],
    ['SA','Saudi Arabia','966',8,9,/^(5\d{8}|1\d{7})$/],
    ['QA','Qatar','974',8,8],['KW','Kuwait','965',8,8],['BH','Bahrain','973',8,8],['OM','Oman','968',8,8],
    ['AR','Argentina','54',10,11],['AM','Armenia','374',8,8],['AU','Australia','61',9,9],
    ['AT','Austria','43',7,13],['AZ','Azerbaijan','994',9,9],['BD','Bangladesh','880',10,10],
    ['BE','Belgium','32',8,9],['BR','Brazil','55',10,11],['BG','Bulgaria','359',8,9],
    ['CA','Canada','1',10,10,/^[2-9]\d{2}[2-9]\d{6}$/],['CN','China','86',10,11],['CY','Cyprus','357',8,8],
    ['CZ','Czechia','420',9,9],['DK','Denmark','45',8,8],['EG','Egypt','20',9,10],
    ['EE','Estonia','372',7,8],['ET','Ethiopia','251',9,9],['FI','Finland','358',6,11],
    ['FR','France','33',9,9],['GE','Georgia','995',9,9],['DE','Germany','49',7,12],
    ['GH','Ghana','233',9,9],['GR','Greece','30',10,10],['HK','Hong Kong','852',8,8],
    ['HU','Hungary','36',8,9],['IN','India','91',10,10,/^[6-9]\d{9}$/],['ID','Indonesia','62',9,12],
    ['IR','Iran','98',10,10],['IQ','Iraq','964',10,10],['IE','Ireland','353',7,9],
    ['IL','Israel','972',8,9],['IT','Italy','39',6,11],['JP','Japan','81',9,10],
    ['JO','Jordan','962',8,9],['KZ','Kazakhstan','7',10,10],['KE','Kenya','254',9,9],
    ['LV','Latvia','371',8,8],['LB','Lebanon','961',7,8],['LT','Lithuania','370',8,8],
    ['LU','Luxembourg','352',6,11],['MY','Malaysia','60',9,10],['MT','Malta','356',8,8],
    ['MX','Mexico','52',10,10],['MA','Morocco','212',9,9],['NL','Netherlands','31',9,9],
    ['NZ','New Zealand','64',8,10],['NG','Nigeria','234',8,10],['NO','Norway','47',8,8],
    ['PK','Pakistan','92',10,10],['PS','Palestine','970',9,9],['PH','Philippines','63',10,10],
    ['PL','Poland','48',9,9],['PT','Portugal','351',9,9],['RO','Romania','40',9,9],
    ['RU','Russia','7',10,10],['RS','Serbia','381',8,9],['SG','Singapore','65',8,8],
    ['SK','Slovakia','421',9,9],['ZA','South Africa','27',9,9],['KR','South Korea','82',9,10],
    ['ES','Spain','34',9,9],['LK','Sri Lanka','94',9,9],['SD','Sudan','249',9,9],
    ['SE','Sweden','46',7,9],['CH','Switzerland','41',9,9],['SY','Syria','963',9,9],
    ['TW','Taiwan','886',9,9],['TZ','Tanzania','255',9,9],['TH','Thailand','66',9,9],
    ['TN','Tunisia','216',8,8],['TR','Turkey','90',10,10],['UG','Uganda','256',9,9],
    ['UA','Ukraine','380',9,9],['GB','United Kingdom','44',9,10,/^(7\d{9}|[1-3]\d{8,9})$/],
    ['US','United States','1',10,10,/^[2-9]\d{2}[2-9]\d{6}$/],['UZ','Uzbekistan','998',9,9],
    ['VN','Vietnam','84',9,10],['YE','Yemen','967',9,9],
  ];
  const byIso = Object.fromEntries(COUNTRIES.map((c) => [c[0], c]));

  // Fill each country-code select and keep its short label in step.
  $$('[data-country-code]').forEach((sel) => {
    const keep = sel.value || 'AE';
    sel.innerHTML = '';
    COUNTRIES.forEach(([iso, name, code], i) => {
      const o = new Option(`${name} (+${code})`, iso);
      sel.add(o);
      if (i === 5) {                       // a divider after the Gulf states
        const d = new Option('──────────', ''); d.disabled = true; sel.add(d);
      }
    });
    sel.value = keep;
    const label = $('[data-cc-label]', sel.parentElement);
    const sync = () => { if (label) label.textContent = '+' + byIso[sel.value][2]; };
    sel.addEventListener('change', sync);
    sync();
  });

  // Reads a phone field against its country. Returns { error, e164 }.
  const readPhone = (input) => {
    const sel = $('[data-country-code]', input.closest('.phone') || input.parentElement);
    let c = byIso[(sel && sel.value) || 'AE'];
    let raw = input.value.trim();
    if (!raw) return { error: input.required ? 'Please enter your phone number.' : '', e164: '' };
    if (/[^\d\s()+.\-]/.test(raw)) return { error: 'Use numbers only.', e164: '' };
    let digits = raw.replace(/\D/g, '');
    // Typed in international form (+44… or 0044…): take the country from it.
    if (/^(\+|00)/.test(raw)) {
      if (raw.startsWith('00')) digits = digits.slice(2);
      const hit = COUNTRIES.filter((k) => digits.startsWith(k[2]))
                           .sort((a, b) => b[2].length - a[2].length)[0];
      if (!hit) return { error: 'That country code is not in our list.', e164: '' };
      if (sel && byIso[sel.value][2] !== hit[2]) {
        sel.value = hit[0]; sel.dispatchEvent(new Event('change'));
      }
      c = byIso[sel ? sel.value : hit[0]];
      digits = digits.slice(c[2].length);
    } else if (digits.startsWith(c[2]) && digits.length > c[4]) {
      digits = digits.slice(c[2].length);   // the code typed without a plus
    }
    if (c[0] !== 'IT') digits = digits.replace(/^0+/, '');   // trunk 0, e.g. 050…
    const [, name, , min, max, pattern] = c;
    if (digits.length < min || digits.length > max) {
      const n = min === max ? `${min}` : `${min}–${max}`;
      return { error: `A ${name} number has ${n} digits after +${c[2]}.`, e164: '' };
    }
    if (pattern && !pattern.test(digits)) {
      return { error: `That is not a valid ${name} number.`, e164: '' };
    }
    return { error: '', e164: `+${c[2]} ${digits}` };
  };

  const RULES = {
    name: (v) => {
      if (!v) return 'Please enter your name.';
      if (/\d/.test(v)) return 'Names cannot contain numbers.';
      if (!/^[\p{L}\p{M}][\p{L}\p{M}' .\-]*$/u.test(v)) return 'Use letters only — no symbols.';
      if (v.replace(/[^\p{L}]/gu, '').length < 2) return 'Please enter your full name.';
      if (/(.)\1\1\1/u.test(v.replace(/\s/g, ''))) return 'Please enter your real name.';
      return '';
    },
    email: (v) => {
      if (!v) return 'Please enter your email.';
      const ok = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/.test(v);
      return ok && v.length <= 254 ? '' : 'Please enter a valid email, like name@example.com.';
    },
    community: (v) => {
      if (!v) return 'Please enter a community.';
      if (!/^[\p{L}\p{M}\d][\p{L}\p{M}\d' ,.&()\/\-]*$/u.test(v) || !/\p{L}/u.test(v)) {
        return 'Use letters and numbers only, e.g. JVC or Dubai Marina.';
      }
      return v.length < 2 ? 'Please enter the full community name.' : '';
    },
    message: (v) => {
      if (!v) return 'Please write a message.';
      if (v.length < 10) return 'Please write a little more (at least 10 characters).';
      if ((v.match(/\p{L}/gu) || []).length < 5) return 'Please write your message in words.';
      if (/(.)\1{9}/u.test(v)) return 'Please write a real message.';
      return '';
    },
    phone: (v, input) => readPhone(input).error,
  };

  const check = (input) => {
    const rule = RULES[input.dataset.rule];
    if (!rule) return true;
    const v = input.value.trim().replace(/\s+/g, ' ');
    const msg = rule(v, input);
    const field = input.closest('.field');
    let err = field && $('.field__error', field);
    if (msg && field && !err) {
      err = document.createElement('p');
      err.className = 'field__error';
      err.id = input.id + '-error';
      field.appendChild(err);
      input.setAttribute('aria-describedby', err.id);
    }
    if (err) err.textContent = msg;
    input.toggleAttribute('aria-invalid', !!msg);
    if (field) field.classList.toggle('is-invalid', !!msg);
    return !msg;
  };

  // Wires a form and returns a function that checks every field, focusing the
  // first one that is wrong.
  const validator = (form) => {
    const inputs = $$('[data-rule]', form);
    inputs.forEach((input) => {
      input.addEventListener('blur', () => { if (input.value.trim() || input.hasAttribute('aria-invalid')) check(input); });
      input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) check(input); });
      if (input.dataset.rule === 'phone') {
        // Drop anything that cannot be part of a phone number as it is typed.
        input.addEventListener('input', () => {
          const clean = input.value.replace(/[^\d\s()+.\-]/g, '');
          if (clean !== input.value) input.value = clean;
        });
        const sel = $('[data-country-code]', input.closest('.phone'));
        if (sel) sel.addEventListener('change', () => { if (input.value.trim()) check(input); });
      }
    });
    return () => {
      const bad = inputs.filter((i) => !check(i));
      if (bad.length) bad[0].focus();
      return bad.length === 0;
    };
  };

  /* --- Sending forms by email ---------------------------------------------- */
  // Every form on the site posts to FormSubmit, which emails each submission
  // to the inbox below. No account: the very first submission makes FormSubmit
  // send that inbox an "Activate form" link, and nothing is delivered until it
  // is clicked. To change the inbox, change INBOX (and activate again).
  const INBOX = 'oobelumgroup@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + INBOX;
  const fallback = (subject) =>
    `<a href="mailto:${INBOX}?subject=${encodeURIComponent(subject)}">${INBOX}</a>`;

  // Resolves with FormSubmit's reply, or rejects with a message to show.
  const sendForm = async (fields, subject, form) => {
    const hp = form && $('input[name="_honey"]', form);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({}, fields, {
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _honey: hp ? hp.value : '',          // filled only by bots: FormSubmit drops it
      })),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || 'Send failed');
    return data;
  };

  // Runs a send with the button disabled and the outcome in the note.
  const submitWith = async (form, button, note, fields, subject, thanks) => {
    const label = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Sending\u2026'; }
    try {
      await sendForm(fields, subject, form);
      form.reset();
      // Put the country-code labels back in step with the reset selects.
      $$('[data-country-code]', form).forEach((sel) => sel.dispatchEvent(new Event('change')));
      if (note) note.textContent = thanks;
      return true;
    } catch (err) {
      if (note) {
        note.innerHTML = 'Sorry, that did not send. Please try again, or email ' +
          fallback(subject) + ' directly.';
      }
      return false;
    } finally {
      if (button) { button.disabled = false; button.textContent = label; }
    }
  };

  // The thank-you pop-up after a contact or brief is sent. A native <dialog>:
  // it traps focus, closes on Escape, and returns focus to where it was.
  // Built once, on first use; clicking the dimmed backdrop also closes it.
  let thanksDialog = null;
  const showThanks = () => {
    if (!thanksDialog) {
      thanksDialog = document.createElement('dialog');
      thanksDialog.className = 'thanks';
      thanksDialog.setAttribute('aria-labelledby', 'thanks-title');
      thanksDialog.innerHTML =
        '<div class="thanks__panel">' +
          '<svg class="thanks__mark" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">' +
            '<circle cx="22" cy="22" r="21" stroke="currentColor" stroke-width="1.2"/>' +
            '<path d="M13.5 22.5l6 6 11-12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
          '<h2 class="thanks__title" id="thanks-title">Thank you for contacting us</h2>' +
          '<p class="thanks__text">Someone from the team will reach out to you shortly.</p>' +
          '<button class="btn btn--gold thanks__close" type="button">Close</button>' +
        '</div>';
      document.body.appendChild(thanksDialog);
      $('.thanks__close', thanksDialog).addEventListener('click', () => thanksDialog.close());
      thanksDialog.addEventListener('click', (e) => { if (e.target === thanksDialog) thanksDialog.close(); });
    }
    if (typeof thanksDialog.showModal === 'function') {
      if (!thanksDialog.open) thanksDialog.showModal();
      $('.thanks__close', thanksDialog).focus();
    }
  };

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

    /* --- The intent disclosure ------------------------------------------- */
    const field   = $('[data-intent-field]', brief);
    const toggle  = $('[data-intent-toggle]', brief);
    const options = $('[data-intent-options]', brief);
    const valueEl = $('[data-intent-value]', brief);
    const placeholder = valueEl ? valueEl.textContent.trim() : 'Select one';

    const openList = (open) => {
      if (!toggle || !options) return;
      options.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        const target = $('.intent__input:checked', options) || $('.intent__input', options);
        if (target) target.focus();
      }
    };
    if (toggle) {
      toggle.addEventListener('click', () => openList(options.hidden));
      // Escape closes and hands focus back, rather than stranding it in a
      // panel that is no longer on screen.
      field.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || options.hidden) return;
        openList(false);
        toggle.focus();
      });
      document.addEventListener('click', (e) => {
        if (!options.hidden && !field.contains(e.target)) openList(false);
      });
    }

    const commit = () => { openList(false); if (toggle) toggle.focus(); };

    // Changing and committing are separate. Arrowing through a radio group
    // fires change on every step, so closing there meant the first ArrowDown
    // picked an option and shut the panel — a keyboard user could never reach
    // the third or fourth. Arrow keys now browse; click, Enter or Space commit.
    $$('.intent__input', brief).forEach(r => {
      r.addEventListener('change', () => {
        if (!r.checked) return;
        show(r.value);
        const title = $('.intent__title', r.parentElement);
        if (valueEl && title) valueEl.textContent = title.textContent.trim();
      });
    });
    if (options) {
      options.addEventListener('click', (e) => {
        // Selecting a radio with an arrow key also fires a click, which would
        // close the panel again. A real pointer click carries detail >= 1; the
        // keyboard's synthetic one is 0.
        if (e.detail === 0) return;
        if (e.target.closest('.intent')) commit();
      });
      options.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();          // this one would otherwise submit the form
        commit();
      });
      // Space checks the radio natively; commit once it has.
      options.addEventListener('keyup', (e) => { if (e.key === ' ') commit(); });
    }
    // A back/forward restore can hand us a radio already checked.
    const preset = $('.intent__input:checked', brief);
    if (preset) {
      show(preset.value);
      const t = $('.intent__title', preset.parentElement);
      if (valueEl && t) valueEl.textContent = t.textContent.trim();
    }

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
        if (note) note.textContent = 'Pick one of the four so we know who should reply.';
        openList(true);
      });
    }

    const briefValid = validator(brief);
    brief.addEventListener('submit', (e) => {
      if (!$('.intent__input:checked', brief)) { e.preventDefault(); return; }
      if (!briefValid()) {
        e.preventDefault();
        if (note) note.textContent = 'Please correct the highlighted fields.';
        return;
      }
      if (brief.getAttribute('action')) return;
      e.preventDefault();
      const v = (n) => (brief.elements[n] ? brief.elements[n].value.trim().replace(/\s+/g, ' ') : '');
      const picked = $('.intent__input:checked', brief);
      const intent = $('.intent__title', picked.parentElement).textContent.trim();
      const submitBtn = $('[data-brief-submit]', brief);
      submitWith(brief, submitBtn, note, {
        'Looking to': intent,
        name: v('name'),
        email: v('email'),
        phone: readPhone(brief.elements.phone).e164,
        community: v('community'),
      }, `Website brief: ${intent} \u2014 ${v('name')}`,
      'Thank you \u2014 your brief has been sent. An advisor will come back to you within 24 hours.')
        .then((ok) => {
          if (!ok) return;
          // The reset cleared the radios; put the panel back to its opening state.
          show('default');
          if (valueEl) valueEl.textContent = placeholder;
          if (note) note.textContent = 'Thank you \u2014 your brief has been sent. An advisor will come back to you within 24 hours.';
          showThanks();
        });
    });
  }

  /* --- Contact form ------------------------------------------------------- */
  // Emailed to INBOX through FormSubmit (see "Sending forms by email").
  const contact = $('[data-contact]');
  if (contact) {
    const note = $('[data-contact-note]', contact);
    const defaultNote = note ? note.textContent.trim() : '';
    const contactValid = validator(contact);
    contact.addEventListener('submit', (e) => {
      if (!contactValid()) {
        e.preventDefault();
        if (note) note.textContent = 'Please correct the highlighted fields.';
        return;
      }
      if (note) note.textContent = defaultNote;
      if (contact.getAttribute('action')) return;
      e.preventDefault();
      const v = (n) => (contact.elements[n] ? contact.elements[n].value.trim().replace(/\s+/g, ' ') : '');
      const phone = readPhone(contact.elements.phone).e164;
      const subject = v('topic') + ' enquiry from ' + v('name');
      submitWith(contact, $('button[type="submit"]', contact), note, {
        name: v('name'),
        email: v('email'),
        phone: phone || 'Not given',
        about: v('topic'),
        message: contact.elements.message.value.trim(),
      }, 'Website enquiry: ' + subject,
      'Thank you \u2014 your message has been sent. We will reply within one working day.')
        .then((ok) => { if (ok) showThanks(); });
    });
  }

  /* --- Signup ------------------------------------------------------------- */
  // No mailing-list provider yet: each sign-up is emailed to INBOX instead, so
  // the address is kept rather than dropped. Give the form an action once a
  // provider is chosen and this steps aside.
  const signup = $('[data-signup]');
  if (signup) {
    const note = $('[data-signup-note]', signup);
    signup.addEventListener('submit', (e) => {
      if (signup.getAttribute('action')) return;   // a provider is wired in
      e.preventDefault();
      const email = $('#signup-email', signup);
      const problem = RULES.email(email.value.trim());
      if (problem) {
        if (note) note.textContent = problem;
        email.focus();
        return;
      }
      submitWith(signup, $('button[type="submit"]', signup), note,
        { email: email.value.trim() }, 'Website newsletter sign-up',
        'Thank you \u2014 you are on the list.');
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
