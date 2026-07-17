const username = 'mateus-henriquee'; // SEU USUÁRIO GITHUB

// ==========================================
// 1. Barra de Progresso do Scroll
// ==========================================
window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    document.getElementById("scrollBar").style.width = scrolled + "%";
};

// ==========================================
// 2. Dropdown & Controle - Repositórios GitHub
// ==========================================
const dropdownBtn = document.getElementById('dropdown-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const reposContainer = document.getElementById('repos-container');

let allRepos = [];

if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha o menu de cursos se estiver aberto para não sobrepor
        if (dropdownMenuCursos) dropdownMenuCursos.classList.remove('show');
        dropdownMenu.classList.toggle('show');
    });
}

if (dropdownMenu) {
    dropdownMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-value');
            const limit = val === 'all' ? allRepos.length : parseInt(val);
            renderRepos(limit);
            dropdownBtn.innerHTML = `Exibir: ${val === 'all' ? 'Todas' : val} ▾`;
        });
    });
}

// ==========================================
// 3. Fetch & Render - GitHub
// ==========================================
async function fetchGithub() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        allRepos = await response.json();
        renderRepos(6); // Começa exibindo 6 por padrão
    } catch (e) {
        if (reposContainer) {
            reposContainer.innerHTML = "Erro ao carregar repositórios.";
        }
    }
}

function renderRepos(limit) {
    if (!reposContainer) return;
    reposContainer.innerHTML = '';
    
    const reposToShow = allRepos.slice(0, limit);

    reposToShow.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';
        
        card.onclick = () => window.open(repo.html_url, '_blank');
        
        const topics = repo.topics ? repo.topics.map(t => `<span class="topic-badge">${t}</span>`).join('') : '';
        const rawImageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/prev.png`;

        card.innerHTML = `
            <div class="repo-preview">
                <img src="${rawImageUrl}" 
                     alt="Prévia de ${repo.name}" 
                     class="preview-img" 
                     onerror="this.onerror=null; this.src='https://placehold.co/600x300/161b22/8a2be2?text=${repo.name}'">
            </div>
            <div class="repo-body">
                <h3 class="repo-title" style="color:#58a6ff; margin-bottom:10px">${repo.name}</h3>
                <div style="margin-bottom:10px">${topics}</div>
                <p class="repo-description" style="color:#8b949e; font-size:13px">${repo.description || 'Sem descrição'}</p>
            </div>
        `;
        reposContainer.appendChild(card);
    });
}

// ==========================================
// 4. Dropdown & Render - Cursos da Alura (Corrigido!)
// ==========================================
const dropdownBtnCursos = document.getElementById('dropdown-btn-cursos');
const dropdownMenuCursos = document.getElementById('dropdown-menu-cursos');
const aluraContainer = document.getElementById('alura-container');

// Mock de Cursos (Insira quantos cursos quiser aqui)
// Substitua o seu cursosMock por este para testar a expansão:
const cursosMock = [
    { nome: "Data Science: Primeiros Passos", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Python para Data Science", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "SQL com SQL Server", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "MongoDB: Introdução ao NoSQL", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "JavaScript: Programando na Web", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "HTML5 e CSS3: Primeira página Web", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Data Science: Análise de Dados com Pandas", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Machine Learning: Introdução", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Dashboard com Power BI", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Estatística com Python", escola: "Alura", status: "Concluído", imagemCertificado: "" },
    { nome: "Data Visualization: Gráficos de Impacto", escola: "Alura", status: "Concluído", imagemCertificado: "" }
];     

// Listener para abrir/fechar o dropdown de Cursos
if (dropdownBtnCursos && dropdownMenuCursos) {
    dropdownBtnCursos.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha o menu de repositórios se estiver aberto para não sobrepor
        if (dropdownMenu) dropdownMenu.classList.remove('show');
        dropdownMenuCursos.classList.toggle('show');
    });
}

// Listener para selecionar a quantidade no dropdown de Cursos
if (dropdownMenuCursos) {
    dropdownMenuCursos.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-value');
            const limit = val === 'all' ? cursosMock.length : parseInt(val);
            renderCursos(limit);
            dropdownBtnCursos.innerHTML = `Exibir: ${val === 'all' ? 'Todas' : val} ▾`;
        });
    });
}

// Função de renderização de cursos corrigida com suporte a limites e imagens
function renderCursos(limit = 6) {
    if (!aluraContainer) return;
    aluraContainer.innerHTML = '';
    
    const cursosToShow = cursosMock.slice(0, limit);

    cursosToShow.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'repo-card';
        
        let previewHTML = '';
        if (curso.imagemCertificado && curso.imagemCertificado !== "") {
            previewHTML = `
                <div class="repo-preview">
                    <img src="${curso.imagemCertificado}" alt="Certificado ${curso.nome}" class="preview-img">
                </div>`;
        } else {
            previewHTML = `
                <div class="repo-preview" style="background: linear-gradient(135deg, #161b22 0%, #1a1025 100%); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; height: 150px;">
                    <span style="font-size: 2.5rem;">🎓</span>
                    <span style="color: #a855f7; font-weight: bold; margin-left: 10px; font-size: 0.95rem; letter-spacing: 1px;">ALURA</span>
                </div>`;
        }

        card.innerHTML = `
            ${previewHTML}
            <div class="repo-body">
                <h3 class="repo-title" style="color:#58a6ff; margin-bottom:10px">${curso.nome}</h3>
                <div class="repo-topics" style="margin-bottom:10px">
                    <span class="topic-badge">${curso.status}</span>
                </div>
                <p class="repo-description" style="color:#8b949e; font-size:13px">Curso de capacitação profissional realizado na plataforma ${curso.escola}.</p>
            </div>
        `;
        aluraContainer.appendChild(card);
    });
}

// ==========================================
// 5. Fechamento Global dos Menus & Inicializadores
// ==========================================
document.addEventListener('click', () => {
    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (dropdownMenuCursos) dropdownMenuCursos.classList.remove('show');
});

// Execuções Iniciais
fetchGithub();
renderCursos(6); // Inicializa mostrando 6