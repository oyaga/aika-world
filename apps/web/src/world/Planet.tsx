import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  Color,
  IcosahedronGeometry,
  type Mesh,
  type MeshToonMaterial,
  type Object3D,
  Quaternion,
  Vector3,
} from 'three'
import { modelUrl } from '../lib/models'
import { mulberry32, PLANET_RADIUS } from '../lib/sphere'
import { type Markers, useStore } from '../state/store'
import type { LandmarkKind } from './layout'
import { type Lake, LAKES, proceduralGround, WATER_DROP } from './lakes'
import { Toon, toonGradient } from './materials'
import { ModelBoundary, useModelClone } from './Model'
import { setTerrain } from './terrain'

const LANDMARK_KINDS: LandmarkKind[] = ['templo', 'correio']
const DEFAULT_VILA_RADIUS = 12 // metros

/**
 * Planeta: `planeta.glb` quando existir, senão a esfera procedural.
 * Convenções de nomes no Blender (ver docs/arte.md):
 * - `terreno*`, `trilha*`, `chao*`, `laje*`, `ponte*`, `piso*` → chão (onde se pisa);
 *   todo o resto é decoração, atravessável;
 * - `bloqueio_*`  → mesh invisível onde não se anda;
 * - `agua_*`      → superfície da água (lagos): dá para entrar, pular e nadar;
 * - `poi_templo`, `poi_correio` → Empty com a posição do marco (sem `poi_correio`,
 *   a caixa de correio fica ao lado do templo)
 *   (a frente do Empty, −Y no Blender, é para onde o prédio olha);
 * - `area_vila`   → Empty no centro da vila das casas (propriedade `raio` em metros);
 * - `area_servicos` → Empty no centro da Praça dos Serviços;
 * - `historia_1`, `historia_2`… → Empties com a posição dos NPCs da história.
 */
export function Planet() {
  const url = modelUrl('planeta')
  if (!url) return <ProceduralPlanet />
  return (
    <ModelBoundary fallback={<ProceduralPlanet />}>
      <Suspense fallback={<ProceduralPlanet />}>
        <PlanetModel url={url} />
      </Suspense>
    </ModelBoundary>
  )
}

/** Prefixos de objetos em que dá para pisar; o resto (árvores, rochas, cachoeira…) é só decoração. */
const WALKABLE = /^(terreno|trilha|chao|laje|ponte|piso)/

function meshKind(mesh: Object3D, root: Object3D): 'bloqueio' | 'agua' | 'chao' | 'decoracao' {
  for (let o: Object3D | null = mesh; o && o !== root; o = o.parent) {
    const n = o.name.toLowerCase()
    if (n.startsWith('bloqueio_')) return 'bloqueio'
    if (n.startsWith('agua_')) return 'agua'
    if (WALKABLE.test(n)) return 'chao'
  }
  return 'decoracao'
}

const tmpPos = new Vector3()
const tmpQuat = new Quaternion()

function readMarkers(root: Object3D): {
  markers: Markers
  ground: Mesh[]
  blockers: Mesh[]
  water: Mesh[]
} {
  const markers: Markers = { landmarks: {}, vila: null, servicos: null, story: [] }
  const ground: Mesh[] = []
  const blockers: Mesh[] = []
  const water: Mesh[] = []
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const name = obj.name.toLowerCase()
    const mesh = obj as Mesh
    if (mesh.isMesh) {
      // Malhas com vários materiais viram filhos do objeto do Blender: vale o nome dele.
      const kind = meshKind(mesh, root)
      if (kind === 'bloqueio') {
        blockers.push(mesh)
        mesh.visible = false
      } else if (kind === 'agua') water.push(mesh)
      else if (kind === 'chao') ground.push(mesh)
      return
    }
    obj.getWorldPosition(tmpPos)
    if (tmpPos.lengthSq() < 1e-6) return
    const dir = tmpPos.clone().normalize()
    const kind = LANDMARK_KINDS.find((k) => name === `poi_${k}`)
    if (kind) {
      obj.getWorldQuaternion(tmpQuat)
      const rotated = Math.abs(tmpQuat.w) < 0.9999
      markers.landmarks[kind] = {
        dir,
        forward: rotated ? new Vector3(0, 0, 1).applyQuaternion(tmpQuat) : null,
      }
    } else if (/^historia_\d+$/.test(name)) {
      const n = Number(name.slice('historia_'.length))
      if (n >= 1) markers.story[n - 1] = dir
    } else if (name === 'area_servicos') {
      markers.servicos = dir
    } else if (name === 'area_vila') {
      const raio = Number((obj.userData as { raio?: unknown }).raio)
      markers.vila = { dir, radius: raio > 0 ? raio : DEFAULT_VILA_RADIUS }
    }
  })
  return { markers, ground, blockers, water }
}

function PlanetModel({ url }: { url: string }) {
  const root = useModelClone(url)
  const setMarkers = useStore((s) => s.setMarkers)

  useLayoutEffect(() => {
    const { markers, ground, blockers, water } = readMarkers(root)
    setTerrain(ground, blockers, water)
    setMarkers(markers)
    return () => setTerrain([], [])
  }, [root, setMarkers])

  return <primitive object={root} />
}

/** Planeta low-poly com leve variação de cor por face (determinística) e os lagos. */
function ProceduralPlanet() {
  const geometry = useMemo(() => {
    const geo = new IcosahedronGeometry(PLANET_RADIUS, 20)
    // Afunda as bacias dos lagos.
    const pos = geo.attributes.position!
    const v = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize()
      v.multiplyScalar(proceduralGround(v))
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    // Geometria não indexada: recalcular normais gera normais por face (flat).
    geo.computeVertexNormals()
    const rand = mulberry32(7)
    const base = new Color('#8fd18a')
    const alt = new Color('#6fbf7a')
    const sand = new Color('#e9d8a6')
    const lakeBed = new Color('#c9b98a')
    const colors = new Float32Array(pos.count * 3)
    const c = new Color()
    const centroid = new Vector3()
    for (let i = 0; i < pos.count; i += 3) {
      const r = rand()
      centroid
        .fromBufferAttribute(pos, i)
        .add(v.fromBufferAttribute(pos, i + 1))
        .add(v.fromBufferAttribute(pos, i + 2))
      const height = centroid.length() / 3
      c.copy(base).lerp(alt, r)
      if (r > 0.97 || height < PLANET_RADIUS - 0.08) c.copy(sand)
      if (height < PLANET_RADIUS - WATER_DROP - 0.2) c.copy(lakeBed)
      for (let k = 0; k < 3; k++) c.toArray(colors, (i + k) * 3)
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <>
      <mesh geometry={geometry} receiveShadow name="planet">
        <Toon color="#ffffff" vertexColors />
      </mesh>
      {LAKES.map((lake, i) => (
        <LakeWater key={i} lake={lake} />
      ))}
    </>
  )
}

/** Superfície da água: uma calota esférica sobre a bacia, com um brilho que ondula. */
function LakeWater({ lake }: { lake: Lake }) {
  const material = useRef<MeshToonMaterial>(null)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const quaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), lake.center),
    [lake],
  )
  useFrame(({ clock }) => {
    if (!material.current || reducedMotion) return
    material.current.emissiveIntensity = 0.25 + Math.sin(clock.elapsedTime * 1.5) * 0.08
  })
  return (
    <mesh quaternion={quaternion}>
      <sphereGeometry
        args={[PLANET_RADIUS - WATER_DROP, 48, 6, 0, Math.PI * 2, 0, lake.radius / PLANET_RADIUS]}
      />
      <meshToonMaterial
        ref={material}
        color="#3fa9d8"
        emissive="#5ce1e6"
        emissiveIntensity={0.25}
        gradientMap={toonGradient}
        transparent
        opacity={0.78}
        depthWrite={false}
      />
    </mesh>
  )
}
