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

/** Boas-vindas do Felipe, na frente do templo: curta e sem desvios. */
export const FELIPE_DIALOGUE: Dialogue = {
  speaker: 'Felipe',
  role: 'criador deste mundo',
  nodes: {
    inicio: {
      lines: [
        'Bem-vindo ao meu mundo!',
        'Que legal que a Aika trouxe um amigo para conhecer o nosso mundo!',
        'Este planeta representa os nossos repositórios e os nossos estudos de dev: cada casinha da vila é um projeto do GitHub, e ela cresce toda vez que a gente trabalha nela.',
        'Dá uma volta, conversa com o pessoal da Praça dos Serviços e, se quiser falar com a gente, a caixa de correio aqui do lado tem todos os contatos.',
      ],
      choices: [{ label: 'Valeu, Felipe!' }],
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
