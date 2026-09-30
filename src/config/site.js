/**
 * ============================================================
 *  CONTEÚDO DA PÁGINA — edite aqui textos, contatos e links.
 *  Nenhum componente precisa ser alterado para atualizar a copy.
 * ============================================================
 */

export const site = {
  brand: {
    name: 'Real Império',
    suffix: 'Multimarcas',
    tagline: 'Estilo que impõe presença',
    // Para usar o logo oficial, coloque o arquivo em /public (ex.: logo.png)
    // e informe o caminho aqui: logoSrc: './logo.png'
    logoSrc: '',
  },

  contact: {
    whatsappNumber: '5522992720497',
    whatsappDisplay: '(22) 99272-0497',
    whatsappDefaultMessage: 'Olá, Real Império! 👑 Vim pelo site e quero ver as novidades.',
    instagram: 'https://www.instagram.com/realimperiorj/',
    instagramHandle: '@realimperiorj',
    facebook: 'https://www.facebook.com/100091545855698/',
    beacons: 'https://beacons.ai/realimperio',
  },

  hours: 'Seg a Sáb · a partir das 9h',

  stores: [
    {
      city: 'Araruama',
      state: 'RJ',
      address: 'Estr. Emb. São Vicente – Fazendinha',
      complement: 'Dentro do Superpreço · CEP 28984-350',
      // Perfil da loja no Google (rotas, fotos e avaliações)
      mapsUrl: 'https://share.google/zNfRj98pEfq6MZCBF',
    },
    {
      city: 'Iguaba Grande',
      state: 'RJ',
      address: 'Endereço completo pelo WhatsApp',
      complement: 'Retirada na loja ou envio',
      mapsUrl: '',
    },
  ],

  nav: [
    { label: 'Looks 3D', href: '#looks' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Clientes', href: '#depoimentos' },
    { label: 'Lista VIP', href: '#lista-vip' },
  ],

  hero: {
    eyebrow: 'Multimarcas · Importados & Nacionais',
    titleTop: 'Estilo que',
    titleHighlight: 'impõe presença.',
    subtitle:
      'Oversized, camisas de time, calça baggy, bermuda balão, tênis importado e acessórios. Uma curadoria de marcas que você não encontra reunida em outro lugar — nas lojas de Araruama e Iguaba Grande ou com envio até você.',
    primaryCta: 'Comprar pelo WhatsApp',
    secondaryCta: 'Ver looks em 3D',
    /**
     * Elemento visual do topo. Tipos aceitos:
     *  - { type: 'three' }                                   → cena 3D nativa (padrão, sem arquivos externos)
     *  - { type: 'spline', url: 'https://my.spline.design/SEU-PROJETO/' }
     *  - { type: 'video', src: './hero.mp4', poster: './hero.jpg', scrub: true }
     *    (scrub: true avança os quadros do vídeo conforme a rolagem)
     */
    visual: { type: 'three' },
  },

  // Faixa de categorias (baseada no que a loja vende)
  categories: [
    'Camisetas oversized',
    'Camisas de time',
    'Calça baggy',
    'Bermuda jeans balão',
    'Regata machão',
    'Tênis importado',
    'Bonés',
    'Moletons',
    'Acessórios',
  ],

  benefits: [
    {
      icon: 'crown',
      kicker: '01 · Curadoria',
      title: 'Várias marcas. Um só império.',
      text: 'Importados e nacionais escolhidos a dedo. Do streetwear ao casual chic, você monta o look completo sem rodar a cidade.',
    },
    {
      icon: 'fabric',
      kicker: '02 · Qualidade',
      title: 'Tecido, acabamento e caimento no padrão.',
      text: 'Cada peça é conferida antes de entrar na arara: malha encorpada, costura firme e modelagem que veste bem de verdade.',
    },
    {
      icon: 'bolt',
      kicker: '03 · Atendimento VIP',
      title: 'Separou, provou, levou.',
      text: 'Chame no WhatsApp, a gente separa seu tamanho e você retira nas lojas de Araruama e Iguaba Grande — ou recebe por envio.',
    },
  ],

  stats: [
    { value: '2', label: 'lojas físicas na Região dos Lagos' },
    { value: '9h', label: 'abertos de segunda a sábado' },
    { value: 'Envio', label: 'do nosso estoque até você' },
  ],

  /**
   * DEPOIMENTOS — ATENÇÃO: os textos abaixo são EXEMPLOS de layout.
   * Substitua pelos feedbacks reais dos clientes (ex.: destaque "Feedbacks"
   * do Instagram ou avaliações do Google) e depois mude
   * `testimonialsAreExamples` para false para remover o aviso da página.
   */
  testimonialsAreExamples: true,
  testimonials: [
    {
      name: 'Lucas M.',
      city: 'Araruama',
      look: 'Calça baggy + oversized',
      text: 'Chamei no WhatsApp, separaram meu tamanho e quando cheguei na loja já tava tudo pronto. A baggy veste perfeito.',
    },
    {
      name: 'Rafael S.',
      city: 'Iguaba Grande',
      look: 'Camisa de time',
      text: 'Achei camisa de time, tênis e boné num lugar só. O acabamento das peças é outro nível, dá pra ver na costura.',
    },
    {
      name: 'Juliana C.',
      city: 'São Pedro da Aldeia',
      look: 'Look trabalho + fim de semana',
      text: 'Me ajudaram a montar um look pro trabalho e outro pro fim de semana. Atendimento atencioso, saí de lá me sentindo outra.',
    },
  ],

  lead: {
    eyebrow: 'Lista VIP do Império',
    title: 'Chegou mercadoria? Você fica sabendo primeiro.',
    text: 'Entre para a lista e receba os drops, reposições e condições especiais antes de todo mundo.',
    button: 'Quero entrar na lista',
    consent: 'Ao enviar, você aceita receber novidades da Real Império. Sem spam — saia quando quiser.',
    success: 'Você está na lista! 👑 Fique de olho no seu e-mail.',
  },
}

/** Link do WhatsApp com mensagem pré-preenchida. */
export function whatsappLink(message = site.contact.whatsappDefaultMessage) {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`
}
