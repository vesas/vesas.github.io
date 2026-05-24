// ============ HUD TARGETING RETICLE ============
  (function () {
    const reticle = document.getElementById('reticle');
    const label = document.getElementById('retLabel');
    if (!reticle) return;

    // Lockable target selectors + how to derive their label
    const TARGETS = [
      { sel: '.project-card', label: (el) => {
        const id = el.querySelector('.project-id');
        return 'LOCK · ' + (id ? id.textContent.trim() : 'PROJECT');
      }},
      { sel: '.writing-item', label: () => 'LOCK · ARTICLE' },
      { sel: '.pill-link', label: (el) => 'LINK · ' + el.textContent.trim().toUpperCase() },
      { sel: '.hero-name', label: () => 'LOCK · IDENT' },
      { sel: '.project-links a', label: (el) => 'LINK · ' + el.textContent.replace(/[↗:]/g,'').trim().toUpperCase().slice(0, 18) }
    ];

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let smoothX = cursorX;
    let smoothY = cursorY;
    let lockedEl = null;
    let firstMove = false;

    function findTarget(e) {
      for (const t of TARGETS) {
        const el = e.target.closest(t.sel);
        if (el) return { el, getLabel: t.label };
      }
      return null;
    }

    function applyLock(found) {
      const r = found.el.getBoundingClientRect();
      // Clamp size so giant cards don't get a tiny inset
      const pad = 8;
      reticle.classList.add('locked');
      reticle.style.left = (r.left + r.width / 2) + 'px';
      reticle.style.top = (r.top + r.height / 2) + 'px';
      reticle.style.width = (r.width + pad * 2) + 'px';
      reticle.style.height = (r.height + pad * 2) + 'px';
      label.textContent = found.getLabel(found.el);
      lockedEl = found.el;
    }

    function releaseLock() {
      reticle.classList.remove('locked');
      reticle.style.width = '22px';
      reticle.style.height = '22px';
      lockedEl = null;
    }

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!firstMove) { firstMove = true; reticle.classList.add('visible'); smoothX = cursorX; smoothY = cursorY; }

      const found = findTarget(e);
      if (found) {
        if (found.el !== lockedEl) applyLock(found);
      } else if (lockedEl) {
        releaseLock();
      }
    }, { passive: true });

    // Re-measure on scroll/resize while locked so brackets stay glued
    function relock() {
      if (lockedEl) {
        const r = lockedEl.getBoundingClientRect();
        const pad = 8;
        reticle.style.left = (r.left + r.width / 2) + 'px';
        reticle.style.top = (r.top + r.height / 2) + 'px';
        reticle.style.width = (r.width + pad * 2) + 'px';
        reticle.style.height = (r.height + pad * 2) + 'px';
      }
    }
    window.addEventListener('scroll', relock, { passive: true });
    window.addEventListener('resize', relock);

    document.addEventListener('mouseleave', () => {
      reticle.classList.remove('visible');
    });
    document.addEventListener('mouseenter', () => {
      if (firstMove) reticle.classList.add('visible');
    });

    // Smooth-follow when idle (not locked)
    function tick() {
      if (!lockedEl) {
        smoothX += (cursorX - smoothX) * 0.35;
        smoothY += (cursorY - smoothY) * 0.35;
        reticle.style.left = smoothX + 'px';
        reticle.style.top = smoothY + 'px';
      }
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // ============ DECRYPT EFFECTS (titles) ============
  (function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const POOL = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const FLASH_CLASSES = ['flash-cyan', 'flash-cyan', 'flash-lime', 'flash-magenta']; // cyan biased
    const randGlyph = () => POOL[(Math.random() * POOL.length) | 0];

    function setupSpans(el) {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      el.textContent = '';
      const chars = [];
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'decrypt-char';
        span.setAttribute('aria-hidden', 'true');
        const ch = text[i];
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
        chars.push({ span, final: ch, settled: false, lastSwap: 0, settleAt: 0 });
      }
      // Lock each char span to its natural Latin width. Any wider glyph (katakana)
      // will visually overflow the span without affecting siblings or wrapping.
      chars.forEach((c) => {
        const w = c.span.getBoundingClientRect().width;
        c.span.style.width = w + 'px';
      });
      el._decryptChars = chars;
      return chars;
    }

    function initialDecrypt(el) {
      if (reduced) {
        const chars = setupSpans(el);
        chars.forEach((c) => {
          c.settled = true;
          c.span.textContent = c.final === ' ' ? '\u00A0' : c.final;
          c.span.classList.add('settled');
        });
        scheduleMiniGlitch(el);
        return;
      }

      const chars = setupSpans(el);
      chars.forEach((c, i) => {
        c.settleAt = i * 55 + 420 + Math.random() * 360;
        if (c.final === ' ') {
          c.settled = true;
          c.span.classList.add('settled');
        }
      });

      const start = performance.now();
      function frame(now) {
        const t = now - start;
        let allDone = true;
        for (const c of chars) {
          if (c.settled) continue;
          if (t >= c.settleAt) {
            c.span.textContent = c.final;
            c.span.classList.add('settled');
            c.settled = true;
          } else {
            allDone = false;
            if (now - c.lastSwap >= 65) {
              c.span.textContent = randGlyph();
              c.lastSwap = now;
            }
          }
        }
        if (allDone) {
          scheduleMiniGlitch(el);
        } else {
          requestAnimationFrame(frame);
        }
      }
      requestAnimationFrame(frame);
    }

    function miniGlitch(el) {
      const chars = el._decryptChars;
      if (!chars) return;

      const candidates = chars.filter((c) => c.final !== ' ' && !c._glitching);
      if (!candidates.length) return;

      const count = 1 + ((Math.random() * Math.min(3, candidates.length)) | 0);
      const picks = [];
      while (picks.length < count) {
        const c = candidates[(Math.random() * candidates.length) | 0];
        if (!picks.includes(c)) picks.push(c);
      }

      const flashClass = FLASH_CLASSES[(Math.random() * FLASH_CLASSES.length) | 0];

      picks.forEach((c) => {
        c._glitching = true;
        c.span.classList.add(flashClass);
        const duration = 220 + Math.random() * 240;
        const start = performance.now();
        let last = 0;
        function tick(now) {
          const t = now - start;
          if (t >= duration) {
            c.span.textContent = c.final;
            c.span.classList.remove(flashClass);
            c._glitching = false;
            return;
          }
          if (now - last >= 55) {
            c.span.textContent = randGlyph();
            last = now;
          }
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    function scheduleMiniGlitch(el) {
      if (reduced) return;
      const delay = 8000 + Math.random() * 14000; // 8–22s per element
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible && !document.hidden) miniGlitch(el);
        scheduleMiniGlitch(el);
      }, delay);
    }

    function observeAll() {
      const titles = document.querySelectorAll('.section-title, .project-title');
      if (!titles.length) return;
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !entry.target.dataset.decrypted) {
              entry.target.dataset.decrypted = '1';
              initialDecrypt(entry.target);
              obs.unobserve(entry.target);
            }
          }
        }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });
        titles.forEach((t) => {
          if (!t.dataset.decrypted) obs.observe(t);
        });
      } else {
        titles.forEach((t) => {
          if (!t.dataset.decrypted) {
            t.dataset.decrypted = '1';
            initialDecrypt(t);
          }
        });
      }
    }

    // Exposed so projects render can call after appending cards.
    window.__decryptObserveAll = observeAll;
    observeAll();
  })();

  // ============ CLOCK ============
  (function () {
    const el = document.getElementById('clock');
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick() {
      const d = new Date();
      el.textContent = `T+ ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
    }
    tick(); setInterval(tick, 1000);
  })();

  // ============ TYPEWRITER TERMINAL ============
  (function () {
    const out = document.getElementById('termOut');
    const lines = [
      { prompt: '$', text: 'whoami' },
      { text: 'Hi, I\u2019m Vesa, a solution architect from Finland.' },
      { text: '' },
      { prompt: '$', text: 'cat ./bio.txt' },
      { text: 'For many years I\u2019ve worked across Finnish finance and insurance, on' },
      { text: 'internet banking, system integrations, and various enterprise systems.' },
      { text: '' },
      { text: 'Current focus: AI-assisted engineering, legacy modernization, performance,' },
      { text: 'and integrating LLMs into existing systems.' },
      { prompt: '$', text: '', cursor: true }
    ];

    let lineIdx = 0;
    let charIdx = 0;
    let currentEl = null;

    function nextLine() {
      if (lineIdx >= lines.length) return;
      const ln = lines[lineIdx];
      const row = document.createElement('div');
      row.className = 'terminal-line';
      if (ln.prompt) {
        const p = document.createElement('span');
        p.className = 'terminal-prompt';
        p.textContent = ln.prompt + ' ';
        row.appendChild(p);
      } else {
        const indent = document.createElement('span');
        indent.style.color = 'var(--fg-faint)';
        indent.textContent = '  ';
        row.appendChild(indent);
      }
      const span = document.createElement('span');
      row.appendChild(span);
      out.appendChild(row);
      currentEl = span;
      charIdx = 0;
      typeChar(ln);
    }

    function typeChar(ln) {
      if (charIdx < ln.text.length) {
        currentEl.textContent += ln.text[charIdx++];
        const delay = ln.prompt ? 38 : (Math.random() * 10 + 8);
        setTimeout(() => typeChar(ln), delay);
      } else {
        if (ln.cursor) {
          const c = document.createElement('span');
          c.className = 'terminal-cursor';
          currentEl.appendChild(c);
        }
        lineIdx++;
        setTimeout(nextLine, ln.prompt ? 250 : 60);
      }
    }

    setTimeout(nextLine, 600);
  })();

  // ============ PROJECTS ============
  (function () {
    const data = JSON.parse(document.getElementById('projects-data').textContent);
    const grid = document.getElementById('projectsGrid');

    data.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-img-wrap">
          <img src="${p.img}" alt="" loading="lazy" />
          <div class="project-img-overlay"></div>
          <div class="project-img-corners"><span></span></div>
          <div class="project-id">PRJ-${p.id}</div>
        </div>
        <div class="project-body">
          <div class="project-stack">
            ${p.stack.map(s => `<span class="stack-tag">${s}</span>`).join('')}
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <p class="project-why"><span class="label">// why</span>${p.why}</p>
          ${p.links.length ? `
            <div class="project-links">
              ${p.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener"><span class="label">${l.label}:</span>${l.text} ↗</a>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
      grid.appendChild(card);
    });

    // Now that .project-title nodes exist, ask the decrypt observer to pick them up.
    if (typeof window.__decryptObserveAll === 'function') {
      window.__decryptObserveAll();
    }
  })();

  // ============ DATASTRIP (binary scroll) ============
  (function () {
    const tracks = document.querySelectorAll('.datastrip-row .track');
    if (!tracks.length) return;

    function makeBinary(len) {
      let out = '';
      for (let i = 0; i < len; i++) {
        const bit = Math.random() < 0.5 ? '0' : '1';
        const r = Math.random();
        if (r < 0.04) out += '<span class="hi">' + bit + '</span>';
        else if (r < 0.07) out += '<span class="mg">' + bit + '</span>';
        else if (r < 0.13) out += '<span class="br">' + bit + '</span>';
        else out += bit;
        // Group every 8 bits with a space
        if ((i + 1) % 8 === 0) out += '&nbsp;';
      }
      return out;
    }

    tracks.forEach((track) => {
      const content = makeBinary(260);
      // Duplicate for seamless infinite scroll (animation translates -50%)
      track.innerHTML = content + content;
    });
  })();

  // ============ TICKER ============
  (function () {
    const items = [
      ['CPU', '0.42', 'cyan'],
      ['MEM', '6.1G', 'cyan'],
      ['NET', 'UP', 'lime'],
      ['REGION', 'EU-NORTH-1', 'cyan'],
      ['STACK', 'JAVA · PYTHON · TS', 'cyan'],
      ['BUILDS', '142/142', 'lime'],
      ['LATENCY', '12ms', 'lime'],
      ['UPLINK', 'STABLE', 'lime'],
      ['NODE', 'HEL-01', 'cyan'],
      ['MODE', 'PUBLIC', 'magenta'],
      ['VERSION', '3.0.26', 'cyan'],
      ['LAST_PUSH', '04:12 UTC', 'cyan']
    ];
    const track = document.getElementById('tickerTrack');
    const html = items.map(([k, v, c]) =>
      `<span class="ticker-item"><span class="dot"></span>${k} <span class="${c}">${v}</span></span>`
    ).join('');
    track.innerHTML = html + html;
  })();
