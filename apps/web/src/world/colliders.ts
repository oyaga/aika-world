import { useEffect } from 'react'
import { type Quaternion, Vector3 } from 'three'

/**
 * Colisão com os objetos que o código posiciona (templo, torii, lanternas,
 * caixa de correio, prédios, casas e NPCs). Cada objeto registra caixas ou
 * círculos no próprio referencial (x = direita, z = frente, em metros) e o
 * visitante não entra neles (ver isBlocked em terrain.ts e o Player).
 * A decoração do planeta (árvores, pedras, postes…) usa os meshes `bloqueio_*`.
 */
export interface Collider {
  /** Centro, no mundo (sobre a superfície). */
  c: Vector3
  /** Eixos do objeto na superfície: direita e frente. */
  x: Vector3
  z: Vector3
  /** Meia-largura e meia-profundidade (caixa) ou raio em `hx` (círculo). */
  hx: number
  hz: number
  round: boolean
}

/** Raio do corpo do visitante: a folga em volta de cada colisor. */
export const BODY_RADIUS = 0.3

const sets = new Map<string, Collider[]>()

export function setColliders(key: string, list: Collider[]) {
  if (list.length > 0) sets.set(key, list)
  else sets.delete(key)
}

function make(
  position: Vector3,
  quaternion: Quaternion,
  cx: number,
  cz: number,
  hx: number,
  hz: number,
  round: boolean,
): Collider {
  const x = new Vector3(1, 0, 0).applyQuaternion(quaternion)
  const z = new Vector3(0, 0, 1).applyQuaternion(quaternion)
  const c = position.clone().addScaledVector(x, cx).addScaledVector(z, cz)
  return { c, x, z, hx, hz, round }
}

/** Caixa com centro em (cx, cz) e meias-medidas hx × hz, no referencial do objeto. */
export function box(
  position: Vector3,
  quaternion: Quaternion,
  cx: number,
  cz: number,
  hx: number,
  hz: number,
): Collider {
  return make(position, quaternion, cx, cz, hx, hz, false)
}

/** Círculo com centro em (cx, cz) e raio r, no referencial do objeto. */
export function circle(
  position: Vector3,
  quaternion: Quaternion,
  cx: number,
  cz: number,
  r: number,
): Collider {
  return make(position, quaternion, cx, cz, r, r, true)
}

const d = new Vector3()

/** true se a direção `dir` (unitária) cai dentro de algum colisor (com a folga do corpo). */
export function hitsCollider(dir: Vector3, pad = BODY_RADIUS): boolean {
  for (const list of sets.values()) {
    for (const k of list) {
      d.copy(dir).multiplyScalar(k.c.length()).sub(k.c)
      const reach = Math.max(k.hx, k.hz) + pad
      if (d.lengthSq() > reach * reach * 2) continue
      const lx = d.dot(k.x)
      const lz = d.dot(k.z)
      if (k.round) {
        if (lx * lx + lz * lz < reach * reach) return true
      } else if (Math.abs(lx) < k.hx + pad && Math.abs(lz) < k.hz + pad) {
        return true
      }
    }
  }
  return false
}

/** Registra os colisores de um objeto enquanto ele existir (`list` deve vir de useMemo). */
export function useColliders(key: string, list: Collider[]) {
  useEffect(() => {
    setColliders(key, list)
    return () => setColliders(key, [])
  }, [key, list])
}
