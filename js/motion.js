// ==========================================
// MOTION: tudo que se move com o scroll
//  - nome em letras 3D, hero que "afunda" ao rolar, foto com tilt, chips orbitando
//  - faixa de texto inclinada em 3D
//  - texto do "Sobre" que acende palavra por palavra
//  - entrada em perspectiva de qualquer [data-r3d]
//  - cards de formação que empilham
//  - tilt com o mouse em [data-tilt], botões magnéticos
//  - menu, barra de progresso e contadores
// ==========================================
const Motion = (() => {
    const E = Engine;
    const { clamp, lerp, easeOut } = E;
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ---------- contadores ----------
    function setStat(id, n) {
        const el = document.getElementById(id);
        if (!el) return;
        if (E.reduce || !Number.isFinite(n)) { el.textContent = n; return; }
        const t0 = performance.now(), dur = 1100;
        (function tick(now) {
            const k = clamp((now - t0) / dur);
            el.textContent = Math.round(easeOut(k) * n);
            if (k < 1) requestAnimationFrame(tick);
        })(t0);
    }

    // ---------- nome em letras ----------
    function splitName() {
        let i = 0;
        document.querySelectorAll('.hero-name .split').forEach(el => {
            const text = el.textContent;
            el.textContent = '';
            [...text].forEach(ch => {
                const span = document.createElement('span');
                span.className = 'char' + (ch === ' ' ? ' sp' : '');
                span.style.setProperty('--i', i++);
                span.textContent = ch === ' ' ? ' ' : ch;
                el.appendChild(span);
            });
        });
    }

    // ---------- hero ----------
    const heroInner = document.getElementById('hero-inner');
    const photoFrame = document.getElementById('photo-frame');
    const orbit = document.getElementById('orbit');
    const chips = orbit ? [...orbit.querySelectorAll('.orbit-chip')] : [];
    let tx = 0, ty = 0;

    function heroFrame(s, t) {
        if (!heroInner) return;
        const p = clamp(s.y / (s.vh * 0.95));
        if (!E.reduce) {
            heroInner.style.transform = `perspective(1400px) translate3d(0, ${p * -6}vh, ${-p * 360}px) rotateX(${p * 16}deg)`;
            heroInner.style.opacity = String(1 - p * 1.15);
        }
        if (p >= 1) return;

        tx += (s.mx - tx) * 0.07;
        ty += (s.my - ty) * 0.07;
        if (photoFrame && !E.reduce) {
            photoFrame.style.transform = `rotateY(${tx * 14}deg) rotateX(${-ty * 10}deg) translateZ(30px)`;
        }

        // chips em órbita elíptica: os de trás ficam menores e atrás da foto
        if (orbit && chips.length) {
            const w = orbit.clientWidth, h = orbit.clientHeight;
            const rx = Math.min(w * (w < 460 ? 0.4 : 0.55), 250), ry = Math.min(h * 0.2, 70);
            const base = E.reduce ? 0 : t * 0.00035 + s.y * 0.0018;
            chips.forEach((chip, i) => {
                const a = base + (i * Math.PI * 2) / chips.length;
                const depth = (Math.sin(a) + 1) / 2;               // 0 = atrás, 1 = na frente
                const x = Math.cos(a) * rx;
                const y = Math.sin(a) * ry + (Math.cos(a) * 14);
                chip.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.72 + depth * 0.32})`;
                chip.style.opacity = String(0.25 + depth * 0.75);
                chip.style.zIndex = depth > 0.5 ? 2 : 0;
                chip.style.filter = depth < 0.5 ? 'blur(1px)' : 'none';
            });
        }
    }

    // ---------- faixa inclinada ----------
    const marquee = document.getElementById('marquee');
    const rows = marquee ? [...marquee.querySelectorAll('.marquee-row')] : [];
    const words = ['Python', 'SQL', 'NoSQL', 'Power BI', 'Databricks', 'Docker', 'Pandas', 'Machine Learning'];
    function buildMarquee() {
        rows.forEach((row, r) => {
            const list = r ? [...words].reverse() : words;
            const chunk = list.map((w, i) => `<span>${w}</span><span><b>•</b></span>`).join('');
            // dois blocos iguais: ao andar metade, o loop é invisível
            row.innerHTML = `<div style="display:flex">${chunk}</div><div style="display:flex">${chunk}</div>`;
        });
    }
    function marqueeFrame(s) {
        if (!rows.length || E.reduce) return;
        rows.forEach(row => {
            const half = row.firstElementChild ? row.firstElementChild.offsetWidth : 1;
            if (!half) return;
            const dir = Number(row.dataset.dir) || -1;
            const shift = (s.y * 0.38) % half;
            const x = dir < 0 ? -shift : shift - half;
            row.style.transform = `translate3d(${x}px, 0, 0) skewX(${clamp(-s.vel * 0.12, -9, 9)}deg)`;
        });
    }

    // ---------- "Sobre": palavras acendem ----------
    const about = document.getElementById('about-text');
    let aboutWords = [];
    function buildAbout() {
        if (!about) return;
        about.querySelectorAll('p').forEach(p => {
            p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
        });
        aboutWords = [...about.querySelectorAll('.w')];
    }
    function aboutFrame(s) {
        if (!aboutWords.length) return;
        const r = about.getBoundingClientRect();
        if (r.bottom < 0 || r.top > s.vh) return;
        const p = clamp((s.vh * 0.82 - r.top) / (r.height + s.vh * 0.25));
        const n = Math.round(p * aboutWords.length * 1.08);
        for (let i = 0; i < aboutWords.length; i++) {
            const on = i < n;
            if (aboutWords[i]._on !== on) { aboutWords[i]._on = on; aboutWords[i].classList.toggle('on', on); }
        }
    }

    // ---------- entrada em 3D ([data-r3d]) ----------
    let items = [];
    function refresh() {
        items = [...document.querySelectorAll('[data-r3d]')];
        if (E.reduce) items.forEach(el => { el.style.transform = ''; el.style.opacity = ''; });
    }
    function pose(kind, c) {
        const k = 1 - c;
        switch (kind) {
            case 'left':  return `perspective(1100px) translate3d(${-k * 90}px, ${k * 30}px, ${-k * 140}px) rotateY(${k * 26}deg)`;
            case 'right': return `perspective(1100px) translate3d(${k * 90}px, ${k * 30}px, ${-k * 140}px) rotateY(${-k * 26}deg)`;
            case 'flip':  return `perspective(900px) translate3d(0, ${k * 28}px, 0) rotateX(${-k * 75}deg)`;
            default:      return `perspective(1100px) translate3d(0, ${k * 70}px, ${-k * 170}px) rotateX(${k * 30}deg)`;
        }
    }
    let lastReveal = 0;
    function revealFrame(s, t) {
        if (E.reduce) return;
        const dt = Math.min(100, lastReveal ? t - lastReveal : 16.7); lastReveal = t;
        const k = 1 - Math.pow(0.86, dt / 16.7);          // suavização independente do fps
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const r = el.getBoundingClientRect();
            // longe da tela: só garante o estado certo, sem gastar conta
            if (r.top > s.vh * 1.6 || r.bottom < -s.vh * 0.6) {
                if (el._c === undefined) { el.style.opacity = '0'; }
                continue;
            }
            const delay = (Number(el.dataset.delay) || 0) * 55;
            const target = clamp((s.vh * 0.98 - (r.top + delay)) / (s.vh * 0.3));
            const exit = clamp((s.vh * 0.16 - r.bottom) / (s.vh * 0.3));
            if (el._c === undefined) el._c = r.top < s.vh * 0.6 && s.y > 50 ? target : 0;
            el._c += (target - el._c) * k;
            const c = easeOut(clamp(el._c));
            if (c > 0.995 && exit === 0) {
                if (el._done !== true) { el.style.transform = 'none'; el.style.opacity = '1'; el._done = true; }
                continue;
            }
            el._done = false;
            const kind = el.dataset.r3d;
            el.style.transform = pose(kind, c) + (exit ? ` rotateX(${exit * 14}deg)` : '');
            el.style.opacity = String(c * (1 - exit * 0.65));
        }
    }

    // ---------- formação: cards empilham ----------
    const eduCards = [...document.querySelectorAll('.edu-card')];
    function eduFrame(s) {
        if (E.reduce) return;
        const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 36 || 100;
        eduCards.forEach((card, i) => {
            const next = eduCards[i + 1];
            if (!next) return;
            const rn = next.getBoundingClientRect();
            const rc = card.getBoundingClientRect();
            const p = clamp(1 - (rn.top - top) / (rc.height + 20));
            card.style.transform = `perspective(1400px) translate3d(0, 0, ${-p * 120}px) rotateX(${p * 7}deg) scale(${1 - p * 0.05})`;
            card.style.opacity = String(1 - p * 0.55);
        });
    }

    // ---------- tilt com o mouse + brilho ----------
    function initTilt() {
        if (!hoverCapable || E.reduce) return;
        let cur = null;
        const reset = (el) => { if (el) { el.style.transform = ''; } };
        document.addEventListener('pointermove', (e) => {
            const el = e.target.closest && e.target.closest('[data-tilt]');
            if (cur && cur !== el) { reset(cur); cur = null; }
            if (!el) return;
            cur = el;
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg) translateZ(8px)`;
            el.style.setProperty('--mx', `${px * 100}%`);
            el.style.setProperty('--my', `${py * 100}%`);
        }, { passive: true });
        document.addEventListener('pointerleave', () => { reset(cur); cur = null; });
    }

    // ---------- botões magnéticos ----------
    function initMagnetic() {
        if (!hoverCapable || E.reduce) return;
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    // ---------- menu, progresso, seção ativa ----------
    function initNav() {
        const bar = document.getElementById('scrollBar');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');
        if (toggle && links) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = links.classList.toggle('open');
                toggle.setAttribute('aria-expanded', open);
            });
            links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }));
            document.addEventListener('click', () => links.classList.remove('open'));
        }
        const anchors = [...document.querySelectorAll('.nav-links a')];
        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) anchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(sec => io.observe(sec));
        E.add((s) => { if (bar) bar.style.width = (s.p * 100) + '%'; });
    }

    function init() {
        splitName();
        buildMarquee();
        buildAbout();
        refresh();
        initNav();
        initTilt();
        initMagnetic();
        E.add((s, t) => { heroFrame(s, t); marqueeFrame(s); aboutFrame(s); revealFrame(s, t); eduFrame(s); });
    }

    return { init, refresh, setStat };
})();
