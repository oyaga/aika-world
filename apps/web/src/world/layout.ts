import type { Vector3 } from 'three'
import type { RepoHouse, WorldData } from '@aika-world/shared'
import type { Markers } from '../state/store'
import { angleBetween, dirFromAngles, fibonacciSphere, PLANET_RADIUS, UP } from '../lib/sphere'

export type LandmarkKind = 'templo' | 'oficina' | 'torre'

export interface LandmarkPoi {
  kind: 'landmark'
  id: 'sobre' | 'servicos' | 'contato'
  landmark: LandmarkKind
  label: string
  dir: Vector3
  /** Para onde o prédio olha (vem do Empty); null = de frente para o spawn. */
  forward?: Vector3 | null
}

export interface HousePoi {
  kind: 'house'
  id: `repo:${number}`
  index: number
  house: RepoHouse
  label: string
  dir: Vector3
}

export type Poi = LandmarkPoi | HousePoi

/** Raio (unidades de mundo, na superfície) para mostrar a dica de interação. */
export const INTERACT_DISTANCE = 4

export const LANDMARKS: LandmarkPoi[] = [
  {
    kind: 'landmark',
    id: 'sobre',
    landmark: 'templo',
    label: 'Templo · Sobre',
    dir: dirFromAngles(28, 0),
  },
  {
    kind: 'landmark',
    id: 'servicos',
    landmark: 'oficina',
    label: 'Oficina · Serviços',
    dir: dirFromAngles(34, 120),
  },
  {
    kind: 'landmark',
    id: 'contato',
    landmark: 'torre',
    label: 'Torre de rádio · Contato',
    dir: dirFromAngles(34, -120),
  },
]

/** Marcos com as posições dos Empties `poi_*` do planeta, quando existirem. */
export function resolveLandmarks(markers: Markers | null): LandmarkPoi[] {
  if (!markers) return LANDMARKS
  return LANDMARKS.map((l) => {
    const m = markers.landmarks[l.landmark]
    return m ? { ...l, dir: m.dir, forward: m.forward } : l
  })
}

/** Direções reservadas (spawn + marcos) onde casas e props não devem ficar. */
export function reservedDirs(landmarks: LandmarkPoi[]): Vector3[] {
  return [UP.clone(), ...landmarks.map((l) => l.dir)]
}

const HOUSE_SPACING = 4.5 // metros entre casas dentro da vila

function toHousePois(houses: RepoHouse[], dirs: Vector3[]): HousePoi[] {
  return houses.map((house, index) => ({
    kind: 'house',
    id: `repo:${index}`,
    index,
    house,
    label: house.secret ? '🔒 Secreto' : house.name,
    dir: dirs[index] as Vector3,
  }))
}

/**
 * Casas agrupadas ao redor do Empty `area_vila`, do centro para fora.
 * Se não couberem no raio da vila, ela cresce até caber.
 */
function layoutVillage(
  houses: RepoHouse[],
  reserved: Vector3[],
  vila: NonNullable<Markers['vila']>,
): HousePoi[] {
  const spacing = HOUSE_SPACING / PLANET_RADIUS
  const n = Math.ceil((4 * Math.PI) / (spacing * spacing))
  const candidates = fibonacciSphere(n)
    .filter((p) => reserved.every((r) => angleBetween(p, r) > spacing * 1.5))
    .map((p) => ({ p, a: angleBetween(p, vila.dir) }))
    .sort((x, y) => x.a - y.a)
  const cap = vila.radius / PLANET_RADIUS
  const inside = candidates.filter((c) => c.a <= cap)
  const picked = (inside.length >= houses.length ? inside : candidates).slice(0, houses.length)
  return toHousePois(
    houses,
    picked.map((c) => c.p),
  )
}

/**
 * Distribui as casas com uma esfera de Fibonacci, pulando pontos próximos
 * demais do spawn ou dos marcos. Com `area_vila`, agrupa as casas nela.
 * Determinístico para a mesma lista.
 */
export function layoutHouses(
  world: WorldData | null,
  landmarks: LandmarkPoi[],
  vila: Markers['vila'] = null,
): HousePoi[] {
  const houses = world?.houses ?? []
  if (houses.length === 0) return []
  const reserved = reservedDirs(landmarks)
  if (vila) return layoutVillage(houses, reserved, vila)
  const minAngle = 0.42 // ~24°
  let count = houses.length + reserved.length * 2
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidates = fibonacciSphere(count).filter((p) =>
      reserved.every((r) => angleBetween(p, r) > minAngle),
    )
    if (candidates.length >= houses.length) return toHousePois(houses, candidates)
    count += houses.length
  }
  return []
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Vue: '#41b883',
  Python: '#3572a5',
  HTML: '#e34c26',
  CSS: '#663399',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Shell: '#89e051',
  Svelte: '#ff3e00',
  Dart: '#00b4ab',
  Kotlin: '#a97bff',
  Swift: '#f05138',
}

export function languageColor(language: string | null): string {
  return (language && LANGUAGE_COLORS[language]) || '#b9a8e6'
}

/** Altura da casa: log das estrelas + bônus de atividade recente. */
export function houseHeight(house: RepoHouse, now = Date.now()): number {
  const stars = Math.log(house.stars + 1)
  const days = Math.max(0, (now - Date.parse(house.pushedAt)) / 86_400_000)
  const activity = Number.isFinite(days) ? Math.exp(-days / 90) : 0
  return Math.min(6, 1.4 + stars * 0.9 + activity * 1.2)
}

export function poiTitle(poi: Poi): string {
  if (poi.kind === 'landmark') return poi.label
  return poi.house.secret ? 'Projeto secreto 🔒' : poi.house.name
}
