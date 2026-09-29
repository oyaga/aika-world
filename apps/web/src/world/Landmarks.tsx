import { type JSX, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { faceTowards, UP } from '../lib/sphere'
import { useStore } from '../state/store'
import { Label } from './Label'
import { type LandmarkKind, type LandmarkPoi, poiAnchor } from './layout'
import { Toon } from './materials'
import { Model } from './Model'
import { Npc } from './Npc'
import { BRAND } from './palette'
import { box, circle, useColliders } from './colliders'
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

/** Caixa de correio no estilo japonês, na cor da marca, com a bandeirinha levantada. */
function Correio() {
  const flag = useRef<Group>(null)
  const reducedMotion = useStore((s) => s.reducedMotion)
  useFrame(({ clock }) => {
    if (!flag.current || reducedMotion) return
    flag.current.rotation.x = -0.15 + Math.sin(clock.elapsedTime * 2.5) * 0.15
  })
  return (
    <group>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.9, 6]} />
        <Toon color="#8a5a3b" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.6, 0.45, 0.8]} />
        <Toon color={BRAND.orange} />
      </mesh>
      <mesh position={[0, 1.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 12, 1, false, 0, Math.PI]} />
        <Toon color={BRAND.orange} />
      </mesh>
      {/* Portinhola da frente (+Z) */}
      <mesh position={[0, 1.15, 0.41]}>
        <boxGeometry args={[0.44, 0.3, 0.03]} />
        <Toon color="#c94500" />
      </mesh>
      <mesh position={[0, 1.2, 0.43]}>
        <boxGeometry args={[0.26, 0.04, 0.02]} />
        <Toon color={BRAND.dark} />
      </mesh>
      {/* Bandeirinha */}
      <group ref={flag} position={[0.33, 1.15, 0.1]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <Toon color="#f4f4f4" />
        </mesh>
      </group>
    </group>
  )
}

const LABEL_HEIGHT: Record<LandmarkKind, number> = { templo: 6, correio: 2.2 }

const PLACEHOLDERS: Record<LandmarkKind, () => JSX.Element> = {
  templo: Templo,
  correio: Correio,
}

function Landmark({ poi }: { poi: LandmarkPoi }) {
  const Placeholder = PLACEHOLDERS[poi.landmark]
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(poi.dir)
    return {
      position: poi.dir.clone().multiplyScalar(ground),
      // Sem Empty girado, o prédio olha para o polo norte (spawn).
      quaternion: faceTowards(poi.dir, poi.forward ?? UP),
      labelPos: poi.dir.clone().multiplyScalar(ground + LABEL_HEIGHT[poi.landmark]),
    }
  }, [poi])
  // Medidas do templo.glb (frente em +Z): base, pilares do torii, lanternas e sakuras.
  const colliders = useMemo(
    () =>
      poi.landmark === 'templo'
        ? [
            box(position, quaternion, 0, 0, 2.8, 2.45),
            circle(position, quaternion, -1.45, 4.8, 0.22),
            circle(position, quaternion, 1.45, 4.8, 0.22),
            circle(position, quaternion, -2.4, 3.45, 0.35),
            circle(position, quaternion, 2.4, 3.45, 0.35),
            circle(position, quaternion, 3.3, -1.3, 0.25),
            circle(position, quaternion, -3.3, -1.9, 0.25),
          ]
        : [circle(position, quaternion, 0, 0, 0.4)],
    [poi.landmark, position, quaternion],
  )
  useColliders(`marco:${poi.id}`, colliders)
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
      poiId={poi.id}
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
