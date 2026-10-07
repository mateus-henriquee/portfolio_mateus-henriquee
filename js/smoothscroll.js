// ==========================================
// SCROLL SUAVE: rolagem de toda a página com inércia (Lenis)
// ==========================================
let lenis = null;

function initSmoothScroll() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // respeita quem pediu menos movimento, e não quebra nada se o CDN do Lenis falhar
    if (reduceMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({
        duration: 0.3,
        easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cúbico
        smoothWheel: true,
        touchMultiplier: 1.15
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Links internos (#âncoras): deixa o Lenis animar em vez do salto padrão do navegador
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80 }); // compensa o header fixo
        });
    });
}

// Usado por outras partes do site (ex.: clique num card de habilidade) pra rolar com o mesmo motor.
// Sem Lenis carregado, cai no scrollIntoView nativo — a página nunca fica sem rolagem suave.
function smoothScrollTo(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80, ...options });
    else el.scrollIntoView({ behavior: 'smooth' });
}
