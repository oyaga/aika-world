import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group, Quaternion, Vector3 } from 'three'
import { angleBetween, PLANET_RADIUS, positionFromOrientation, turn, UP, walk } from '../lib/sphere'
import { consumeJump, readAxes } from '../state/input'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { sendMove } from '../net/multiplayer'
import { Visitor } from './Characters'
import { EmoteBubble } from './RemotePlayers'
import { INTERACT_DISTANCE, type Poi, poiAnchor } from './layout'
import { RUN_SPEED, stepVertical, SWIM_SPEED, WALK_SPEED } from './locomotion'
import { splashAt } from './Splashes'
import { isBlocked } from './terrain'

const TURN_SPEED = 2.4 // rad/s

const before = new Quaternion()
const upDir = new Vector3()

/**
 * Controle do visitante sobre a esfera (a Aika o acompanha, ver Companion). A orientação (quaternion) é a única
 * fonte de verdade: "up" local = normal da superfície, frente = +Z local.
 * A altura (chão, pulo, água) vem de stepVertical; objetos `bloqueio_*`
 * desfazem o passo. Shift corre, Espaço pula, na água funda nada.
 */
export function Player({ pois }: { pois: Poi[] }) {
  const group = useRef<Group>(null)
  const visitorColor = useStore((s) => s.visitorColor)
  const look = useStore((s) => s.look)
  const setWardrobe = useStore((s) => s.setWardrobe)
  const myId = useStore((s) => s.net.me?.id ?? 'me')
  const anchors = useMemo(() => pois.map(poiAnchor), [pois])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const { openPoi, simpleView, wardrobeOpen, setNearPoi } = useStore.getState()
    const locked = openPoi !== null || simpleView || wardrobeOpen
    const axes = locked ? { forward: 0, turn: 0, run: false } : readAxes()
    const { forward, turn: turnAxis } = axes
    const wantJump = consumeJump() && !locked

    const swimming = playerState.state === 'swim'
    const maxSpeed = swimming ? SWIM_SPEED : axes.run ? RUN_SPEED : WALK_SPEED
    const q = playerState.orientation
    if (turnAxis !== 0) turn(q, turnAxis * TURN_SPEED * delta)
    if (forward !== 0) {
      before.copy(q)
      walk(q, forward * maxSpeed * delta, PLANET_RADIUS)
      if (isBlocked(upDir.copy(UP).applyQuaternion(q))) q.copy(before)
    }
    upDir.copy(UP).applyQuaternion(q)
    const step = stepVertical(playerState, upDir, delta, wantJump)
    if (step.jumped) playerState.jumpedAt = performance.now()
    positionFromOrientation(q, playerState.radius, playerState.position)
    if (step.splash > 0) splashAt(playerState.position, step.splash)

    // Suaviza a velocidade usada pela animação (1 = andando).
    const target = Math.abs(forward) * (maxSpeed / WALK_SPEED) + Math.abs(turnAxis) * 0.3
    playerState.speed += (target - playerState.speed) * Math.min(1, delta * 10)

    if (group.current) {
      group.current.position.copy(playerState.position)
      group.current.quaternion.copy(q)
    }
    sendMove(
      q,
      playerState.speed < 0.05 ? 0 : playerState.speed,
      playerState.radius,
      playerState.state,
    )

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
      <Visitor motion={playerState} color={visitorColor} look={look} onWardrobe={setWardrobe} />
      <EmoteBubble id={myId} />
    </group>
  )
}
