import { DurableObject } from 'cloudflare:workers'
import {
  CLOSE_ABUSE,
  CLOSE_ROOM_FULL,
  MAX_PLAYERS_PER_ROOM,
  MAX_ROOMS,
  MOVE_RATE_HZ,
  parseClientMessage,
  PING,
  PONG,
  PROTOCOL_VERSION,
  type PlayerSnapshot,
  type ServerMessage,
  VISITOR_COLORS,
} from '@aika-world/shared'

export interface Env {
  WORLD: DurableObjectNamespace<World>
  /** Arquivos estáticos do site (apps/web/dist). */
  ASSETS?: Fetcher
  /** Origens permitidas, separadas por vírgula (ex.: "https://aikaworld.com"). Vazio = qualquer uma. */
  ALLOWED_ORIGINS?: string
}

/** Balde de fichas simples para limitar mensagens por conexão. */
class Bucket {
  private tokens: number
  private last = Date.now()
  constructor(
    private readonly capacity: number,
    private readonly perSecond: number,
  ) {
    this.tokens = capacity
  }
  take(): boolean {
    const now = Date.now()
    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.perSecond)
    this.last = now
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }
}

interface Limits {
  move: Bucket
  emote: Bucket
  invalid: number
}

const MAX_INVALID = 20

/**
 * Uma sala do mundo. Guarda as conexões WebSocket dos visitantes (com a API
 * de hibernação: conexões paradas não custam nada) e repassa movimento e
 * emotes de cada um para os outros. O estado de cada visitante vive no
 * "attachment" da própria conexão, então sobrevive à hibernação.
 */
export class World extends DurableObject<Env> {
  /** Limites em memória; zeram se o objeto hibernar, o que é aceitável. */
  private limits = new Map<WebSocket, Limits>()

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG))
  }

  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Esperava um WebSocket', { status: 426 })
    }
    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]
    const others = this.ctx.getWebSockets()

    if (others.length >= MAX_PLAYERS_PER_ROOM) {
      this.ctx.acceptWebSocket(server)
      server.close(CLOSE_ROOM_FULL, 'sala cheia')
      return new Response(null, { status: 101, webSocket: client })
    }

    const you: PlayerSnapshot = {
      id: crypto.randomUUID().slice(0, 8),
      name: `Viajante #${100 + Math.floor(Math.random() * 900)}`,
      color: VISITOR_COLORS[Math.floor(Math.random() * VISITOR_COLORS.length)] ?? VISITOR_COLORS[0],
      q: [0, 0, 0, 1],
      s: 0,
      r: 20,
      a: 0,
    }
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment(you)

    const players = others
      .map((ws) => ws.deserializeAttachment() as PlayerSnapshot | null)
      .filter((p): p is PlayerSnapshot => p !== null)
    send(server, {
      type: 'welcome',
      you: { id: you.id, name: you.name, color: you.color },
      players,
    })
    this.broadcast({ type: 'join', player: you }, server)

    return new Response(null, { status: 101, webSocket: client })
  }

  override async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const me = ws.deserializeAttachment() as PlayerSnapshot | null
    if (!me) return
    const limits = this.limitsFor(ws)
    const msg = typeof raw === 'string' ? parseClientMessage(raw) : null
    if (!msg) {
      if (++limits.invalid > MAX_INVALID) ws.close(CLOSE_ABUSE, 'mensagens inválidas')
      return
    }

    if (msg.type === 'move') {
      if (!limits.move.take()) return
      const move = { q: msg.q, s: msg.s, r: msg.r, a: msg.a }
      Object.assign(me, move)
      ws.serializeAttachment(me)
      this.broadcast({ type: 'move', id: me.id, ...move }, ws)
    } else if (msg.type === 'emote') {
      if (!limits.emote.take()) return
      this.broadcast({ type: 'emote', id: me.id, emote: msg.emote }, ws)
    }
  }

  override async webSocketClose(ws: WebSocket, code: number, reason: string) {
    this.leave(ws)
    try {
      ws.close(code, reason)
    } catch {
      // Já fechado.
    }
  }

  override async webSocketError(ws: WebSocket) {
    this.leave(ws)
  }

  private leave(ws: WebSocket) {
    this.limits.delete(ws)
    const me = ws.deserializeAttachment() as PlayerSnapshot | null
    if (me) this.broadcast({ type: 'leave', id: me.id }, ws)
  }

  private limitsFor(ws: WebSocket): Limits {
    let l = this.limits.get(ws)
    if (!l) {
      l = {
        move: new Bucket(MOVE_RATE_HZ * 1.5, MOVE_RATE_HZ * 1.5),
        emote: new Bucket(2, 1),
        invalid: 0,
      }
      this.limits.set(ws, l)
    }
    return l
  }

  private broadcast(msg: ServerMessage, except?: WebSocket) {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      if (ws !== except) {
        try {
          ws.send(data)
        } catch {
          // Conexão fechando; o close handler cuida dela.
        }
      }
    }
  }
}

function send(ws: WebSocket, msg: ServerMessage) {
  ws.send(JSON.stringify(msg))
}

function originAllowed(request: Request, env: Env): boolean {
  const allowed = env.ALLOWED_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  if (!allowed || allowed.length === 0) return true
  const origin = request.headers.get('Origin')
  return origin !== null && allowed.includes(origin)
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } })
    }

    if (url.pathname === '/world') {
      if (!originAllowed(request, env)) return new Response('Origem não permitida', { status: 403 })
      if (url.searchParams.get('v') !== String(PROTOCOL_VERSION)) {
        return new Response('Versão do protocolo incompatível', { status: 400 })
      }
      const room = Number(url.searchParams.get('room') ?? '1')
      if (!Number.isInteger(room) || room < 1 || room > MAX_ROOMS) {
        return new Response('Sala inválida', { status: 400 })
      }
      const stub = env.WORLD.get(env.WORLD.idFromName(`room-${room}`))
      return stub.fetch(request)
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
