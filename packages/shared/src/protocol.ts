/**
 * Protocolo WebSocket do multiplayer (cliente ⇄ Durable Object `World`).
 *
 * A posição de um visitante na esfera é a orientação (quaternion `q`, cujo
 * "up" local aponta para ele) vezes a distância ao centro `r` (chão, água ou
 * no ar durante um pulo). Além disso vão `s`, a velocidade para a animação
 * (1 = andando, ~1,75 = correndo), e `a`, o estado de movimento.
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

/** Estado de movimento: 0 = no chão, 1 = no ar (pulo), 2 = nadando. */
export type MoveAction = 0 | 1 | 2

export interface MoveData {
  q: QuatTuple
  s: number
  r: number
  a: MoveAction
}

export interface PlayerSnapshot extends PlayerInfo, MoveData {}

/** Limites aceitos para `r` (o planeta tem raio ~20 m). */
export const MIN_RADIUS = 14
export const MAX_RADIUS = 30

/** Mensagens enviadas do cliente para o servidor. */
export type ClientMessage = ({ type: 'move' } & MoveData) | { type: 'emote'; emote: Emote }

/** Mensagens enviadas do servidor para o cliente. */
export type ServerMessage =
  | { type: 'welcome'; you: PlayerInfo; players: PlayerSnapshot[] }
  | { type: 'join'; player: PlayerSnapshot }
  | { type: 'leave'; id: string }
  | ({ type: 'move'; id: string } & MoveData)
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
      if (!q || !isFiniteNumber(msg.s) || !isFiniteNumber(msg.r)) return null
      if (msg.a !== 0 && msg.a !== 1 && msg.a !== 2) return null
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
      return {
        type: 'move',
        q,
        s: clamp(Math.round(msg.s * 100) / 100, 0, 2),
        r: clamp(Math.round(msg.r * 100) / 100, MIN_RADIUS, MAX_RADIUS),
        a: msg.a,
      }
    }
    case 'emote':
      return EMOTES.includes(msg.emote as Emote)
        ? { type: 'emote', emote: msg.emote as Emote }
        : null
    default:
      return null
  }
}
