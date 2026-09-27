import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group, Quaternion, Vector3 } from 'three'
import type { ModelName } from '../lib/models'
import { faceTowards } from '../lib/sphere'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { Label } from './Label'
import { Toon } from './materials'
import { Model } from './Model'
import { surfaceRadius } from './terrain'

export interface NpcLook {
  outfit: string
  hair: string
  skin?: string
  accent?: string
}

/** Boneco de primitivas (mesma escala da Aika), de frente para +Z. */
function NpcPlaceholder({ outfit, hair, skin = '#f1c9a5', accent = '#ffffff' }: NpcLook) {
  return (
    <group>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.32, 0]}>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <Toon color="#2a2433" />
        </mesh>
      ))}
      <mesh position={[0, 0.98, 0]}>
        <capsuleGeometry args={[0.3, 0.45, 6, 12]} />
        <Toon color={outfit} />
      </mesh>
      <mesh position={[0, 1.3, 0.2]}>
        <boxGeometry args={[0.36, 0.12, 0.08]} />
        <Toon color={accent} />
      </mesh>
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 0.95, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <Toon color={skin} />
        </mesh>
      ))}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.34, 20, 16]} />
        <Toon color={skin} />
      </mesh>
      <mesh position={[0, 1.82, -0.04]} scale={[1.06, 0.9, 1.06]}>
        <sphereGeometry args={[0.35, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <Toon color={hair} />
      </mesh>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 1.72, 0.31]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshBasicMaterial color="#1b1733" />
        </mesh>
      ))}
    </group>
  )
}

interface NpcProps {
  /** Direção (unitária) do ponto na superfície onde o NPC fica. */
  dir: Vector3
  /** Para onde ele olha por padrão (ex.: centro da praça ou o spawn). */
  lookAt: Vector3
  name: string
  look: NpcLook
  /** Modelo .glb que substitui o boneco (materiais `@tint` recebem `look.outfit`). */
  model: ModelName
  /** Ponto de interesse deste NPC: com a conversa dele aberta, toca `Talk`. */
  poiId?: string
}

const FACE_PLAYER_DISTANCE = 7
const local = new Vector3()
const inv = new Quaternion()

/** NPC parado que se vira para a Aika quando ela chega perto. */
export function Npc({ dir, lookAt, name, look, model, poiId }: NpcProps) {
  const talking = useStore((s) => poiId !== undefined && s.openPoi === poiId)
  const body = useRef<Group>(null)
  const yaw = useRef(0)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(dir)
    return {
      position: dir.clone().multiplyScalar(ground),
      quaternion: faceTowards(dir, lookAt),
      labelPos: dir.clone().multiplyScalar(ground + 2.5),
    }
  }, [dir, lookAt])

  useFrame(({ clock }, delta) => {
    const g = body.current
    if (!g) return
    local.copy(playerState.position).sub(position)
    const near = local.length() < FACE_PLAYER_DISTANCE
    local.applyQuaternion(inv.copy(quaternion).invert())
    const target = near ? Math.atan2(local.x, local.z) : 0
    // Menor caminho angular até o alvo.
    const diff = Math.atan2(Math.sin(target - yaw.current), Math.cos(target - yaw.current))
    yaw.current += diff * Math.min(1, delta * 6)
    g.rotation.y = yaw.current
    g.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2 + position.x) * 0.03
  })

  return (
    <>
      <group position={position} quaternion={quaternion}>
        <group ref={body}>
          <Model
            name={model}
            tint={look.outfit}
            animation={talking ? 'Talk' : 'Idle'}
            fallback={<NpcPlaceholder {...look} />}
          />
        </group>
      </group>
      <Label position={labelPos} text={`💬 ${name}`} />
    </>
  )
}
