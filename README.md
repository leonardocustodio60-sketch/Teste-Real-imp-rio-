# Real Império Multimarcas — Landing Page 3D

Landing page de alta conversão da **Real Império Multimarcas** (Araruama e Iguaba Grande – RJ).
Estilo *cyber-imperial*: preto profundo, dourado neon e tipografia geométrica, com dois elementos 3D:

- **Hero (100vh):** o rei e a rainha do xadrez do logo, torneados em 3D (ouro e obsidiana). Eles giram, reagem ao mouse e acompanham a rolagem com parallax.
- **Provador 3D:** carrossel com 4 manequins vestindo looks da loja (Street Oversized, Camisa de Time, Casual Chic, Smart Office). O cliente arrasta para girar, aproxima a câmera (look inteiro, parte de cima ou parte de baixo) e vê etiquetas de detalhe. O botão "Quero esse look" abre o WhatsApp com o nome do look já na mensagem.

Tudo em 3D é **procedural**: nenhum modelo ou HDR é baixado. As roupas, texturas de tecido e estampas são geradas no navegador.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Build | Vite 8 (multi-página + pré-renderização SSG) |
| UI | React 19 + Tailwind CSS 4 |
| 3D | three.js + @react-three/fiber + drei (em chunk separado, carregado sob demanda) |
| Fontes | Unbounded (títulos) + Manrope (texto), auto-hospedadas via Fontsource |

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera /dist (estático, pronto para deploy)
npm run preview    # serve o /dist localmente
```

Requer Node 20.19+ (recomendado 22).

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Textos, contatos, lojas, categorias, diferenciais, depoimentos, FAQ | `src/config/site.js` |
| Looks do provador 3D (cores, peças, estampas, etiquetas) | `src/config/looks.js` |
| Títulos/descrições de cada página, horário para o Google | `src/config/seo.js` |
| Paleta de cores e fontes (tokens da marca) | `src/index.css` (bloco `@theme`) |
| Política de Privacidade | `politica-de-privacidade/index.html` |

### Estrutura

```
src/
  components/   seções da página (Hero, Showroom, Benefits, Testimonials, LeadSection, FAQ, Footer…)
  three/        cenas e geometria 3D (HeroScene, ShowroomScene, Mannequin, materiais, anatomia)
  hooks/        rolagem, perfil do dispositivo, visibilidade, ponteiro
  config/       conteúdo editável (site, looks, seo)
scripts/
  seo-plugin.js  gera head SEO, robots.txt, sitemap.xml e llms.txt
  prerender.js   injeta o HTML do React no dist/index.html (SSG)
```

## Elemento 3D do topo: nativo, Spline ou vídeo

Em `src/config/site.js` → `hero.visual`:

```js
visual: { type: 'three' }                                         // padrão (cena nativa)
visual: { type: 'spline', url: 'https://my.spline.design/SEU-PROJETO/' }
visual: { type: 'video', src: './hero.mp4', poster: './hero.jpg', scrub: true }
```

- Com `scrub: true`, o vídeo avança quadro a quadro conforme a rolagem. Exporte com keyframes densos para a transição ficar suave (ex.: `ffmpeg -i in.mp4 -g 1 -crf 22 hero.mp4`).
- Qualquer opção recebe o mesmo parallax de rolagem da camada (variável CSS `--hero-p`).

## Responsividade e desempenho

- **Qualidade automática:** `full` no desktop; `lite` no celular e em aparelhos modestos (menor resolução, materiais mais leves, menos partículas); `poster` sem WebGL ou com economia de dados (imagem estática, e o provador oferece o botão "Carregar provador 3D").
- O 3D fica num **chunk separado** (~250 KB gzip), carregado só quando o navegador fica ocioso (hero) ou quando a seção se aproxima (provador).
- A renderização **pausa quando a cena sai da tela**.
- Respeita `prefers-reduced-motion`: sem giro automático, sem parallax e sem animações.
- No celular, o arraste horizontal gira o manequim e o vertical continua rolando a página (`touch-action: pan-y`).

## Formulário da Lista VIP

Crie um `.env` (veja `.env.example`):

```
VITE_LEAD_ENDPOINT=https://formspree.io/f/SEU_ID
```

O formulário envia `POST` JSON `{ nome, email, origem }`. Sem endpoint, ele funciona em modo demonstração: mostra o sucesso, mas não envia nada. Tem validação, honeypot anti-spam e aviso de consentimento com link para a Política de Privacidade (LGPD).

## SEO técnico (gerado no build)

| Item | Como funciona |
| --- | --- |
| `robots.txt` | Libera o rastreamento de todas as páginas públicas e aponta para o sitemap. |
| `sitemap.xml` | Lista as URLs indexáveis de `src/config/seo.js`, com `lastmod` da data do build. |
| Schema.org JSON-LD | `ClothingStore` (endereço, WhatsApp, redes, categorias em `OfferCatalog`, unidade de Iguaba Grande), `WebSite`, `WebPage`, `FAQPage` (home) e `BreadcrumbList` (páginas internas). |
| Canonical | `<link rel="canonical">` absoluto em cada página. |
| Title/description | Individuais por página (mais Open Graph e Twitter Card com `og-image.png` 1200×630). |
| HTML semântico | Um único H1 → H2 por seção → H3/H4; `header`, `nav`, `main`, `section`, `article`, `figure/blockquote`, `address`, `details`. A home é **pré-renderizada**, então buscadores e IAs leem o conteúdo sem executar JavaScript. |
| `llms.txt` | Resumo da loja, categorias, FAQ, páginas e contatos em Markdown para agentes de IA. |

**Defina o domínio** antes do build, senão os links absolutos usam `https://seu-dominio.com.br`:

```bash
SITE_URL=https://www.seudominio.com.br npm run build
```

Na **Vercel** e na **Netlify** o domínio é detectado automaticamente (`VERCEL_PROJECT_PRODUCTION_URL` / `URL`). Mesmo assim, recomendamos definir `SITE_URL` nas variáveis de ambiente do projeto.

## Deploy (hospedagem estática)

- **Vercel:** importe o repositório. `vercel.json` já define `npm run build` → `dist`.
- **Netlify:** importe o repositório. `netlify.toml` já define build, pasta e cache.
- **Cloudflare Pages:** build `npm run build`, saída `dist`, variável `SITE_URL`.
- **GitHub Pages / subpasta:** os caminhos são relativos (`base: './'`). Use `SITE_URL=https://usuario.github.io/repositorio`.

## Antes de publicar (checklist)

- [ ] Definir `SITE_URL` com o domínio final.
- [ ] **Trocar os depoimentos de exemplo** por feedbacks reais (destaque "Feedbacks" do Instagram ou avaliações do Google) e mudar `testimonialsAreExamples` para `false` em `src/config/site.js`.
- [ ] Configurar `VITE_LEAD_ENDPOINT` para receber os cadastros da Lista VIP.
- [ ] (Opcional) Colocar o logo oficial em `public/` e preencher `brand.logoSrc`.
- [ ] (Opcional) Informar o horário de fechamento em `src/config/seo.js` → `openingHours.closes`, para publicar o horário completo no Google.
- [ ] (Opcional) Informar o endereço da loja de Iguaba Grande em `src/config/site.js`.
