import { useEffect, useMemo } from 'react'
import { modelUrl } from '../lib/models'
import { useStore } from '../state/store'
import { Atmosphere } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { DayNightClock } from './dayNight'
import { Effects } from './Effects'
import { isTouchDevice } from '../lib/device'
import { Companion } from './Companion'
import { Houses } from './Houses'
import { Landmarks } from './Landmarks'
import {
  reservedDirs,
  trailDirs,
  type HousePoi,
  type LandmarkPoi,
  type Poi,
  type ServicePoi,
  type StoryPoi,
} from './layout'
import { Planet } from './Planet'
import { Player } from './Player'
import { Props } from './Props'
import { RemotePlayers } from './RemotePlayers'
import { ServiceDistrict } from './ServiceDistrict'
import { Splashes } from './Splashes'
import { Trail } from './Trail'

interface SceneProps {
  landmarks: LandmarkPoi[]
  story: StoryPoi[]
  services: ServicePoi[]
  houses: HousePoi[]
  pois: Poi[]
  onReady: () => void
}

const hasPlanetModel = modelUrl('planeta') !== undefined
const lowPower = isTouchDevice()

export function Scene({ landmarks, story, services, houses, pois, onReady }: SceneProps) {
  const reducedMotion = useStore((s) => s.reducedMotion)
  const avoid = useMemo(
    () => [
      ...reservedDirs(landmarks, story, services),
      ...trailDirs(),
      ...houses.map((h) => h.dir),
    ],
    [landmarks, story, services, houses],
  )

  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <>
      <DayNightClock />
      <Atmosphere reducedMotion={reducedMotion} />

      <Planet />
      {!hasPlanetModel && <Props avoid={avoid} />}
      <Landmarks landmarks={landmarks} />
      <ServiceDistrict services={services} />
      <Trail story={story} showPath={!hasPlanetModel} />
      <Houses houses={houses} />
      <Player pois={pois} />
      <Companion pois={pois} />
      <RemotePlayers />
      <Splashes />
      <CameraRig />
      <Effects lowPower={lowPower} />
    </>
  )
}
