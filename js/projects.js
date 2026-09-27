// ==========================================
// PROJETOS: repositórios do GitHub (próprios + contribuições) — busca, filtro e limite
// ==========================================
const reposContainer = document.getElementById('repos-container');
const repoSearch = document.getElementById('repo-search');
const repoFilters = document.getElementById('repo-filters');

let allRepos = [];
let repoLimit = 6;
let repoLang = 'Todos';
let repoQuery = '';

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
    'ORACLExDATASUS_challenge-FIAP-2026',
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
    repoFilters.innerHTML = all.map(l => `<button class="chip ${l === repoLang ? 'active' : ''}" data-lang="${esc(l)}">${esc(l)}</button>`).join('');
    repoFilters.querySelectorAll('.chip').forEach(btn => btn.addEventListener('click', () => {
        repoLang = btn.dataset.lang;
        repoFilters.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
        renderRepos();
    }));
}

function renderRepos() {
    if (!reposContainer) return;

    const filtered = allRepos.filter(r => {
        const okLang = repoLang === 'Todos' || r.language === repoLang;
        const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase();
        return okLang && text.includes(repoQuery);
    });
    const list = filtered.slice(0, repoLimit);

    if (!list.length) {
        reposContainer.innerHTML = '<p class="empty">Nenhum projeto encontrado.</p>';
        return;
    }

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

// Chamado pelo dropdown "Exibir: N"
function setRepoLimit(n) {
    repoLimit = n;
    renderRepos();
}

function initProjects() {
    if (repoSearch) {
        repoSearch.addEventListener('input', (e) => {
            repoQuery = e.target.value.trim().toLowerCase();
            renderRepos();
        });
    }
    fetchGithub();
}