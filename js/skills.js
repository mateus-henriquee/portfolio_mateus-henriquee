// ==========================================
// SKILLS: anel 3D que gira com o scroll (desktop) ou lista empilhada (celular)
// Clicar numa skill rola até Projetos e já filtra por ela (ver projects.js)
// ==========================================
(() => {
    // level: core = base sólida | practicing = praticando | learning = em estudo
    const GROUPS = [
        {
            title: 'Análise de Dados', icon: 'fa-solid fa-magnifying-glass-chart',
            items: [
                { name: 'Python', icon: 'fa-brands fa-python', level: 'core', desc: 'Análise, automação e modelos preditivos.' },
                { name: 'Pandas', icon: 'fa-solid fa-table', level: 'practicing', desc: 'Limpeza, transformação e agregação de dados.' },
                { name: 'Estatística', icon: 'fa-solid fa-chart-line', level: 'practicing', desc: 'Descritiva, distribuições e testes de hipótese.' },
                { name: 'Machine Learning', icon: 'fa-solid fa-brain', level: 'learning', desc: 'Modelos supervisionados e não supervisionados.' }
            ]
        },
        {
            title: 'Bancos de Dados', icon: 'fa-solid fa-database',
            items: [
                { name: 'SQL Server', icon: 'fa-solid fa-database', level: 'core', desc: 'Consultas, joins e modelagem relacional.' },
                { name: 'Oracle SQL', icon: 'fa-solid fa-server', level: 'practicing', desc: 'Consultas e modelagem no curso de Data Science.' },
                { name: 'MongoDB', icon: 'fa-solid fa-leaf', level: 'practicing', desc: 'Dados não relacionais (NoSQL).' }
            ]
        },
        {
            title: 'BI & Big Data', icon: 'fa-solid fa-chart-pie',
            items: [
                { name: 'Power BI', icon: 'fa-solid fa-chart-column', level: 'practicing', desc: 'Dashboards interativos e tratamento de dados.' },
                { name: 'Databricks', icon: 'fa-solid fa-layer-group', level: 'learning', desc: 'Processamento distribuído com Spark.' },
                { name: 'Google Colab', icon: 'fa-solid fa-cloud', level: 'practicing', desc: 'Notebooks para análise e experimentos.' },
                { name: 'Docker', icon: 'fa-brands fa-docker', level: 'learning', desc: 'Ambientes isolados e reprodutíveis.' }
            ]
        },
        {
            title: 'Apoio: Web & Design', icon: 'fa-solid fa-code',
            items: [
                { name: 'HTML / CSS / JS', icon: 'fa-solid fa-code', level: 'practicing', desc: 'Interfaces web e visualizações no navegador.' },
                { name: 'Node.js', icon: 'fa-brands fa-node-js', level: 'practicing', desc: 'APIs e automações em JavaScript.' },
                { name: 'Figma', icon: 'fa-brands fa-figma', level: 'practicing', desc: 'Protótipos e layouts de dashboards.' }
            ]
        }
    ];
    const LEVEL = { core: 'Base sólida', practicing: 'Praticando', learning: 'Em estudo' };
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const section = document.getElementById('skills');
    const ring = document.getElementById('skill-ring');
    if (!section || !ring) return;
    const N = GROUPS.length;

    ring.innerHTML = GROUPS.map((g, i) => `
        <div class="ring-panel" data-i="${i}">
            <div class="panel-head"><i class="${g.icon}"></i><h3>${esc(g.title)}</h3><span>${String(g.items.length).padStart(2, '0')}</span></div>
            ${g.items.map(s => `
                <button type="button" class="skill" data-skill="${esc(s.name)}" title="Ver projetos de ${esc(s.name)}">
                    <i class="${s.icon}"></i>
                    <span class="s-body"><b>${esc(s.name)}</b><small>${esc(s.desc)}</small></span>
                    <em class="lvl ${s.level}">${LEVEL[s.level]}</em>
                </button>`).join('')}
        </div>`).join('');

    const panels = [...ring.querySelectorAll('.ring-panel')];
    const dotsEl = document.getElementById('ring-dots');
    const idxEl = document.getElementById('ring-index');
    const titleEl = document.getElementById('ring-title');
    if (dotsEl) dotsEl.innerHTML = GROUPS.map((g, i) => `<button type="button" aria-label="${esc(g.title)}" data-go="${i}"></button>`).join('');
    const dots = dotsEl ? [...dotsEl.children] : [];

    // contador "Tecnologias" do hero
    const total = GROUPS.reduce((n, g) => n + g.items.length, 0);
    if (typeof Motion !== 'undefined') Motion.setStat('stat-techs', total);

    // clique numa skill -> projetos filtrados
    ring.addEventListener('click', (e) => {
        const b = e.target.closest('[data-skill]');
        if (b && typeof window.filterProjectsBySkill === 'function') window.filterProjectsBySkill(b.dataset.skill);
    });

    // ---------- 3D ----------
    const STEP = 34;   // graus entre painéis
    const R = 760;     // raio do anel em px
    const mq = window.matchMedia('(min-width: 900px)');
    let is3d = false, cur = 0, lastActive = -1;

    function setMode() {
        is3d = mq.matches && !Engine.reduce;
        section.classList.toggle('is-static', !is3d);
        section.style.height = is3d ? `${100 + (N - 1) * 80}svh` : '';
        panels.forEach((el, i) => {
            if (is3d) {
                el.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px) translate(-50%, -50%)`;
            } else {
                el.style.transform = ''; el.style.opacity = ''; el.removeAttribute('inert');
            }
        });
        if (!is3d) ring.style.transform = '';
        lastActive = -1;
    }
    mq.addEventListener('change', setMode);
    setMode();

    function setActive(i) {
        if (i === lastActive) return;
        lastActive = i;
        if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
        if (titleEl) titleEl.textContent = GROUPS[i].title;
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
    }

    // pontos do indicador: levam ao painel correspondente
    if (dotsEl) dotsEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-go]');
        if (!b || !is3d) return;
        const range = section.offsetHeight - window.innerHeight;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (Number(b.dataset.go) / (N - 1)) * range + 2, behavior: 'smooth' });
    });

    let lastT = 0;
    Engine.add((s, t) => {
        const dt = Math.min(100, lastT ? t - lastT : 16.7); lastT = t;
        if (!is3d) return;
        const r = section.getBoundingClientRect();
        if (r.bottom < -200 || r.top > s.vh + 200) return;
        const range = section.offsetHeight - s.vh;
        const p = Engine.clamp(-r.top / range);
        cur += (p - cur) * (1 - Math.pow(0.88, dt / 16.7));   // mesma suavidade em 30, 60 ou 120 fps
        const f = cur * (N - 1);
        ring.style.transform = `translateZ(${-R}px) rotateY(${-f * STEP}deg)`;
        panels.forEach((el, i) => {
            const ad = Math.abs(i - f);
            el.style.opacity = String(Math.max(0.1, 1 - ad * 0.62));
            const active = ad < 0.5;
            el.classList.toggle('is-active', active);
            if (active) el.removeAttribute('inert'); else el.setAttribute('inert', '');
        });
        setActive(Math.round(f));
    });
    setActive(0);
})();
