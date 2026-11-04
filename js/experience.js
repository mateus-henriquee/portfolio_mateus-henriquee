// ==========================================
// EXPERIÊNCIA: linha do tempo que preenche com o scroll,
// galeria coverflow 3D e lightbox (foto em tela cheia, fundo borrado)
// ==========================================

// ---------- Lightbox (também usado nos certificados) ----------
const Lightbox = (() => {
    let el = null, lastFocus = null;

    function build() {
        el = document.createElement('div');
        el.className = 'lightbox';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.innerHTML = `
            <button type="button" class="lightbox-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
            <figure class="lightbox-figure">
                <img class="lightbox-img" alt="">
                <figcaption class="lightbox-caption"></figcaption>
            </figure>`;
        document.body.appendChild(el);
        el.querySelector('.lightbox-close').addEventListener('click', close);
        el.addEventListener('click', (e) => { if (e.target === el) close(); }); // clique fora da foto fecha
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('open')) close(); });
    }

    function open(src, alt, caption) {
        if (!el) build();
        const img = el.querySelector('.lightbox-img');
        const cap = el.querySelector('.lightbox-caption');
        img.src = src;
        img.alt = alt || '';
        cap.textContent = caption || '';
        cap.hidden = !caption;
        lastFocus = document.activeElement;
        el.classList.add('open');
        document.body.classList.add('lb-lock');
        el.querySelector('.lightbox-close').focus();
        document.dispatchEvent(new CustomEvent('lightbox:open'));
    }

    function close() {
        if (!el || !el.classList.contains('open')) return;
        el.classList.remove('open');
        document.body.classList.remove('lb-lock');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
        document.dispatchEvent(new CustomEvent('lightbox:close'));
    }

    return { open, close, isOpen: () => !!el && el.classList.contains('open') };
})();

// ---------- Linha do tempo ----------
(() => {
    const tl = document.getElementById('timeline');
    const fill = document.getElementById('t-fill');
    if (!tl) return;
    const items = [...tl.querySelectorAll('.t-item')];
    Engine.add((s) => {
        const r = tl.getBoundingClientRect();
        if (r.bottom < -100 || r.top > s.vh + 100) return;
        const trigger = s.vh * 0.58;
        const p = Engine.clamp((trigger - r.top) / r.height);
        if (fill) fill.style.height = (p * 100) + '%';
        items.forEach(it => it.classList.toggle('active', it.getBoundingClientRect().top < trigger));
    });
})();

// ---------- Galeria coverflow ----------
(() => {
    const root = document.querySelector('[data-gallery]');
    if (!root) return;

    const figs = [...root.querySelectorAll('figure')];
    const ready = (fig) => new Promise(res => {
        const img = fig.querySelector('img');
        if (!img) return res(false);
        if (img.complete) return res(img.naturalWidth > 0);
        img.addEventListener('load', () => res(true), { once: true });
        img.addEventListener('error', () => res(false), { once: true });
    });

    Promise.all(figs.map(ready)).then(oks => {
        const items = figs.filter((_, i) => oks[i]);
        if (!items.length) { root.remove(); return; } // sem fotos válidas: o bloco some

        const stage = document.createElement('div');
        stage.className = 'cf-stage';
        stage.tabIndex = 0;
        stage.setAttribute('role', 'group');
        stage.setAttribute('aria-label', root.getAttribute('aria-label') || 'Galeria de fotos');
        items.forEach(f => { f.classList.add('cf-item'); stage.appendChild(f); });

        const n = items.length;
        const ctrl = document.createElement('div');
        ctrl.className = 'cf-ctrl';
        ctrl.innerHTML = `
            <button type="button" class="cf-btn" data-d="-1" aria-label="Foto anterior"><i class="fa-solid fa-chevron-left"></i></button>
            <span class="cf-count"><b>01</b> / ${String(n).padStart(2, '0')}</span>
            <button type="button" class="cf-btn" data-d="1" aria-label="Próxima foto"><i class="fa-solid fa-chevron-right"></i></button>`;
        const bar = document.createElement('div');
        bar.className = 'cf-bar';
        bar.innerHTML = '<i></i>';

        root.replaceChildren(stage, ctrl, bar);
        const barFill = bar.firstElementChild;
        const counter = ctrl.querySelector('.cf-count b');

        let idx = 0;
        function layout() {
            items.forEach((it, i) => {
                let d = i - idx;
                if (d > n / 2) d -= n;
                if (d < -n / 2) d += n;
                const ad = Math.abs(d);
                it.style.transform = `translate(-50%, -50%) translateX(${d * 58}%) translateZ(${-ad * 190}px) rotateY(${-d * 36}deg) scale(${1 - ad * 0.05})`;
                it.style.opacity = ad > 2 ? '0' : String(ad === 0 ? 1 : Math.max(0.3, 0.8 - ad * 0.25));
                it.style.zIndex = String(10 - ad);
                it.style.pointerEvents = ad > 2 ? 'none' : 'auto';
                it.classList.toggle('active', d === 0);
            });
            counter.textContent = String(idx + 1).padStart(2, '0');
            // reinicia a barra de autoplay
            barFill.classList.remove('run');
            void barFill.offsetWidth;
            if (n > 1) barFill.classList.add('run');
        }
        const goTo = (i) => { idx = (i + n) % n; layout(); };
        const step = (d) => goTo(idx + d);

        // clique: lateral abre a foto; foto central abre em tela cheia
        stage.addEventListener('click', (e) => {
            if (dragged) return;
            const fig = e.target.closest('.cf-item');
            if (!fig) return;
            const i = items.indexOf(fig);
            if (i === idx) {
                const img = fig.querySelector('img'), cap = fig.querySelector('figcaption');
                Lightbox.open(img.currentSrc || img.src, img.alt, cap ? cap.textContent : '');
            } else goTo(i);
        });
        ctrl.addEventListener('click', (e) => {
            const b = e.target.closest('[data-d]');
            if (b) step(Number(b.dataset.d));
        });
        stage.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
            if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
            if (e.key === 'Enter' || e.key === ' ') { items[idx].click(); e.preventDefault(); }
        });

        // arrastar para os lados
        let x0 = null, dragged = false;
        stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; dragged = false; });
        stage.addEventListener('pointerup', (e) => {
            if (x0 === null) return;
            const dx = e.clientX - x0;
            x0 = null;
            if (Math.abs(dx) > 45) { dragged = true; step(dx < 0 ? 1 : -1); setTimeout(() => { dragged = false; }, 0); }
        });
        stage.addEventListener('pointercancel', () => { x0 = null; });

        // autoplay: a própria barra marca o tempo; pausa com mouse, foco, lightbox ou fora da tela
        let hover = false, inView = true, lb = false;
        const sync = () => root.classList.toggle('paused', hover || !inView || lb || document.hidden);
        root.addEventListener('pointerenter', () => { hover = true; sync(); });
        root.addEventListener('pointerleave', () => { hover = false; sync(); });
        root.addEventListener('focusin', () => { hover = true; sync(); });
        root.addEventListener('focusout', () => { hover = false; sync(); });
        document.addEventListener('visibilitychange', sync);
        document.addEventListener('lightbox:open', () => { lb = true; sync(); });
        document.addEventListener('lightbox:close', () => { lb = false; sync(); });
        new IntersectionObserver(([en]) => { inView = en.isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
        barFill.addEventListener('animationend', () => { if (!Engine.reduce) step(1); });

        layout();
        if (typeof Motion !== 'undefined') Motion.refresh();
    });
})();
