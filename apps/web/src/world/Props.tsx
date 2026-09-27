import { type ReactNode, Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import {
  type BufferGeometry,
  Euler,
  type InstancedMesh,
  type Material,
  Matrix4,
  type Mesh,
  Quaternion,
  Vector3,
} from 'three'
import { type ModelName, modelUrl } from '../lib/models'
import {
  angleBetween,
  mulberry32,
  PLANET_RADIUS,
  randomUnitVector,
  surfaceQuaternion,
} from '../lib/sphere'
import { lakeNear, SHORE } from './lakes'
import { Toon, toToon } from './materials'
import { ModelBoundary } from './Model'

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
    if (lakeNear(dir, SHORE + 0.6)) continue
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

function Trees({ items }: { items: Placement[] }) {
  const trunks = useRef<InstancedMesh>(null)
  const leaves = useRef<InstancedMesh>(null)
  const leavesTop = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    applyInstances(trunks.current, items, 0.5, new Vector3(1, 1, 1))
    applyInstances(leaves.current, items, 1.5, new Vector3(1, 1, 1))
    applyInstances(leavesTop.current, items, 2.3, new Vector3(0.7, 0.8, 0.7))
  }, [items])

  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
        <Toon color="#8a5a3b" />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined, undefined, items.length]} castShadow>
        <coneGeometry args={[0.75, 1.4, 7]} />
        <Toon color="#3f9e5a" />
      </instancedMesh>
      <instancedMesh ref={leavesTop} args={[undefined, undefined, items.length]} castShadow>
        <coneGeometry args={[0.75, 1.4, 7]} />
        <Toon color="#57b86c" />
      </instancedMesh>
    </>
  )
}

function Rocks({ items }: { items: Placement[] }) {
  const stones = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    applyInstances(stones.current, items, 0.15, new Vector3(1, 0.7, 1), tilt)
  }, [items])
  return (
    <instancedMesh ref={stones} args={[undefined, undefined, items.length]} castShadow>
      <dodecahedronGeometry args={[0.35, 0]} />
      <Toon color="#9aa0a8" />
    </instancedMesh>
  )
}

interface Part {
  geometry: BufferGeometry
  material: Material
}

/** Um InstancedMesh por mesh do .glb, com a origem do modelo no chão. */
function InstancedGlb({ url, items }: { url: string; items: Placement[] }) {
  const { scene } = useGLTF(url)
  const parts = useMemo(() => {
    const out: Part[] = []
    scene.updateMatrixWorld(true)
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      if (!source) return
      out.push({
        geometry: mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),
        material: toToon(source),
      })
    })
    return out
  }, [scene])

  return (
    <>
      {parts.map((part, i) => (
        <InstancedPart key={i} part={part} items={items} />
      ))}
    </>
  )
}

function InstancedPart({ part, items }: { part: Part; items: Placement[] }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    applyInstances(ref.current, items, 0, new Vector3(1, 1, 1))
  }, [items])
  return <instancedMesh ref={ref} args={[part.geometry, part.material, items.length]} />
}

function Scattered({
  name,
  items,
  fallback,
}: {
  name: ModelName
  items: Placement[]
  fallback: ReactNode
}) {
  const url = modelUrl(name)
  if (!url) return <>{fallback}</>
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <InstancedGlb url={url} items={items} />
      </Suspense>
    </ModelBoundary>
  )
}

/**
 * Árvores e pedras espalhadas de forma determinística e instanciada.
 * Usa `arvore.glb`/`pedra.glb` quando existirem. Com `planeta.glb`, a
 * decoração vem do próprio Blender e isto não é renderizado.
 */
export function Props({ avoid }: PropsProps) {
  const trees = useMemo(() => scatter(42, 70, avoid, 0.2), [avoid])
  const rocks = useMemo(
    () => scatter(1337, 30, [...avoid, ...trees.map((t) => t.dir)], 0.12),
    [avoid, trees],
  )
  return (
    <group>
      <Scattered name="arvore" items={trees} fallback={<Trees items={trees} />} />
      <Scattered name="pedra" items={rocks} fallback={<Rocks items={rocks} />} />
    </group>
  )
}
