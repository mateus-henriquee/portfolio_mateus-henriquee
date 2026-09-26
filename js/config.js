// ==========================================
// CONFIG: usuário do GitHub e utilitários
// ==========================================
const username = 'mateus-henriquee'; // usuário GitHub

const PORTFOLIO_REPO = 'portfolio_mateus-henriquee'; // repositório deste site (pasta img/certificados)

// Escapa texto vindo de fora (API do GitHub) antes de inserir no HTML
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Anexo do formulário de contato.
// O EmailJS limita o tamanho por plano (Personal: 500 KB, Professional: 2 MB). Ajuste conforme o seu.
const MAX_ATTACHMENT_KB = 500;
const ALLOWED_ATTACHMENT_EXT = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];