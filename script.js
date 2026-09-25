const username = 'mateus-henriquee'; // usuário GitHub

// ==========================================
// DADOS EDITÁVEIS
// ==========================================
// level: core = base sólida | practicing = praticando | learning = em estudo
const skillGroups = [
    {
        title: 'Análise de Dados', icon: 'fa-solid fa-magnifying-glass-chart',
        items: [
            { name: 'Python', icon: 'fa-brands fa-python', level: 'core', desc: 'Análise, automação e modelos preditivos.', url: 'https://docs.python.org/3/' },
            { name: 'Pandas', icon: 'fa-solid fa-table', level: 'practicing', desc: 'Limpeza, transformação e agregação de dados.', url: 'https://pandas.pydata.org/docs/' },
            { name: 'Estatística', icon: 'fa-solid fa-chart-line', level: 'practicing', desc: 'Descritiva, distribuições e testes de hipótese.', url: 'https://docs.scipy.org/doc/scipy/reference/stats.html' },
            { name: 'Machine Learning', icon: 'fa-solid fa-brain', level: 'learning', desc: 'Modelos supervisionados e não supervisionados.', url: 'https://scikit-learn.org/stable/' }
        ]
    },
    {
        title: 'Bancos de Dados', icon: 'fa-solid fa-database',
        items: [
            { name: 'SQL Server', icon: 'fa-solid fa-database', level: 'core', desc: 'Consultas, joins e modelagem relacional.', url: 'https://learn.microsoft.com/en-us/ssms/' },
            { name: 'Oracle SQL', icon: 'fa-solid fa-server', level: 'practicing', desc: 'Consultas e modelagem no curso de Data Science.', url: 'https://docs.oracle.com/en/database/' },
            { name: 'MongoDB', icon: 'fa-solid fa-leaf', level: 'practicing', desc: 'Dados não relacionais (NoSQL).', url: 'https://www.mongodb.com/docs/' }
        ]
    },
    {
        title: 'BI & Big Data', icon: 'fa-solid fa-chart-pie',
        items: [
            { name: 'Power BI', icon: 'fa-solid fa-chart-column', level: 'practicing', desc: 'Dashboards interativos e tratamento de dados.', url: 'https://learn.microsoft.com/en-us/power-bi/' },
            { name: 'Databricks', icon: 'fa-solid fa-layer-group', level: 'learning', desc: 'Processamento distribuído com Spark.', url: 'https://docs.databricks.com/aws/en/' },
            { name: 'Google Colab', icon: 'fa-solid fa-cloud', level: 'practicing', desc: 'Notebooks para análise e experimentos.', url: 'https://colab.research.google.com/' },
            { name: 'Docker', icon: 'fa-brands fa-docker', level: 'learning', desc: 'Ambientes isolados e reprodutíveis.', url: 'https://docs.docker.com/' }
        ]
    },
    {
        title: 'Apoio: Web & Design', icon: 'fa-solid fa-code',
        items: [
            { name: 'HTML / CSS / JS', icon: 'fa-solid fa-code', level: 'practicing', desc: 'Interfaces web e visualizações no navegador.', url: 'https://developer.mozilla.org/pt-BR/' },
            { name: 'Node.js', icon: 'fa-brands fa-node-js', level: 'practicing', desc: 'APIs e automações em JavaScript.', url: 'https://nodejs.org/docs/latest/api/' },
            { name: 'Figma', icon: 'fa-brands fa-figma', level: 'practicing', desc: 'Protótipos e layouts de dashboards.', url: 'https://help.figma.com/' }
        ]
    }
];

const levelLabels = { core: 'Base sólida', practicing: 'Praticando', learning: 'Em estudo' };

// Preencha imagemCertificado e link com a URL do certificado, se tiver.
const cursosMock = [
    { nome: "Data Science: Primeiros Passos", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Python para Data Science", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "SQL com SQL Server", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "MongoDB: Introdução ao NoSQL", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Data Science: Análise de Dados com Pandas", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Dashboard com Power BI", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Estatística com Python", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Machine Learning: Introdução", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "Data Visualization: Gráficos de Impacto", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "JavaScript: Programando na Web", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" },
    { nome: "HTML5 e CSS3: Primeira página Web", escola: "Alura", status: "Concluído", imagemCertificado: "", link: "" }
];

// ==========================================
// UTILITÁRIOS
// ==========================================
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ==========================================
// 1. Barra de progresso + nav
// ==========================================
const scrollBar = document.getElementById('scrollBar');
function updateScrollBar() {
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    if (scrollBar) scrollBar.style.width = pct + '%';
}

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }));
}

// Link ativo conforme a seção visível
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ==========================================
// 2. Timeline
// ==========================================
function updateTimelineProgress() {
    const wrapper = document.querySelector('.timeline-wrapper');
    const line = document.querySelector('.timeline-progress-line');
    if (!wrapper || !line) return;

    const rect = wrapper.getBoundingClientRect();
    const trigger = window.innerHeight / 2;
    const pct = Math.max(0, Math.min(100, ((trigger - rect.top) / rect.height) * 100));
    line.style.height = pct + '%';

    document.querySelectorAll('.timeline-item').forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        if (dot) item.classList.toggle('active', dot.getBoundingClientRect().top < trigger);
    });
}

window.addEventListener('scroll', () => { updateScrollBar(); updateTimelineProgress(); }, { passive: true });
window.addEventListener('resize', updateTimelineProgress);
document.addEventListener('DOMContentLoaded', () => { updateScrollBar(); updateTimelineProgress(); });

// ==========================================
// 3. Skills
// ==========================================
function renderSkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;
    container.innerHTML = skillGroups.map(group => `
        <div class="skill-group reveal">
            <h3><i class="${group.icon}"></i> ${esc(group.title)}</h3>
            <div class="skills-grid">
                ${group.items.map(s => `
                    <a class="skill-card" href="${esc(s.url)}" target="_blank" rel="noopener">
                        <i class="${s.icon}"></i>
                        <h4>${esc(s.name)}</h4>
                        <p>${esc(s.desc)}</p>
                        <span class="level ${s.level}">${levelLabels[s.level]}</span>
                    </a>`).join('')}
            </div>
        </div>`).join('');

    const total = skillGroups.reduce((n, g) => n + g.items.length, 0);
    const el = document.getElementById('stat-techs');
    if (el) el.textContent = total;
}

// ==========================================
// 4. Repositórios GitHub (busca, filtro, limite)
// ==========================================
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
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

if (repoSearch) {
    repoSearch.addEventListener('input', (e) => {
        repoQuery = e.target.value.trim().toLowerCase();
        renderRepos();
    });
}

// ==========================================
// 5. Cursos
// ==========================================
const dropdownBtnCursos = document.getElementById('dropdown-btn-cursos');
const dropdownMenuCursos = document.getElementById('dropdown-menu-cursos');
const aluraContainer = document.getElementById('alura-container');

function renderCursos(limit = 6) {
    if (!aluraContainer) return;
    aluraContainer.innerHTML = '';

    cursosMock.slice(0, limit).forEach(curso => {
        const card = document.createElement('div');
        card.className = 'repo-card' + (curso.link ? ' clickable' : '');
        if (curso.link) card.onclick = () => window.open(curso.link, '_blank', 'noopener');

        const preview = curso.imagemCertificado
            ? `<div class="repo-preview"><img src="${esc(curso.imagemCertificado)}" alt="Certificado ${esc(curso.nome)}" class="preview-img" loading="lazy"></div>`
            : `<div class="repo-preview"><i class="fa-solid fa-graduation-cap ph"></i><span class="ph-label">${esc(curso.escola).toUpperCase()}</span></div>`;

        card.innerHTML = `
            ${preview}
            <div class="repo-body">
                <h3 class="repo-title">${esc(curso.nome)}</h3>
                <div><span class="topic-badge">${esc(curso.status)}</span></div>
                <p class="repo-description">Capacitação realizada na plataforma ${esc(curso.escola)}.</p>
            </div>`;
        aluraContainer.appendChild(card);
    });
}

const statCursos = document.getElementById('stat-cursos');
if (statCursos) statCursos.textContent = cursosMock.filter(c => c.status === 'Concluído').length;

// ==========================================
// 6. Dropdowns
// ==========================================
function setupDropdown(btn, menu, onSelect, total) {
    if (!btn || !menu) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-content.show').forEach(m => { if (m !== menu) m.classList.remove('show'); });
        menu.classList.toggle('show');
    });
    menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const val = b.dataset.value;
        onSelect(val === 'all' ? Infinity : parseInt(val, 10));
        btn.innerHTML = `Exibir: ${val === 'all' ? 'Todos' : val} ▾`;
    }));
}

setupDropdown(dropdownBtn, dropdownMenu, (n) => { repoLimit = n; renderRepos(); });
setupDropdown(dropdownBtnCursos, dropdownMenuCursos, (n) => renderCursos(n));

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-content.show').forEach(m => m.classList.remove('show'));
    if (navLinks) navLinks.classList.remove('open');
});

// ==========================================
// 7. Formulário (EmailJS)
// ==========================================
if (typeof emailjs !== 'undefined') emailjs.init("pf3zrh5Hl2rNkmjEJ");

const contactForm = document.getElementById('contact-form');
const btnEnviar = document.getElementById('btn-enviar');

if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof emailjs === 'undefined') {
            alert('Serviço de e-mail indisponível. Use o e-mail direto.');
            return;
        }

        btnEnviar.innerText = 'Enviando...';
        btnEnviar.disabled = true;

        emailjs.sendForm('service_mhljs', 'template_mhljs', contactForm)
            .then(() => {
                const toast = document.getElementById('toast-notification');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
                contactForm.reset();
            })
            .catch((error) => {
                alert('Erro ao enviar a mensagem. Tente novamente.');
                console.error('Erro EmailJS:', error);
            })
            .finally(() => {
                btnEnviar.innerText = 'Enviar mensagem';
                btnEnviar.disabled = false;
            });
    });
}

// Máscara de telefone (xx) xxxxx-xxxx
const inputTelefone = document.getElementById('telefone');
if (inputTelefone) {
    inputTelefone.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 0) v = `(${v}`;
        if (v.length > 3) v = `${v.slice(0, 3)}) ${v.slice(3)}`;
        if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
        e.target.value = v;
    });
}

// Sugestões de domínio de e-mail
const inputEmail = document.getElementById('email');
const datalistEmail = document.getElementById('email-suggestions');
const dominios = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];

if (inputEmail && datalistEmail) {
    inputEmail.addEventListener('input', (e) => {
        const valor = e.target.value;
        datalistEmail.innerHTML = '';
        if (!valor.includes('@')) return;
        const [usuario, digitado = ''] = valor.split('@');
        dominios.filter(d => d.startsWith(digitado)).forEach(d => {
            const opt = document.createElement('option');
            opt.value = `${usuario}@${d}`;
            datalistEmail.appendChild(opt);
        });
    });
}

// ==========================================
// 8. Animação de entrada
// ==========================================
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

function observeReveals() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

// ==========================================
// INIT
// ==========================================
renderSkills();
renderCursos(6);
observeReveals();
fetchGithub();