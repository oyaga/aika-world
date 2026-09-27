import { Suspense, useLayoutEffect, useMemo } from 'react'
import {
  BufferAttribute,
  Color,
  IcosahedronGeometry,
  type Mesh,
  type Object3D,
  Quaternion,
  Vector3,
} from 'three'
import { modelUrl } from '../lib/models'
import { mulberry32, PLANET_RADIUS } from '../lib/sphere'
import { type Markers, useStore } from '../state/store'
import type { LandmarkKind } from './layout'
import { Toon } from './materials'
import { ModelBoundary, useModelClone } from './Model'
import { setTerrain } from './terrain'

const LANDMARK_KINDS: LandmarkKind[] = ['templo', 'torre']
const DEFAULT_VILA_RADIUS = 12 // metros

/**
 * Planeta: `planeta.glb` quando existir, senão a esfera procedural.
 * Convenções de nomes no Blender (ver docs/arte.md):
 * - `bloqueio_*`  → mesh invisível onde não se anda;
 * - `poi_templo`, `poi_torre` → Empty com a posição do marco
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

const tmpPos = new Vector3()
const tmpQuat = new Quaternion()

function readMarkers(root: Object3D): { markers: Markers; ground: Mesh[]; blockers: Mesh[] } {
  const markers: Markers = { landmarks: {}, vila: null, servicos: null, story: [] }
  const ground: Mesh[] = []
  const blockers: Mesh[] = []
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const name = obj.name.toLowerCase()
    const mesh = obj as Mesh
    if (name.startsWith('bloqueio_')) {
      if (mesh.isMesh) blockers.push(mesh)
      obj.visible = false
      return
    }
    if (mesh.isMesh) {
      ground.push(mesh)
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
  return { markers, ground, blockers }
}

function PlanetModel({ url }: { url: string }) {
  const root = useModelClone(url)
  const setMarkers = useStore((s) => s.setMarkers)

  useLayoutEffect(() => {
    const { markers, ground, blockers } = readMarkers(root)
    setTerrain(ground, blockers)
    setMarkers(markers)
    return () => setTerrain([], [])
  }, [root, setMarkers])

  return <primitive object={root} />
}

/** Planeta low-poly com leve variação de cor por face (determinística). */
function ProceduralPlanet() {
  const geometry = useMemo(() => {
    const geo = new IcosahedronGeometry(PLANET_RADIUS, 14)
    // Geometria não indexada: recalcular normais gera normais por face (flat).
    geo.computeVertexNormals()
    const rand = mulberry32(7)
    const base = new Color('#8fd18a')
    const alt = new Color('#6fbf7a')
    const sand = new Color('#e9d8a6')
    const count = geo.attributes.position!.count
    const colors = new Float32Array(count * 3)
    const c = new Color()
    for (let i = 0; i < count; i += 3) {
      const r = rand()
      c.copy(base).lerp(alt, r)
      if (r > 0.97) c.copy(sand)
      for (let v = 0; v < 3; v++) c.toArray(colors, (i + v) * 3)
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow name="planet">
      <Toon color="#ffffff" vertexColors />
    </mesh>
  )
}
