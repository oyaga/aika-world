import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { type Group, Vector3 } from 'three'
import { remotes } from '../net/multiplayer'
import { UP } from '../lib/sphere'
import { useStore } from '../state/store'
import { type Motion, Visitor } from './Characters'
import { Label } from './Label'

/** Emote sobre a cabeça de um visitante (o próprio ou outro), se houver. */
export function EmoteBubble({ id }: { id: string }) {
  const emote = useStore((s) => s.emotes[id])
  if (!emote) return null
  return (
    <Html position={[0, 3, 0]} center zIndexRange={[15, 5]} pointerEvents="none">
      <div className="emote" key={emote.key} role="img" aria-label={`emote ${emote.emote}`}>
        {emote.emote}
      </div>
    </Html>
  )
}

const up = new Vector3()
const STATES = ['ground', 'air', 'swim'] as const

/** Outro visitante: suaviza (interpola) a orientação recebida da rede. */
function RemoteVisitor({ id }: { id: string }) {
  const group = useRef<Group>(null)
  const motion = useRef<Motion>({ speed: 0, state: 'ground' })
  const player = remotes.get(id)
  const look = useStore((s) => s.remoteLooks[id])

  useFrame((_, rawDelta) => {
    const r = remotes.get(id)
    const g = group.current
    if (!r || !g) return
    const dt = Math.min(rawDelta, 0.1)
    r.current.slerp(r.target, 1 - Math.exp(-dt * 10))
    r.r += (r.targetR - r.r) * (1 - Math.exp(-dt * 12))
    up.copy(UP).applyQuaternion(r.current)
    g.position.copy(up).multiplyScalar(r.r)
    g.quaternion.copy(r.current)
    motion.current.speed += (r.s - motion.current.speed) * Math.min(1, dt * 8)
    motion.current.state = STATES[r.a]
    motion.current.gesture = r.gesture ?? null
  })

  if (!player) return null
  return (
    <>
      <group ref={group}>
        <Visitor motion={motion.current} color={player.info.color} look={look} />
        <EmoteBubble id={id} />
        <Label position={[0, 2.3, 0]} text={player.info.name} muted />
      </group>
    </>
  )
}

/** Todos os outros visitantes da sala. */
export function RemotePlayers() {
  const ids = useStore((s) => s.remoteIds)
  return (
    <>
      {ids.map((id) => (
        <RemoteVisitor key={id} id={id} />
      ))}
    </>
  )
}
