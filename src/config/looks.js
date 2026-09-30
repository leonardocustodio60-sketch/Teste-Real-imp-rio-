/**
 * ============================================================
 *  LOOKS DO PROVADOR 3D
 *  Cada look descreve o texto exibido e a "roupa" montada no manequim 3D.
 *  Para criar um novo look, copie um objeto e ajuste cores/peças.
 *
 *  body:      'm' (masculino) | 'f' (feminino)
 *  top.type:  'tee' | 'jersey' | 'hoodie' | 'crop' | 'blazer'
 *  top.fit:   'regular' | 'oversized'
 *  bottom.type: 'baggy' | 'balloon' (bermuda) | 'wide' | 'tailored' | 'cargo'
 *  fabric:    'cotton' | 'denim' | 'knit' | 'mesh' | 'fleece' | 'wool' | 'leather'
 *  extras:    'cap' | 'chain' | 'watch' | 'bag' | 'belt'
 *  hotspots:  pontos de detalhe (anchor: chest | back | neck | head | waist | thigh | knee | foot | wrist | hand)
 * ============================================================
 */

export const looks = [
  {
    id: 'street-oversized',
    name: 'Street Oversized',
    tag: 'Masculino',
    vibe: 'Streetwear',
    description:
      'Camiseta oversized com estampa nas costas, calça baggy jeans empilhando no tênis e boné para fechar. O look que mais sai da loja.',
    pieces: ['Camiseta oversized estampada', 'Calça baggy jeans', 'Tênis importado', 'Boné aba curva'],
    body: 'm',
    outfit: {
      top: {
        type: 'tee',
        fit: 'oversized',
        color: '#efe9dc',
        fabric: 'cotton',
        printBack: { title: 'IMPÉRIO', subtitle: 'REAL · ARARUAMA RJ', color: '#141414', accent: '#c8961c' },
        printFront: { crown: true, color: '#c8961c' },
      },
      bottom: { type: 'baggy', color: '#4a6689', fabric: 'denim' },
      shoes: { type: 'sneaker', color: '#131316', sole: '#131316', accent: '#f5c542' },
      extras: [{ type: 'cap', color: '#111114' }],
    },
    hotspots: [
      { anchor: 'back', label: 'Estampa nas costas' },
      { anchor: 'thigh', label: 'Baggy com caimento amplo' },
      { anchor: 'foot', label: 'Tênis importado' },
    ],
  },
  {
    id: 'camisa-de-time',
    name: 'Camisa de Time',
    tag: 'Masculino',
    vibe: 'Quadra & rua',
    description:
      'Regata de basquete com número nas costas, bermuda jeans balão e ouro no pescoço e no pulso. Presença garantida em qualquer rolê.',
    pieces: ['Camisa de time / regata', 'Bermuda jeans balão', 'Corrente e relógio dourados', 'Tênis importado'],
    body: 'm',
    outfit: {
      top: {
        type: 'jersey',
        fit: 'regular',
        color: '#101014',
        fabric: 'mesh',
        trim: '#f5c542',
        printFront: { title: 'IMPÉRIO', number: '10', color: '#f5c542' },
        printBack: { title: 'REAL', number: '10', color: '#f5c542' },
      },
      bottom: { type: 'balloon', color: '#22324a', fabric: 'denim' },
      shoes: { type: 'sneaker', color: '#f2f0ea', sole: '#f2f0ea', accent: '#101014' },
      extras: [{ type: 'chain' }, { type: 'watch' }],
    },
    hotspots: [
      { anchor: 'chest', label: 'Número na frente e nas costas' },
      { anchor: 'neck', label: 'Corrente dourada' },
      { anchor: 'knee', label: 'Bermuda balão' },
    ],
  },
  {
    id: 'casual-chic',
    name: 'Casual Chic',
    tag: 'Feminino',
    vibe: 'Dia a dia',
    description:
      'Top cropped canelado, calça pantalona de alfaiataria e bolsa estruturada. Confortável para o dia inteiro, elegante até a noite.',
    pieces: ['Top cropped canelado', 'Calça pantalona', 'Bolsa estruturada', 'Tênis branco'],
    body: 'f',
    outfit: {
      top: { type: 'crop', fit: 'regular', color: '#141417', fabric: 'knit' },
      bottom: { type: 'wide', color: '#d8c6a5', fabric: 'wool' },
      shoes: { type: 'sneaker', color: '#f4f1ea', sole: '#f4f1ea', accent: '#c8961c' },
      extras: [{ type: 'bag', color: '#8a5a2b' }, { type: 'belt' }],
    },
    hotspots: [
      { anchor: 'chest', label: 'Malha canelada' },
      { anchor: 'waist', label: 'Cintura alta' },
      { anchor: 'hand', label: 'Bolsa estruturada' },
    ],
  },
  {
    id: 'smart-office',
    name: 'Smart Office',
    tag: 'Feminino',
    vibe: 'Trabalho',
    description:
      'Blazer de alfaiataria sobre top básico, calça reta e mocassim. Da reunião ao happy hour sem trocar de roupa.',
    pieces: ['Blazer de alfaiataria', 'Top básico', 'Calça reta', 'Mocassim'],
    body: 'f',
    outfit: {
      top: {
        type: 'blazer',
        fit: 'regular',
        color: '#b3824a',
        fabric: 'wool',
        inner: { color: '#0f0f12', fabric: 'cotton' },
      },
      bottom: { type: 'tailored', color: '#121215', fabric: 'wool' },
      shoes: { type: 'loafer', color: '#0d0d0f', accent: '#f5c542' },
      extras: [{ type: 'watch' }],
    },
    hotspots: [
      { anchor: 'chest', label: 'Blazer estruturado' },
      { anchor: 'wrist', label: 'Relógio dourado' },
      { anchor: 'foot', label: 'Mocassim' },
    ],
  },
]
