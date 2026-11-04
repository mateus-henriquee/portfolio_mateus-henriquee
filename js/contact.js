// ==========================================
// CURRÍCULO (Google Docs) + FORMULÁRIO DE CONTATO (EmailJS)
// Usa RESUME_DOC_ID, MAX_ATTACHMENT_KB e ALLOWED_ATTACHMENT_EXT do js/config.js
// ==========================================

// ---------- Currículo ----------
(() => {
    const id = (typeof RESUME_DOC_ID !== 'undefined') ? RESUME_DOC_ID : '';
    const frame = document.getElementById('resume-frame');
    const iframe = document.getElementById('resume-embed');
    const dl = document.getElementById('resume-download');
    const open = document.getElementById('resume-open');
    if (!frame || !iframe) return;

    if (!id) {
        frame.querySelector('.resume-loading').innerHTML = '<i class="fa-solid fa-file-lines"></i> Currículo indisponível no momento.';
        iframe.remove();
        return;
    }
    const base = `https://docs.google.com/document/d/${id}`;
    iframe.addEventListener('load', () => { const l = frame.querySelector('.resume-loading'); if (l) l.remove(); });
    iframe.src = `${base}/preview`;
    if (dl) dl.href = `${base}/export?format=pdf`;
    if (open) open.href = `${base}/preview`;
})();

// ---------- Formulário ----------
(() => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    if (typeof emailjs !== 'undefined') emailjs.init('pf3zrh5Hl2rNkmjEJ');

    const btn = document.getElementById('btn-enviar');
    const toast = document.getElementById('toast-notification');
    const flash = (msg) => {
        if (!toast) return;
        toast.querySelector('.toast-message').textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    };

    // anexo
    const maxKB = (typeof MAX_ATTACHMENT_KB !== 'undefined' && MAX_ATTACHMENT_KB) ? MAX_ATTACHMENT_KB : 1024;
    let allowed = (typeof ALLOWED_ATTACHMENT_EXT !== 'undefined' && ALLOWED_ATTACHMENT_EXT) ? ALLOWED_ATTACHMENT_EXT : ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
    if (typeof allowed === 'string') allowed = allowed.split(/[,\s]+/);
    allowed = [...allowed].map(e => String(e).replace(/^\./, '').toLowerCase()).filter(Boolean);

    const attach = document.getElementById('btn-attach');
    const input = document.getElementById('anexo');
    const chip = document.getElementById('file-chip');
    const nameEl = document.getElementById('file-name');
    const rm = document.getElementById('file-remove');
    const err = document.getElementById('file-error');

    const showError = (m) => { err.textContent = m; err.hidden = !m; };
    const clearFile = () => { input.value = ''; chip.hidden = true; showError(''); };
    attach.addEventListener('click', () => input.click());
    rm.addEventListener('click', clearFile);
    input.addEventListener('change', () => {
        const f = input.files[0];
        if (!f) return clearFile();
        const ext = f.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) { clearFile(); return showError(`Formato não permitido. Use: ${allowed.join(', ')}.`); }
        if (f.size > maxKB * 1024) { clearFile(); return showError(`Arquivo acima de ${maxKB} KB.`); }
        showError('');
        nameEl.textContent = f.name;
        chip.hidden = false;
    });

    // envio
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (typeof emailjs === 'undefined') return flash('Serviço de e-mail indisponível. Use o e-mail direto.');
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        emailjs.sendForm('service_mhljs', 'template_mhljs', form)
            .then(() => { flash('Mensagem enviada! Responderei em breve.'); form.reset(); clearFile(); })
            .catch((error) => { flash('Erro ao enviar. Tente novamente.'); console.error('Erro EmailJS:', error); })
            .finally(() => { btn.textContent = 'Enviar mensagem'; btn.disabled = false; });
    });

    // máscara de telefone (xx) xxxxx-xxxx
    const tel = document.getElementById('telefone');
    tel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 0) v = `(${v}`;
        if (v.length > 3) v = `${v.slice(0, 3)}) ${v.slice(3)}`;
        if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
        e.target.value = v;
    });

    // sugestões de domínio de e-mail
    const email = document.getElementById('email');
    const list = document.getElementById('email-suggestions');
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
    email.addEventListener('input', (e) => {
        list.innerHTML = '';
        const v = e.target.value;
        if (!v.includes('@')) return;
        const [user, typed = ''] = v.split('@');
        domains.filter(d => d.startsWith(typed)).forEach(d => {
            const o = document.createElement('option');
            o.value = `${user}@${d}`;
            list.appendChild(o);
        });
    });
})();
