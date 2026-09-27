import { type Mesh, Raycaster, Vector3 } from 'three'
import { PLANET_RADIUS } from '../lib/sphere'

/**
 * Superfície andável do planeta. Sem `planeta.glb` é a esfera lisa de raio
 * PLANET_RADIUS; com ele, a altura vem de um raio lançado de fora para o
 * centro contra os meshes do terreno.
 */
const ground: Mesh[] = []
const blockers: Mesh[] = []

const ray = new Raycaster()
const origin = new Vector3()
const inward = new Vector3()
const CAST_FROM = PLANET_RADIUS * 2

export function setTerrain(groundMeshes: Mesh[], blockerMeshes: Mesh[]) {
  ground.splice(0, ground.length, ...groundMeshes)
  blockers.splice(0, blockers.length, ...blockerMeshes)
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
  if (ground.length === 0) return PLANET_RADIUS
  const hit = castDown(dir, ground)
  return hit ? CAST_FROM - hit.distance : PLANET_RADIUS
}

/** Verdadeiro se a direção cai dentro de um objeto `bloqueio_*`. */
export function isBlocked(dir: Vector3): boolean {
  return blockers.length > 0 && castDown(dir, blockers) !== undefined
}
