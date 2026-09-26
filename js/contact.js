// ==========================================
// CONTATO: formulário (EmailJS), máscara de telefone e sugestões de e-mail
// ==========================================
const contactForm = document.getElementById('contact-form');
const btnEnviar = document.getElementById('btn-enviar');
const inputTelefone = document.getElementById('telefone');
const inputEmail = document.getElementById('email');
const datalistEmail = document.getElementById('email-suggestions');
const dominios = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];

function initContactForm() {
    if (typeof emailjs !== 'undefined') emailjs.init("pf3zrh5Hl2rNkmjEJ");
    if (!contactForm) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof emailjs === 'undefined') {
            alert('Serviço de e-mail indisponível. Use o e-mail direto.');
            return;
        }

        btnEnviar.innerText = 'Enviando...';
        btnEnviar.disabled = true;

        emailjs.sendForm('service_mhljs', 'template_mhljs', contactForm)
            .then(() => {
                const toast = document.getElementById('toast-notification');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3000);
                }
                contactForm.reset();
            })
            .catch((error) => {
                alert('Erro ao enviar a mensagem. Tente novamente.');
                console.error('Erro EmailJS:', error);
            })
            .finally(() => {
                btnEnviar.innerText = 'Enviar mensagem';
                btnEnviar.disabled = false;
            });
    });
}

// Máscara de telefone (xx) xxxxx-xxxx
function initPhoneMask() {
    if (!inputTelefone) return;
    inputTelefone.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 0) v = `(${v}`;
        if (v.length > 3) v = `${v.slice(0, 3)}) ${v.slice(3)}`;
        if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
        e.target.value = v;
    });
}

// Sugestões de domínio de e-mail
function initEmailSuggestions() {
    if (!inputEmail || !datalistEmail) return;
    inputEmail.addEventListener('input', (e) => {
        const valor = e.target.value;
        datalistEmail.innerHTML = '';
        if (!valor.includes('@')) return;
        const [usuario, digitado = ''] = valor.split('@');
        dominios.filter(d => d.startsWith(digitado)).forEach(d => {
            const opt = document.createElement('option');
            opt.value = `${usuario}@${d}`;
            datalistEmail.appendChild(opt);
        });
    });
}

// Anexo de arquivo: botão com ícone de clipe, validação e chip com o nome
function initAttachment() {
    const input = document.getElementById('anexo');
    const btn = document.getElementById('btn-attach');
    const chip = document.getElementById('file-chip');
    const chipName = document.getElementById('file-name');
    const remove = document.getElementById('file-remove');
    const error = document.getElementById('file-error');
    if (!input || !btn || !chip || !chipName || !remove || !error) return;

    const showError = (msg) => { error.textContent = msg; error.hidden = !msg; };

    const clear = () => {
        input.value = '';
        chip.hidden = true;
        chipName.textContent = '';
        btn.classList.remove('has-file');
        showError('');
    };

    const formatSize = (bytes) => bytes >= 1024 * 1024
        ? (bytes / 1024 / 1024).toFixed(1) + ' MB'
        : Math.max(1, Math.round(bytes / 1024)) + ' KB';

    btn.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) { clear(); return; }

        const ext = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_ATTACHMENT_EXT.includes(ext)) {
            clear();
            showError('Tipo não permitido. Use: ' + ALLOWED_ATTACHMENT_EXT.join(', ') + '.');
            return;
        }
        if (file.size > MAX_ATTACHMENT_KB * 1024) {
            clear();
            showError('Arquivo muito grande (' + formatSize(file.size) + '). O limite é ' + MAX_ATTACHMENT_KB + ' KB.');
            return;
        }

        showError('');
        chipName.textContent = file.name + ' · ' + formatSize(file.size);
        chip.hidden = false;
        btn.classList.add('has-file');
    });

    remove.addEventListener('click', clear);
    // contactForm.reset() (após enviar) também limpa o chip
    if (contactForm) contactForm.addEventListener('reset', () => setTimeout(clear, 0));
}

function initContact() {
    initContactForm();
    initPhoneMask();
    initEmailSuggestions();
    initAttachment();
}
