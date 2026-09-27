/**
 * Protocolo WebSocket do multiplayer (cliente ⇄ Durable Object `World`).
 *
 * A posição de um visitante na esfera é derivada só da orientação
 * (quaternion): "up" local × raio do terreno, calculado em cada cliente.
 * Por isso a rede só carrega o quaternion `q` e a velocidade `s` (0..1,
 * usada na animação de andar).
 */

/** Versão do protocolo; o servidor recusa clientes de outra versão. */
export const PROTOCOL_VERSION = 1

/** Visitantes por instância (sala). Acima disso, o cliente tenta a próxima sala. */
export const MAX_PLAYERS_PER_ROOM = 50

/** Quantas salas o cliente tenta antes de desistir e ficar sozinho. */
export const MAX_ROOMS = 5

/** Frequência máxima de envio de movimento (por segundo). */
export const MOVE_RATE_HZ = 10

/**
 * Keep-alive: o cliente manda o texto exato `ping` e o servidor responde
 * `pong` automaticamente, sem acordar o Durable Object.
 */
export const PING = 'ping'
export const PONG = 'pong'

/** Código de fechamento quando a sala está cheia. */
export const CLOSE_ROOM_FULL = 4001
/** Código de fechamento por abuso (mensagens demais ou inválidas). */
export const CLOSE_ABUSE = 4008

/** Emotes permitidos (sem chat livre, para não precisar moderar texto). */
export const EMOTES = ['👋', '🎉', '❤️', '😂'] as const
export type Emote = (typeof EMOTES)[number]

/** Cores de roupa sorteadas pelo servidor para cada visitante. */
export const VISITOR_COLORS = [
  '#3fb5a0',
  '#4f8cff',
  '#f2a93b',
  '#9b6bff',
  '#e9577d',
  '#44b86b',
] as const

/** Quaternion compacto [x, y, z, w]. */
export type QuatTuple = [number, number, number, number]

export interface PlayerInfo {
  id: string
  name: string
  color: string
}

export interface PlayerSnapshot extends PlayerInfo {
  q: QuatTuple
  s: number
}

/** Mensagens enviadas do cliente para o servidor. */
export type ClientMessage =
  { type: 'move'; q: QuatTuple; s: number } | { type: 'emote'; emote: Emote }

/** Mensagens enviadas do servidor para o cliente. */
export type ServerMessage =
  | { type: 'welcome'; you: PlayerInfo; players: PlayerSnapshot[] }
  | { type: 'join'; player: PlayerSnapshot }
  | { type: 'leave'; id: string }
  | { type: 'move'; id: string; q: QuatTuple; s: number }
  | { type: 'emote'; id: string; emote: Emote }
  | { type: 'commit'; repo: string | null; secret: boolean; at: string }

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Quaternion normalizado e arredondado, ou null se inválido. */
export function sanitizeQuat(value: unknown): QuatTuple | null {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(isFiniteNumber)) return null
  const [x, y, z, w] = value as number[] as QuatTuple
  const len = Math.hypot(x, y, z, w)
  if (len < 1e-6) return null
  const r = (n: number) => Math.round((n / len) * 10_000) / 10_000
  return [r(x), r(y), r(z), r(w)]
}

/**
 * Valida uma mensagem do cliente (texto JSON). Devolve null para qualquer
 * coisa fora do protocolo — o servidor nunca confia no que chega.
 */
export function parseClientMessage(raw: string): ClientMessage | null {
  if (raw.length > 512) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const msg = data as Record<string, unknown>
  switch (msg.type) {
    case 'move': {
      const q = sanitizeQuat(msg.q)
      if (!q || !isFiniteNumber(msg.s)) return null
      return { type: 'move', q, s: Math.min(1, Math.max(0, Math.round(msg.s * 100) / 100)) }
    }
    case 'emote':
      return EMOTES.includes(msg.emote as Emote)
        ? { type: 'emote', emote: msg.emote as Emote }
        : null
    default:
      return null
  }
}
