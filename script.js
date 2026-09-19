// ============ TERMINAL BIO ============
// Types the bio out quickly (whole sequence lands in well under a second).
// The same text is present in a .sr-only block in the markup for assistive tech
// and for anyone arriving without JS.
(function () {
  const out = document.getElementById('termOut');
  if (!out) return;

  const lines = [
    { prompt: '$', text: 'whoami' },
    { text: 'Hi, I’m Vesa, a solution architect from Finland.' },
    { text: '' },
    { prompt: '$', text: 'cat ./bio.txt' },
    { text: 'For many years I’ve worked across Finnish finance and insurance, on' },
    { text: 'internet banking, system integrations, and various enterprise systems.' },
    { text: '' },
    { text: 'Current focus: legacy modernization, performance, AI-assisted' },
    { text: 'engineering, and integrating LLMs into existing systems.' },
    { prompt: '$', text: '', cursor: true }
  ];

  // Per-character and per-line costs in ms. Commands type at a readable pace,
  // output text streams fast so the bio is simply there.
  const PROMPT_CHAR = 8;
  const BODY_CHAR = 0.6;
  const PROMPT_PAUSE = 70;
  const BODY_PAUSE = 10;
  const START_DELAY = 60;

  const fragment = document.createDocumentFragment();
  const rowEls = lines.map((ln) => {
    const row = document.createElement('div');
    row.className = 'terminal-line';
    let promptEl = null;
    if (ln.prompt) {
      promptEl = document.createElement('span');
      promptEl.className = 'terminal-prompt';
      promptEl.textContent = ln.prompt;
      // Space stays reserved but hidden until this line's turn — a fresh
      // terminal shouldn't already show a wall of $ signs.
      promptEl.style.visibility = 'hidden';
      row.appendChild(promptEl);
    } else {
      const indent = document.createElement('span');
      indent.className = 'terminal-prompt';
      indent.style.visibility = 'hidden';
      indent.textContent = '$';
      row.appendChild(indent);
    }
    const span = document.createElement('span');
    row.appendChild(span);
    // Reserve baseline height on blank lines so the box keeps its shape
    // before typing reaches them.
    if (!ln.text && !ln.prompt) {
      const ghost = document.createElement('span');
      ghost.textContent = ' ';
      ghost.style.visibility = 'hidden';
      row.appendChild(ghost);
    }
    fragment.appendChild(row);
    return { row, span, promptEl };
  });
  out.appendChild(fragment);

  function addCursor(i) {
    const c = document.createElement('span');
    c.className = 'terminal-cursor';
    rowEls[i].span.appendChild(c);
  }

  function finishAll() {
    lines.forEach((ln, i) => {
      if (rowEls[i].promptEl) rowEls[i].promptEl.style.visibility = 'visible';
      rowEls[i].span.textContent = ln.text;
      if (ln.cursor) addCursor(i);
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishAll();
    return;
  }

  let lineIdx = 0;
  let charIdx = 0;
  let credit = -START_DELAY; // negative credit acts as the opening pause
  let lastFrame = 0;

  // If frames are throttled (backgrounded tab, heavy load), don't leave the bio
  // half-typed — put the whole thing on screen and stop.
  const bail = setTimeout(() => { lineIdx = lines.length; finishAll(); }, 2500);

  function frame(now) {
    credit += Math.min(now - (lastFrame || now), 250);
    lastFrame = now;

    while (lineIdx < lines.length) {
      const ln = lines[lineIdx];
      const row = rowEls[lineIdx];
      const charCost = ln.prompt ? PROMPT_CHAR : BODY_CHAR;

      if (charIdx < ln.text.length) {
        if (credit < charCost) break;
        if (charIdx === 0 && row.promptEl) row.promptEl.style.visibility = 'visible';
        credit -= charCost;
        row.span.textContent += ln.text[charIdx++];
        continue;
      }

      // Line finished: pay the end-of-line pause, then advance.
      const pause = ln.prompt ? PROMPT_PAUSE : BODY_PAUSE;
      if (credit < pause) break;
      credit -= pause;
      if (row.promptEl) row.promptEl.style.visibility = 'visible';
      if (ln.cursor) addCursor(lineIdx);
      lineIdx++;
      charIdx = 0;
    }

    if (lineIdx < lines.length) requestAnimationFrame(frame);
    else clearTimeout(bail);
  }

  requestAnimationFrame(frame);
})();

// ============ WORK TABLE ============
(function () {
  const dataEl = document.getElementById('projects-data');
  const body = document.getElementById('workRows');
  if (!dataEl || !body) return;

  const data = JSON.parse(dataEl.textContent);
  const fragment = document.createDocumentFragment();

  data.forEach((p, i) => {
    // The title carries the primary link where there is one. Projects with
    // nothing to link to stay plain text rather than pretending otherwise.
    const primary = p.links[0];
    const name = primary
      ? `<a href="${primary.href}" target="_blank" rel="noopener">${p.title}</a>`
      : p.title;
    const links = p.links.length
      ? p.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener">${l.text}</a>`).join('')
      : '<span class="none">—</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="c-num">${String(i + 1).padStart(2, '0')}</td>
      <td class="c-name">${name}</td>
      <td class="c-stack">${p.stack.join(' · ')}</td>
      <td class="c-desc">${p.short}</td>
      <td class="c-links">${links}</td>
    `;
    fragment.appendChild(row);
  });

  body.appendChild(fragment);
})();
