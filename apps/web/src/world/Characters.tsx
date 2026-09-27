import { Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { type ModelName, modelUrl } from '../lib/models'
import { useStore } from '../state/store'
import { Toon } from './materials'
import { ModelBoundary, useModelClone } from './Model'
import { BRAND } from './palette'

/** Objeto mutável com `speed` (0..1), lido a cada frame para a animação. */
export interface Motion {
  speed: number
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
  const phase = useRef(0)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useFrame((_, delta) => {
    const s = motion.speed
    phase.current += delta * 11 * s
    const swing = reducedMotion ? 0 : Math.sin(phase.current) * 0.7 * s
    const bob = reducedMotion ? 0 : Math.abs(Math.sin(phase.current)) * 0.12 * s
    if (body.current) body.current.position.y = bob
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.8
    if (armR.current) armR.current.rotation.x = swing * 0.8
  })

  return (
    <group>
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

/** Personagem .glb com as ações `Idle` e `Walk`, misturadas pela velocidade. */
function AnimatedGlb({ url, motion, tint }: { url: string; motion: Motion; tint?: string }) {
  const root = useModelClone(url, tint)
  const { animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, root)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useEffect(() => {
    const idle = actions.Idle
    const walk = actions.Walk
    if (import.meta.env.DEV && (!idle || !walk)) {
      console.warn(`[${url}] esperava as ações "Idle" e "Walk"; encontrei: ${names.join(', ')}`)
    }
    idle?.play()
    walk?.play().setEffectiveWeight(0)
    return () => {
      idle?.stop()
      walk?.stop()
    }
  }, [actions, names, url])

  useFrame(() => {
    const walking = reducedMotion ? 0 : motion.speed
    actions.Walk?.setEffectiveWeight(walking)
    actions.Idle?.setEffectiveWeight(1 - walking)
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
