// ==========================================
// CURRÍCULO: documento do Google Docs incorporado + baixar PDF
// ==========================================
// Tudo vem do RESUME_DOC_ID (js/config.js). O PDF é gerado pelo Google na hora
// do clique, então sempre reflete a última versão do documento.
function initResume() {
    const frame = document.getElementById('resume-frame');
    const embed = document.getElementById('resume-embed');
    const download = document.getElementById('resume-download');
    const open = document.getElementById('resume-open');
    if (!frame || !embed || !RESUME_DOC_ID) return;

    const base = 'https://docs.google.com/document/d/' + encodeURIComponent(RESUME_DOC_ID);
    embed.addEventListener('load', () => frame.classList.add('loaded'), { once: true });
    embed.src = base + '/preview';
    if (download) download.href = base + '/export?format=pdf';
    if (open) open.href = base + '/preview';

    // Pausa a borda neon com o cursor em cima. O iframe (outra origem) não gera mouseenter
    // no pai, mas o pai recebe mouseover/mouseout no próprio iframe, então escutamos no document.
    document.addEventListener('mouseover', (e) => frame.classList.toggle('is-hover', frame.contains(e.target)));
    document.addEventListener('mouseleave', () => frame.classList.remove('is-hover'));
}