// ==========================================
// HEADER: barra de progresso, menu mobile e link ativo
// ==========================================
const scrollBar = document.getElementById('scrollBar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function updateScrollBar() {
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    if (scrollBar) scrollBar.style.width = pct + '%';
}

function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}

function initHeader() {
    // Menu mobile
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open);
        });
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    }

    // Link ativo conforme a seção visível
    const navAnchors = document.querySelectorAll('.nav-links a');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

    // Barra de progresso do scroll
    window.addEventListener('scroll', updateScrollBar, { passive: true });
    updateScrollBar();
}
