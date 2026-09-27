import type { Vector3 } from 'three'
import { angleBetween, dirFromAngles, PLANET_RADIUS } from '../lib/sphere'

/**
 * Lagos do planeta procedural: bacias afundadas no terreno com água por cima.
 * Com `planeta.glb`, os lagos vêm do Blender (meshes `agua_*`) e isto não é usado.
 */
export interface Lake {
  center: Vector3
  /** Raio da superfície da água, em metros (pela superfície do planeta). */
  radius: number
  /** Profundidade no centro, em metros abaixo da água. */
  depth: number
}

export const LAKES: Lake[] = [
  { center: dirFromAngles(30, -150), radius: 5, depth: 2.6 },
  { center: dirFromAngles(112, 40), radius: 6.5, depth: 3 },
]

/** Nível da água abaixo do chão normal (a margem fica um pouco acima dela). */
export const WATER_DROP = 0.3
/** Faixa de areia em volta da água, em metros. */
export const SHORE = 1.2

/** Distância (m) do ponto ao centro do lago, pela superfície. */
export function lakeDistance(lake: Lake, dir: Vector3): number {
  return angleBetween(lake.center, dir) * PLANET_RADIUS
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Altura do chão do planeta procedural, com as bacias dos lagos. */
export function proceduralGround(dir: Vector3): number {
  let r = PLANET_RADIUS
  for (const lake of LAKES) {
    const d = lakeDistance(lake, dir)
    const edge = lake.radius + SHORE
    if (d >= edge) continue
    // Margem desce suave até o nível da água; dentro, a bacia afunda até `depth`.
    const t = d < lake.radius ? 1 - d / lake.radius : 0
    const shore = smooth(Math.min(1, (edge - d) / SHORE)) * (WATER_DROP + 0.15)
    r = Math.min(r, PLANET_RADIUS - shore - smooth(t) * lake.depth)
  }
  return r
}

/** Raio da superfície da água na direção `dir`, ou null se não houver água. */
export function proceduralWater(dir: Vector3): number | null {
  for (const lake of LAKES) {
    if (lakeDistance(lake, dir) < lake.radius) return PLANET_RADIUS - WATER_DROP
  }
  return null
}

/** O lago que contém (ou quase contém) a direção, para a Aika comentar. */
export function lakeNear(dir: Vector3, margin = 3): Lake | null {
  return LAKES.find((l) => lakeDistance(l, dir) < l.radius + margin) ?? null
}
