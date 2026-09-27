import { Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { modelUrl } from '../lib/models'
import { useStore } from '../state/store'
import { Toon } from './materials'
import { ModelBoundary, useModelClone } from './Model'

interface AikaProps {
  /** Objeto mutável com `speed` (0..1), lido a cada frame para a animação. */
  motion: { speed: number }
}

/**
 * Aika: usa `aika.glb` quando existir (ações `Idle` e `Walk`), senão a
 * versão de primitivas. A frente do modelo é +Z (−Y no Blender).
 */
export function Aika({ motion }: AikaProps) {
  const url = modelUrl('aika')
  const placeholder = <AikaPlaceholder motion={motion} />
  if (!url) return placeholder
  return (
    <ModelBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <AikaModel url={url} motion={motion} />
      </Suspense>
    </ModelBoundary>
  )
}

function AikaModel({ url, motion }: AikaProps & { url: string }) {
  const root = useModelClone(url)
  const { animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, root)
  const reducedMotion = useStore((s) => s.reducedMotion)

  useEffect(() => {
    const idle = actions.Idle
    const walk = actions.Walk
    if (import.meta.env.DEV && (!idle || !walk)) {
      console.warn(`[aika.glb] esperava as ações "Idle" e "Walk"; encontrei: ${names.join(', ')}`)
    }
    idle?.play()
    walk?.play().setEffectiveWeight(0)
    return () => {
      idle?.stop()
      walk?.stop()
    }
  }, [actions, names])

  useFrame(() => {
    const walking = reducedMotion ? 0 : motion.speed
    actions.Walk?.setEffectiveWeight(walking)
    actions.Idle?.setEffectiveWeight(1 - walking)
  })

  return <primitive object={root} />
}

/**
 * Aika de primitivas, usada enquanto `aika.glb` não existe ou carrega.
 * Fica de frente para +Z local, com os pés em y = 0.
 */
function AikaPlaceholder({ motion }: AikaProps) {
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
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <Toon color="#2f2a44" />
        </mesh>
      </group>
      <group ref={legR} position={[0.14, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <Toon color="#2f2a44" />
        </mesh>
      </group>

      <group ref={body}>
        {/* Corpo */}
        <mesh position={[0, 0.98, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.45, 6, 12]} />
          <Toon color="#f06c9b" />
        </mesh>
        {/* Cachecol / detalhe */}
        <mesh position={[0, 1.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.07, 8, 16]} />
          <Toon color="#ffd166" />
        </mesh>
        {/* Braços */}
        <group ref={armL} position={[-0.38, 1.2, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <Toon color="#f6d2b8" />
          </mesh>
        </group>
        <group ref={armR} position={[0.38, 1.2, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <Toon color="#f6d2b8" />
          </mesh>
        </group>
        {/* Cabeça */}
        <mesh position={[0, 1.72, 0]} castShadow>
          <sphereGeometry args={[0.36, 20, 16]} />
          <Toon color="#f6d2b8" />
        </mesh>
        {/* Cabelo */}
        <mesh position={[0, 1.8, -0.05]} scale={[1.08, 1, 1.08]}>
          <sphereGeometry args={[0.37, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <Toon color="#3b2a6b" />
        </mesh>
        <mesh position={[0, 1.62, -0.22]} scale={[1, 1.2, 0.7]}>
          <sphereGeometry args={[0.33, 16, 12]} />
          <Toon color="#3b2a6b" />
        </mesh>
        {/* Marias-chiquinhas */}
        <mesh position={[-0.4, 1.72, -0.1]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <Toon color="#3b2a6b" />
        </mesh>
        <mesh position={[0.4, 1.72, -0.1]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <Toon color="#3b2a6b" />
        </mesh>
        {/* Presilha de destaque */}
        <mesh position={[0.22, 2.02, 0.12]}>
          <octahedronGeometry args={[0.08, 0]} />
          <Toon color="#5ce1e6" emissive="#5ce1e6" emissiveIntensity={0.3} />
        </mesh>
        {/* Olhos (frente = +Z) */}
        <mesh position={[-0.12, 1.72, 0.33]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#1b1733" />
        </mesh>
        <mesh position={[0.12, 1.72, 0.33]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshBasicMaterial color="#1b1733" />
        </mesh>
      </group>
    </group>
  )
}
