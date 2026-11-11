// ==========================================
// PITCH: botão de play, capítulos que pulam no vídeo, pausa fora da tela
// ==========================================
(() => {
    const video = document.getElementById('pitch-video');
    const play = document.getElementById('pitch-play');
    const chapters = document.getElementById('pitch-chapters');
    if (!video || !play) return;
    const frame = video.closest('.pitch-frame');
    const buttons = chapters ? [...chapters.querySelectorAll('button')] : [];

    function start(t) {
        if (typeof t === 'number') {
            if (video.readyState < 1) video.addEventListener('loadedmetadata', () => { video.currentTime = t; }, { once: true });
            else video.currentTime = t;
        }
        video.controls = true;
        video.play().catch(() => { /* navegador bloqueou: o usuário clica de novo */ });
    }
    play.addEventListener('click', () => start());
    video.addEventListener('play', () => frame.classList.add('playing'));
    video.addEventListener('ended', () => { frame.classList.remove('playing'); video.controls = false; });

    if (chapters) chapters.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-t]');
        if (b) start(Number(b.dataset.t));
    });

    // capítulo atual em destaque
    video.addEventListener('timeupdate', () => {
        const t = video.currentTime;
        let cur = 0;
        buttons.forEach((b, i) => { if (t >= Number(b.dataset.t)) cur = i; });
        buttons.forEach((b, i) => b.classList.toggle('on', i === cur));
    });

    // pausa ao sair da tela
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((en) => { if (!en[0].isIntersecting && !video.paused) video.pause(); }, { threshold: 0.15 }).observe(video);
    }
})();
