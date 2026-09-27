import { useMemo } from 'react'
import { PLANET_RADIUS, surfaceQuaternion } from '../lib/sphere'
import { Label } from './Label'
import { houseHeight, languageColor, type HousePoi } from './layout'
import { Toon } from './materials'

function House({ poi }: { poi: HousePoi }) {
  const { house } = poi
  const height = houseHeight(house)
  const body = house.secret ? '#8d8f99' : languageColor(house.language)
  const roof = house.secret ? '#5e606b' : '#d9685e'
  const { position, quaternion, labelPos } = useMemo(
    () => ({
      position: poi.dir.clone().multiplyScalar(PLANET_RADIUS),
      quaternion: surfaceQuaternion(poi.dir, poi.index * 1.3),
      labelPos: poi.dir.clone().multiplyScalar(PLANET_RADIUS + height + 2),
    }),
    [poi, height],
  )
  return (
    <>
      <group position={position} quaternion={quaternion}>
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, height, 1.8]} />
          <Toon color={body} />
        </mesh>
        <mesh position={[0, height + 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.55, 1, 4]} />
          <Toon color={roof} />
        </mesh>
        <mesh position={[0, 0.45, 0.91]}>
          <boxGeometry args={[0.5, 0.9, 0.05]} />
          <Toon color="#4a3528" />
        </mesh>
        {!house.secret && (
          <mesh position={[0.5, Math.min(height - 0.4, 1.4), 0.91]}>
            <boxGeometry args={[0.4, 0.4, 0.05]} />
            <Toon color="#fff3b0" emissive="#ffe28a" emissiveIntensity={0.4} />
          </mesh>
        )}
      </group>
      <Label position={labelPos} text={poi.label} muted={house.secret} />
    </>
  )
}

export function Houses({ houses }: { houses: HousePoi[] }) {
  return (
    <>
      {houses.map((poi) => (
        <House key={poi.id} poi={poi} />
      ))}
    </>
  )
}
