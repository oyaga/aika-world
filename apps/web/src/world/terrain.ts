import { type Mesh, type Object3D, Raycaster, Vector3 } from 'three'
import { offsetDir, PLANET_RADIUS, tangentTowards } from '../lib/sphere'
import { proceduralGround, proceduralWater } from './lakes'

/**
 * Superfície do planeta. Sem `planeta.glb` é a esfera procedural (com as
 * bacias dos lagos); com ele, a altura vem de um raio lançado de fora para o
 * centro contra os meshes do terreno, e a água contra os meshes `agua_*`.
 */
const ground: Mesh[] = []
/** Trilhas (meshes de chão cujo nome começa com `trilha`): casas não ficam em cima. */
const paths: Mesh[] = []
const blockers: Mesh[] = []
const water: Mesh[] = []
let modelLoaded = false

const ray = new Raycaster()
const origin = new Vector3()
const inward = new Vector3()
const CAST_FROM = PLANET_RADIUS * 2
const probe = new Vector3()

export function setTerrain(groundMeshes: Mesh[], blockerMeshes: Mesh[], waterMeshes: Mesh[] = []) {
  ground.splice(0, ground.length, ...groundMeshes)
  paths.splice(
    0,
    paths.length,
    ...groundMeshes.filter((m) => {
      for (let o: Object3D | null = m; o; o = o.parent) {
        if (o.name.toLowerCase().startsWith('trilha')) return true
      }
      return false
    }),
  )
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

/** true se há trilha no ponto ou a até `margin` metros dele (amostra 8 direções). */
export function nearPath(dir: Vector3, margin: number): boolean {
  if (paths.length === 0) return false
  if (castDown(dir, paths)) return true
  const north = tangentTowards(dir, probe.set(0, 1, 0))
  for (let i = 0; i < 8; i++) {
    const heading = north.clone().applyAxisAngle(dir, (i / 8) * Math.PI * 2)
    if (castDown(offsetDir(dir, heading, margin), paths)) return true
  }
  return false
}

/** Verdadeiro se a direção cai dentro de um objeto `bloqueio_*`. */
export function isBlocked(dir: Vector3): boolean {
  return blockers.length > 0 && castDown(dir, blockers) !== undefined
}

/** true quando o terreno vem do `planeta.glb` (e não do planeta procedural). */
export function hasTerrainModel(): boolean {
  return modelLoaded
}

/** true se há água no ponto ou a até `margin` metros dele (amostra 8 direções). */
export function nearWater(dir: Vector3, margin: number): boolean {
  if (waterRadius(dir) !== null) return true
  const north = tangentTowards(dir, probe.set(0, 1, 0))
  for (let i = 0; i < 8; i++) {
    const heading = north.clone().applyAxisAngle(dir, (i / 8) * Math.PI * 2)
    if (waterRadius(offsetDir(dir, heading, margin)) !== null) return true
  }
  return false
}
