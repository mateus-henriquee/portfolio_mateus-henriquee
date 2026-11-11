// ==========================================
// 404: dígitos com profundidade real (camadas em translateZ) que seguem o mouse
// + mostra o endereço que não existe como se fosse uma consulta SQL.
// ==========================================
(() => {
    const stage = document.getElementById('nf-stage');
    if (stage) {
        const LAYERS = 9;
        stage.querySelectorAll('.nf-d').forEach(d => {
            const ch = d.dataset.ch;
            for (let k = LAYERS; k >= 1; k--) {
                const l = document.createElement('span');
                l.className = 'layer';
                l.style.setProperty('--k', k);
                l.style.setProperty('--a', Math.max(0.07, 0.5 - k * 0.045).toFixed(2));
                l.textContent = ch;
                d.appendChild(l);
            }
            const f = document.createElement('span');
            f.className = 'front';
            f.textContent = ch;
            d.appendChild(f);
        });

        let rx = 0, ry = 0;
        if (Engine.reduce) {
            stage.style.transform = 'rotateX(-8deg) rotateY(-16deg)';
        } else {
            Engine.add((s, t) => {
                const tx = s.mx * 24 + Math.sin(t / 1900) * 6;      // alvo: segue o mouse + leve balanço
                const ty = -s.my * 16 + Math.cos(t / 2300) * 4;
                ry += (tx - ry) * 0.08;
                rx += (ty - rx) * 0.08;
                stage.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
            });
        }
    }

    const url = document.getElementById('nf-url');
    if (url) {
        let path = decodeURIComponent(location.pathname + location.search).replace(/\s+/g, ' ');
        if (path.length > 70) path = path.slice(0, 67) + '...';
        url.textContent = path || '/';
    }

    Engine.start();
})();
