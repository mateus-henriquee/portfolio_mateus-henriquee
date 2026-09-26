// ==========================================
// GALERIA: pilha de polaroids nas experiências
// ==========================================
// Como usar (no index.html, dentro do .timeline-content, logo depois do texto):
//   <div class="timeline-media" data-gallery aria-label="Fotos de ...">
//       <figure><img src="img/experiencia/foto-1.jpg" alt="Descrição"><figcaption>Legenda</figcaption></figure>
//       <figure>...</figure>
//   </div>
// Fotos que não carregam são removidas. Sem nenhuma foto, a galeria não aparece
// e o card da experiência continua como era.
const GALLERY_AUTOPLAY_MS = 5000;

function loadImage(img) {
    return new Promise((resolve) => {
        if (img.complete) return resolve(img.naturalWidth > 0);
        img.addEventListener('load', () => resolve(true), { once: true });
        img.addEventListener('error', () => resolve(false), { once: true });
    });
}

async function setupGallery(root) {
    const figures = [...root.querySelectorAll('figure')];
    const loaded = await Promise.all(figures.map(f => {
        const img = f.querySelector('img');
        return img ? loadImage(img) : Promise.resolve(false);
    }));
    const figs = figures.filter((f, i) => loaded[i]);
    if (!figs.length) return;

    const n = figs.length;
    let index = 0;
    let timer = null;
    let visible = false;
    let paused = false;

    // Monta a pilha
    const stack = document.createElement('div');
    stack.className = 'photo-stack';
    stack.tabIndex = 0;
    stack.setAttribute('role', 'group');
    stack.setAttribute('aria-roledescription', 'carrossel');
    stack.setAttribute('aria-label', root.getAttribute('aria-label') || 'Fotos');
    figs.forEach(f => { f.classList.add('polaroid'); stack.appendChild(f); });

    const gallery = document.createElement('div');
    gallery.className = 'gallery';
    gallery.appendChild(stack);

    let dots = [];
    if (n > 1) {
        const controls = document.createElement('div');
        controls.className = 'gallery-controls';

        const chevron = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
        const prev = document.createElement('button');
        prev.type = 'button'; prev.className = 'gallery-btn'; prev.setAttribute('aria-label', 'Foto anterior');
        prev.innerHTML = chevron('M15 18l-6-6 6-6');
        const next = document.createElement('button');
        next.type = 'button'; next.className = 'gallery-btn'; next.setAttribute('aria-label', 'Próxima foto');
        next.innerHTML = chevron('M9 18l6-6-6-6');

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'gallery-dots';
        dots = figs.map((_, i) => {
            const d = document.createElement('button');
            d.type = 'button'; d.className = 'gallery-dot';
            d.setAttribute('aria-label', 'Ir para a foto ' + (i + 1));
            d.addEventListener('click', () => { goTo(i); restart(); });
            dotsWrap.appendChild(d);
            return d;
        });

        prev.addEventListener('click', () => { step(-1); restart(); });
        next.addEventListener('click', () => { step(1); restart(); });
        controls.append(prev, dotsWrap, next);
        gallery.appendChild(controls);
    }

    function render() {
        figs.forEach((f, i) => {
            const pos = (i - index + n) % n;
            f.dataset.pos = pos;
            f.setAttribute('aria-hidden', pos !== 0);
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(target) {
        if (n < 2 || target === index) return;
        const leaving = figs[index];
        leaving.classList.add('leaving');
        setTimeout(() => leaving.classList.remove('leaving'), 380);
        index = target;
        render();
    }
    function step(dir) { goTo((index + dir + n) % n); }

    // Autoplay: só quando visível, sem hover/foco e sem "reduzir movimento"
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function stop() { clearInterval(timer); timer = null; }
    function start() {
        if (n < 2 || reduce || timer || paused || !visible) return;
        timer = setInterval(() => step(1), GALLERY_AUTOPLAY_MS);
    }
    function restart() { stop(); start(); }

    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
    }, { threshold: 0.3 }).observe(gallery);

    gallery.addEventListener('mouseenter', () => { paused = true; stop(); });
    gallery.addEventListener('mouseleave', () => { paused = false; start(); });
    gallery.addEventListener('focusin', () => { paused = true; stop(); });
    gallery.addEventListener('focusout', () => { paused = false; start(); });

    // Clique/toque passa a foto; arrastar para o lado navega
    let startX = null;
    stack.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    stack.addEventListener('pointercancel', () => { startX = null; });
    stack.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        else if (Math.abs(dx) < 8) step(1);
        restart();
    });
    stack.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { step(1); restart(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { step(-1); restart(); e.preventDefault(); }
    });

    // Publica
    root.replaceChildren(gallery);
    render();
    root.classList.add('ready');
    // Só muda o layout da timeline quando o bloco está AO LADO do card (filho direto do item).
    // Dentro do card (padrão), nada muda no layout.
    const parent = root.parentElement;
    if (parent && parent.classList.contains('timeline-item')) parent.classList.add('has-media');
    // o layout mudou: recalcula a linha roxa da timeline
    if (typeof updateTimelineProgress === 'function') updateTimelineProgress();
}

function initGallery() {
    document.querySelectorAll('[data-gallery]').forEach(setupGallery);
}