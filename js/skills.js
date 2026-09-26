// ==========================================
// SKILLS: dados editáveis e renderização
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
            { name: 'HTML / CSS / JS', icon: 'fa-solid fa-code', level: 'core', desc: 'Interfaces web e visualizações no navegador.', url: 'https://developer.mozilla.org/pt-BR/' },
            { name: 'Node.js', icon: 'fa-brands fa-node-js', level: 'practicing', desc: 'APIs e automações em JavaScript.', url: 'https://nodejs.org/docs/latest/api/' },
            { name: 'Figma', icon: 'fa-brands fa-figma', level: 'core', desc: 'Protótipos e layouts de dashboards.', url: 'https://help.figma.com/' }
        ]
    }
];

const levelLabels = { core: 'Base sólida', practicing: 'Praticando', learning: 'Em estudo' };

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

function initSkills() {
    renderSkills();
}
