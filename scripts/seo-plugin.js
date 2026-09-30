/**
 * Plugin Vite de SEO da Real Império.
 *  - injeta <title>, meta description, canonical, Open Graph e JSON-LD em cada página
 *  - gera robots.txt, sitemap.xml e llms.txt com o domínio correto
 * Tudo sai das configs em src/config (site.js e seo.js): uma única fonte de verdade.
 */
import { site, whatsappLink } from '../src/config/site.js'
import { pages, openingHours } from '../src/config/seo.js'

const HEAD_MARKER = '<!-- seo:head -->'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const jsonLd = (data) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c')

const phoneE164 = `+${site.contact.whatsappNumber}`
const brandName = `${site.brand.name} ${site.brand.suffix}`

function storeGraph(siteUrl) {
  const [main, ...others] = site.stores
  const store = {
    '@type': 'ClothingStore',
    '@id': `${siteUrl}/#loja`,
    name: brandName,
    alternateName: site.brand.name,
    slogan: site.brand.tagline,
    description:
      'Loja multimarcas de roupas importadas e nacionais: camisetas oversized, camisas de time, calça baggy, bermuda jeans balão, tênis importados, bonés e acessórios.',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/logo-512.png`,
    image: `${siteUrl}/og-image.png`,
    telephone: phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${main.address} (${main.landmark})`,
      addressLocality: main.city,
      addressRegion: main.state,
      postalCode: main.postalCode,
      addressCountry: 'BR',
    },
    hasMap: main.mapsUrl || undefined,
    areaServed: [...site.stores.map((s) => ({ '@type': 'City', name: s.city })), { '@type': 'Place', name: 'Região dos Lagos – RJ' }],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: phoneE164,
      url: whatsappLink(),
      availableLanguage: 'pt-BR',
    },
    sameAs: [site.contact.instagram, site.contact.facebook, site.contact.beacons],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Categorias da Real Império',
      itemListElement: site.categories.map((name) => ({ '@type': 'OfferCatalog', name })),
    },
    department: others.map((s) => ({
      '@type': 'ClothingStore',
      name: `${brandName} – ${s.city}`,
      telephone: phoneE164,
      address: { '@type': 'PostalAddress', addressLocality: s.city, addressRegion: s.state, addressCountry: 'BR' },
    })),
  }
  if (openingHours.closes) {
    store.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: openingHours.days,
      opens: openingHours.opens,
      closes: openingHours.closes,
    }
  }
  return store
}

function structuredData(page, siteUrl) {
  const pageUrl = siteUrl + page.path
  const graph = [
    storeGraph(siteUrl),
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: brandName,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${siteUrl}/#loja` },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.description,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#loja` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${siteUrl}/og-image.png`, width: 1200, height: 630 },
      ...(page.breadcrumb ? { breadcrumb: { '@id': `${pageUrl}#breadcrumb` } } : {}),
    },
  ]

  if (page.kind === 'home') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      url: pageUrl,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: site.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }

  if (page.breadcrumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: pageUrl },
      ],
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

function renderHead(page, siteUrl) {
  const url = siteUrl + page.path
  const image = `${siteUrl}/og-image.png`
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="${esc(brandName)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${brandName} — ${site.brand.tagline}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json">\n${jsonLd(structuredData(page, siteUrl))}\n</script>`,
  ]
    .map((line) => `    ${line}`)
    .join('\n')
}

function robotsTxt(siteUrl) {
  return `# ${brandName}
# Todas as páginas públicas podem ser rastreadas (buscadores e agentes de IA).
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
}

function sitemapXml(siteUrl) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${esc(siteUrl + p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function llmsTxt(siteUrl) {
  const [main, ...others] = site.stores
  const pageLines = pages.map((p) => `- [${p.breadcrumb || 'Início'}](${siteUrl}${p.path}): ${p.description}`)
  return `# ${brandName}

> ${site.brand.tagline}. Loja multimarcas de roupas importadas e nacionais em ${site.stores
    .map((s) => `${s.city} (${s.state})`)
    .join(' e ')}, com envio. Vendas e atendimento pelo WhatsApp ${site.contact.whatsappDisplay}.

A ${brandName} reúne em um só lugar peças masculinas e femininas de marcas importadas e nacionais, do streetwear ao casual chic e ao look de trabalho. O site oferece um provador 3D em que os visitantes giram manequins para ver cada look de todos os ângulos; a compra é finalizada pelo WhatsApp, com retirada na loja ou envio.

## Informações da loja

- Loja ${main.city} – ${main.state}: ${main.address}, ${main.landmark}, CEP ${main.postalCode}
${others.map((s) => `- Loja ${s.city} – ${s.state}: ${s.address}`).join('\n')}
- Horário: ${site.hours}
- Envios: combinados pelo WhatsApp
- Como comprar: escolher o look no site e tocar em "Quero esse look" ou "Comprar pelo WhatsApp"; a equipe confirma tamanhos, valores e entrega

## Categorias

${site.categories.map((c) => `- ${c}`).join('\n')}

## Páginas

${pageLines.join('\n')}

## Perguntas frequentes

${site.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## Contato e redes

- [WhatsApp ${site.contact.whatsappDisplay}](https://wa.me/${site.contact.whatsappNumber}): vendas, tamanhos, valores e envios
- [Instagram ${site.contact.instagramHandle}](${site.contact.instagram}): novidades, chegadas e feedbacks de clientes
- [Facebook](${site.contact.facebook})
- [Todos os links](${site.contact.beacons})
${main.mapsUrl ? `- [Perfil no Google (rotas e avaliações)](${main.mapsUrl})\n` : ''}
## Optional

- [Sitemap XML](${siteUrl}/sitemap.xml)
`
}

export function resolveSiteUrl(env) {
  const raw =
    env.SITE_URL ||
    env.VITE_SITE_URL ||
    env.URL || // Netlify (domínio principal do site)
    (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    ''
  return { url: (raw || 'https://seu-dominio.com.br').replace(/\/+$/, ''), isFallback: !raw }
}

export default function seoPlugin({ siteUrl, isFallback }) {
  let isSsrBuild = false
  const files = {
    'robots.txt': () => ({ type: 'text/plain', body: robotsTxt(siteUrl) }),
    'sitemap.xml': () => ({ type: 'application/xml', body: sitemapXml(siteUrl) }),
    'llms.txt': () => ({ type: 'text/plain', body: llmsTxt(siteUrl) }),
  }

  return {
    name: 'real-imperio-seo',
    configResolved(config) {
      isSsrBuild = !!config.build.ssr
      if (isFallback && config.command === 'build' && !isSsrBuild) {
        config.logger.warn(
          `\n⚠  SITE_URL não definido — usando ${siteUrl} em canonical, sitemap, robots e llms.txt.\n` +
            '   Defina SITE_URL=https://seu-dominio.com.br antes do build (Vercel e Netlify detectam sozinhos).\n',
        )
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = ctx.path.replace(/^\//, '')
        const page = pages.find((p) => p.file === file)
        if (!page || !html.includes(HEAD_MARKER)) return html
        return html.replace(HEAD_MARKER, renderHead(page, siteUrl).trimStart())
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0].replace(/^\//, '')
        if (!files[name]) return next()
        const { type, body } = files[name]()
        res.setHeader('Content-Type', `${type}; charset=utf-8`)
        res.end(body)
      })
    },
    generateBundle() {
      if (isSsrBuild) return
      for (const [fileName, make] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: make().body })
      }
    },
  }
}
