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
      { text: 'Current focus: legacy modernization, performance, and integrating' },
      { text: 'LLMs into existing systems.' },
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
