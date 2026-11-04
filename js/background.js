// ==========================================
// FUNDO 3D: superfície de dados (como um gráfico 3D) em canvas.
// A câmera gira, sobe e se aproxima conforme você rola a página.
// ==========================================
(() => {
    const cv = document.getElementById('bg-canvas');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');

    const small = window.innerWidth < 700;
    const N = small ? 22 : 36;         // pontos por lado da grade
    const STEP = small ? 0.62 : 0.4;   // distância entre pontos
    const HALF = (N - 1) / 2;
    const ALPHAS = [0.05, 0.08, 0.12, 0.17, 0.23, 0.3];

    let W = 0, H = 0;
    const px = new Float32Array(N * N);
    const py = new Float32Array(N * N);
    const pd = new Float32Array(N * N);
    const ph = new Float32Array(N * N);
    const fade = new Float32Array(N * N);

    // bordas da grade somem suavemente
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const r = Math.hypot(i - HALF, j - HALF) / (HALF * 1.05);
        fade[i * N + j] = Math.max(0, 1 - r * r);
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = window.innerWidth; H = window.innerHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (Engine.reduce) draw(0, 0, 0);
    }

    // altura do "terreno" de dados em (x, z)
    function height(x, z, t, amp) {
        return amp * (
            Math.sin(x * 1.25 + t * 0.9) * Math.cos(z * 1.05 - t * 0.6) * 0.55 +
            Math.sin((x + z) * 0.7 + t * 0.45) * 0.35 +
            Math.sin(x * 2.3 - z * 1.8 + t * 1.2) * 0.12
        );
    }

    let sp = 0, energy = 0, mx = 0, my = 0;

    function draw(t, p, vel) {
        const time = t * 0.00035;
        energy += (Math.min(Math.abs(vel) * 0.012, 0.9) - energy) * 0.06;
        const amp = 0.75 + 0.45 * Math.sin(p * Math.PI * 2.5) + energy;

        const yaw = -0.55 + p * 2.6 + mx * 0.14;
        const pitch = Math.max(0.28, 0.6 + 0.28 * Math.sin(p * Math.PI * 2) + my * 0.06);
        const dist = 11.5 - 3 * Math.sin(p * Math.PI);
        const f = Math.max(W, H * 1.2) * 0.95;
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp2 = Math.sin(pitch);
        const oy = H * 0.6;

        let dmin = 1e9, dmax = -1e9;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const x = (i - HALF) * STEP, z = (j - HALF) * STEP;
                const y = height(x, z, time, amp);
                const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
                const y1 = y * cp - z1 * sp2, z2 = y * sp2 + z1 * cp;
                const d = Math.max(0.5, z2 + dist);
                const k = f / d;
                const idx = i * N + j;
                px[idx] = W / 2 + x1 * k;
                py[idx] = oy - y1 * k;
                pd[idx] = d;
                ph[idx] = y;
                if (d < dmin) dmin = d;
                if (d > dmax) dmax = d;
            }
        }

        ctx.clearRect(0, 0, W, H);
        ctx.lineWidth = 1;

        // agrupa as linhas por transparência: poucos "stroke" por quadro
        const buckets = ALPHAS.map(() => new Path2D());
        const span = Math.max(0.001, dmax - dmin);
        const seg = (a, b) => {
            const depth = 1 - (pd[a] + pd[b] - 2 * dmin) / (2 * span);
            const hh = Math.min(1, Math.max(0, ((ph[a] + ph[b]) * 0.5 / (amp + 0.001) + 1) * 0.5));
            const v = (0.25 + 0.75 * depth) * (0.45 + 0.55 * hh) * Math.min(fade[a], fade[b]) * 1.6;
            const bi = Math.min(ALPHAS.length - 1, Math.floor(v * ALPHAS.length));
            if (v < 0.04) return;
            buckets[bi].moveTo(px[a], py[a]);
            buckets[bi].lineTo(px[b], py[b]);
        };
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const a = i * N + j;
            if (j < N - 1) seg(a, a + 1);
            if (i < N - 1) seg(a, a + N);
        }
        for (let b = 0; b < buckets.length; b++) {
            ctx.strokeStyle = `rgba(168,85,247,${ALPHAS[b]})`;
            ctx.stroke(buckets[b]);
        }

        // pontos de dados nos picos
        ctx.fillStyle = 'rgba(196,161,255,0.55)';
        for (let i = 1; i < N; i += 3) for (let j = 1; j < N; j += 3) {
            const a = i * N + j;
            if (fade[a] < 0.35) continue;
            ctx.globalAlpha = Math.min(1, fade[a] * 1.3) * (0.35 + 0.65 * (1 - (pd[a] - dmin) / span));
            ctx.beginPath();
            ctx.arc(px[a], py[a], 1.5, 0, 6.2832);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    window.addEventListener('resize', resize);
    resize();

    if (Engine.reduce) return; // movimento reduzido: um quadro estático

    Engine.add((s, t) => {
        sp += (s.p - sp) * 0.07;
        mx += (s.mx - mx) * 0.05;
        my += (s.my - my) * 0.05;
        draw(t, sp, s.vel);
    });
})();
