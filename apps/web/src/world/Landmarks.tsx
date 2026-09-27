import { type JSX, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { faceTowards, PLANET_RADIUS, UP } from '../lib/sphere'
import { useStore } from '../state/store'
import { Label } from './Label'
import { LANDMARKS, type LandmarkKind, type LandmarkPoi } from './layout'
import { Toon } from './materials'

function Templo() {
  const columns: [number, number][] = [
    [-1.1, -1.1],
    [1.1, -1.1],
    [-1.1, 1.1],
    [1.1, 1.1],
  ]
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <Toon color="#f3eee2" />
      </mesh>
      {columns.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.4, z]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 2, 8]} />
          <Toon color="#fbf7ee" />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[3, 0.3, 3]} />
        <Toon color="#e8dcc4" />
      </mesh>
      <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.3, 1.2, 4]} />
        <Toon color="#d0605e" />
      </mesh>
    </group>
  )
}

function Oficina() {
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2, 2.4]} />
        <Toon color="#f2b56b" />
      </mesh>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 3.4, 3]} />
        <Toon color="#5b6c8f" />
      </mesh>
      <mesh position={[1, 2.9, -0.5]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <Toon color="#8b5e46" />
      </mesh>
      <mesh position={[0, 0.7, 1.21]}>
        <boxGeometry args={[1.2, 1.4, 0.05]} />
        <Toon color="#5a3d2e" />
      </mesh>
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
        <Toon color="#e05d5d" />
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

const MODELS: Record<LandmarkKind, () => JSX.Element> = {
  templo: Templo,
  oficina: Oficina,
  torre: Torre,
}

function Landmark({ poi }: { poi: LandmarkPoi }) {
  const Model = MODELS[poi.landmark]
  const { position, quaternion, labelPos } = useMemo(
    () => ({
      position: poi.dir.clone().multiplyScalar(PLANET_RADIUS),
      // Vira o prédio para o polo norte (spawn), de frente para a Aika.
      quaternion: faceTowards(poi.dir, UP),
      labelPos: poi.dir.clone().multiplyScalar(PLANET_RADIUS + 5),
    }),
    [poi],
  )
  return (
    <>
      <group position={position} quaternion={quaternion}>
        <Model />
      </group>
      <Label position={labelPos} text={poi.label} />
    </>
  )
}

export function Landmarks() {
  return (
    <>
      {LANDMARKS.map((poi) => (
        <Landmark key={poi.id} poi={poi} />
      ))}
    </>
  )
}
