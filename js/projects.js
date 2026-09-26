// ==========================================
// PROJETOS: repositórios do GitHub (busca, filtro e limite)
// ==========================================
const reposContainer = document.getElementById('repos-container');
const repoSearch = document.getElementById('repo-search');
const repoFilters = document.getElementById('repo-filters');

let allRepos = [];
let repoLimit = 6;
let repoLang = 'Todos';
let repoQuery = '';

async function fetchGithub() {
    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        allRepos = data
            .filter(r => !r.fork && r.name.toLowerCase() !== username.toLowerCase())
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

        const statRepos = document.getElementById('stat-repos');
        if (statRepos) statRepos.textContent = allRepos.length;

        renderFilters();
        renderRepos();
    } catch (e) {
        if (reposContainer) {
            reposContainer.innerHTML = `<p class="empty">Não consegui carregar os repositórios agora. <a class="link-accent" href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener">Ver no GitHub</a></p>`;
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
        const card = document.createElement('div');
        card.className = 'repo-card clickable';
        card.onclick = (e) => { if (!e.target.closest('a')) window.open(repo.html_url, '_blank', 'noopener'); };

        const topics = (repo.topics || []).slice(0, 5).map(t => `<span class="topic-badge">${esc(t)}</span>`).join('');
        const img = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch || 'main'}/prev.png`;
        const updated = new Date(repo.pushed_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const demo = repo.homepage ? `<a href="${esc(repo.homepage)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>` : '';

        card.innerHTML = `
            <div class="repo-preview">
                <i class="fa-solid fa-chart-simple ph"></i>
                <img src="${img}" alt="Prévia de ${esc(repo.name)}" class="preview-img" loading="lazy" onerror="this.remove()">
            </div>
            <div class="repo-body">
                <h3 class="repo-title">${esc(repo.name)}</h3>
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
