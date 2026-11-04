// ==========================================
// CURSOS: certificados lidos sozinhos da pasta img/certificados/ do repositório
// (basta subir a imagem no GitHub). Sem pasta/internet, cai na lista abaixo.
// ==========================================
(() => {
    const USER = (typeof username !== 'undefined' && username) ? username : 'mateus-henriquee';
    const REPO = (typeof PORTFOLIO_REPO !== 'undefined' && PORTFOLIO_REPO) ? PORTFOLIO_REPO : 'portfolio_mateus-henriquee';
    const DIR = 'img/certificados';
    const CACHE_KEY = 'certificados-v2', CACHE_MS = 10 * 60 * 1000;
    const FIRST = 6, STEP = 3;

    // plano B (sem imagem de certificado)
    const FALLBACK = [
        'Data Science: Primeiros Passos', 'Python para Data Science', 'SQL com SQL Server', 'MongoDB: Introdução ao NoSQL',
        'Data Science: Análise de Dados com Pandas', 'Dashboard com Power BI', 'Estatística com Python', 'Machine Learning: Introdução',
        'Data Visualization: Gráficos de Impacto', 'JavaScript: Programando na Web', 'HTML5 e CSS3: Primeira página Web'
    ].map(nome => ({ nome, escola: 'Alura', status: 'Concluído', imagem: '' }));

    const container = document.getElementById('alura-container');
    const moreBtn = document.getElementById('cursos-load-more');
    const allBtn = document.getElementById('cursos-load-all');
    if (!container) return;

    let cursos = [], limit = FIRST;
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const readCache = (ignoreAge) => {
        try {
            const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            return c && (ignoreAge || Date.now() - c.t < CACHE_MS) ? c.data : null;
        } catch { return null; }
    };

    async function fetchCertificados() {
        const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${DIR}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const files = await res.json();
        return files
            .filter(f => f.type === 'file' && /\.(png|jpe?g|webp|gif)$/i.test(f.name))
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }))
            .map(f => ({
                nome: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(),
                escola: 'Alura', status: 'Concluído',
                imagem: `${DIR}/${encodeURIComponent(f.name)}`
            }));
    }

    function card(c, i) {
        const wrap = document.createElement('div');
        wrap.className = 'card-wrap';
        wrap.dataset.r3d = 'up';
        wrap.dataset.delay = i % 3;
        const preview = c.imagem
            ? `<img src="${esc(c.imagem)}" alt="Certificado ${esc(c.nome)}" class="preview-img" loading="lazy">`
            : `<div class="ph-stack"><i class="fa-solid fa-graduation-cap ph"></i><span class="ph-label">${esc(c.escola).toUpperCase()}</span></div>`;
        wrap.innerHTML = `
            <article class="repo-card" data-tilt ${c.imagem ? 'title="Ver certificado"' : ''}>
                <div class="repo-preview">${preview}</div>
                <div class="repo-body">
                    <h3 class="repo-title">${esc(c.nome)}</h3>
                    <div class="badges"><span class="badge">${esc(c.status)}</span></div>
                    <p class="repo-description">Capacitação realizada na plataforma ${esc(c.escola)}.</p>
                </div>
            </article>`;
        if (c.imagem) {
            wrap.firstElementChild.addEventListener('click', () => Lightbox.open(c.imagem, `Certificado ${c.nome}`, c.nome));
        }
        return wrap;
    }

    const cardEls = new Map();
    function render() {
        const list = cursos.slice(0, limit);
        container.replaceChildren(...list.map((c, i) => {
            let el = cardEls.get(c.nome);
            if (!el) { el = card(c, i); cardEls.set(c.nome, el); }
            el.dataset.delay = i % 3;
            return el;
        }));
        Motion.refresh();
        const rest = cursos.length - list.length;
        moreBtn.hidden = rest <= 0;
        allBtn.hidden = rest <= STEP;
        if (rest > 0) allBtn.textContent = `Ver todos (${cursos.length})`;
    }

    function show(list) {
        cursos = list;
        Motion.setStat('stat-cursos', list.filter(c => c.status === 'Concluído').length);
        render();
    }

    moreBtn.addEventListener('click', () => { limit += STEP; render(); });
    allBtn.addEventListener('click', () => { limit = Infinity; render(); });

    (async () => {
        const cached = readCache(false);
        if (cached && cached.length) return show(cached);
        try {
            const list = await fetchCertificados();
            if (!list.length) throw new Error('pasta vazia');
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: list })); } catch { /* ok */ }
            show(list);
        } catch {
            const stale = readCache(true);
            show(stale && stale.length ? stale : FALLBACK);
        }
    })();
})();
