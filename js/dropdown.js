// ==========================================
// DROPDOWN: seletor "Exibir: N" de Projetos e Cursos
// ==========================================
function setupDropdown(btn, menu, onSelect) {
    if (!btn || !menu) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-content.show').forEach(m => { if (m !== menu) m.classList.remove('show'); });
        menu.classList.toggle('show');
    });
    menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const val = b.dataset.value;
        onSelect(val === 'all' ? Infinity : parseInt(val, 10));
        btn.innerHTML = `Exibir: ${val === 'all' ? 'Todos' : val} ▾`;
    }));
}

function initDropdowns() {
    setupDropdown(
        document.getElementById('dropdown-btn'),
        document.getElementById('dropdown-menu'),
        setRepoLimit
    );
    setupDropdown(
        document.getElementById('dropdown-btn-cursos'),
        document.getElementById('dropdown-menu-cursos'),
        renderCursos
    );

    // Clique fora fecha dropdowns e o menu mobile
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content.show').forEach(m => m.classList.remove('show'));
        closeNav();
    });
}
