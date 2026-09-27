import { DurableObject } from 'cloudflare:workers'
import type { ServerMessage } from '@aika-world/shared'

export interface Env {
  WORLD: DurableObjectNamespace<World>
}

/**
 * Durable Object que vai manter o estado de uma instância do mundo
 * (jogadores conectados via WebSocket). Stub — etapa 2 do roadmap.
 */
export class World extends DurableObject<Env> {
  override async fetch(_request: Request): Promise<Response> {
    // TODO(etapa 2): aceitar WebSocket (this.ctx.acceptWebSocket) e fazer broadcast.
    const msg: ServerMessage = { type: 'welcome', id: this.ctx.id.toString(), players: [] }
    return Response.json(msg)
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } })
    }

    if (url.pathname === '/world') {
      const stub = env.WORLD.get(env.WORLD.idFromName('main'))
      return stub.fetch(request)
    }

    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler<Env>
