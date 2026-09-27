import type { RepoHouse } from '@aika-world/shared'

/**
 * Falas da Aika, a guia que acompanha o visitante: o que ela diz ao chegar,
 * perto de cada repositório e, de vez em quando, sem motivo nenhum.
 */

export const AIKA_GREETING =
  'Oi! Eu sou a Aika. Vem comigo, vou te mostrar o mundo do Felipe! O templo fica logo ali na frente.'

export const AIKA_LAKE = 'Olha o lago! Pode pular, a água tá ótima 💦 (Espaço pula, Shift corre)'
export const AIKA_SWIM = 'Que delícia! Para sair da água, é só nadar até a margem ou pular.'

export const AIKA_CHATTER: string[] = [
  'Sabia que cada casinha cresce quando o Felipe faz commit nela?',
  'Psiu! O Felipe está lá no templo, esperando para te dar boas-vindas.',
  'Na Praça dos Serviços, o pessoal adora explicar o que faz. Pode puxar papo!',
  'Quer falar com o Felipe? A caixa de correio fica do ladinho do templo.',
  'Fui criada pelo Felipe como uma extensão da visão estratégica dele. Sou meio que a assistente oficial daqui!',
  'Este planeta é pequeno, mas cabe muita coisa. Já deu a volta inteira?',
  'Siga a trilha de pedras: o Felipe de cada época conta um pedaço da história dele.',
  'As casinhas cinzas com cadeado são projetos secretos. Nem eu tenho a chave!',
  'Hmm… será que o Felipe já fez commit hoje?',
  'Já tentou pular dentro do lago? Faz um splash!',
  'Adoro esse céu estrelado. Dizem que cada estrela é um bug corrigido.',
  'Se ficar tonto de tanto girar, tem a versão simples lá no canto de cima.',
  'Cada repositório aqui é um estudo, um teste ou um projeto de verdade. Tudo conta!',
]

/** O que a Aika diz ao chegar perto de um repositório. */
export function houseLine(house: RepoHouse): string {
  if (house.secret) {
    return 'Esse aqui é um projeto secreto do Felipe 🔒. Nem eu posso contar o que tem dentro!'
  }
  const description = house.description?.trim()
  const about = description
    ? `${description}${/[.!?]$/.test(description) ? '' : '.'}`
    : 'O Felipe ainda não escreveu uma descrição para ele, mas dá para espiar pelo GitHub.'
  const language = house.language ? ` É feito em ${house.language}.` : ''
  return `Esse é o “${house.name}”! ${about}${language}`
}

/** Por quanto tempo (ms) um balão fica na tela, conforme o tamanho da fala. */
export function speechDuration(text: string): number {
  return Math.min(9000, Math.max(3500, text.length * 60))
}
