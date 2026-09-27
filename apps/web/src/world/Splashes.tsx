import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group, Quaternion, Vector3 } from 'three'
import { useStore } from '../state/store'

/** Respingos na água: um anel que se espalha e algumas gotas que sobem e caem. */
interface Splash {
  id: number
  position: Vector3
  quaternion: Quaternion
  strength: number
  born: number
}

const LIFETIME = 0.9
let nextId = 0
let pending: Splash[] = []
const UP = new Vector3(0, 1, 0)

/** Pede um respingo na posição `at` (no mundo), com força 0..1. */
export function splashAt(at: Vector3, strength: number) {
  pending.push({
    id: nextId++,
    position: at.clone(),
    quaternion: new Quaternion().setFromUnitVectors(UP, at.clone().normalize()),
    strength,
    born: -1,
  })
}

const DROPS = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (i / 6) * Math.PI * 2
  return new Vector3(Math.cos(a), 1.6 + (i % 2) * 0.6, Math.sin(a))
})

function SplashFx({ splash, onDone }: { splash: Splash; onDone: () => void }) {
  const ring = useRef<Group>(null)
  const drops = useRef<Group>(null)
  const done = useRef(false)
  useFrame(({ clock }) => {
    if (done.current) return
    if (splash.born < 0) splash.born = clock.elapsedTime
    const t = (clock.elapsedTime - splash.born) / LIFETIME
    if (t >= 1) {
      done.current = true
      onDone()
      return
    }
    const s = splash.strength
    ring.current?.scale.setScalar(0.3 + t * 2.2 * (0.6 + s))
    drops.current?.children.forEach((d, i) => {
      const v = DROPS[i] as Vector3
      const time = t * LIFETIME
      d.position.set(
        v.x * time * 1.4 * s,
        (v.y * time - 4.5 * time * time) * (0.6 + s),
        v.z * time * 1.4 * s,
      )
      d.visible = d.position.y > -0.1
    })
  })
  return (
    <group position={splash.position} quaternion={splash.quaternion}>
      <group ref={ring}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.7, 0.9, 24]} />
          <meshBasicMaterial color="#e6fbff" transparent opacity={0.8} depthWrite={false} />
        </mesh>
      </group>
      <group ref={drops}>
        {DROPS.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.09, 6, 4]} />
            <meshBasicMaterial color="#bff3ff" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Splashes() {
  const [active, setActive] = useState<Splash[]>([])
  const reducedMotion = useStore((s) => s.reducedMotion)
  useFrame(() => {
    if (pending.length === 0) return
    const fresh = reducedMotion ? [] : pending
    pending = []
    if (fresh.length) setActive((list) => [...list, ...fresh].slice(-12))
  })
  return (
    <>
      {active.map((s) => (
        <SplashFx
          key={s.id}
          splash={s}
          onDone={() => setActive((list) => list.filter((x) => x.id !== s.id))}
        />
      ))}
    </>
  )
}
