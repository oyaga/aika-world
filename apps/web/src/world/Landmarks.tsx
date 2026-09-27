import { type JSX, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { faceTowards, UP } from '../lib/sphere'
import { useStore } from '../state/store'
import { Label } from './Label'
import { type LandmarkKind, type LandmarkPoi, poiAnchor } from './layout'
import { Toon } from './materials'
import { Model } from './Model'
import { Npc } from './Npc'
import { BRAND } from './palette'
import { surfaceRadius } from './terrain'

const ROOF = '#2f2a44'
const STONE = '#b9b3a8'
const SHOJI = '#f6ecd9'

interface RoofProps {
  y: number
  width: number
  depth: number
  height: number
}

/** Telhado de quatro águas: pirâmide achatada e esticada, com beiral. */
function Roof({ y, width, depth, height }: RoofProps) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[width, 0.12, depth]} />
        <Toon color={ROOF} />
      </mesh>
      <mesh
        position={[0, 0.12 + height / 2, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1, 1, depth / width]}
      >
        <coneGeometry args={[width * 0.72, height, 4]} />
        <Toon color={ROOF} />
      </mesh>
    </group>
  )
}

/** Lanterna de pedra (tōrō). */
function Lantern({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.2, 6]} />
        <Toon color={STONE} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.6, 6]} />
        <Toon color={STONE} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.34, 0.3, 0.34]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <mesh position={[0, 1.22, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.36, 0.28, 4]} />
        <Toon color={STONE} />
      </mesh>
    </group>
  )
}

/** Portal torii na cor da marca. */
function Torii({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 1.35, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 2.7, 10]} />
          <Toon color={BRAND.orange} />
        </mesh>
      ))}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[3, 0.16, 0.16]} />
        <Toon color={BRAND.orange} />
      </mesh>
      <mesh position={[0, 2.62, 0]}>
        <boxGeometry args={[3.3, 0.14, 0.26]} />
        <Toon color={BRAND.orange} />
      </mesh>
      <mesh position={[0, 2.78, 0]}>
        <boxGeometry args={[3.6, 0.22, 0.34]} />
        <Toon color={BRAND.dark} />
      </mesh>
    </group>
  )
}

/**
 * Templo japonês: base de pedra, pilares laranja, paredes shoji, telhado em
 * dois níveis, lanternas e um torii na frente (+Z). O Felipe fica entre o
 * templo e o torii (ver FELIPE_OFFSET).
 */
function Templo() {
  const pillars: [number, number][] = [
    [-1.6, -1.1],
    [1.6, -1.1],
    [-1.6, 1.1],
    [1.6, 1.1],
  ]
  return (
    <group>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[4.4, 0.5, 3.4]} />
        <Toon color={STONE} />
      </mesh>
      <mesh position={[0, 0.12, 1.95]}>
        <boxGeometry args={[1.6, 0.25, 0.5]} />
        <Toon color={STONE} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[3, 1.6, 2]} />
        <Toon color={SHOJI} />
      </mesh>
      <mesh position={[0, 1.2, 1.01]}>
        <boxGeometry args={[1, 1.3, 0.04]} />
        <Toon color="#5a3d2e" />
      </mesh>
      {pillars.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.4, z]}>
          <cylinderGeometry args={[0.12, 0.14, 1.8, 8]} />
          <Toon color={BRAND.orange} />
        </mesh>
      ))}
      <Roof y={2.3} width={4.8} depth={3.8} height={0.8} />
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[1.8, 0.6, 1.4]} />
        <Toon color={SHOJI} />
      </mesh>
      <Roof y={3.75} width={2.8} depth={2.2} height={0.7} />
      <mesh position={[0, 4.75, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.5, 6]} />
        <Toon color="#ffd166" />
      </mesh>
      <Lantern x={-1.9} z={2.3} />
      <Lantern x={1.9} z={2.3} />
      <Torii z={4.8} />
    </group>
  )
}

function Torre() {
  const light = useRef<Mesh>(null)
  const reducedMotion = useStore((s) => s.reducedMotion)
  useFrame(({ clock }) => {
    if (!light.current || reducedMotion) return
    light.current.visible = Math.sin(clock.elapsedTime * 4) > -0.3
  })
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 1.8]} />
        <Toon color="#c9ccd6" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.45, 5.4, 4]} />
        <Toon color={BRAND.orange} />
      </mesh>
      {[1.6, 2.8, 4].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45 - y * 0.07, 0.04, 6, 12]} />
          <Toon color="#f4f4f4" />
        </mesh>
      ))}
      <mesh ref={light} position={[0, 6.05, 0]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial color="#ffe06b" />
      </mesh>
    </group>
  )
}

const PLACEHOLDERS: Record<LandmarkKind, () => JSX.Element> = {
  templo: Templo,
  torre: Torre,
}

function Landmark({ poi }: { poi: LandmarkPoi }) {
  const Placeholder = PLACEHOLDERS[poi.landmark]
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(poi.dir)
    return {
      position: poi.dir.clone().multiplyScalar(ground),
      // Sem Empty girado, o prédio olha para o polo norte (spawn).
      quaternion: faceTowards(poi.dir, poi.forward ?? UP),
      labelPos: poi.dir.clone().multiplyScalar(ground + 6),
    }
  }, [poi])
  return (
    <>
      <group position={position} quaternion={quaternion}>
        <Model name={poi.landmark} fallback={<Placeholder />} />
      </group>
      <Label position={labelPos} text={poi.label} />
      {poi.landmark === 'templo' && <Felipe poi={poi} />}
    </>
  )
}

/** O Felipe, na frente do templo, olhando para quem chega. */
function Felipe({ poi }: { poi: LandmarkPoi }) {
  const dir = useMemo(() => poiAnchor(poi), [poi])
  return (
    <Npc
      dir={dir}
      lookAt={poi.forward ?? UP}
      name="Felipe"
      model="felipe"
      look={{ outfit: BRAND.dark, hair: '#15110f', accent: BRAND.orange }}
    />
  )
}

export function Landmarks({ landmarks }: { landmarks: LandmarkPoi[] }) {
  return (
    <>
      {landmarks.map((poi) => (
        <Landmark key={poi.id} poi={poi} />
      ))}
    </>
  )
}
