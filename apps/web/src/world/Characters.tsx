import { Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { type ModelName, modelUrl } from '../lib/models'
import { useStore } from '../state/store'
import { Toon } from './materials'
import { ModelBoundary, useModelClone } from './Model'
import type { MoveState } from './locomotion'
import { BRAND } from './palette'

/** Objeto mutável com `speed` (0..1), lido a cada frame para a animação. */
export interface Motion {
  /** 1 = andando, ~1,75 = correndo (0 = parado). */
  speed: number
  /** No chão, no ar (pulo) ou nadando. Padrão: no chão. */
  state?: MoveState
}

interface ChibiLook {
  outfit: string
  scarf: string
  hair: string
  skin: string
  legs: string
  /** Marias-chiquinhas + presilha neon (a Aika). */
  pigtails?: boolean
  /** Mochila de viajante nas costas. */
  backpack?: string
}

const AIKA_LOOK: ChibiLook = {
  outfit: '#f06c9b',
  scarf: BRAND.orange,
  hair: '#3b2a6b',
  skin: '#f6d2b8',
  legs: '#2f2a44',
  pigtails: true,
}

interface LimbProps {
  color: string
  radius: number
  length: number
  /** Distância do pivô (ombro/quadril) até o centro da cápsula. */
  drop: number
}

function Limb({ color, radius, length, drop }: LimbProps) {
  return (
    <mesh position={[0, -drop, 0]}>
      <capsuleGeometry args={[radius, length, 4, 8]} />
      <Toon color={color} />
    </mesh>
  )
}

/** Boneco chibi de primitivas que anda (pernas e braços balançam). Frente = +Z, pés em y = 0. */
function Chibi({ motion, look }: { motion: Motion; look: ChibiLook }) {
  const body = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const pose = useRef<Group>(null)
  const phase = useRef(0)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useFrame((_, delta) => {
    const s = motion.speed
    const state = motion.state ?? 'ground'
    const k = Math.min(1, delta * 12)
    const lerp = (ref: React.RefObject<Group | null>, target: number) => {
      if (ref.current) ref.current.rotation.x += (target - ref.current.rotation.x) * k
    }

    // Nadando, o corpo deita para a frente e fica na linha d'água.
    const p = pose.current
    if (p) {
      p.rotation.x += ((state === 'swim' ? 1.25 : 0) - p.rotation.x) * k
      p.position.y += ((state === 'swim' ? 0.7 : 0) - p.position.y) * k
    }
    if (body.current) body.current.position.y = 0

    if (state === 'air') {
      // Pulo: braços para cima, pernas encolhidas.
      lerp(armL, -2.6)
      lerp(armR, -2.6)
      lerp(legL, 0.6)
      lerp(legR, -0.25)
      return
    }
    if (state === 'swim') {
      // Braçadas alternadas e pernas batendo.
      phase.current += delta * (reducedMotion ? 0 : 5 + s * 2)
      if (armL.current) armL.current.rotation.x = -phase.current
      if (armR.current) armR.current.rotation.x = -phase.current - Math.PI
      lerp(legL, Math.sin(phase.current * 2) * 0.4)
      lerp(legR, -Math.sin(phase.current * 2) * 0.4)
      return
    }
    // No chão: andar/correr (correndo, passos mais rápidos e mais largos).
    phase.current += delta * 11 * Math.min(s, 1.8)
    const amplitude = reducedMotion ? 0 : 0.7 * Math.min(s, 1) + 0.3 * Math.max(0, s - 1)
    const swing = Math.sin(phase.current) * amplitude
    if (body.current && !reducedMotion) {
      body.current.position.y = Math.abs(Math.sin(phase.current)) * 0.12 * Math.min(s, 1.5)
    }
    lerp(legL, swing)
    lerp(legR, -swing)
    lerp(armL, -swing * 0.8)
    lerp(armR, swing * 0.8)
  })

  return (
    <group ref={pose}>
      {/* Pernas (fora do grupo com bob para os pés ficarem no chão) */}
      <group ref={legL} position={[-0.14, 0.62, 0]}>
        <Limb color={look.legs} radius={0.1} length={0.4} drop={0.3} />
      </group>
      <group ref={legR} position={[0.14, 0.62, 0]}>
        <Limb color={look.legs} radius={0.1} length={0.4} drop={0.3} />
      </group>

      <group ref={body}>
        <mesh position={[0, 0.98, 0]}>
          <capsuleGeometry args={[0.3, 0.45, 6, 12]} />
          <Toon color={look.outfit} />
        </mesh>
        <mesh position={[0, 1.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.07, 8, 16]} />
          <Toon color={look.scarf} />
        </mesh>
        {look.backpack && (
          <mesh position={[0, 1.02, -0.34]}>
            <boxGeometry args={[0.42, 0.5, 0.2]} />
            <Toon color={look.backpack} />
          </mesh>
        )}
        <group ref={armL} position={[-0.38, 1.2, 0]}>
          <Limb color={look.skin} radius={0.08} length={0.35} drop={0.25} />
        </group>
        <group ref={armR} position={[0.38, 1.2, 0]}>
          <Limb color={look.skin} radius={0.08} length={0.35} drop={0.25} />
        </group>
        <mesh position={[0, 1.72, 0]}>
          <sphereGeometry args={[0.36, 20, 16]} />
          <Toon color={look.skin} />
        </mesh>
        <mesh position={[0, 1.8, -0.05]} scale={[1.08, 1, 1.08]}>
          <sphereGeometry args={[0.37, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <Toon color={look.hair} />
        </mesh>
        {look.pigtails && (
          <>
            <mesh position={[0, 1.62, -0.22]} scale={[1, 1.2, 0.7]}>
              <sphereGeometry args={[0.33, 16, 12]} />
              <Toon color={look.hair} />
            </mesh>
            {[-0.4, 0.4].map((x) => (
              <mesh key={x} position={[x, 1.72, -0.1]}>
                <sphereGeometry args={[0.14, 12, 10]} />
                <Toon color={look.hair} />
              </mesh>
            ))}
            <mesh position={[0.22, 2.02, 0.12]}>
              <octahedronGeometry args={[0.08, 0]} />
              <Toon color={BRAND.neon} emissive={BRAND.neon} emissiveIntensity={0.3} />
            </mesh>
          </>
        )}
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 1.72, 0.33]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshBasicMaterial color="#1b1733" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const OPTIONAL_ACTIONS = ['Idle', 'Walk', 'Run', 'Jump', 'Swim'] as const

/**
 * Personagem .glb: `Idle` e `Walk` obrigatórias; `Run`, `Jump` e `Swim`
 * opcionais (sem elas, usa `Walk` ou a pose parada). Misturadas pela
 * velocidade e pelo estado de movimento.
 */
function AnimatedGlb({ url, motion, tint }: { url: string; motion: Motion; tint?: string }) {
  const root = useModelClone(url, tint)
  const { animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, root)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useEffect(() => {
    if (import.meta.env.DEV && (!actions.Idle || !actions.Walk)) {
      console.warn(`[${url}] esperava as ações "Idle" e "Walk"; encontrei: ${names.join(', ')}`)
    }
    // Todas tocam o tempo todo; o peso de cada uma decide o que aparece.
    const all = OPTIONAL_ACTIONS.map((n) => actions[n]).filter((a) => a != null)
    all.forEach((a) => a.play().setEffectiveWeight(0))
    actions.Idle?.setEffectiveWeight(1)
    return () => all.forEach((a) => a.stop())
  }, [actions, names, url])

  useFrame(() => {
    const state = motion.state ?? 'ground'
    const s = reducedMotion ? 0 : motion.speed
    const w = { Idle: 0, Walk: 0, Run: 0, Jump: 0, Swim: 0 }
    if (state === 'air' && actions.Jump) w.Jump = 1
    else if (state === 'swim' && actions.Swim) w.Swim = 1
    else {
      const moving = Math.min(1, s)
      const running = actions.Run ? Math.min(1, Math.max(0, (s - 1.2) / 0.4)) : 0
      w.Walk = moving * (1 - running)
      w.Run = running
      w.Idle = 1 - moving
    }
    for (const name of OPTIONAL_ACTIONS) actions[name]?.setEffectiveWeight(w[name])
  })

  return <primitive object={root} />
}

interface CharacterProps {
  model: ModelName
  motion: Motion
  look: ChibiLook
  /** Cor para materiais `@tint` do .glb. */
  tint?: string
}

/** Usa o .glb quando existir; senão (ou enquanto carrega) o chibi de primitivas. */
function Character({ model, motion, look, tint }: CharacterProps) {
  const url = modelUrl(model)
  const placeholder = <Chibi motion={motion} look={look} />
  if (!url) return placeholder
  return (
    <ModelBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <AnimatedGlb url={url} motion={motion} tint={tint} />
      </Suspense>
    </ModelBoundary>
  )
}

/** A Aika, guia do visitante (`aika.glb`). */
export function Aika({ motion }: { motion: Motion }) {
  return <Character model="aika" motion={motion} look={AIKA_LOOK} />
}

/** O visitante (`visitante.glb`), com a roupa na cor sorteada para esta visita. */
export function Visitor({ motion, color }: { motion: Motion; color: string }) {
  return (
    <Character
      model="visitante"
      motion={motion}
      tint={color}
      look={{
        outfit: color,
        scarf: '#fff3e6',
        hair: '#4a3426',
        skin: '#e9b98f',
        legs: '#3a3346',
        backpack: '#8a5a3b',
      }}
    />
  )
}
