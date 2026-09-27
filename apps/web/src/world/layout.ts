import type { Vector3 } from 'three'
import type { RepoHouse, WorldData } from '@aika-world/shared'
import { angleBetween, dirFromAngles, fibonacciSphere, UP } from '../lib/sphere'

export type LandmarkKind = 'templo' | 'oficina' | 'torre'

export interface LandmarkPoi {
  kind: 'landmark'
  id: 'sobre' | 'servicos' | 'contato'
  landmark: LandmarkKind
  label: string
  dir: Vector3
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

/** Direções reservadas (spawn + marcos) onde casas e props não devem ficar. */
export const RESERVED_DIRS: Vector3[] = [UP.clone(), ...LANDMARKS.map((l) => l.dir)]

/**
 * Distribui as casas com uma esfera de Fibonacci, pulando pontos próximos
 * demais do spawn ou dos marcos. Determinístico para a mesma lista.
 */
export function layoutHouses(world: WorldData | null): HousePoi[] {
  const houses = world?.houses ?? []
  if (houses.length === 0) return []
  const minAngle = 0.42 // ~24°
  let count = houses.length + RESERVED_DIRS.length * 2
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidates = fibonacciSphere(count).filter((p) =>
      RESERVED_DIRS.every((r) => angleBetween(p, r) > minAngle),
    )
    if (candidates.length >= houses.length) {
      return houses.map((house, index) => ({
        kind: 'house',
        id: `repo:${index}`,
        index,
        house,
        label: house.secret ? '🔒 Secreto' : house.name,
        dir: candidates[index] as Vector3,
      }))
    }
    count += houses.length
  }
  return []
}

export function allPois(world: WorldData | null): Poi[] {
  return [...LANDMARKS, ...layoutHouses(world)]
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
