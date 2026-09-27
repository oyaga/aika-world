import { CONTACT, type Service, type StoryMilestone } from './content'
import type { Poi } from './world/layout'

/**
 * Conversas com NPCs. Cada conversa é um pequeno grafo: o nó `inicio` abre,
 * cada nó tem falas (mostradas uma a uma) e, ao final, opções de resposta.
 * Nós sem `choices` ganham "Quero saber outra coisa" + "Tchau".
 */
export interface DialogueChoice {
  label: string
  /** Próximo nó. Sem `next` nem `href`, a conversa termina. */
  next?: string
  /** Link externo (WhatsApp, e-mail…). */
  href?: string
}

export interface DialogueNode {
  lines: string[]
  choices?: DialogueChoice[]
}

export interface Dialogue {
  speaker: string
  role: string
  nodes: Record<string, DialogueNode> & { inicio: DialogueNode }
}

export const BACK_CHOICES: DialogueChoice[] = [
  { label: 'Quero saber outra coisa', next: 'inicio' },
  { label: 'Tchau!' },
]

function whatsappAbout(topic: string): string {
  const text = `Olá, Felipe! Vim pelo Aika World e quero saber mais sobre ${topic}.`
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
}

export const FELIPE_DIALOGUE: Dialogue = {
  speaker: 'Felipe',
  role: 'criador deste planeta',
  nodes: {
    inicio: {
      lines: [
        'Oi, Aika! Trouxe mais um visitante? Seja bem-vindo ao meu templo!',
        `Eu sou o ${CONTACT.name}. Este planeta inteiro é meu: meus projetos, meu trabalho e minha história.`,
      ],
      choices: [
        { label: 'Quem é você?', next: 'felipe' },
        { label: 'Quem é a Aika?', next: 'aika' },
        { label: 'Como a Aika nasceu?', next: 'origem' },
        { label: 'Onde vejo seu trabalho?', next: 'trabalho' },
        { label: 'Tchau!' },
      ],
    },
    felipe: {
      lines: [
        'Sou designer e desenvolvedor. Trabalho com sites, identidade visual, vídeo, servidores, SEO e assistentes de IA.',
        'Minha trajetória está na trilha que dá a volta no planeta: em cada parada, um eu do passado conta um capítulo.',
      ],
    },
    aika: {
      lines: [
        'A Aika é uma agente inteligente que eu criei, conectada a várias ferramentas e modelos de linguagem.',
        'Ela atua como desenvolvedora, designer, analista e gestora: um agente completo, versátil e sempre em evolução.',
        'E é ela quem vai te guiar por aqui.',
      ],
    },
    origem: {
      lines: [
        'Criei a Aika como uma extensão da minha visão estratégica.',
        'Ela nasceu da lealdade e de um propósito claro: honrar o legado de cada cliente, unindo dados e alma, tecnologia e estratégia.',
      ],
    },
    trabalho: {
      lines: [
        'Na Praça dos Serviços, cada prédio é um serviço, e tem alguém na porta para te explicar tudo.',
        'As casinhas da vila são meus projetos do GitHub. Elas crescem quando eu trabalho nelas.',
      ],
      choices: [
        { label: 'Ver meu LinkedIn', href: CONTACT.linkedin },
        { label: 'Falar no WhatsApp', href: whatsappAbout('o seu trabalho') },
        ...BACK_CHOICES,
      ],
    },
  },
}

/** Conversa do NPC na porta de cada prédio de serviço, gerada dos dados do serviço. */
export function serviceDialogue(service: Service): Dialogue {
  const lower = service.idealFor.charAt(0).toLowerCase() + service.idealFor.slice(1)
  return {
    speaker: service.npc.name,
    role: service.npc.role,
    nodes: {
      inicio: {
        lines: [
          `Oi! Eu sou ${service.npc.name}, ${service.npc.role}. Bem-vindo à ${service.name}!`,
          service.text,
        ],
        choices: [
          { label: 'Como funciona?', next: 'como' },
          { label: 'Para quem é?', next: 'quem' },
          { label: 'Quero contratar', next: 'contratar' },
          { label: 'Tchau!' },
        ],
      },
      como: {
        lines: [`Na prática, você recebe: ${service.points.join(', ')}.`],
      },
      quem: {
        lines: [`É ideal para ${lower}.`],
      },
      contratar: {
        lines: ['Ótimo! Fale direto com o Felipe e conte o que você precisa.'],
        choices: [
          { label: 'Abrir WhatsApp', href: whatsappAbout(service.name) },
          { label: 'Mandar e-mail', href: `mailto:${CONTACT.email}` },
          ...BACK_CHOICES,
        ],
      },
    },
  }
}

/** Quem conta um capítulo da história (padrão: o Felipe daquela época). */
export function storyNarrator(milestone: StoryMilestone) {
  return (
    milestone.npc ?? {
      name: `Felipe · ${milestone.when}`,
      role: milestone.title,
    }
  )
}

/** Conversa de um NPC da Trilha da história. */
export function storyDialogue(milestone: StoryMilestone, index: number, total: number): Dialogue {
  const narrator = storyNarrator(milestone)
  const last = index >= total - 1
  return {
    speaker: narrator.name,
    role: narrator.role,
    nodes: {
      inicio: {
        lines: milestone.lines,
        choices: [{ label: 'E depois?', next: 'depois' }, { label: 'Tchau!' }],
      },
      depois: {
        lines: [
          last
            ? 'Essa é a história até agora. O próximo capítulo ainda está sendo escrito!'
            : 'Siga pela trilha: o próximo capítulo te espera mais adiante.',
        ],
        choices: [{ label: 'Ouvir de novo', next: 'inicio' }, { label: 'Tchau!' }],
      },
    },
  }
}

/** Conversa do ponto de interesse, ou null se ele abre um painel comum. */
export function dialogueFor(poi: Poi): Dialogue | null {
  if (poi.kind === 'landmark' && poi.landmark === 'templo') return FELIPE_DIALOGUE
  if (poi.kind === 'service') return serviceDialogue(poi.service)
  if (poi.kind === 'story') return storyDialogue(poi.milestone, poi.index, poi.total)
  return null
}
