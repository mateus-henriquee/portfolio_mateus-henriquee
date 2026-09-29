// ==========================================
// PROJETOS: repositórios do GitHub (próprios + contribuições) — busca, filtro e limite
// ==========================================
const reposContainer = document.getElementById('repos-container');
const repoSearch = document.getElementById('repo-search');
const repoFilters = document.getElementById('repo-filters');
const repoTopicsPanel = document.getElementById('repo-topics');
const repoLoadMore = document.getElementById('repos-load-more');
const REPOS_STEP = 3; // quantos projetos o "Ver mais" revela por clique

let allRepos = [];
let repoLimit = 6;
let repoLang = 'Todos';
let repoQuery = '';
let repoTopic = null; // topic do GitHub selecionado (ex: "docker"), ou null
let repoTopicsOpen = false;

// Repositórios de outras pessoas/organizações nos quais colaborei. A API do GitHub não lista
// isso publicamente sem login, então a lista é manual: adicione { owner, repo } como aparecem na URL.
const CONTRIBUTED_REPOS = [
    { owner: 'Fiap-Hackops', repo: 'Projeto-Hackops-fiap-2026' },
    { owner: 'Danillo-Vidal', repo: 'Plataforma-de-Recomenda-o-com-Neo4j-Redis-e-Python-' },
    { owner: 'Guilherme-Rigobello', repo: 'bluemind' },
    { owner: 'dpereirajuli', repo: 'aloSolucoes' }
];

// Projetos fixados no topo (ordem da lista abaixo), acima dos ordenados por data.
// Use "nome-do-repo" para um repositório seu, ou "dono/nome-do-repo" para um contribuído.
const FEATURED_REPOS = [
    'Fiap-Hackops/Projeto-Hackops-fiap-2026',
    'Guilherme-Rigobello/bluemind',
    'Danillo-Vidal/Plataforma-de-Recomenda-o-com-Neo4j-Redis-e-Python-'
];

const REPOS_CACHE_KEY = 'repos-v1';
const REPOS_CACHE_MS = 10 * 60 * 1000; // 10 min: poupa o limite de 60 chamadas/hora do GitHub sem login

async function fetchOwnRepos() {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return data.filter(r => !r.fork && r.name.toLowerCase() !== username.toLowerCase());
}

async function fetchContributedRepos() {
    const results = await Promise.all(CONTRIBUTED_REPOS.map(async ({ owner, repo }) => {
        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            data._contributor = true; // marca para exibir o selo, sem mexer nos campos do GitHub
            return data;
        } catch (e) {
            return null; // repositório indisponível (nome errado, privado, API fora do ar): some da lista sozinho
        }
    }));
    return results.filter(Boolean);
}

// Marca destaques e ordena. Roda TODA VEZ (mesmo com dados vindos do cache), porque
// FEATURED_REPOS pode mudar num novo envio de arquivo sem que o cache antigo saiba disso.
function applyFeatured(list) {
    list.forEach(r => {
        r._featured = FEATURED_REPOS.includes(r.full_name) || FEATURED_REPOS.includes(r.name);
    });
    const featuredOrder = (r) => FEATURED_REPOS.indexOf(r.full_name) >= 0 ? FEATURED_REPOS.indexOf(r.full_name) : FEATURED_REPOS.indexOf(r.name);

    return [...list].sort((a, b) => {
        if (a._featured !== b._featured) return a._featured ? -1 : 1; // destaques primeiro
        if (a._featured && b._featured) return featuredOrder(a) - featuredOrder(b); // na ordem da lista
        return new Date(b.pushed_at) - new Date(a.pushed_at); // os demais, por data
    });
}

function readCache() {
    try {
        const cached = JSON.parse(sessionStorage.getItem(REPOS_CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.t < REPOS_CACHE_MS) return cached.repos;
    } catch (e) { /* sem cache */ }
    return null;
}

function readStaleCache() {
    // último resultado salvo, mesmo vencido — melhor que mostrar erro se a API estiver fora do ar
    try {
        const cached = JSON.parse(sessionStorage.getItem(REPOS_CACHE_KEY) || 'null');
        return cached ? cached.repos : null;
    } catch (e) {
        return null;
    }
}

function writeCache(repos) {
    try { sessionStorage.setItem(REPOS_CACHE_KEY, JSON.stringify({ t: Date.now(), repos })); } catch (e) { /* ok */ }
}

function showRepos(repos) {
    allRepos = repos;
    const statRepos = document.getElementById('stat-repos');
    if (statRepos) statRepos.textContent = allRepos.length;
    renderFilters();
    renderRepos();
}

async function fetchGithub() {
    const cached = readCache();
    if (cached) { showRepos(applyFeatured(cached)); return; } // evita gastar o limite de requisições à toa

    try {
        const [own, contributed] = await Promise.all([fetchOwnRepos(), fetchContributedRepos()]);
        const raw = [...own, ...contributed]; // sem destaque/ordem ainda: isso é recalculado sempre, no cache ou não
        writeCache(raw);
        showRepos(applyFeatured(raw));
    } catch (e) {
        const stale = readStaleCache();
        if (stale) { showRepos(applyFeatured(stale)); return; } // API falhou agora, mas tínhamos um resultado recente

        console.warn('Repositórios: falha ao consultar a API do GitHub.', e);
        if (reposContainer) {
            reposContainer.innerHTML = `<p class="empty">Não consegui carregar os repositórios agora (provável limite de requisições do GitHub). Tente novamente em alguns minutos. <a class="link-accent" href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener">Ver no GitHub</a></p>`;
        }
    }
}

function renderFilters() {
    if (!repoFilters) return;
    const langs = [...new Set(allRepos.map(r => r.language).filter(Boolean))].sort();
    const all = ['Todos', ...langs];

    repoFilters.innerHTML = all.map(l => `<button class="chip" data-lang="${esc(l)}">${esc(l)}</button>`).join('')
        + `<button type="button" class="chip chip-toggle" id="topics-toggle" aria-expanded="false" aria-controls="repo-topics" aria-label="Mais filtros por assunto (topics do GitHub)"><i class="fa-solid fa-chevron-down"></i></button>`;

    repoFilters.querySelectorAll('.chip[data-lang]').forEach(btn => btn.addEventListener('click', () => {
        repoLang = btn.dataset.lang;
        repoLimit = 6; // troca de filtro: recomeça mostrando 6, não continua de onde o "Ver mais" parou
        renderRepos();
        syncFilterUI();
    }));

    const topicsToggle = document.getElementById('topics-toggle');
    if (topicsToggle) {
        topicsToggle.addEventListener('click', () => {
            repoTopicsOpen = !repoTopicsOpen;
            syncFilterUI();
        });
    }

    renderTopicChips();
    syncFilterUI();
}

// Chips de "topics" do GitHub (assuntos marcados nos meus repositórios), escondidos até abrir a seta
function renderTopicChips() {
    if (!repoTopicsPanel) return;
    const langsLower = new Set(allRepos.map(r => (r.language || '').toLowerCase()));
    const topics = [...new Set(allRepos.flatMap(r => r.topics || []))]
        .filter(t => !langsLower.has(t.toLowerCase())) // evita repetir chip de linguagem como topic (ex.: "python")
        .sort();

    if (!topics.length) {
        repoTopicsPanel.innerHTML = '';
        const toggle = document.getElementById('topics-toggle');
        if (toggle) toggle.hidden = true;
        return;
    }

    repoTopicsPanel.innerHTML = topics.map(t => `<button class="chip" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
    repoTopicsPanel.querySelectorAll('.chip[data-topic]').forEach(btn => btn.addEventListener('click', () => {
        repoTopic = repoTopic === btn.dataset.topic ? null : btn.dataset.topic; // clicar de novo desliga o filtro
        repoLimit = 6;
        renderRepos();
        syncFilterUI();
    }));
}

// Mantém os chips (linguagem + topics) e o painel de topics em sincronia com o estado atual
function syncFilterUI() {
    if (repoFilters) {
        repoFilters.querySelectorAll('.chip[data-lang]').forEach(c => c.classList.toggle('active', c.dataset.lang === repoLang));
    }
    const toggle = document.getElementById('topics-toggle');
    if (toggle) {
        toggle.classList.toggle('open', repoTopicsOpen);
        toggle.classList.toggle('active', !!repoTopic);
        toggle.setAttribute('aria-expanded', repoTopicsOpen);
    }
    if (repoTopicsPanel) {
        repoTopicsPanel.hidden = !repoTopicsOpen;
        repoTopicsPanel.querySelectorAll('.chip[data-topic]').forEach(c => c.classList.toggle('active', c.dataset.topic === repoTopic));
    }
}

function renderRepos() {
    if (!reposContainer) return;

    const filtered = allRepos.filter(r => {
        const okLang = repoLang === 'Todos' || r.language === repoLang;
        const okTopic = !repoTopic || (r.topics || []).includes(repoTopic);
        const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
        return okLang && okTopic && text.includes(repoQuery);
    });
    const list = filtered.slice(0, repoLimit);

    if (!list.length) {
        reposContainer.innerHTML = '<p class="empty">Nenhum projeto encontrado.</p>';
        if (repoLoadMore) repoLoadMore.hidden = true;
        return;
    }

    if (repoLoadMore) repoLoadMore.hidden = list.length >= filtered.length;

    reposContainer.innerHTML = '';
    list.forEach(repo => {
        const contributor = !!repo._contributor;
        const featured = !!repo._featured;
        const owner = repo.full_name.split('/')[0];

        const card = document.createElement('div');
        card.className = 'repo-card clickable';
        card.onclick = (e) => { if (!e.target.closest('a')) window.open(repo.html_url, '_blank', 'noopener'); };

        const topics = (repo.topics || []).slice(0, 5).map(t => `<span class="topic-badge">${esc(t)}</span>`).join('');
        const img = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/prev.png`;
        const updated = new Date(repo.pushed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const demo = repo.homepage ? `<a href="${esc(repo.homepage)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>` : '';

        card.innerHTML = `
            <div class="repo-preview">
                <i class="fa-solid fa-chart-simple ph"></i>
                <img src="${img}" alt="Prévia de ${esc(repo.name)}" class="preview-img" loading="lazy" onerror="this.remove()">
                <div class="repo-badges">
                    ${featured ? '<span class="featured-badge"><i class="fa-solid fa-star"></i> Destaque</span>' : ''}
                    ${contributor ? '<span class="contrib-badge"><i class="fa-solid fa-code-pull-request"></i> Contribuidor</span>' : ''}
                </div>
            </div>
            <div class="repo-body">
                <h3 class="repo-title">${esc(repo.name)}</h3>
                ${contributor ? `<p class="repo-owner">por ${esc(owner)}</p>` : ''}
                <div>${topics}</div>
                <p class="repo-description">${esc(repo.description) || 'Sem descrição'}</p>
                <div class="repo-meta">
                    ${repo.language ? `<span><i class="fa-solid fa-circle" style="color:#a855f7;font-size:8px"></i>${esc(repo.language)}</span>` : ''}
                    <span><i class="fa-regular fa-star"></i>${repo.stargazers_count}</span>
                    <span><i class="fa-regular fa-clock"></i>${updated}</span>
                </div>
                <div class="repo-links">
                    <a href="${esc(repo.html_url)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> Código</a>
                    ${demo}
                </div>
            </div>`;
        reposContainer.appendChild(card);
    });
}

// Mapa: nome da skill (js/skills.js) -> como filtrar os projetos.
// "lang" tenta bater com repo.language (GitHub); "query" cai na busca por texto (nome/descrição/tópicos).
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

// Chamado pelos cards de habilidades: filtra os projetos pela skill clicada e rola até a seção
function filterProjectsBySkill(skillName) {
    const cfg = SKILL_FILTER_MAP[skillName] || { query: skillName.toLowerCase() };
    repoLimit = 6;
    repoTopic = null;
    repoTopicsOpen = false;

    // usa a linguagem só se algum repo carregado realmente tiver essa linguagem
    const langs = new Set(allRepos.map(r => r.language).filter(Boolean));
    const useLang = cfg.lang && langs.has(cfg.lang) ? cfg.lang : null;

    if (useLang) {
        repoLang = useLang;
        repoQuery = '';
        if (repoSearch) repoSearch.value = '';
    } else {
        repoLang = 'Todos';
        repoQuery = (cfg.query || skillName).toLowerCase();
        if (repoSearch) repoSearch.value = cfg.query || skillName;
    }

    syncFilterUI();
    renderRepos();

    smoothScrollTo('#projetos');
}

// Chamado pelo dropdown "Exibir: N"
function setRepoLimit(n) {
    repoLimit = n;
    renderRepos();
}

function initProjects() {
    if (repoSearch) {
        repoSearch.addEventListener('input', (e) => {
            repoQuery = e.target.value.trim().toLowerCase();
            repoLimit = 6; // nova busca: recomeça mostrando 6
            renderRepos();
        });
    }
    if (repoLoadMore) {
        repoLoadMore.addEventListener('click', () => {
            repoLimit += REPOS_STEP;
            renderRepos();
        });
    }
    fetchGithub();
}