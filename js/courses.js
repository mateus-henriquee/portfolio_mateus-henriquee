// ==========================================
// CURSOS: puxados automaticamente da pasta img/certificados (API do GitHub)
// ==========================================
// Como adicionar um curso: coloque a imagem (ou PDF) do certificado em
//   img/certificados/  com o nome no formato:
//   escola__nome-do-curso__AAAA-MM.jpg      ex.: alura__python-para-data-science__2026-03.jpg
// Faça o push. O card aparece sozinho no site.
//
// Acentos e link do certificado (opcional): crie o arquivo certificados.json na raiz:
//   { "alura__python-para-data-science__2026-03.jpg": { "nome": "Python para Data Science", "link": "https://..." } }
//
// Se a API falhar ou a pasta estiver vazia, usa a lista de exemplo abaixo.
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

let cursos = cursosMock;
const aluraContainer = document.getElementById('alura-container');

// ---------- Leitura da pasta de certificados ----------
const CERT_DIR = 'img/certificados';
const CERT_IMG_EXT = ['jpg', 'jpeg', 'png', 'webp'];
const CERT_CACHE_KEY = 'certificados-v1';
const CERT_CACHE_MS = 10 * 60 * 1000; // poupa o limite de 60 chamadas/hora da API
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'a', 'o', 'na', 'no', 'ao']);
const SIGLAS = { sql: 'SQL', nosql: 'NoSQL', html: 'HTML', html5: 'HTML5', css: 'CSS', css3: 'CSS3', api: 'API', ia: 'IA', bi: 'BI', aws: 'AWS', json: 'JSON', etl: 'ETL', javascript: 'JavaScript', mongodb: 'MongoDB', oci: 'OCI', ux: 'UX', ui: 'UI' };

function titulo(slug) {
    return slug.replace(/[-_]+/g, ' ').trim().split(/\s+/).map((w, i) => {
        const k = w.toLowerCase();
        if (SIGLAS[k]) return SIGLAS[k];
        if (i > 0 && MINUSCULAS.has(k)) return k;
        return k.charAt(0).toUpperCase() + k.slice(1);
    }).join(' ');
}

function linkSeguro(url) { return /^https?:\/\//i.test(url || '') ? url : ''; }

// Converte um arquivo da pasta em um curso: escola__nome-do-curso__AAAA-MM.ext
function arquivoParaCurso(file, extra = {}) {
    const dot = file.name.lastIndexOf('.');
    const ext = file.name.slice(dot + 1).toLowerCase();
    const parts = file.name.slice(0, dot).split('__');
    const dataMatch = /^(\d{4})-(\d{2})$/.exec(parts[parts.length - 1] || '');
    const data = dataMatch ? parts.pop() : '';
    const escola = parts.length > 1 ? titulo(parts.shift()) : '';
    const isImg = CERT_IMG_EXT.includes(ext);
    const [ano, mes] = data.split('-');
    return {
        nome: extra.nome || titulo(parts.join(' ')),
        escola: extra.escola || escola,
        status: 'Concluído',
        data: extra.data || data,
        dataLabel: data ? `${MESES[+mes - 1] || ''}/${ano}` : '',
        imagemCertificado: isImg ? file.download_url : '',
        link: linkSeguro(extra.link) || file.download_url
    };
}

async function carregarCursos() {
    try {
        const cached = JSON.parse(sessionStorage.getItem(CERT_CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.t < CERT_CACHE_MS) return cached.cursos;
    } catch (e) { /* sem cache */ }

    const res = await fetch(`https://api.github.com/repos/${username}/${PORTFOLIO_REPO}/contents/${CERT_DIR}`);
    if (!res.ok) throw new Error('API ' + res.status);
    const files = (await res.json()).filter(f => f.type === 'file' && /\.(jpe?g|png|webp|pdf)$/i.test(f.name));

    let extras = {};
    try {
        const r = await fetch('certificados.json');
        if (r.ok) extras = await r.json();
    } catch (e) { /* opcional */ }

    const lista = files
        .map(f => arquivoParaCurso(f, extras[f.name]))
        .sort((a, b) => (b.data || '').localeCompare(a.data || '') || a.nome.localeCompare(b.nome, 'pt'));

    try { sessionStorage.setItem(CERT_CACHE_KEY, JSON.stringify({ t: Date.now(), cursos: lista })); } catch (e) { /* ok */ }
    return lista;
}

// ---------- Renderização ----------
function renderCursos(limit = 6) {
    if (!aluraContainer) return;
    aluraContainer.innerHTML = '';

    cursos.slice(0, limit).forEach(curso => {
        const card = document.createElement('div');
        card.className = 'repo-card' + (curso.link ? ' clickable' : '');
        if (curso.link) card.onclick = () => window.open(curso.link, '_blank', 'noopener');

        const preview = curso.imagemCertificado
            ? `<div class="repo-preview"><img src="${esc(curso.imagemCertificado)}" alt="Certificado ${esc(curso.nome)}" class="preview-img" loading="lazy"></div>`
            : `<div class="repo-preview"><i class="fa-solid fa-graduation-cap ph"></i><span class="ph-label">${esc(curso.escola || 'Certificado').toUpperCase()}</span></div>`;

        const desc = curso.escola
            ? `Capacitação realizada na plataforma ${esc(curso.escola)}.`
            : 'Certificado de conclusão.';
        const dataBadge = curso.dataLabel ? ` <span class="topic-badge">${esc(curso.dataLabel)}</span>` : '';

        card.innerHTML = `
            ${preview}
            <div class="repo-body">
                <h3 class="repo-title">${esc(curso.nome)}</h3>
                <div><span class="topic-badge">${esc(curso.status)}</span>${dataBadge}</div>
                <p class="repo-description">${desc}</p>
            </div>`;
        aluraContainer.appendChild(card);
    });
}

function atualizarStatCursos() {
    const stat = document.getElementById('stat-cursos');
    if (stat) stat.textContent = cursos.filter(c => c.status === 'Concluído').length;
}

async function initCourses() {
    atualizarStatCursos();
    renderCursos(6);
    try {
        const lista = await carregarCursos();
        if (!lista.length) return; // pasta vazia: mantém os exemplos
        cursos = lista;
        atualizarStatCursos();
        renderCursos(6);
    } catch (e) {
        console.warn('Certificados: usando lista de exemplo.', e);
    }
}