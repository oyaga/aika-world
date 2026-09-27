import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group, Quaternion, Vector3 } from 'three'
import { angleBetween, PLANET_RADIUS, positionFromOrientation, turn, UP, walk } from '../lib/sphere'
import { readAxes } from '../state/input'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { Aika } from './Aika'
import { INTERACT_DISTANCE, type Poi, poiAnchor } from './layout'
import { isBlocked, surfaceRadius } from './terrain'

const WALK_SPEED = 6 // unidades/s
const TURN_SPEED = 2.4 // rad/s

const before = new Quaternion()
const upDir = new Vector3()

/**
 * Controle da Aika sobre a esfera. A orientação (quaternion) é a única
 * fonte de verdade: "up" local = normal da superfície, frente = +Z local.
 * Gravidade implícita: a posição é sempre up * altura do chão, então ela
 * nunca sai do terreno. Objetos `bloqueio_*` desfazem o passo.
 */
export function Player({ pois }: { pois: Poi[] }) {
  const group = useRef<Group>(null)
  const anchors = useMemo(() => pois.map(poiAnchor), [pois])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { openPoi, simpleView, setNearPoi } = useStore.getState()
    const locked = openPoi !== null || simpleView
    const { forward, turn: turnAxis } = locked ? { forward: 0, turn: 0 } : readAxes()

    const q = playerState.orientation
    if (turnAxis !== 0) turn(q, turnAxis * TURN_SPEED * delta)
    if (forward !== 0) {
      before.copy(q)
      walk(q, forward * WALK_SPEED * delta, PLANET_RADIUS)
      if (isBlocked(upDir.copy(UP).applyQuaternion(q))) q.copy(before)
    }
    upDir.copy(UP).applyQuaternion(q)
    const ground = surfaceRadius(upDir)
    // Primeiro frame encaixa direto; depois suaviza subidas e descidas.
    playerState.radius =
      playerState.radius === 0
        ? ground
        : playerState.radius + (ground - playerState.radius) * Math.min(1, delta * 15)
    positionFromOrientation(q, playerState.radius, playerState.position)

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
    for (let i = 0; i < pois.length; i++) {
      const poi = pois[i] as Poi
      // Distância pela superfície, independente da altura do terreno.
      const d = angleBetween(anchors[i] ?? poi.dir, upDir) * PLANET_RADIUS
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
