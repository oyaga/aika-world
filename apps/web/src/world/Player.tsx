import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group, Quaternion, Vector3 } from 'three'
import { angleBetween, PLANET_RADIUS, positionFromOrientation, turn, UP, walk } from '../lib/sphere'
import { consumeJump, readAxes } from '../state/input'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { sendMove } from '../net/multiplayer'
import { orbit } from './CameraRig'
import { type Motion, Visitor } from './Characters'
import { EmoteBubble } from './RemotePlayers'
import { INTERACT_DISTANCE, type Poi, poiAnchor } from './layout'
import { fittingLift, RUN_SPEED, stepVertical, SWIM_SPEED, WALK_SPEED } from './locomotion'
import { splashAt } from './Splashes'
import { isBlocked } from './terrain'

const TURN_SPEED = 2.4 // rad/s

const before = new Quaternion()
const tryQ = new Quaternion()
const probeUp = new Vector3()
/** Desvios (rad) testados quando o passo reto bate em algo: o visitante desliza rente ao obstáculo. */
const SLIDE_ANGLES = [0.55, -0.55, 1.1, -1.1, Math.PI / 2, -Math.PI / 2]

/** O que a animação vê: com o guarda-roupa aberto na água, o visitante fica em pé. */
const display: Motion = {
  get speed() {
    return playerState.speed
  },
  get state() {
    return fittingLift(playerState.state, useStore.getState().wardrobeOpen) > 0
      ? 'ground'
      : playerState.state
  },
  get gesture() {
    return playerState.gesture
  },
  set gesture(g) {
    playerState.gesture = g
  },
}
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
    const { openPoi, simpleView, wardrobeOpen, welcomeOpen, setNearPoi } = useStore.getState()
    const locked = openPoi !== null || simpleView || wardrobeOpen || welcomeOpen
    const axes = locked ? { forward: 0, turn: 0, run: false } : readAxes()
    const { forward, turn: turnAxis } = axes
    const wantJump = consumeJump() && !locked

    const swimming = playerState.state === 'swim'
    const maxSpeed = swimming ? SWIM_SPEED : axes.run ? RUN_SPEED : WALK_SPEED
    const q = playerState.orientation
    // Andar segue a câmera: o visitante vira aos poucos para onde ela olha e o
    // giro da câmera diminui na mesma medida (a vista não pula).
    if (forward !== 0 && orbit.yaw !== 0) {
      const yawStep = orbit.yaw * Math.min(1, delta * 10)
      turn(q, yawStep)
      orbit.yaw -= yawStep
      if (Math.abs(orbit.yaw) < 1e-3) orbit.yaw = 0
    }
    if (turnAxis !== 0) turn(q, turnAxis * TURN_SPEED * delta)
    if (forward !== 0) {
      const dist = forward * maxSpeed * delta
      before.copy(q)
      // Já dentro de um obstáculo (ex.: nasceu nele): deixa sair livremente.
      const stuck = isBlocked(probeUp.copy(UP).applyQuaternion(before))
      walk(q, dist, PLANET_RADIUS)
      if (!stuck && isBlocked(upDir.copy(UP).applyQuaternion(q))) {
        q.copy(before)
        for (const a of SLIDE_ANGLES) {
          tryQ.copy(before)
          turn(tryQ, a)
          // De frente para um obstáculo redondo, o passo de lado precisa de distância própria.
          walk(tryQ, dist * Math.max(Math.cos(a), 0.45), PLANET_RADIUS)
          turn(tryQ, -a)
          if (!isBlocked(upDir.copy(UP).applyQuaternion(tryQ))) {
            q.copy(tryQ)
            break
          }
        }
      }
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
      group.current.position
        .copy(playerState.position)
        .addScaledVector(upDir, fittingLift(playerState.state, wardrobeOpen))
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
      <Visitor motion={display} color={visitorColor} look={look} onWardrobe={setWardrobe} />
      <EmoteBubble id={myId} />
    </group>
  )
}
