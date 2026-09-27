import { useLayoutEffect, useMemo, useRef } from 'react'
import { type InstancedMesh, Matrix4, Vector3 } from 'three'
import { faceTowards, PLANET_RADIUS, surfaceQuaternion, UP } from '../lib/sphere'
import { storyNarrator } from '../dialogues'
import { Label } from './Label'
import { type StoryPoi, trailDirs } from './layout'
import { Toon } from './materials'
import { Npc } from './Npc'
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
  const narrator = storyNarrator(poi.milestone)
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(poi.signDir)
    return {
      position: poi.signDir.clone().multiplyScalar(ground),
      // A placa olha para o polo norte, de onde a Aika costuma vir.
      quaternion: faceTowards(poi.signDir, UP),
      labelPos: poi.signDir.clone().multiplyScalar(ground + 3.2),
    }
  }, [poi])
  return (
    <>
      <group position={position} quaternion={quaternion}>
        <Signpost />
      </group>
      <Label position={labelPos} text={poi.label} />
      <Npc
        dir={poi.dir}
        lookAt={UP}
        name={narrator.name}
        poiId={poi.id}
        model={poi.milestone.npc ? 'npc' : 'felipe'}
        look={{
          outfit: poi.milestone.npc?.outfit ?? BRAND.dark,
          hair: '#15110f',
          accent: BRAND.orange,
        }}
      />
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
 * Trilha da história: em cada marco, um NPC (por padrão, o Felipe daquela
 * época) conta o capítulo em conversa, com a placa do ano atrás dele. Com
 * `planeta.glb`, o caminho é modelado no Blender e só NPCs e placas aparecem.
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
