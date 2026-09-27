import { Matrix4, Quaternion, Vector3 } from 'three'

export const PLANET_RADIUS = 20

export const UP = new Vector3(0, 1, 0)
export const FORWARD = new Vector3(0, 0, 1)
export const RIGHT_AXIS = new Vector3(1, 0, 0)

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ponto uniforme aleatório na esfera unitária. */
export function randomUnitVector(rand: () => number, out = new Vector3()): Vector3 {
  const u = rand() * 2 - 1
  const theta = rand() * Math.PI * 2
  const s = Math.sqrt(1 - u * u)
  return out.set(s * Math.cos(theta), u, s * Math.sin(theta))
}

/** Distribuição de Fibonacci: `n` pontos quase uniformes na esfera unitária. */
export function fibonacciSphere(n: number): Vector3[] {
  const points: Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    points.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
  }
  return points
}

/**
 * Direção unitária a partir de coordenadas esféricas em graus.
 * `polar` = 0 é o polo norte (onde a Aika nasce); `azimuth` gira em torno de Y.
 * azimuth 0 aponta para +Z (frente inicial da Aika).
 */
export function dirFromAngles(polarDeg: number, azimuthDeg: number): Vector3 {
  const p = (polarDeg * Math.PI) / 180
  const a = (azimuthDeg * Math.PI) / 180
  return new Vector3(Math.sin(p) * Math.sin(a), Math.cos(p), Math.sin(p) * Math.cos(a))
}

/**
 * Quaternion que alinha o eixo +Y local à normal da superfície `normal`,
 * com uma rotação opcional (yaw) em torno dessa normal.
 */
export function surfaceQuaternion(normal: Vector3, yaw = 0): Quaternion {
  const q = new Quaternion().setFromUnitVectors(UP, normal.clone().normalize())
  if (yaw !== 0) q.multiply(new Quaternion().setFromAxisAngle(UP, yaw))
  return q
}

/** Ângulo (radianos) entre duas direções unitárias. */
export function angleBetween(a: Vector3, b: Vector3): number {
  return Math.acos(Math.min(1, Math.max(-1, a.dot(b))))
}

const tmpQ = new Quaternion()

/** Gira a orientação `q` em torno do eixo "up" local (virar à esquerda/direita). */
export function turn(q: Quaternion, angle: number): Quaternion {
  return q.multiply(tmpQ.setFromAxisAngle(UP, angle))
}

/**
 * Anda `distance` sobre a superfície de uma esfera de raio `radius`,
 * na direção da frente local (+Z). Implementado como rotação em torno do
 * eixo X local: a posição (up local * raio) desliza em direção à frente.
 */
export function walk(q: Quaternion, distance: number, radius = PLANET_RADIUS): Quaternion {
  return q.multiply(tmpQ.setFromAxisAngle(RIGHT_AXIS, distance / radius)).normalize()
}

/** Posição na superfície correspondente à orientação `q`. */
export function positionFromOrientation(
  q: Quaternion,
  radius = PLANET_RADIUS,
  out = new Vector3(),
): Vector3 {
  return out.copy(UP).applyQuaternion(q).multiplyScalar(radius)
}

const basisM = new Matrix4()

/**
 * Orientação sobre a superfície com +Y = normal e +Z (frente) apontando,
 * no plano tangente, para `target` (ex.: o polo norte/spawn).
 */
export function faceTowards(normal: Vector3, target: Vector3): Quaternion {
  const y = normal.clone().normalize()
  const z = target.clone().sub(y.clone().multiplyScalar(target.dot(y)))
  if (z.lengthSq() < 1e-8) return surfaceQuaternion(y)
  z.normalize()
  const x = new Vector3().crossVectors(y, z)
  basisM.makeBasis(x, y, z)
  return new Quaternion().setFromRotationMatrix(basisM)
}

/** Tangente unitária em `at` apontando para `target` (ou um eixo qualquer, se degenerado). */
export function tangentTowards(at: Vector3, target: Vector3): Vector3 {
  const t = target.clone().sub(at.clone().multiplyScalar(target.dot(at)))
  if (t.lengthSq() > 1e-8) return t.normalize()
  const helper = Math.abs(at.x) < 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1)
  return helper.sub(at.clone().multiplyScalar(helper.dot(at))).normalize()
}

/** Direção a `distance` metros de `from`, andando pela superfície no rumo `heading`. */
export function offsetDir(
  from: Vector3,
  heading: Vector3,
  distance: number,
  radius = PLANET_RADIUS,
): Vector3 {
  const axis = new Vector3().crossVectors(from, heading).normalize()
  return from
    .clone()
    .applyAxisAngle(axis, distance / radius)
    .normalize()
}
