import { useMemo } from 'react'
import { Color } from 'three'
import { faceTowards } from '../lib/sphere'
import { Label } from './Label'
import type { ServicePoi } from './layout'
import { Toon } from './materials'
import { firstModel } from '../lib/models'
import { Model } from './Model'
import { Npc } from './Npc'
import { BRAND } from './palette'
import { surfaceRadius } from './terrain'

const BUILDING_HEIGHTS = [3.2, 2.8, 3.8, 3, 3.4, 2.9]

/** Prédio de empresa de primitivas, com a fachada (porta e letreiro) em +Z. */
function ServiceBuilding({ color, height }: { color: string; height: number }) {
  const roof = useMemo(() => new Color(color).multiplyScalar(0.6).getStyle(), [color])
  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[3, height, 2.6]} />
        <Toon color={color} />
      </mesh>
      <mesh position={[0, height + 0.12, 0]}>
        <boxGeometry args={[3.4, 0.24, 3]} />
        <Toon color={roof} />
      </mesh>
      {/* Letreiro com a cor da marca */}
      <mesh position={[0, height - 0.45, 1.34]}>
        <boxGeometry args={[2.2, 0.5, 0.1]} />
        <Toon color={BRAND.orange} />
      </mesh>
      {/* Porta */}
      <mesh position={[0, 0.6, 1.31]}>
        <boxGeometry args={[0.8, 1.2, 0.05]} />
        <Toon color="#3a2c24" />
      </mesh>
      {/* Janelas acesas */}
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, Math.min(1.5, height - 1.1), 1.31]}>
          <boxGeometry args={[0.55, 0.55, 0.05]} />
          <Toon color="#fff3b0" emissive="#ffe28a" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function ServiceSpot({ poi, index }: { poi: ServicePoi; index: number }) {
  const { service } = poi
  const height = BUILDING_HEIGHTS[index % BUILDING_HEIGHTS.length] ?? 3
  const { position, quaternion, labelPos } = useMemo(() => {
    const ground = surfaceRadius(poi.buildingDir)
    return {
      position: poi.buildingDir.clone().multiplyScalar(ground),
      quaternion: faceTowards(poi.buildingDir, poi.center),
      labelPos: poi.buildingDir.clone().multiplyScalar(ground + height + 1.2),
    }
  }, [poi, height])

  return (
    <>
      <group position={position} quaternion={quaternion}>
        <Model
          name={firstModel(`servico_${service.slug}`, 'servico')}
          tint={service.color}
          fallback={<ServiceBuilding color={service.color} height={height} />}
        />
      </group>
      <Label position={labelPos} text={poi.label} />
      <Npc
        dir={poi.dir}
        lookAt={poi.center}
        name={service.npc.name}
        poiId={poi.id}
        model={firstModel(`npc_${service.slug}`, 'npc')}
        look={{ outfit: service.color, hair: '#2b2238', accent: BRAND.orange }}
      />
    </>
  )
}

/** Praça dos Serviços: um prédio por serviço, com um NPC na porta. */
export function ServiceDistrict({ services }: { services: ServicePoi[] }) {
  return (
    <>
      {services.map((poi, i) => (
        <ServiceSpot key={poi.id} poi={poi} index={i} />
      ))}
    </>
  )
}
