import { Quaternion } from 'three'
import {
  CLOSE_ABUSE,
  CLOSE_ROOM_FULL,
  type ClientMessage,
  type Emote,
  MAX_ROOMS,
  type MoveAction,
  MOVE_RATE_HZ,
  PING,
  type Look,
  type PlayerInfo,
  type PlayerSnapshot,
  PROTOCOL_VERSION,
  type ServerMessage,
} from '@aika-world/shared'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { type Gesture, playGesture } from '../world/Characters'

/**
 * Conexão com o servidor do mundo (Cloudflare Durable Object). Só liga se
 * `VITE_WORLD_URL` estiver definido; sem ele, o planeta funciona sozinho.
 * - `same-origin`: o próprio endereço do site + /world (deploy num Worker só);
 * - ou uma URL completa, ex.: ws://localhost:8787/world.
 */
function resolveWorldUrl(): string | undefined {
  const value = import.meta.env.VITE_WORLD_URL?.trim()
  if (!value) return undefined
  if (value !== 'same-origin') return value
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}/world`
}

const WORLD_URL = resolveWorldUrl()

export interface RemotePlayer {
  info: PlayerInfo
  /** Última orientação recebida (alvo) e a mostrada (suavizada). */
  target: Quaternion
  current: Quaternion
  s: number
  /** Distância ao centro recebida (alvo) e a mostrada (suavizada). */
  targetR: number
  r: number
  a: MoveAction
  /** Último gesto recebido (ex.: aceno do emote 👋). */
  gesture?: Gesture
}

/** Outros visitantes, fora do React (lidos a cada frame). A lista de ids fica no store. */
export const remotes = new Map<string, RemotePlayer>()

let ws: WebSocket | null = null
let room = 1
let retry = 0
let pingTimer = 0
let lastSent = 0
const lastQ = new Quaternion(0, 0, 0, 2) // inválido de propósito: força o primeiro envio
let lastS = -1
let lastR = 0
let lastA: MoveAction = 0
const ACTIONS = { ground: 0, air: 1, swim: 2 } as const

function syncIds() {
  useStore.getState().setRemoteIds([...remotes.keys()])
}

function addRemote(p: PlayerSnapshot) {
  useStore.getState().setRemoteLook(p.id, p.look ?? null)
  const q = new Quaternion(...p.q)
  remotes.set(p.id, {
    info: { id: p.id, name: p.name, color: p.color },
    target: q,
    current: q.clone(),
    s: p.s,
    targetR: p.r,
    r: p.r,
    a: p.a,
  })
}

function handle(msg: ServerMessage) {
  const store = useStore.getState()
  switch (msg.type) {
    case 'welcome':
      remotes.clear()
      msg.players.forEach(addRemote)
      store.setNet({ status: 'online', me: msg.you, room })
      store.setVisitorColor(msg.you.color)
      syncIds()
      sendLook(store.look)
      retry = 0
      lastS = -1 // reenvia a posição atual para quem já está na sala
      break
    case 'join':
      addRemote(msg.player)
      syncIds()
      break
    case 'leave':
      remotes.delete(msg.id)
      store.setRemoteLook(msg.id, null)
      syncIds()
      break
    case 'move': {
      const r = remotes.get(msg.id)
      if (r) {
        r.target.set(...msg.q)
        r.s = msg.s
        r.targetR = msg.r
        r.a = msg.a
      }
      break
    }
    case 'emote': {
      store.showEmote(msg.id, msg.emote)
      const r = remotes.get(msg.id)
      if (r && msg.emote === '👋') r.gesture = { name: 'Wave', id: Date.now() }
      break
    }
    case 'look':
      if (remotes.has(msg.id)) store.setRemoteLook(msg.id, msg.look)
      break
    case 'commit':
      // Etapa 3 (commits ao vivo).
      break
  }
}

function connect() {
  if (!WORLD_URL) return
  useStore.getState().setNet({ status: 'connecting' })
  const socket = new WebSocket(`${WORLD_URL}?v=${PROTOCOL_VERSION}&room=${room}`)
  ws = socket

  socket.onmessage = (e) => {
    if (typeof e.data !== 'string' || e.data === 'pong') return
    try {
      handle(JSON.parse(e.data) as ServerMessage)
    } catch {
      // Mensagem inesperada: ignora.
    }
  }
  socket.onopen = () => {
    window.clearInterval(pingTimer)
    pingTimer = window.setInterval(() => socket.readyState === 1 && socket.send(PING), 25_000)
  }
  socket.onclose = (e) => {
    window.clearInterval(pingTimer)
    if (ws !== socket) return
    ws = null
    remotes.clear()
    syncIds()
    if (e.code === CLOSE_ROOM_FULL && room < MAX_ROOMS) {
      room += 1
      connect()
      return
    }
    if (e.code === CLOSE_ROOM_FULL || e.code === CLOSE_ABUSE) {
      useStore.getState().setNet({ status: 'offline', me: null })
      return
    }
    // Queda de rede: tenta de novo com espera crescente (2 s, 4 s… até 30 s).
    useStore.getState().setNet({ status: 'connecting', me: null })
    const delay = Math.min(30_000, 2000 * 2 ** retry++)
    window.setTimeout(connect, delay)
  }
}

function send(msg: ClientMessage) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
}

/** Liga o multiplayer (uma vez). */
export function startMultiplayer() {
  if (!WORLD_URL || ws) return
  connect()
}

/** Envia o movimento do visitante, no máximo MOVE_RATE_HZ vezes por segundo e só se mudou. */
export function sendMove(
  q: Quaternion,
  speed: number,
  radius: number,
  state: keyof typeof ACTIONS,
) {
  if (!ws) return
  const now = performance.now()
  if (now - lastSent < 1000 / MOVE_RATE_HZ) return
  const s = Math.round(speed * 100) / 100
  const a = ACTIONS[state]
  const turned = Math.abs(lastQ.dot(q)) < 0.99999
  const stopped = s === 0 && lastS !== 0
  const moved = Math.abs(radius - lastR) > 0.05 || a !== lastA
  if (!turned && !stopped && !moved && Math.abs(s - lastS) < 0.1) return
  lastSent = now
  lastQ.copy(q)
  lastS = s
  lastR = radius
  lastA = a
  send({ type: 'move', q: [q.x, q.y, q.z, q.w], s, r: radius, a })
}

export function sendEmote(emote: Emote) {
  if (emote === '👋') playGesture(playerState, 'Wave')
  const me = useStore.getState().net.me
  useStore.getState().showEmote(me?.id ?? 'me', emote)
  send({ type: 'emote', emote })
}

function sendLook(look: Look) {
  send({ type: 'look', look })
}

// Visual novo → avisa a sala (com uma pequena espera, para cliques seguidos virarem um envio).
let lookTimer = 0
useStore.subscribe((state, prev) => {
  if (state.look === prev.look || !ws) return
  window.clearTimeout(lookTimer)
  lookTimer = window.setTimeout(() => sendLook(useStore.getState().look), 400)
})

export const multiplayerEnabled = Boolean(WORLD_URL)
