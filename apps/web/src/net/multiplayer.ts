import { Quaternion } from 'three'
import {
  CLOSE_ABUSE,
  CLOSE_ROOM_FULL,
  type ClientMessage,
  type Emote,
  MAX_ROOMS,
  MOVE_RATE_HZ,
  PING,
  type PlayerInfo,
  PROTOCOL_VERSION,
  type QuatTuple,
  type ServerMessage,
} from '@aika-world/shared'
import { useStore } from '../state/store'

/**
 * Conexão com o servidor do mundo (Cloudflare Durable Object). Só liga se
 * `VITE_WORLD_URL` estiver definido (ex.: wss://aika-world-server.<conta>.workers.dev/world);
 * sem ele, o planeta funciona sozinho, como antes.
 */
const WORLD_URL = import.meta.env.VITE_WORLD_URL || undefined

export interface RemotePlayer {
  info: PlayerInfo
  /** Última orientação recebida (alvo) e a mostrada (suavizada). */
  target: Quaternion
  current: Quaternion
  s: number
  /** false até a primeira posição chegar; então `current` pula direto para o alvo. */
  placed: boolean
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

function syncIds() {
  useStore.getState().setRemoteIds([...remotes.keys()])
}

function addRemote(p: PlayerInfo & { q: QuatTuple; s: number }) {
  const q = new Quaternion(...p.q)
  remotes.set(p.id, {
    info: { id: p.id, name: p.name, color: p.color },
    target: q,
    current: q.clone(),
    s: p.s,
    placed: true,
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
      retry = 0
      lastS = -1 // reenvia a posição atual para quem já está na sala
      break
    case 'join':
      addRemote(msg.player)
      syncIds()
      break
    case 'leave':
      remotes.delete(msg.id)
      syncIds()
      break
    case 'move': {
      const r = remotes.get(msg.id)
      if (r) {
        r.target.set(...msg.q)
        r.s = msg.s
      }
      break
    }
    case 'emote':
      store.showEmote(msg.id, msg.emote)
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

/** Envia a orientação do visitante, no máximo MOVE_RATE_HZ vezes por segundo e só se mudou. */
export function sendMove(q: Quaternion, speed: number) {
  if (!ws) return
  const now = performance.now()
  if (now - lastSent < 1000 / MOVE_RATE_HZ) return
  const s = Math.round(speed * 100) / 100
  const turned = Math.abs(lastQ.dot(q)) < 0.99999
  const stopped = s === 0 && lastS !== 0
  if (!turned && !stopped && Math.abs(s - lastS) < 0.1) return
  lastSent = now
  lastQ.copy(q)
  lastS = s
  send({ type: 'move', q: [q.x, q.y, q.z, q.w], s })
}

export function sendEmote(emote: Emote) {
  const me = useStore.getState().net.me
  useStore.getState().showEmote(me?.id ?? 'me', emote)
  send({ type: 'emote', emote })
}

export const multiplayerEnabled = Boolean(WORLD_URL)
