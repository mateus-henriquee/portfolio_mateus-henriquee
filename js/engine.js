// ==========================================
// ENGINE: um único loop de animação que lê o scroll e avisa os módulos
// Cada módulo faz Engine.add((estado, tempo) => { ... })
// ==========================================
const Engine = (() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fns = [];
    const s = { y: 0, vh: window.innerHeight, vw: window.innerWidth, docH: 1, p: 0, vel: 0, mx: 0, my: 0 };

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function measure() {
        s.vh = window.innerHeight;
        s.vw = window.innerWidth;
        s.docH = Math.max(1, document.documentElement.scrollHeight - s.vh);
    }

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
    window.addEventListener('pointermove', (e) => {
        s.mx = (e.clientX / s.vw) * 2 - 1;
        s.my = (e.clientY / s.vh) * 2 - 1;
    }, { passive: true });

    let last = window.scrollY;
    function loop(t) {
        const y = window.scrollY;
        s.vel = lerp(s.vel, y - last, 0.2);
        last = y;
        s.y = y;
        s.p = clamp(y / s.docH);
        for (let i = 0; i < fns.length; i++) fns[i](s, t);
        requestAnimationFrame(loop);
    }

    return {
        s, reduce, clamp, lerp, easeOut,
        add: (fn) => fns.push(fn),
        start() { measure(); requestAnimationFrame(loop); }
    };
})();
