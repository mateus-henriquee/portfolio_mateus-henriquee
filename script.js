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
// ANIMAÇÃO DA TRILHA PROFISSIONAL (TIMELINE)
// ==========================================
function updateTimelineProgress() {
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const progressLine = document.querySelector('.timeline-progress-line');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineWrapper || !progressLine) return;

    const wrapperRect = timelineWrapper.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calcula o quanto da timeline passou do meio da tela do usuário
    const triggerPoint = windowHeight / 2;
    const totalHeight = wrapperRect.height;
    const currentProgress = triggerPoint - wrapperRect.top;

    // Converte em porcentagem limite (0% a 100%)
    let progressPercent = (currentProgress / totalHeight) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));

    // Aplica a altura na linha roxa
    progressLine.style.height = `${progressPercent}%`;

    // Ativa os pontos (dots) conforme a linha passa por eles
    timelineItems.forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        if (dot) {
            const dotTopWithRespectToWindow = dot.getBoundingClientRect().top;
            if (dotTopWithRespectToWindow < triggerPoint) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Conecta o efeito ao evento de scroll que você já possui na página
window.addEventListener('scroll', updateTimelineProgress);
window.addEventListener('resize', updateTimelineProgress);
// Roda uma vez no início para checar o posicionamento atual
document.addEventListener('DOMContentLoaded', updateTimelineProgress);

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
// CONFIGURAÇÃO DO EMAILJS (Envio Real)
// ==========================================
// Substitua pelo seu Public Key obtido no painel do EmailJS
emailjs.init("pf3zrh5Hl2rNkmjEJ"); 

const contactForm = document.getElementById('contact-form');
const btnEnviar = document.getElementById('btn-enviar');

if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (btnEnviar) {
            btnEnviar.innerText = "Enviando...";
            btnEnviar.disabled = true;
        }

        // Envia o formulário real usando os dados dos inputs (através do atributo 'name')
        emailjs.sendForm('service_mhljs', 'template_mhljs', this) 
    .then(() => {
        // Seleciona os elementos da notificação
        const toast = document.getElementById('toast-notification');
        
        if (toast) {
            // Exibe a notificação (faz ela descer)
            toast.classList.add('show');
            
            // Remove a notificação (faz ela subir de volta) após 3 segundos (3000ms)
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Limpa o formulário e restaura o botão
        contactForm.reset();
        if (btnEnviar) btnEnviar.innerText = "Enviar Mensagem";
    }, (error) => {
        alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
        console.error('Erro EmailJS:', error);
        if (btnEnviar) btnEnviar.innerText = "Enviar Mensagem";
    })
    .finally(() => {
        if (btnEnviar) btnEnviar.disabled = false;
    });
    });
}

// ==========================================
// MÁSCARA DE TELEFONE (xx) xxxxx-xxxx
// ==========================================
const inputTelefone = document.getElementById('telefone');

if (inputTelefone) {
    inputTelefone.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Remove tudo o que não for número
        value = value.replace(/\D/g, "");
        
        // Aplica a máscara progressivamente
        if (value.length > 0) {
            value = `(${value}`;
        }
        if (value.length > 3) {
            value = `${value.slice(0, 3)}) ${value.slice(3)}`;
        }
        if (value.length > 10) {
            value = `${value.slice(0, 10)}-${value.slice(10, 14)}`;
        }
        
        e.target.value = value;
    });
}

// ==========================================
// SUGESTÕES DE DOMÍNIO DE E-MAIL
// ==========================================
const inputEmail = document.getElementById('email');
const datalistEmail = document.getElementById('email-suggestions');
const dominios = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'com.br'];

if (inputEmail && datalistEmail) {
    inputEmail.addEventListener('input', (e) => {
        const valor = e.target.value;
        datalistEmail.innerHTML = ''; // Limpa as sugestões anteriores

        // Se o usuário digitou o caractere '@'
        if (valor.includes('@')) {
            const partes = valor.split('@');
            const usuario = partes[0]; // Tudo antes do @
            const dominioDigitado = partes[1]; // Tudo depois do @

            dominios.forEach(dom => {
                // Filtra para mostrar apenas domínios que combinem com o que ele começou a digitar após o @
                if (dom.startsWith(dominioDigitado)) {
                    const option = document.createElement('option');
                    option.value = `${usuario}@${dom}`;
                    datalistEmail.appendChild(option);
                }
            });
        }
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

