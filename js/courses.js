// ==========================================
// CURSOS: dados editáveis e renderização
// ==========================================
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

function initCourses() {
    const statCursos = document.getElementById('stat-cursos');
    if (statCursos) statCursos.textContent = cursosMock.filter(c => c.status === 'Concluído').length;
    renderCursos(6);
}
