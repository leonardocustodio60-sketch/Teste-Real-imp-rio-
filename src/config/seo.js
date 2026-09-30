/**
 * ============================================================
 *  SEO — páginas indexáveis do site
 *  Cada página tem title/description próprios, entra no sitemap.xml,
 *  recebe <link rel="canonical"> e dados estruturados (JSON-LD).
 *  O domínio vem da variável SITE_URL (veja README).
 * ============================================================
 */

export const pages = [
  {
    path: '/',
    file: 'index.html',
    kind: 'home',
    title: 'Real Império Multimarcas | Roupas Importadas em Araruama',
    description:
      'Loja multimarcas em Araruama e Iguaba Grande (RJ): camisetas oversized, camisas de time, calça baggy, tênis importados e acessórios. Compre pelo WhatsApp.',
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/politica-de-privacidade/',
    file: 'politica-de-privacidade/index.html',
    kind: 'legal',
    breadcrumb: 'Política de Privacidade',
    title: 'Política de Privacidade | Real Império Multimarcas',
    description:
      'Saiba como a Real Império Multimarcas coleta, usa e protege seus dados pessoais no site e na Lista VIP, de acordo com a LGPD.',
    changefreq: 'yearly',
    priority: '0.3',
  },
]

/**
 * Horário para os dados estruturados. Preencha `closes` (ex.: '19:00')
 * para publicar o horário completo no Google; vazio = não publica.
 */
export const openingHours = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: '09:00',
  closes: '',
}
