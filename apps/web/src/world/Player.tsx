import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PLANET_RADIUS, positionFromOrientation, turn, walk } from '../lib/sphere'
import { readAxes } from '../state/input'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { Aika } from './Aika'
import { INTERACT_DISTANCE, type Poi } from './layout'

const WALK_SPEED = 6 // unidades/s
const TURN_SPEED = 2.4 // rad/s

/**
 * Controle da Aika sobre a esfera. A orientação (quaternion) é a única
 * fonte de verdade: "up" local = normal da superfície, frente = +Z local.
 * Gravidade implícita: a posição é sempre up * raio, então ela nunca sai do chão.
 */
export function Player({ pois }: { pois: Poi[] }) {
  const group = useRef<Group>(null)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { openPoi, simpleView, setNearPoi } = useStore.getState()
    const locked = openPoi !== null || simpleView
    const { forward, turn: turnAxis } = locked ? { forward: 0, turn: 0 } : readAxes()

    const q = playerState.orientation
    if (turnAxis !== 0) turn(q, turnAxis * TURN_SPEED * delta)
    if (forward !== 0) walk(q, forward * WALK_SPEED * delta, PLANET_RADIUS)
    positionFromOrientation(q, PLANET_RADIUS, playerState.position)

    // Suaviza a velocidade usada pela animação.
    const target = Math.min(1, Math.abs(forward) + Math.abs(turnAxis) * 0.3)
    playerState.speed += (target - playerState.speed) * Math.min(1, delta * 10)

    if (group.current) {
      group.current.position.copy(playerState.position)
      group.current.quaternion.copy(q)
    }

    // Proximidade com pontos de interesse.
    let nearest: Poi | null = null
    let best = INTERACT_DISTANCE
    for (const poi of pois) {
      const d = Math.hypot(
        poi.dir.x * PLANET_RADIUS - playerState.position.x,
        poi.dir.y * PLANET_RADIUS - playerState.position.y,
        poi.dir.z * PLANET_RADIUS - playerState.position.z,
      )
      if (d < best) {
        best = d
        nearest = poi
      }
    }
    setNearPoi(nearest ? nearest.id : null)
  })

  return (
    <group ref={group}>
      <Aika motion={playerState} />
    </group>
  )
}
