// ==========================================
// GALERIA: painéis expansíveis (estilo HUD) nas experiências
// ==========================================
// Como usar (no index.html, dentro do .timeline-content, logo depois do texto):
//   <div class="timeline-media" data-gallery aria-label="Fotos de ...">
//       <figure><img src="img/experiencia/foto-1.jpg" alt="Descrição"><figcaption>Legenda</figcaption></figure>
//       <figure>...</figure>
//   </div>
// Fotos que não carregam são removidas. Sem nenhuma foto, a galeria não aparece
// e o card da experiência continua como era.
// O avanço automático é guiado pela barra de progresso (CSS): ela pausa
// com o mouse/foco, fora da tela e com "reduzir movimento".

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
    const pad = (v) => String(v).padStart(2, '0');
    let index = 0;

    // Monta os painéis
    const strip = document.createElement('div');
    strip.className = 'reel-strip';
    strip.tabIndex = 0;
    strip.setAttribute('role', 'group');
    strip.setAttribute('aria-roledescription', 'carrossel');
    strip.setAttribute('aria-label', root.getAttribute('aria-label') || 'Fotos');
    figs.forEach((f, i) => {
        f.classList.add('reel-item');
        f.dataset.idx = 'IMG_' + pad(i + 1);
        strip.appendChild(f);
    });

    const gallery = document.createElement('div');
    gallery.className = 'reel';
    gallery.appendChild(strip);

    // Barra de status: contador, progresso e setas
    let counter = null;
    let fill = null;
    if (n > 1) {
        const bar = document.createElement('div');
        bar.className = 'reel-bar';

        counter = document.createElement('span');
        counter.className = 'reel-counter';

        const progress = document.createElement('div');
        progress.className = 'reel-progress';
        fill = document.createElement('span');
        progress.appendChild(fill);

        const chevron = (d) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
        const mkBtn = (label, d, dir) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'reel-btn';
            b.setAttribute('aria-label', label);
            b.innerHTML = chevron(d);
            b.addEventListener('click', () => step(dir));
            return b;
        };

        bar.append(counter, progress, mkBtn('Foto anterior', 'M15 18l-6-6 6-6', -1), mkBtn('Próxima foto', 'M9 18l6-6-6-6', 1));
        gallery.appendChild(bar);

        // fim da barra = próxima foto
        fill.addEventListener('animationend', () => step(1));
    }

    function render() {
        figs.forEach((f, i) => f.classList.toggle('active', i === index));
        if (counter) counter.innerHTML = `<b>${pad(index + 1)}</b> / ${pad(n)}`;
        if (fill) { // reinicia a animação da barra
            fill.classList.remove('run');
            void fill.offsetWidth;
            fill.classList.add('run');
        }
    }

    function goTo(target) {
        if (n < 2 || target === index) return;
        index = target;
        render();
    }
    function step(dir) { goTo((index + dir + n) % n); }

    // Pausa: mouse, foco e fora da tela
    const setPaused = (v) => gallery.classList.toggle('paused', v);
    let hovering = false, focused = false, visible = false;
    const sync = () => setPaused(hovering || focused || !visible);
    gallery.addEventListener('mouseenter', () => { hovering = true; sync(); });
    gallery.addEventListener('mouseleave', () => { hovering = false; sync(); });
    // só foco por teclado pausa (clicar num botão não deve travar o avanço)
    gallery.addEventListener('focusin', (e) => { focused = e.target.matches(':focus-visible'); sync(); });
    gallery.addEventListener('focusout', () => { focused = false; sync(); });
    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        sync();
    }, { threshold: 0.3 }).observe(gallery);
    sync();

    // Clique em um painel abre ele; clique no aberto passa para o próximo. Arrastar navega.
    let startX = null;
    strip.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    strip.addEventListener('pointercancel', () => { startX = null; });
    strip.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) return step(dx < 0 ? 1 : -1);
        if (Math.abs(dx) >= 8) return;
        const item = e.target.closest('.reel-item');
        if (!item) return;
        const i = figs.indexOf(item);
        i === index ? step(1) : goTo(i);
    });
    strip.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });

    // Publica
    root.replaceChildren(gallery);
    render();
    root.classList.add('ready');
    // o layout mudou: recalcula a linha roxa da timeline
    if (typeof updateTimelineProgress === 'function') updateTimelineProgress();
}

function initGallery() {
    document.querySelectorAll('[data-gallery]').forEach(setupGallery);
}