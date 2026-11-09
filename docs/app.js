(() => {
  document.documentElement.classList.add('js');

  /* VITA Classical 16 shades ordered by brightness (value) from brightest B1 to darkest C4 */
  const VITA = [
    { code: 'B1', hex: '#FBF8EE', desc: 'самый светлый в классической шкале' },
    { code: 'A1', hex: '#F9F3DF', desc: 'очень светлый тёплый' },
    { code: 'B2', hex: '#F6EED5', desc: 'светлый сливочный' },
    { code: 'D2', hex: '#F2E7CE', desc: 'светлый нейтральный' },
    { code: 'A2', hex: '#F3E5C6', desc: 'естественный светлый' },
    { code: 'C1', hex: '#ECE1C6', desc: 'спокойный серо-бежевый' },
    { code: 'C2', hex: '#E8DAB9', desc: 'умеренный холодный' },
    { code: 'D4', hex: '#E5D6B2', desc: 'средний нейтральный' },
    { code: 'A3', hex: '#EFE0BD', desc: 'натуральный тёплый' },
    { code: 'D3', hex: '#E4CEAC', desc: 'насыщенный нейтральный' },
    { code: 'B3', hex: '#E8D1A7', desc: 'медово-бежевый' },
    { code: 'A3.5', hex: '#E2C699', desc: 'тёплый выраженный' },
    { code: 'B4', hex: '#DEC090', desc: 'глубокий жёлто-бежевый' },
    { code: 'C3', hex: '#D8BE96', desc: 'приглушённый тёмный' },
    { code: 'A4', hex: '#D1B284', desc: 'тёмный тёплый' },
    { code: 'C4', hex: '#C7AA7E', desc: 'самый тёмный в шкале' }
  ];

  let idxNow = 8;  // A3
  let idxGoal = 0; // B1
  let currentTask = 'whiten';

  const heroFan = document.getElementById('hero-fan');
  const swatchesNow = document.getElementById('swatches-now');
  const swatchesGoal = document.getElementById('swatches-goal');

  if (heroFan) {
    VITA.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'fan-tab';
      item.innerHTML = `<span class="fan-tab__tooth" style="background:${s.hex}"></span><span class="fan-tab__code">${s.code}</span>`;
      item.addEventListener('click', () => {
        idxNow = i;
        renderCalibrator();
        document.getElementById('vita')?.scrollIntoView({ behavior: 'smooth' });
      });
      heroFan.appendChild(item);
    });
  }

  function buildSwatches(container, groupName, getSelectedIdx, onSelect) {
    if (!container) return;
    VITA.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(i === getSelectedIdx()));
      btn.setAttribute('aria-label', `Оттенок ${s.code}, ${s.desc}`);
      btn.dataset.idx = String(i);
      btn.innerHTML = `<span class="swatch__chip" style="background:${s.hex}"></span><span class="swatch__code">${s.code}</span>`;
      btn.addEventListener('click', () => onSelect(i));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (i + 1) % VITA.length;
          onSelect(next);
          container.children[next]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (i - 1 + VITA.length) % VITA.length;
          onSelect(prev);
          container.children[prev]?.focus();
        }
      });
      container.appendChild(btn);
    });
  }

  buildSwatches(swatchesNow, 'now', () => idxNow, (i) => {
    idxNow = i;
    renderCalibrator();
  });

  buildSwatches(swatchesGoal, 'goal', () => idxGoal, (i) => {
    idxGoal = i;
    renderCalibrator();
  });

  const taskTabs = document.getElementById('task-tabs');
  if (taskTabs) {
    taskTabs.querySelectorAll('.task-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTask = btn.dataset.task || 'whiten';
        taskTabs.querySelectorAll('.task-tab').forEach((b) => {
          b.setAttribute('aria-checked', String(b === btn));
        });
        renderCalibrator();
      });
    });
  }

  function renderCalibrator() {
    const now = VITA[idxNow];
    const goal = VITA[idxGoal];
    const steps = idxNow - idxGoal; // positive means lightening

    if (swatchesNow) {
      [...swatchesNow.children].forEach((el, i) => el.setAttribute('aria-checked', String(i === idxNow)));
    }
    if (swatchesGoal) {
      [...swatchesGoal.children].forEach((el, i) => el.setAttribute('aria-checked', String(i === idxGoal)));
    }

    const outNow = document.getElementById('out-now');
    const outGoal = document.getElementById('out-goal');
    if (outNow) outNow.textContent = `${now.code} · ${now.desc}`;
    if (outGoal) outGoal.textContent = `${goal.code} · ${goal.desc}`;

    const tagNow = document.getElementById('tag-now');
    const tagGoal = document.getElementById('tag-goal');
    if (tagNow) tagNow.textContent = now.code;
    if (tagGoal) tagGoal.textContent = goal.code;

    const svgNow = document.getElementById('svg-teeth-now');
    const svgGoal = document.getElementById('svg-teeth-goal');
    if (svgNow) svgNow.setAttribute('fill', now.hex);
    if (svgGoal) svgGoal.setAttribute('fill', goal.hex);

    const deltaEl = document.getElementById('verdict-delta');
    const titleEl = document.getElementById('verdict-title');
    const textEl = document.getElementById('verdict-text');

    if (currentTask === 'crown') {
      deltaEl.textContent = `Подбор коронки: ориентир ${goal.code}`;
      titleEl.textContent = 'Ортопед сверит цвет коронки при дневном свете';
      textEl.textContent = steps > 2
        ? `Вы выбрали оттенок ${goal.code}, который светлее текущего (${now.code}) на ${steps} ступ. Если вы хотите общую улыбку светлее, сначала проводят чистку или отбеливание, и через 10–14 дней подбирают цвет коронки.`
        : `Керамическую или циркониевую коронку изготовят в тон ${goal.code}, чтобы она не выделялась в зубном ряду.`;
      return;
    }

    if (currentTask === 'filling') {
      deltaEl.textContent = `Реставрация: тон ${goal.code}`;
      titleEl.textContent = 'Художественная реставрация переднего зуба в тон эмали';
      textEl.textContent = steps > 2
        ? `Желаемый тон (${goal.code}) заметно светлее исходного (${now.code}). Чтобы новая пломба не выглядела светлым пятном, перед реставрацией делают профгигиену Air-Flow или отбеливание.`
        : `Терапевт подберёт композитный материал под оттенок ${goal.code} с учётом прозрачности режущего края.`;
      return;
    }

    // Default task: whiten
    if (steps <= 0) {
      deltaEl.textContent = `Без осветления (${now.code} → ${goal.code})`;
      titleEl.textContent = 'Поддерживающая гигиена: ультразвук + Air-Flow + фторирование';
      textEl.textContent = 'Когда свой оттенок устраивает, достаточно раз в полгода снимать пигментированный налёт и зубной камень.';
    } else if (steps <= 3) {
      deltaEl.textContent = `Осветление на ${steps} ${steps === 1 ? 'ступень' : 'ступени'} (${now.code} → ${goal.code})`;
      titleEl.textContent = 'Начнём с профессиональной чистки Air-Flow';
      textEl.textContent = 'Разница в 1–3 ступени по шкале VITA часто уходит после снятия налёта от кофе и чая аппаратом Air-Flow. Если после чистки захочется светлее, обсудим Zoom.';
    } else {
      deltaEl.textContent = `Осветление на ${steps} ступ. по яркости (${now.code} → ${goal.code})`;
      titleEl.textContent = 'Подойдёт кабинетное отбеливание Zoom после осмотра эмали';
      textEl.textContent = 'При переходе на 4 и более ступеней одной чистки недостаточно. Сначала врач проверит, нет ли трещин и кариеса, проведёт профгигиену и затем выполнит отбеливание Zoom.';
    }
  }

  renderCalibrator();

  const applyBtn = document.getElementById('vita-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const now = VITA[idxNow];
      const goal = VITA[idxGoal];
      const taskNames = {
        whiten: 'осветление эмали',
        crown: 'подбор коронки в тон',
        filling: 'реставрация переднего зуба'
      };
      const note = document.getElementById('f-note');
      if (note) {
        note.value = `Шкала VITA: сейчас ${now.code}, хочу ${goal.code} (${taskNames[currentTask]}).`;
      }
      setTimeout(() => document.getElementById('f-name')?.focus({ preventScroll: true }), 350);
    });
  }

  /* FORM & PHONE */
  const form = document.getElementById('form');
  const phone = document.getElementById('f-phone');
  const nameInput = document.getElementById('f-name');

  if (phone) {
    phone.addEventListener('input', () => {
      let d = phone.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      const p = d.slice(1);
      let out = '+7';
      if (p.length) out += ' ' + p.slice(0, 3);
      if (p.length > 3) out += ' ' + p.slice(3, 6);
      if (p.length > 6) out += '-' + p.slice(6, 8);
      if (p.length > 8) out += '-' + p.slice(8, 10);
      phone.value = out;
      if (phone.getAttribute('aria-invalid') === 'true' && p.length === 10) setErr(phone, false);
    });
  }

  function setErr(input, bad) {
    if (!input) return;
    input.setAttribute('aria-invalid', String(bad));
    const err = document.getElementById(input.id + '-err');
    if (err) err.hidden = !bad;
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) setErr(nameInput, false);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameBad = !nameInput || nameInput.value.trim().length < 2;
      const digits = phone ? phone.value.replace(/\D/g, '') : '';
      const phoneBad = digits.length !== 11;
      setErr(nameInput, nameBad);
      setErr(phone, phoneBad);
      if (nameBad) { nameInput?.focus(); return; }
      if (phoneBad) { phone?.focus(); return; }
      form.hidden = true;
      const done = document.getElementById('form-done');
      if (done) {
        done.hidden = false;
        done.focus();
      }
    });
  }

  /* SCROLL REVEAL */
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
