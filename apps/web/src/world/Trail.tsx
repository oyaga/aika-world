import { useLayoutEffect, useMemo, useRef } from 'react'
import { type InstancedMesh, Matrix4, Vector3 } from 'three'
import { faceTowards, PLANET_RADIUS, surfaceQuaternion, UP } from '../lib/sphere'
import { Label } from './Label'
import { type StoryPoi, trailDirs } from './layout'
import { Toon } from './materials'
import { BRAND } from './palette'
import { surfaceRadius } from './terrain'

function Signpost() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.4, 6]} />
        <Toon color="#8a5a3b" />
      </mesh>
      <mesh position={[0, 1.35, 0.02]}>
        <boxGeometry args={[1.1, 0.6, 0.08]} />
        <Toon color={BRAND.orange} />
      </mesh>
      <mesh position={[0, 1.35, 0.07]}>
        <boxGeometry args={[0.9, 0.08, 0.02]} />
        <Toon color="#fff3e6" />
      </mesh>
    </group>
  )
}

function Milestone({ poi }: { poi: StoryPoi }) {
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(poi.dir)
    return {
      position: poi.dir.clone().multiplyScalar(ground),
      // A placa olha para o polo norte, de onde a Aika costuma vir.
      quaternion: faceTowards(poi.dir, UP),
      labelPos: poi.dir.clone().multiplyScalar(ground + 2.4),
    }
  }, [poi])
  return (
    <>
      <group position={position} quaternion={quaternion}>
        <Signpost />
      </group>
      <Label position={labelPos} text={poi.label} />
    </>
  )
}

const m = new Matrix4()
const scale = new Vector3(1, 0.25, 0.8)

/** Pedras chatas marcando o caminho (só no planeta procedural). */
function Stones() {
  const dirs = useMemo(() => trailDirs(), [])
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    dirs.forEach((dir, i) => {
      m.compose(
        dir.clone().multiplyScalar(PLANET_RADIUS + 0.02),
        surfaceQuaternion(dir, i * 0.7),
        scale,
      )
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [dirs])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dirs.length]}>
      <cylinderGeometry args={[0.45, 0.5, 0.3, 7]} />
      <Toon color="#e9d8a6" />
    </instancedMesh>
  )
}

/**
 * Trilha da história: placas com os marcos da vida do Felipe. Com
 * `planeta.glb`, o caminho é modelado no Blender e só as placas aparecem.
 */
export function Trail({ story, showPath }: { story: StoryPoi[]; showPath: boolean }) {
  return (
    <>
      {showPath && <Stones />}
      {story.map((poi) => (
        <Milestone key={poi.id} poi={poi} />
      ))}
    </>
  )
}
