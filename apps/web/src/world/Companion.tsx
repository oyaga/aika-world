import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { type Group, Quaternion, Vector3 } from 'three'
import {
  AIKA_CHATTER,
  AIKA_GREETING,
  AIKA_LAKE,
  AIKA_SWIM,
  houseLine,
  speechDuration,
} from '../guide'
import { angleBetween, faceTowards, PLANET_RADIUS } from '../lib/sphere'
import { aikaState, playerState } from '../state/player'
import { useStore } from '../state/store'
import { Aika } from './Characters'
import type { Poi } from './layout'
import { lakeNear } from './lakes'
import { stepVertical, SWIM_SPEED, WALK_SPEED } from './locomotion'
import { splashAt } from './Splashes'
import { hasTerrainModel } from './terrain'

/** Onde a Aika gosta de ficar, no referencial do visitante: ao lado e um pouco atrás. */
const FOLLOW_OFFSET = new Vector3(1.4, 0, -1)
const TELEPORT_GAP = 25 // m: se ficar muito para trás, reaparece ao lado
/** A Aika pula um instantinho depois do visitante. */
const JUMP_DELAY_MS = 180

const target = new Vector3()
const axis = new Vector3()
const visitorDir = new Vector3()
const desired = new Quaternion()

/** Move a Aika na superfície, em direção ao lado do visitante. */
function followStep(dt: number) {
  const a = aikaState
  target.copy(FOLLOW_OFFSET).applyQuaternion(playerState.orientation).add(playerState.position)
  target.normalize()
  if (!a.placed) {
    a.dir.copy(target)
    a.placed = true
  }

  const gap = angleBetween(a.dir, target) * PLANET_RADIUS
  let moved = 0
  if (gap > TELEPORT_GAP) {
    a.dir.copy(target)
  } else if (gap > 0.15) {
    // Acelera quando está longe, desacelera ao chegar (nadando, mais devagar).
    const cap = a.state === 'swim' ? SWIM_SPEED + 1 : 12
    const speed = Math.min(cap, 1.5 + gap * 2.2)
    moved = Math.min(gap, speed * dt)
    axis.crossVectors(a.dir, target).normalize()
    a.dir.applyAxisAngle(axis, moved / PLANET_RADIUS).normalize()
  }

  const walking = Math.min(1.8, moved / Math.max(dt, 1e-3) / WALK_SPEED)
  a.speed += (walking - a.speed) * Math.min(1, dt * 10)

  // Andando: olha para onde vai. Parada: olha para o visitante.
  visitorDir.copy(playerState.position).normalize()
  desired.copy(faceTowards(a.dir, moved > 0 ? target : visitorDir))
  a.orientation.slerp(desired, Math.min(1, dt * 8))

  // Imita o pulo do visitante, com um pequeno atraso.
  const jumpedAt = playerState.jumpedAt
  const wantJump =
    jumpedAt > a.copiedJump && performance.now() - jumpedAt > JUMP_DELAY_MS && a.state !== 'air'
  if (wantJump) a.copiedJump = jumpedAt
  const step = stepVertical(a, a.dir, dt, wantJump)
  a.position.copy(a.dir).multiplyScalar(a.radius)
  if (step.splash > 0) splashAt(a.position, step.splash * 0.8)
}

/** Balão de fala sobre a cabeça da Aika. Some sozinho depois de um tempo. */
function SpeechBubble() {
  const line = useStore((s) => s.aikaLine)
  const hidden = useStore((s) => s.openPoi !== null)
  const hush = useStore((s) => s.aikaHush)

  useEffect(() => {
    if (!line) return
    const id = window.setTimeout(() => {
      if (useStore.getState().aikaLine?.id === line.id) hush()
    }, speechDuration(line.text))
    return () => window.clearTimeout(id)
  }, [line, hush])

  if (!line || hidden) return null
  return (
    <Html position={[0, 2.55, 0]} center zIndexRange={[20, 10]} pointerEvents="none">
      <div className="speech" aria-hidden="true" key={line.id}>
        {line.text}
      </div>
    </Html>
  )
}

/**
 * O que a Aika fala: boas-vindas ao chegar, o nome e a descrição de cada
 * repositório quando o visitante se aproxima, e comentários aleatórios de
 * tempos em tempos (só quando nada mais está acontecendo).
 */
function useGuideSpeech(pois: Poi[]) {
  useEffect(() => {
    const id = window.setTimeout(() => useStore.getState().aikaSay(AIKA_GREETING), 1500)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(
    () =>
      useStore.subscribe((state, prev) => {
        if (state.nearPoi === prev.nearPoi || !state.nearPoi) return
        const poi = pois.find((p) => p.id === state.nearPoi)
        if (poi?.kind === 'house') state.aikaSay(houseLine(poi.house))
      }),
    [pois],
  )

  const bag = useRef<string[]>([])
  useEffect(() => {
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(tick, 18_000 + Math.random() * 17_000)
    }
    const tick = () => {
      const s = useStore.getState()
      if (!s.aikaLine && !s.openPoi && !s.simpleView && !document.hidden) {
        if (bag.current.length === 0)
          bag.current = [...AIKA_CHATTER].sort(() => Math.random() - 0.5)
        const next = bag.current.pop()
        if (next) s.aikaSay(next)
      }
      schedule()
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])
}

/** A Aika, guia que acompanha o visitante e conversa com ele. */
export function Companion({ pois }: { pois: Poi[] }) {
  const group = useRef<Group>(null)
  useGuideSpeech(pois)

  const remarks = useRef({ lakeAt: -Infinity, swam: false, wasSwimming: false })
  useFrame(({ clock }, rawDelta) => {
    followStep(Math.min(rawDelta, 0.1))
    // Comentários sobre a água: perto de um lago (no máximo a cada minuto) e no primeiro mergulho.
    const r = remarks.current
    const store = useStore.getState()
    const swimming = playerState.state === 'swim'
    if (swimming && !r.wasSwimming && !r.swam) {
      r.swam = true
      store.aikaSay(AIKA_SWIM)
    } else if (
      !swimming &&
      !store.aikaLine &&
      !store.openPoi &&
      clock.elapsedTime - r.lakeAt > 60 &&
      !hasTerrainModel() &&
      lakeNear(visitorDir.copy(playerState.position).normalize())
    ) {
      r.lakeAt = clock.elapsedTime
      store.aikaSay(AIKA_LAKE)
    }
    r.wasSwimming = swimming
    const g = group.current
    if (!g) return
    g.position.copy(aikaState.position)
    g.quaternion.copy(aikaState.orientation)
  })

  return (
    <group ref={group}>
      <Aika motion={aikaState} />
      <SpeechBubble />
    </group>
  )
}
