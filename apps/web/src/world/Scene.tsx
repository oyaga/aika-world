import { useEffect, useMemo } from 'react'
import { Stars } from '@react-three/drei'
import { modelUrl } from '../lib/models'
import { useStore } from '../state/store'
import { CameraRig } from './CameraRig'
import { Houses } from './Houses'
import { Landmarks } from './Landmarks'
import { reservedDirs, type HousePoi, type LandmarkPoi, type Poi } from './layout'
import { Planet } from './Planet'
import { Player } from './Player'
import { Props } from './Props'

interface SceneProps {
  landmarks: LandmarkPoi[]
  houses: HousePoi[]
  pois: Poi[]
  onReady: () => void
}

const hasPlanetModel = modelUrl('planeta') !== undefined

export function Scene({ landmarks, houses, pois, onReady }: SceneProps) {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const avoid = useMemo(
    () => [...reservedDirs(landmarks), ...houses.map((h) => h.dir)],
    [landmarks, houses],
  )

  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <>
      <color attach="background" args={['#1b1733']} />
      <fog attach="fog" args={['#1b1733', 30, 70]} />
      <hemisphereLight args={['#ffe9f3', '#3a3160', 1.1]} />
      <directionalLight position={[30, 40, 20]} intensity={1.6} />
      <Stars radius={90} depth={30} count={1500} factor={3} fade speed={reducedMotion ? 0 : 0.5} />

      <Planet />
      {!hasPlanetModel && <Props avoid={avoid} />}
      <Landmarks landmarks={landmarks} />
      <Houses houses={houses} />
      <Player pois={pois} />
      <CameraRig />
    </>
  )
}
