// ==========================================
// EXPERIÊNCIA: linha do tempo animada no scroll
// ==========================================
function updateTimelineProgress() {
    const wrapper = document.querySelector('.timeline-wrapper');
    const line = document.querySelector('.timeline-progress-line');
    if (!wrapper || !line) return;

    const rect = wrapper.getBoundingClientRect();
    const trigger = window.innerHeight / 2;
    const pct = Math.max(0, Math.min(100, ((trigger - rect.top) / rect.height) * 100));
    line.style.height = pct + '%';

    document.querySelectorAll('.timeline-item').forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        if (dot) item.classList.toggle('active', dot.getBoundingClientRect().top < trigger);
    });
}

function initTimeline() {
    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress();
}
