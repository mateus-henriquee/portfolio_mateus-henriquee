// ==========================================
// REVEAL: animação de entrada dos elementos .reveal
// ==========================================
function initReveal() {
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}
