// ==========================================
// ESTUDO DE CASO: repositórios criados por mês
// Dados reais: API pública do GitHub (campo created_at de cada repositório).
// Gráfico de barras em SVG, sem biblioteca.
// ==========================================
(() => {
    const chartEl = document.getElementById('case-chart');
    const tipEl = document.getElementById('case-tip');
    if (!chartEl || !tipEl) return;

    const USER = typeof username !== 'undefined' ? username : 'mateus-henriquee';
    const CACHE_KEY = 'case-repos-v1';
    const CACHE_MS = 10 * 60 * 1000;
    const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const MON_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const $ = (id) => document.getElementById(id);
    const state = { forks: false, range: '12' };
    let repos = null;     // [{ name, month: 'YYYY-MM', fork }]
    let view = null;      // meses e contagens exibidos agora
    let layout = null;    // medidas do desenho (para posicionar o tooltip)
    let seen = false;     // o gráfico já apareceu na tela?
    let lastW = 0;

    // ---------- dados ----------
    function readCache() {
        try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch (e) { return null; }
    }
    function writeCache(data) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) { /* sem cache */ }
    }
    async function load() {
        const cached = readCache();
        if (cached && Array.isArray(cached.data) && Date.now() - cached.t < CACHE_MS) return cached.data;
        try {
            const all = [];
            for (let page = 1; page <= 3; page++) {
                const res = await fetch(`https://api.github.com/users/${encodeURIComponent(USER)}/repos?per_page=100&type=owner&page=${page}`);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const list = await res.json();
                all.push(...list);
                if (list.length < 100) break;
            }
            const data = all
                .filter(r => r.name.toLowerCase() !== USER.toLowerCase())   // ignora o repositório de perfil
                .map(r => ({ name: r.name, month: String(r.created_at).slice(0, 7), fork: !!r.fork }));
            writeCache(data);
            return data;
        } catch (e) {
            if (cached && Array.isArray(cached.data)) return cached.data;   // melhor um dado antigo que nenhum
            throw e;
        }
    }

    // ---------- cálculo ----------
    const key = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
    function monthsFrom(startKey, endKey) {
        let [y, m] = startKey.split('-').map(Number);
        const out = [];
        while (key(y, m) <= endKey) {
            out.push(key(y, m));
            if (++m > 12) { m = 1; y++; }
        }
        return out;
    }
    // alto = acima da média do período (verde) | baixo = abaixo (vermelho) | igual = neutro (roxo)
    const kind = (c, avg) => (c > avg + 1e-9 ? 'up' : c < avg - 1e-9 ? 'down' : 'mid');
    const STATUS = { up: 'acima da média', down: 'abaixo da média', mid: 'na média' };
    const fmt = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
    const plural = (n) => `${n} ${n === 1 ? 'repositório' : 'repositórios'}`;
    const label = (k) => `${MON[Number(k.slice(5)) - 1]}/${k.slice(2, 4)}`;
    const full = (k) => `${MON_FULL[Number(k.slice(5)) - 1]} de ${k.slice(0, 4)}`;

    function compute() {
        const list = repos.filter(r => state.forks || !r.fork);
        if (!list.length) return null;
        const now = new Date();
        const nowKey = key(now.getFullYear(), now.getMonth() + 1);
        const first = list.reduce((a, r) => (r.month < a ? r.month : a), list[0].month);
        const last = list.reduce((a, r) => (r.month > a ? r.month : a), list[0].month);
        let months = monthsFrom(first, last > nowKey ? last : nowKey);
        const span = months.length;
        if (state.range === '12' && span > 12) months = months.slice(-12);
        const names = new Map(months.map(m => [m, []]));
        list.forEach(r => { if (names.has(r.month)) names.get(r.month).push(r.name); });
        const counts = months.map(m => names.get(m).length);
        const total = counts.reduce((a, b) => a + b, 0);
        return { months, names, counts, span, total, avg: total / months.length };
    }

    // ---------- desenho ----------
    // curva suave que nunca passa dos valores vizinhos (não "afunda" abaixo de 0)
    function smoothPath(pts) {
        const n = pts.length;
        if (n === 1) return `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
        const dx = [], mk = [];
        for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; mk[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
        const t = [mk[0]];
        for (let i = 1; i < n - 1; i++) t[i] = mk[i - 1] * mk[i] <= 0 ? 0 : (mk[i - 1] + mk[i]) / 2;
        t[n - 1] = mk[n - 2];
        for (let i = 0; i < n - 1; i++) {
            if (mk[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
            const a = t[i] / mk[i], b = t[i + 1] / mk[i], h = Math.hypot(a, b);
            if (h > 3) { const k = 3 / h; t[i] = k * a * mk[i]; t[i + 1] = k * b * mk[i]; }
        }
        let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
        for (let i = 0; i < n - 1; i++) {
            const c = dx[i] / 3;
            d += ` C${(pts[i][0] + c).toFixed(1)},${(pts[i][1] + t[i] * c).toFixed(1)} ${(pts[i + 1][0] - c).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * c).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
        }
        return d;
    }

    function draw(v, animate) {
        const W = Math.max(280, Math.round(chartEl.clientWidth));
        const H = Math.round(Math.min(320, Math.max(220, W * 0.42)));
        const m = { l: 30, r: 4, t: 20, b: 40 };
        const iw = W - m.l - m.r, ih = H - m.t - m.b;
        const n = v.months.length;
        const slot = iw / n;
        const max = Math.max(1, ...v.counts);
        const step = Math.max(1, Math.ceil(max / 4));
        const yMax = step * Math.ceil(max / step);
        const every = [1, 2, 3, 6, 12].find(k => slot * k >= 34) || 12;
        const peaks = v.counts.filter(c => c === max && c > 0).length;
        layout = { W, m, slot, ih, yMax };

        const yAvg = m.t + ih - (v.avg / yMax) * ih;
        let s = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="Gráfico de linhas: repositórios criados por mês">`;
        s += `<defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(168,85,247)" stop-opacity=".5"/><stop offset=".6" stop-color="rgb(168,85,247)" stop-opacity=".14"/><stop offset="1" stop-color="rgb(168,85,247)" stop-opacity="0"/></linearGradient>` +
            `<clipPath id="cpReveal"><rect class="reveal" x="0" y="-10" width="${W}" height="${H + 20}"/></clipPath></defs>`;
        for (let t = 0; t <= yMax; t += step) {
            const y = m.t + ih - (t / yMax) * ih;
            s += `<line class="${t ? 'grid-l' : 'base-l'}" x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}"/>`;
            s += `<text class="yl" x="${m.l - 8}" y="${y + 3.5}">${t}</text>`;
        }
        if (v.avg > 0) {
            s += `<line class="avg-l" x1="${m.l}" x2="${W - m.r}" y1="${yAvg.toFixed(1)}" y2="${yAvg.toFixed(1)}"/>`;
        }
        const base = m.t + ih;
        const px = (i) => m.l + i * slot + slot / 2;
        const py = (c) => base - (c / yMax) * ih;
        const pts = v.counts.map((c, i) => [px(i), py(c)]);
        const line = smoothPath(pts);
        s += `<path class="area" clip-path="url(#cpReveal)" d="${line} L${pts[n - 1][0].toFixed(1)},${base} L${pts[0][0].toFixed(1)},${base} Z"/>`;
        s += `<path class="line" pathLength="1" d="${line}"/>`;
        s += `<line class="guide" x1="0" x2="0" y1="${m.t}" y2="${base}"/>`;
        const r = slot < 16 ? 3 : 4.5;
        let firstLabel = true;
        v.months.forEach((k, i) => {
            const c = v.counts[i];
            const mon = Number(k.slice(5)) - 1;
            const [cx, cy] = pts[i];
            s += `<circle class="pt ${kind(c, v.avg)}" data-i="${i}" style="--i:${i}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}"/>`;
            if (c === max && c > 0 && (slot >= 14 || peaks === 1)) s += `<text class="val" x="${cx.toFixed(1)}" y="${(cy - 13).toFixed(1)}">${c}</text>`;
            if (mon % every === 0) {
                s += `<text class="xl" x="${cx.toFixed(1)}" y="${H - m.b + 17}">${MON[mon]}</text>`;
                if (mon === 0 || firstLabel) s += `<text class="yr" x="${cx.toFixed(1)}" y="${H - m.b + 31}">${k.slice(0, 4)}</text>`;
                firstLabel = false;
            }
        });
        v.months.forEach((k, i) => {
            s += `<rect class="hit" data-i="${i}" tabindex="0" aria-label="${full(k)}: ${plural(v.counts[i])}" x="${(m.l + i * slot).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${H - m.b + 4}"/>`;
        });
        s += '</svg>';

        hideTip();
        chartEl.classList.toggle('still', !animate);
        chartEl.classList.remove('in');
        chartEl.innerHTML = s;
        void chartEl.offsetWidth;   // reinicia a animação das barras
        if (seen) requestAnimationFrame(() => chartEl.classList.add('in'));
    }

    // ---------- tooltip ----------
    function showTip(i) {
        if (!view || !layout) return;
        const k = view.months[i];
        const c = view.counts[i];
        const { m, slot, ih, yMax, W } = layout;
        const cxp = m.l + i * slot + slot / 2;
        const yTop = m.t + ih - (c / yMax) * ih - 8;      // logo acima do ponto
        const x = Math.min(Math.max(cxp, 85), W - 85);

        tipEl.textContent = '';
        const b = document.createElement('b'); b.textContent = full(k);
        const em = document.createElement('em'); em.textContent = plural(c);
        const kd = kind(c, view.avg);
        const st = document.createElement('small');
        st.className = 'st ' + kd;
        st.textContent = `${STATUS[kd]} (${fmt(view.avg)})`;
        tipEl.append(b, em, st);
        const names = view.names.get(k);
        if (names.length) {
            const ul = document.createElement('ul');
            names.slice(0, 4).forEach(nm => { const li = document.createElement('li'); li.textContent = nm; ul.appendChild(li); });
            if (names.length > 4) { const li = document.createElement('li'); li.textContent = `e mais ${names.length - 4}`; ul.appendChild(li); }
            tipEl.appendChild(ul);
        }
        tipEl.classList.toggle('below', yTop < 90);
        tipEl.style.left = x + 'px';
        tipEl.style.top = yTop + 'px';
        tipEl.hidden = false;
        clearOn();
        const pt = chartEl.querySelector(`.pt[data-i="${i}"]`);
        if (pt) pt.classList.add('on');
        const g = chartEl.querySelector('.guide');
        if (g) { g.setAttribute('x1', cxp); g.setAttribute('x2', cxp); g.classList.add('on'); }
    }
    function clearOn() { chartEl.querySelectorAll('.on').forEach(el => el.classList.remove('on')); }
    function hideTip() { tipEl.hidden = true; clearOn(); }
    chartEl.addEventListener('pointerover', (e) => { const h = e.target.closest('.hit'); if (h) showTip(Number(h.dataset.i)); });
    chartEl.addEventListener('pointerleave', hideTip);
    chartEl.addEventListener('focusin', (e) => { const h = e.target.closest('.hit'); if (h) showTip(Number(h.dataset.i)); });
    chartEl.addEventListener('focusout', hideTip);
    document.addEventListener('pointerdown', (e) => { if (!chartEl.contains(e.target)) hideTip(); });

    // ---------- textos e números ----------
    function setNum(id, n) {
        const el = $(id);
        if (!el) return;
        if (typeof Motion !== 'undefined' && Motion.setStat) Motion.setStat(id, n); else el.textContent = n;
    }
    function fillStats(v) {
        const max = Math.max(...v.counts);
        const peakIdx = v.counts.lastIndexOf(max);           // em empate, o mais recente
        const active = v.counts.filter(c => c > 0).length;
        setNum('cs-total', v.total);
        $('cs-peak').textContent = max ? label(v.months[peakIdx]) : '–';
        $('cs-peak-note').textContent = max ? `mês mais produtivo · ${max}` : 'mês mais produtivo';
        $('cs-avg').textContent = fmt(v.avg);
        $('lg-avg').textContent = `média do período (${fmt(v.avg)})`;
        $('cs-active').textContent = `${active}/${v.months.length}`;
        $('cs-active-note').textContent = 'meses com projeto novo';

        const parts = [];
        if (max) parts.push(`Pico em ${full(v.months[peakIdx])}: ${plural(max)}.`);
        parts.push(`${active} de ${v.months.length} meses tiveram ao menos um projeto novo.`);
        if (v.months.length >= 6) {
            const sum = (a) => a.reduce((x, y) => x + y, 0);
            const last3 = sum(v.counts.slice(-3)), prev3 = sum(v.counts.slice(-6, -3));
            parts.push(`Últimos 3 meses: ${last3} (nos 3 anteriores: ${prev3}).`);
        }
        $('case-reading').textContent = parts.join(' ');
        $('case-sub').textContent = `${v.months.length} meses · ${full(v.months[0])} até ${full(v.months[v.months.length - 1])}`;
    }
    function setPressed(group, attr, value) {
        group.querySelectorAll('button').forEach(b => {
            const on = b.dataset[attr] === value;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', String(on));
        });
    }

    // ---------- fluxo ----------
    function update(animate = true) {
        if (!repos) return;
        const v = compute();
        $('case-range').hidden = !(v && v.span > 12);
        if (!v) {
            view = null;
            chartEl.innerHTML = '<p class="loading">Nenhum repositório para mostrar.</p>';
            $('case-reading').textContent = 'Sem dados para analisar.';
            return;
        }
        view = v;
        fillStats(v);
        draw(v, animate);
    }

    function showError() {
        chartEl.innerHTML = '<p class="loading">Não consegui ler o GitHub agora (limite da API?). <button type="button" class="btn btn-quiet" id="case-retry">Tentar de novo</button></p>';
        $('case-reading').textContent = 'Dados indisponíveis no momento.';
        $('case-sub').textContent = 'GitHub · sem conexão';
        const retry = $('case-retry');
        if (retry) retry.addEventListener('click', start);
    }

    function start() {
        chartEl.innerHTML = '<p class="loading">Lendo o GitHub...</p>';
        load().then(data => { repos = data; update(true); }).catch(showError);
    }

    $('case-forks').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state.forks = b.dataset.forks === '1';
        setPressed($('case-forks'), 'forks', b.dataset.forks);
        update(true);
    });
    $('case-range').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state.range = b.dataset.range;
        setPressed($('case-range'), 'range', b.dataset.range);
        update(true);
    });

    // anima as barras quando o gráfico aparece na tela
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            seen = true;
            chartEl.classList.add('in');
            io.disconnect();
        }, { threshold: 0.3 });
        io.observe(chartEl);
    } else {
        seen = true;
    }

    // redesenha (sem animar de novo) quando a largura muda
    if ('ResizeObserver' in window) {
        let raf = 0;
        new ResizeObserver(() => {
            const w = Math.round(chartEl.clientWidth);
            if (!view || Math.abs(w - lastW) < 2) { lastW = w; return; }
            lastW = w;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => draw(view, false));
        }).observe(chartEl);
    }

    start();
})();
