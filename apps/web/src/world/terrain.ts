import { type Mesh, Raycaster, Vector3 } from 'three'
import { PLANET_RADIUS } from '../lib/sphere'
import { proceduralGround, proceduralWater } from './lakes'

/**
 * Superfície do planeta. Sem `planeta.glb` é a esfera procedural (com as
 * bacias dos lagos); com ele, a altura vem de um raio lançado de fora para o
 * centro contra os meshes do terreno, e a água contra os meshes `agua_*`.
 */
const ground: Mesh[] = []
const blockers: Mesh[] = []
const water: Mesh[] = []
let modelLoaded = false

const ray = new Raycaster()
const origin = new Vector3()
const inward = new Vector3()
const CAST_FROM = PLANET_RADIUS * 2

export function setTerrain(groundMeshes: Mesh[], blockerMeshes: Mesh[], waterMeshes: Mesh[] = []) {
  ground.splice(0, ground.length, ...groundMeshes)
  blockers.splice(0, blockers.length, ...blockerMeshes)
  water.splice(0, water.length, ...waterMeshes)
  modelLoaded = groundMeshes.length > 0
}

function castDown(dir: Vector3, targets: Mesh[]) {
  origin.copy(dir).normalize().multiplyScalar(CAST_FROM)
  inward.copy(dir).normalize().negate()
  ray.set(origin, inward)
  ray.far = CAST_FROM
  return ray.intersectObjects(targets, false)[0]
}

/** Distância do centro até o chão na direção `dir`. */
export function surfaceRadius(dir: Vector3): number {
  if (!modelLoaded) return proceduralGround(dir)
  const hit = castDown(dir, ground)
  return hit ? CAST_FROM - hit.distance : PLANET_RADIUS
}

/** Distância do centro até a superfície da água em `dir`, ou null se for terra firme. */
export function waterRadius(dir: Vector3): number | null {
  if (!modelLoaded) return proceduralWater(dir)
  if (water.length === 0) return null
  const hit = castDown(dir, water)
  return hit ? CAST_FROM - hit.distance : null
}

/** Verdadeiro se a direção cai dentro de um objeto `bloqueio_*`. */
export function isBlocked(dir: Vector3): boolean {
  return blockers.length > 0 && castDown(dir, blockers) !== undefined
}

/** true quando o terreno vem do `planeta.glb` (e não do planeta procedural). */
export function hasTerrainModel(): boolean {
  return modelLoaded
}
