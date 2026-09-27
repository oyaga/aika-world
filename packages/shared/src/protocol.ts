/**
 * Protocolo WebSocket (placeholder para a etapa 2 — multiplayer).
 * Os formatos abaixo ainda não são usados em produção.
 */

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Quat {
  x: number
  y: number
  z: number
  w: number
}

export interface PlayerState {
  id: string
  position: Vec3
  rotation: Quat
  walking: boolean
}

/** Mensagens enviadas do cliente para o servidor. */
export type ClientMessage =
  | { type: 'hello'; name?: string }
  | { type: 'move'; position: Vec3; rotation: Quat; walking: boolean }
  | { type: 'ping'; t: number }

/** Mensagens enviadas do servidor para o cliente. */
export type ServerMessage =
  | { type: 'welcome'; id: string; players: PlayerState[] }
  | { type: 'join'; player: PlayerState }
  | { type: 'leave'; id: string }
  | { type: 'state'; players: PlayerState[] }
  | { type: 'commit'; repo: string | null; secret: boolean; at: string }
  | { type: 'pong'; t: number }
