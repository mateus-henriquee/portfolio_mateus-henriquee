// ==========================================
// PROJETOS: repositórios do GitHub (meus + forks + contribuições)
// busca, filtro por linguagem, filtro por topics, "Ver mais" e filtro vindo das Skills
// ==========================================
(() => {
    const USER = (typeof username !== 'undefined' && username) ? username : 'mateus-henriquee';

    // ---------- dados editáveis ----------
    // Repositórios de outras pessoas em que contribuí (aparecem com o selo "Contribuidor")
    const CONTRIBUTED_REPOS = [
        { owner: 'Fiap-Hackops', repo: 'Projeto-Hackops-fiap-2026' },
        { owner: 'Danillo-Vidal', repo: 'Plataforma-de-Recomenda-o-com-Neo4j-Redis-e-Python-' },
        { owner: 'Guilherme-Rigobello', repo: 'bluemind' },
        { owner: 'dpereirajuli', repo: 'aloSolucoes' }
    ];
    // Fixados no topo, na ordem desta lista (selo verde "Destaque"). Pode ser "nome" ou "dono/nome".
    const FEATURED_REPOS = [
        'Fiap-Hackops/Projeto-Hackops-fiap-2026',
        'bluemind',
        'Danillo-Vidal/Plataforma-de-Recomenda-o-com-Neo4j-Redis-e-Python-'
    ];
    // Todos os meus forks entram sozinhos. Para esconder algum, coloque o nome aqui.
    const HIDDEN_FORKS = [];

    // Skill clicada -> como filtrar. "lang" = linguagem do GitHub; "query" = busca por texto.
    const SKILL_FILTER_MAP = {
        'Python': { lang: 'Python' },
        'Pandas': { query: 'pandas' },
        'Estatística': { query: 'estatística' },
        'Machine Learning': { query: 'machine learning' },
        'SQL Server': { query: 'sql' },
        'Oracle SQL': { query: 'sql' },
        'MongoDB': { query: 'mongo' },
        'Power BI': { query: 'power bi' },
        'Databricks': { query: 'databricks' },
        'Google Colab': { lang: 'Jupyter Notebook' },
        'Docker': { query: 'docker' },
        'HTML / CSS / JS': { query: 'html' },
        'Node.js': { lang: 'JavaScript' },
        'Figma': { query: 'figma' }
    };

    const STEP = 3, FIRST = 6;
    const CACHE_KEY = 'repos-v3', CACHE_MS = 10 * 60 * 1000;

    // ---------- elementos / estado ----------
    const $ = (id) => document.getElementById(id);
    const container = $('repos-container'), search = $('repo-search'), filters = $('repo-filters'),
          topicsPanel = $('repo-topics'), moreBtn = $('repos-load-more'), allBtn = $('repos-load-all');
    if (!container) return;

    let all = [], limit = FIRST, lang = 'Todos', query = '', topic = null, topicsOpen = false;
    const els = new Map(); // full_name -> elemento (reaproveita o card: a animação não recomeça)

    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = async (url) => { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };

    // ---------- busca na API (com cache e plano B) ----------
    async function fetchLive() {
        const own = (await J(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=100`))
            .filter(r => r.name.toLowerCase() !== USER.toLowerCase() && !(r.fork && HIDDEN_FORKS.includes(r.name)))
            .map(r => r.fork ? { ...r, _contributor: true } : r);

        const contrib = (await Promise.all(CONTRIBUTED_REPOS.map(async c => {
            try { return { ...(await J(`https://api.github.com/repos/${c.owner}/${c.repo}`)), _contributor: true }; }
            catch { return null; }
        }))).filter(Boolean);

        // se eu tenho fork do mesmo projeto, vale o fork (sem duplicar)
        const keep = contrib.filter(c => !own.some(r => r.fork && r.name === c.name));
        return [...own, ...keep];
    }
    const readCache = (ignoreAge) => {
        try {
            const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            return c && (ignoreAge || Date.now() - c.t < CACHE_MS) ? c.data : null;
        } catch { return null; }
    };
    const writeCache = (data) => { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch { /* sem cache, tudo bem */ } };

    // destaque e ordem são recalculados SEMPRE (mudou a lista acima? vale na hora, mesmo com cache)
    function featuredIndex(r) {
        const name = r.name.toLowerCase(), full = r.full_name.toLowerCase();
        return FEATURED_REPOS.findIndex(f => {
            f = f.toLowerCase();
            return f === full || f === name || f.split('/').pop() === name;
        });
    }
    function applyFeatured(list) {
        return list.map(r => ({ ...r, _fi: featuredIndex(r) })).map(r => ({ ...r, _featured: r._fi >= 0 }))
            .sort((a, b) => {
                if (a._featured !== b._featured) return a._featured ? -1 : 1;
                if (a._featured) return a._fi - b._fi;
                return new Date(b.pushed_at) - new Date(a.pushed_at);
            });
    }

    async function load() {
        const cached = readCache(false);
        if (cached) return show(cached);
        try {
            const data = await fetchLive();
            writeCache(data);
            show(data);
        } catch (e) {
            const stale = readCache(true);
            if (stale) return show(stale);
            container.innerHTML = `<p class="empty">Não consegui carregar os repositórios agora (provável limite de requisições do GitHub). Tente novamente em alguns minutos. <a class="link" href="https://github.com/${USER}?tab=repositories" target="_blank" rel="noopener">Ver no GitHub</a></p>`;
            Motion.setStat('stat-repos', '–');
        }
    }
    function show(raw) {
        all = applyFeatured(raw);
        Motion.setStat('stat-repos', all.length);
        renderFilters();
        render();
    }

    // ---------- filtros ----------
    function renderFilters() {
        const langs = [...new Set(all.map(r => r.language).filter(Boolean))].sort();
        filters.innerHTML = ['Todos', ...langs].map(l => `<button type="button" class="chip" data-lang="${esc(l)}">${esc(l)}</button>`).join('')
            + `<button type="button" class="chip chip-toggle" id="topics-toggle" aria-expanded="false" aria-controls="repo-topics" aria-label="Mais filtros por assunto (topics do GitHub)"><i class="fa-solid fa-chevron-down"></i></button>`;

        filters.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
            lang = b.dataset.lang; limit = FIRST; render(); syncUI();
        }));
        $('topics-toggle').addEventListener('click', () => { topicsOpen = !topicsOpen; syncUI(); });

        // topics reais dos meus repositórios (menos os que já são linguagem)
        const langsLower = new Set(all.map(r => (r.language || '').toLowerCase()));
        const topics = [...new Set(all.flatMap(r => r.topics || []))].filter(t => !langsLower.has(t.toLowerCase())).sort();
        if (!topics.length) $('topics-toggle').hidden = true;
        topicsPanel.innerHTML = topics.map(t => `<button type="button" class="chip" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
        topicsPanel.querySelectorAll('[data-topic]').forEach(b => b.addEventListener('click', () => {
            topic = topic === b.dataset.topic ? null : b.dataset.topic; // clicar de novo desliga
            limit = FIRST; render(); syncUI();
        }));
        syncUI();
    }
    function syncUI() {
        filters.querySelectorAll('[data-lang]').forEach(c => c.classList.toggle('active', c.dataset.lang === lang));
        const t = $('topics-toggle');
        if (t) {
            t.classList.toggle('open', topicsOpen);
            t.classList.toggle('active', !!topic);
            t.setAttribute('aria-expanded', topicsOpen);
        }
        topicsPanel.hidden = !topicsOpen;
        topicsPanel.querySelectorAll('[data-topic]').forEach(c => c.classList.toggle('active', c.dataset.topic === topic));
    }

    // ---------- cards ----------
    function makeCard(repo, i) {
        const wrap = document.createElement('div');
        wrap.className = 'card-wrap';
        wrap.dataset.r3d = 'up';

        const topics = (repo.topics || []).slice(0, 5).map(t => `<span class="badge">${esc(t)}</span>`).join('');
        const img = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/prev.png`;
        const updated = new Date(repo.pushed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const owner = repo.owner && repo.owner.login;
        const demo = repo.homepage ? `<a href="${esc(repo.homepage)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>` : '';
        const badges = (repo._featured ? `<span class="featured-badge"><i class="fa-solid fa-star"></i> Destaque</span>` : '')
            + (repo._contributor ? `<span class="contrib-badge"><i class="fa-solid fa-code-branch"></i> Contribuidor</span>` : '');

        wrap.innerHTML = `
            <article class="repo-card" data-tilt>
                <div class="repo-preview">
                    <div class="ph-stack"><i class="fa-solid fa-chart-simple ph"></i></div>
                    <img src="${esc(img)}" alt="Prévia de ${esc(repo.name)}" class="preview-img" loading="lazy" onerror="this.remove()">
                    ${badges ? `<div class="repo-badges">${badges}</div>` : ''}
                </div>
                <div class="repo-body">
                    <h3 class="repo-title">${esc(repo.name)}</h3>
                    ${repo._contributor && owner && owner.toLowerCase() !== USER.toLowerCase() ? `<p class="repo-owner">por ${esc(owner)}</p>` : ''}
                    <div class="badges">${topics}</div>
                    <p class="repo-description">${esc(repo.description) || 'Sem descrição'}</p>
                    <div class="repo-meta">
                        ${repo.language ? `<span><i class="fa-solid fa-circle" style="color:var(--accent);font-size:7px"></i>${esc(repo.language)}</span>` : ''}
                        <span><i class="fa-regular fa-star"></i>${repo.stargazers_count}</span>
                        <span><i class="fa-regular fa-clock"></i>${updated}</span>
                    </div>
                    <div class="repo-links">
                        <a href="${esc(repo.html_url)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Código</a>
                        ${demo}
                    </div>
                </div>
            </article>`;
        wrap.firstElementChild.addEventListener('click', (e) => {
            if (!e.target.closest('a')) window.open(repo.html_url, '_blank', 'noopener');
        });
        return wrap;
    }

    function render() {
        const filtered = all.filter(r => {
            const okLang = lang === 'Todos' || r.language === lang;
            const okTopic = !topic || (r.topics || []).includes(topic);
            const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
            return okLang && okTopic && text.includes(query);
        });
        const list = filtered.slice(0, limit);

        if (!list.length) {
            container.innerHTML = '<p class="empty">Nenhum projeto encontrado.</p>';
        } else {
            container.replaceChildren(...list.map((r, i) => {
                let el = els.get(r.full_name);
                if (!el) { el = makeCard(r, i); els.set(r.full_name, el); }
                el.dataset.delay = i % 3;
                return el;
            }));
        }
        Motion.refresh();

        const rest = filtered.length - list.length;
        moreBtn.hidden = rest <= 0;
        allBtn.hidden = rest <= STEP;
        if (rest > 0) allBtn.textContent = `Ver todos (${filtered.length})`;
    }

    // ---------- eventos ----------
    search.addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); limit = FIRST; render(); });
    moreBtn.addEventListener('click', () => { limit += STEP; render(); });
    allBtn.addEventListener('click', () => { limit = Infinity; render(); });

    // chamado pelos cards de Skills: filtra e rola até Projetos
    window.filterProjectsBySkill = function (skill) {
        const cfg = SKILL_FILTER_MAP[skill] || { query: skill.toLowerCase() };
        limit = FIRST; topic = null; topicsOpen = false;

        // usa a linguagem só se algum repo carregado realmente tiver essa linguagem
        const langs = new Set(all.map(r => r.language).filter(Boolean));
        if (cfg.lang && langs.has(cfg.lang)) {
            lang = cfg.lang; query = ''; search.value = '';
        } else {
            lang = 'Todos'; query = (cfg.query || skill).toLowerCase(); search.value = cfg.query || skill;
        }
        syncUI();
        render();
        $('projetos').scrollIntoView({ behavior: 'smooth' });
    };

    load();
})();
