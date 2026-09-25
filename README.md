# Portfólio | Mateus Henrique Leccese da Silva

Portfólio pessoal focado em **Análise de Dados**. Feito com HTML, CSS e JavaScript puros, sem frameworks.

**Demo:** https://portfolio-mateus-henriquee.vercel.app/

![Preview do Site](prev.png)

## Sobre

Estudante de Data Science na FIAP (2026–2027). Trabalho com Python, SQL, Power BI e Databricks. Busco estágio na área de Dados.

## Funcionalidades

- Seção de projetos alimentada pela **API do GitHub**, com busca e filtro por linguagem
- Habilidades agrupadas por área, com nível de domínio
- Linha do tempo de experiência com animação no scroll
- Formação e cursos com limite de exibição configurável
- Formulário de contato com **EmailJS**, máscara de telefone e sugestão de e-mail
- Layout responsivo, com menu mobile
- Barra de progresso de leitura e animações de entrada
- Respeita `prefers-reduced-motion`

## Tecnologias

| Camada | Uso |
|---|---|
| HTML5 | Estrutura semântica |
| CSS3 | Grid, Flexbox, variáveis, animações |
| JavaScript (ES6+) | `fetch`, `IntersectionObserver`, manipulação do DOM |
| GitHub REST API | Listagem de repositórios |
| EmailJS | Envio do formulário sem back-end |
| Font Awesome | Ícones |

## Estrutura

```
.
├── index.html
├── style.css
├── script.js
├── img/          # imagens e prévias
└── README.md
```

## Como rodar

```bash
git clone https://github.com/mateus-henriquee/portfolio_mateus-henriquee.git
cd portfolio_mateus-henriquee
```

Abra o `index.html` no navegador. Para usar um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Como personalizar

Os dados editáveis ficam no topo do `script.js`:

- `username`: usuário do GitHub
- `skillGroups`: habilidades, ícones, níveis e links
- `cursosMock`: cursos e certificados

Para exibir uma prévia em um projeto, adicione um arquivo `prev.png` na raiz do repositório dele.

## Deploy

Hospedado na **Vercel**, com deploy automático a cada push na branch `main`.

## Contato

- E-mail: mateush.leccese@gmail.com
- LinkedIn: https://www.linkedin.com/in/devmateus-henriquee
- GitHub: https://github.com/mateus-henriquee
