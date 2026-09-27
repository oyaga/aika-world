import type { ReactNode } from 'react'
import type { LandmarkPoi } from './world/layout'

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

interface Service {
  name: string
  text: string
  points: string[]
  idealFor: string
}

export const SERVICES: Service[] = [
  {
    name: 'IA Assistente',
    text: 'Assistente digital personalizado para a sua empresa. Automatize o atendimento ao cliente e otimize tarefas diárias de forma inteligente e eficiente.',
    points: ['Automatização', 'Atendimento 24h', 'Otimização'],
    idealFor: 'Empresas que buscam automatização',
  },
  {
    name: 'Web Designer',
    text: 'Sites modernos, responsivos e otimizados para atrair e converter seus clientes.',
    points: ['Design responsivo', 'Foco em conversão', 'Alta performance'],
    idealFor: 'Empresas que precisam de presença online',
  },
  {
    name: 'Servidores',
    text: 'Máxima velocidade (servidores NVMe) e segurança (SSL e firewall), com gestão técnica completa. Você foca no seu negócio, eu cuido do servidor.',
    points: ['Servidores NVMe', 'SSL e firewall', 'Gestão completa'],
    idealFor: 'Empresas que precisam de infraestrutura confiável',
  },
  {
    name: 'Design Gráfico',
    text: 'Logotipos, identidade visual completa (cores, tipografia) e materiais de divulgação que deixam sua marca memorável e profissional.',
    points: ['Branding', 'Identidade visual', 'Materiais de divulgação'],
    idealFor: 'Empresas que buscam uma identidade visual forte',
  },
  {
    name: 'Editor de Vídeo',
    text: 'Vídeos com ritmo, trilha sonora licenciada e motion graphics que prendem a atenção.',
    points: ['Engajamento', 'Motion graphics', 'Trilha sonora licenciada'],
    idealFor: 'Criadores de conteúdo e empresas que querem vídeos profissionais',
  },
  {
    name: 'Google',
    text: 'Estratégias de SEO on-page e otimização técnica para dominar o tráfego orgânico e superar a concorrência.',
    points: ['SEO on-page', 'Otimização técnica', 'Tráfego orgânico'],
    idealFor: 'Empresas que buscam visibilidade no Google',
  },
]

export interface StoryMilestone {
  /** Ano ou período, ex.: "2019" ou "2019–2021". */
  when: string
  title: string
  text: string
}

/**
 * Trilha da história: marcos da vida do Felipe, em ordem. Cada um vira uma
 * placa no caminho que dá a volta no planeta.
 * TODO: substituir pelos marcos reais contados pelo Felipe.
 */
export const STORY: StoryMilestone[] = [
  {
    when: 'Em breve',
    title: 'O começo',
    text: 'Aqui vai o primeiro capítulo da história do Felipe. Conteúdo a ser preenchido.',
  },
  {
    when: 'Em breve',
    title: 'Nasce a Aika',
    text: 'O Felipe me criou como uma extensão da visão estratégica dele: uma agente conectada a várias ferramentas e modelos de linguagem.',
  },
]

export const SECTIONS: Record<LandmarkPoi['id'], SectionContent> = {
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
        <p>Na oficina a gente constrói de tudo. Veja o que podemos fazer por você:</p>
        <ul className="services">
          {SERVICES.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
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
    title: 'Contato',
    body: (
      <>
        <p>A torre de rádio está captando sinais. Fale com o Felipe (e comigo) por aqui:</p>
        <ul className="links">
          <li>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`}>E-mail: {CONTACT.email}</a>
          </li>
          <li>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              GitHub: @{GITHUB_USER}
            </a>
          </li>
          <li>
            <a href={CONTACT.site} target="_blank" rel="noopener noreferrer">
              aikanakamura.com
            </a>
          </li>
        </ul>
      </>
    ),
  },
}
