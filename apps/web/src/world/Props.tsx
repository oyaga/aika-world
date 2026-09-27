import { useLayoutEffect, useMemo, useRef } from 'react'
import { Euler, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import {
  angleBetween,
  mulberry32,
  PLANET_RADIUS,
  randomUnitVector,
  surfaceQuaternion,
} from '../lib/sphere'
import { Toon } from './materials'

interface PropsProps {
  /** Direções a evitar (spawn, marcos, casas). */
  avoid: Vector3[]
}

interface Placement {
  dir: Vector3
  scale: number
  yaw: number
}

function scatter(seed: number, count: number, avoid: Vector3[], minAngle: number): Placement[] {
  const rand = mulberry32(seed)
  const out: Placement[] = []
  let guard = 0
  while (out.length < count && guard++ < count * 40) {
    const dir = randomUnitVector(rand)
    if (avoid.some((a) => angleBetween(a, dir) < minAngle)) continue
    if (out.some((p) => angleBetween(p.dir, dir) < 0.08)) continue
    out.push({ dir, scale: 0.7 + rand() * 0.7, yaw: rand() * Math.PI * 2 })
  }
  return out
}

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const tilt = new Quaternion().setFromEuler(new Euler(0.3, 0.2, 0))

function applyInstances(
  mesh: InstancedMesh | null,
  items: Placement[],
  offset: number,
  size: Vector3,
  extra?: Quaternion,
) {
  if (!mesh) return
  items.forEach((it, i) => {
    q.copy(surfaceQuaternion(it.dir, it.yaw))
    if (extra) q.multiply(extra)
    pos.copy(it.dir).multiplyScalar(PLANET_RADIUS + offset * it.scale)
    scl.copy(size).multiplyScalar(it.scale)
    m.compose(pos, q, scl)
    mesh.setMatrixAt(i, m)
  })
  mesh.instanceMatrix.needsUpdate = true
  mesh.computeBoundingSphere()
}

/** Árvores e pedras de primitivas, com posicionamento determinístico e instanciado. */
export function Props({ avoid }: PropsProps) {
  const trees = useMemo(() => scatter(42, 70, avoid, 0.2), [avoid])
  const rocks = useMemo(
    () => scatter(1337, 30, [...avoid, ...trees.map((t) => t.dir)], 0.12),
    [avoid, trees],
  )

  const trunks = useRef<InstancedMesh>(null)
  const leaves = useRef<InstancedMesh>(null)
  const leavesTop = useRef<InstancedMesh>(null)
  const stones = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    applyInstances(trunks.current, trees, 0.5, new Vector3(1, 1, 1))
    applyInstances(leaves.current, trees, 1.5, new Vector3(1, 1, 1))
    applyInstances(leavesTop.current, trees, 2.3, new Vector3(0.7, 0.8, 0.7))
    applyInstances(stones.current, rocks, 0.15, new Vector3(1, 0.7, 1), tilt)
  }, [trees, rocks])

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
        <Toon color="#8a5a3b" />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.75, 1.4, 7]} />
        <Toon color="#3f9e5a" />
      </instancedMesh>
      <instancedMesh ref={leavesTop} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.75, 1.4, 7]} />
        <Toon color="#57b86c" />
      </instancedMesh>
      <instancedMesh ref={stones} args={[undefined, undefined, rocks.length]} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <Toon color="#9aa0a8" />
      </instancedMesh>
    </group>
  )
}
