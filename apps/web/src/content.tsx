import type { ReactNode } from 'react'

/**
 * Conteúdo do planeta. Quem fala é a Aika, a agente criada pelo Felipe:
 * o planeta é dele, e ela guia o visitante.
 */

export interface SectionContent {
  title: string
  body: ReactNode
}

export const GITHUB_USER = 'oyaga'

export const CONTACT = {
  name: 'Felipe Kenji "Nakamura"',
  email: 'felipe.kenji@hotmail.com',
  whatsapp: 'https://wa.me/5519993369603',
  linkedin: 'https://www.linkedin.com/in/felipe-nakamura-dsg',
  github: `https://github.com/${GITHUB_USER}`,
  site: 'https://aikanakamura.com',
}

interface ContactOption {
  icon: string
  label: string
  detail: string
  href: string
}

/** Todas as formas de contato, mostradas na caixa de correio ao lado do templo. */
export const CONTACT_OPTIONS: ContactOption[] = [
  {
    icon: '💬',
    label: 'WhatsApp',
    detail: 'Mensagem direta',
    href: `${CONTACT.whatsapp}?text=${encodeURIComponent('Olá, Felipe! Vim pelo Aika World.')}`,
  },
  { icon: '✉️', label: 'E-mail', detail: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: '💼', label: 'LinkedIn', detail: 'felipe-nakamura-dsg', href: CONTACT.linkedin },
  { icon: '🐙', label: 'GitHub', detail: `@${GITHUB_USER}`, href: CONTACT.github },
  { icon: '🌐', label: 'Site', detail: 'aikanakamura.com', href: CONTACT.site },
]

export interface Service {
  slug: string
  icon: string
  name: string
  text: string
  points: string[]
  idealFor: string
  /** Cor do prédio e da roupa do NPC. */
  color: string
  /** NPC na porta do prédio, que explica o serviço. */
  npc: { name: string; role: string }
}

export const SERVICES: Service[] = [
  {
    slug: 'ia-assistente',
    icon: '🤖',
    name: 'IA Assistente',
    color: '#7b61ff',
    npc: { name: 'Yuki', role: 'especialista em assistentes de IA' },
    text: 'Assistente digital personalizado para a sua empresa. Automatize o atendimento ao cliente e otimize tarefas diárias de forma inteligente e eficiente.',
    points: ['Automatização', 'Atendimento 24h', 'Otimização'],
    idealFor: 'Empresas que buscam automatização',
  },
  {
    slug: 'web-designer',
    icon: '💻',
    name: 'Web Designer',
    color: '#2f9bff',
    npc: { name: 'Hiro', role: 'web designer' },
    text: 'Sites modernos, responsivos e otimizados para atrair e converter seus clientes.',
    points: ['Design responsivo', 'Foco em conversão', 'Alta performance'],
    idealFor: 'Empresas que precisam de presença online',
  },
  {
    slug: 'servidores',
    icon: '🗄️',
    name: 'Servidores',
    color: '#3fb57a',
    npc: { name: 'Takeshi', role: 'cuidador dos servidores' },
    text: 'Máxima velocidade (servidores NVMe) e segurança (SSL e firewall), com gestão técnica completa. Você foca no seu negócio, eu cuido do servidor.',
    points: ['Servidores NVMe', 'SSL e firewall', 'Gestão completa'],
    idealFor: 'Empresas que precisam de infraestrutura confiável',
  },
  {
    slug: 'design-grafico',
    icon: '🎨',
    name: 'Design Gráfico',
    color: '#ff6fa8',
    npc: { name: 'Sakura', role: 'designer gráfica' },
    text: 'Logotipos, identidade visual completa (cores, tipografia) e materiais de divulgação que deixam sua marca memorável e profissional.',
    points: ['Branding', 'Identidade visual', 'Materiais de divulgação'],
    idealFor: 'Empresas que buscam uma identidade visual forte',
  },
  {
    slug: 'editor-de-video',
    icon: '🎬',
    name: 'Editor de Vídeo',
    color: '#ffb020',
    npc: { name: 'Ren', role: 'editor de vídeo' },
    text: 'Vídeos com ritmo, trilha sonora licenciada e motion graphics que prendem a atenção.',
    points: ['Engajamento', 'Motion graphics', 'Trilha sonora licenciada'],
    idealFor: 'Criadores de conteúdo e empresas que querem vídeos profissionais',
  },
  {
    slug: 'google',
    icon: '🔎',
    name: 'Google',
    color: '#e8453c',
    npc: { name: 'Mei', role: 'especialista em SEO' },
    text: 'Estratégias de SEO on-page e otimização técnica para dominar o tráfego orgânico e superar a concorrência.',
    points: ['SEO on-page', 'Otimização técnica', 'Tráfego orgânico'],
    idealFor: 'Empresas que buscam visibilidade no Google',
  },
]

export interface StoryMilestone {
  /** Ano ou período, ex.: "2019" ou "2019–2021". Aparece na placa ao lado do NPC. */
  when: string
  title: string
  /** Falas do NPC ao contar este capítulo (mostradas uma a uma). */
  lines: string[]
  /**
   * Quem conta o capítulo. Padrão: o próprio Felipe naquela época
   * ("Felipe · 2018"), falando em primeira pessoa.
   */
  npc?: { name: string; role: string; outfit?: string }
}

/**
 * Trilha da história: marcos da vida do Felipe, em ordem. Cada um vira um
 * NPC no caminho que dá a volta no planeta; a história é contada em conversa
 * quando a Aika chega perto e interage.
 * TODO: substituir pelos marcos reais contados pelo Felipe.
 */
export const STORY: StoryMilestone[] = [
  {
    when: 'Em breve',
    title: 'O começo',
    lines: [
      'Oi! Eu sou o Felipe de um tempo atrás.',
      'Este é o começo da minha história… que eu ainda vou te contar direitinho. Volte em breve!',
    ],
  },
  {
    when: 'Em breve',
    title: 'Nasce a Aika',
    lines: [
      'Foi aqui que eu criei a Aika, como uma extensão da minha visão estratégica.',
      'Uma agente conectada a várias ferramentas e modelos de linguagem, pronta para qualquer demanda.',
    ],
  },
]

/** Seções para a versão simples (2D), na ordem em que aparecem. */
export const SECTIONS: Record<'sobre' | 'servicos' | 'contato', SectionContent> = {
  sobre: {
    title: 'Sobre',
    body: (
      <>
        <p>
          Oi, eu sou a <strong>Aika</strong>! Bem-vindo ao planeta do{' '}
          <strong>{CONTACT.name}</strong>. Ele me criou como uma extensão da visão estratégica dele,
          e eu moro aqui para te mostrar tudo.
        </p>
        <p>
          Sou uma agente inteligente conectada a diversas ferramentas e modelos de linguagem (LLMs).
          Atuo como desenvolvedora, designer, analista e gestora: um agente completo, versátil e
          sempre em evolução. Minha missão é unir dados e alma, tecnologia e estratégia, para
          construir marcas fortes e duradouras no digital.
        </p>
        <p>
          Cada casinha da vila é um projeto do Felipe e cresce quando ele trabalha nela. Siga a
          trilha de placas para conhecer a história dele.
        </p>
      </>
    ),
  },
  servicos: {
    title: 'Serviços',
    body: (
      <>
        <p>Na Praça dos Serviços, cada prédio é um serviço. Veja o que podemos fazer por você:</p>
        <ul className="services">
          {SERVICES.map((s) => (
            <li key={s.name}>
              <h3>
                {s.icon} {s.name}
              </h3>
              <p>{s.text}</p>
              <p className="services__points">{s.points.join(' · ')}</p>
              <p className="services__ideal">
                <strong>Ideal para:</strong> {s.idealFor}
              </p>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  contato: {
    title: 'Caixa de correio',
    body: (
      <>
        <p>Deixe sua mensagem! Escolha como falar com o Felipe (e com a Aika):</p>
        <ul className="contacts">
          {CONTACT_OPTIONS.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                {...(c.href.startsWith('mailto:')
                  ? {}
                  : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <span className="contacts__icon" aria-hidden="true">
                  {c.icon}
                </span>
                <span>
                  <strong>{c.label}</strong>
                  <small>{c.detail}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  },
}
