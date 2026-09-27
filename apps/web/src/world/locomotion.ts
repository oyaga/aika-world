import type { Vector3 } from 'three'
import { surfaceRadius, waterRadius } from './terrain'

/**
 * Movimento vertical sem biblioteca de física: a gravidade puxa para o centro
 * do planeta, o pulo dá velocidade para fora, e na água funda o corpo boia.
 * Usado pelo visitante e pela Aika.
 */
export type MoveState = 'ground' | 'air' | 'swim'

export interface Body {
  /** Distância do centro até os pés. 0 = ainda não posicionado. */
  radius: number
  /** Velocidade radial (m/s, positiva para fora). */
  vy: number
  state: MoveState
}

export const WALK_SPEED = 6
export const RUN_SPEED = 10.5
export const SWIM_SPEED = 3.2
const GRAVITY = 24
const JUMP_SPEED = 8.5 // ~1,5 m de altura
const SWIM_JUMP_SPEED = 7 // sair da água pulando
/** Água mais funda que isso (m) = nadando. */
const SWIM_DEPTH = 0.9
/** Quanto os pés ficam abaixo da superfície ao nadar (a cabeça fica de fora). */
export const SWIM_SINK = 1.15

/**
 * Guarda-roupa aberto nadando: o visitante fica em pé na superfície, como num
 * provador, em vez de deitado e meio submerso. Metros a subir a partir dos pés.
 */
export function fittingLift(state: MoveState, fitting: boolean): number {
  return fitting && state === 'swim' ? SWIM_SINK : 0
}

export interface StepResult {
  /** Caiu na água neste frame (e com que força, 0..1), para o respingo. */
  splash: number
  jumped: boolean
}

/** Avança a física vertical de `body` na direção `dir` (unitária). */
export function stepVertical(body: Body, dir: Vector3, dt: number, wantJump: boolean): StepResult {
  const ground = surfaceRadius(dir)
  const water = waterRadius(dir)
  const deep = water !== null && water - ground > SWIM_DEPTH
  const floor = deep ? (water as number) - SWIM_SINK : ground
  const result: StepResult = { splash: 0, jumped: false }

  if (body.radius === 0) {
    body.radius = floor
    body.state = deep ? 'swim' : 'ground'
    return result
  }

  if (body.state !== 'air') {
    if (wantJump) {
      body.vy = body.state === 'swim' ? SWIM_JUMP_SPEED : JUMP_SPEED
      body.state = 'air'
      result.jumped = true
    } else {
      const wasSwimming = body.state === 'swim'
      body.radius += (floor - body.radius) * Math.min(1, dt * 15)
      body.state = deep ? 'swim' : 'ground'
      if (deep && !wasSwimming) result.splash = 0.35 // entrou andando
      // Saiu do chão (beira de um degrau alto): começa a cair.
      if (body.radius - floor > 0.6) body.state = 'air'
      return result
    }
  }

  body.vy -= GRAVITY * dt
  body.radius += body.vy * dt
  if (body.radius <= floor && body.vy <= 0) {
    if (deep) result.splash = Math.min(1, 0.4 + -body.vy / 15)
    body.radius = floor
    body.vy = 0
    body.state = deep ? 'swim' : 'ground'
  }
  return result
}
