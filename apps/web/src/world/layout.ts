import { Vector3 } from 'three'
import type { RepoHouse, WorldData } from '@aika-world/shared'
import type { Service, StoryMilestone } from '../content'
import type { Markers } from '../state/store'
import {
  angleBetween,
  dirFromAngles,
  fibonacciSphere,
  offsetDir,
  PLANET_RADIUS,
  tangentTowards,
  UP,
} from '../lib/sphere'

export type LandmarkKind = 'templo' | 'correio'

export interface LandmarkPoi {
  kind: 'landmark'
  id: 'sobre' | 'contato'
  landmark: LandmarkKind
  label: string
  dir: Vector3
  /** Para onde o prédio olha (vem do Empty); null = de frente para o spawn. */
  forward?: Vector3 | null
}

export interface ServicePoi {
  kind: 'service'
  id: `servico:${string}`
  service: Service
  label: string
  /** Posição do NPC (ponto de interação). */
  dir: Vector3
  /** Posição do prédio, atrás do NPC. */
  buildingDir: Vector3
  /** Centro da praça: prédio e NPC olham para ele. */
  center: Vector3
}

export interface HousePoi {
  kind: 'house'
  id: `repo:${number}`
  index: number
  house: RepoHouse
  label: string
  dir: Vector3
}

export interface StoryPoi {
  kind: 'story'
  id: `historia:${number}`
  index: number
  total: number
  milestone: StoryMilestone
  label: string
  /** Posição do NPC que conta o capítulo (ponto de interação). */
  dir: Vector3
  /** Placa com o ano, logo atrás do NPC. */
  signDir: Vector3
}

export type Poi = LandmarkPoi | ServicePoi | HousePoi | StoryPoi

/** Raio (unidades de mundo, na superfície) para mostrar a dica de interação. */
export const INTERACT_DISTANCE = 4

const TEMPLE_DIR = dirFromAngles(28, 0)

export const LANDMARKS: LandmarkPoi[] = [
  {
    kind: 'landmark',
    id: 'sobre',
    landmark: 'templo',
    label: 'Templo · Felipe',
    dir: TEMPLE_DIR,
  },
  {
    kind: 'landmark',
    id: 'contato',
    landmark: 'correio',
    label: '📮 Caixa de correio · Contato',
    dir: TEMPLE_DIR, // recalculada ao lado do templo em resolveLandmarks
  },
]

/** Posição da caixa de correio no referencial do templo: à direita e à frente (m). */
const MAILBOX_RIGHT = 3.8
const MAILBOX_FORWARD = 2.2

/** Distância (m) do Felipe à frente do centro do templo, no referencial do templo (+Z). */
export const FELIPE_OFFSET = 3.2

/** Rumo "frente" do marco na superfície: o Empty girado ou, sem ele, o spawn. */
export function landmarkForward(poi: LandmarkPoi): Vector3 {
  return tangentTowards(poi.dir, poi.forward ?? UP)
}

/**
 * Ponto de interação do marco. No templo é onde o Felipe fica, na frente;
 * nos outros, o centro do prédio.
 */
export function poiAnchor(poi: Poi): Vector3 {
  if (poi.kind === 'landmark' && poi.landmark === 'templo') {
    return offsetDir(poi.dir, landmarkForward(poi), FELIPE_OFFSET)
  }
  return poi.dir
}

/** Direção de um ponto ao lado de um marco, em metros no referencial dele. */
function besideLandmark(poi: LandmarkPoi, right: number, forward: number): Vector3 {
  const fwd = landmarkForward(poi)
  const side = new Vector3().crossVectors(poi.dir, fwd) // +X local (direita)
  return poi.dir
    .clone()
    .multiplyScalar(PLANET_RADIUS)
    .addScaledVector(fwd, forward)
    .addScaledVector(side, right)
    .normalize()
}

/**
 * Marcos com as posições dos Empties `poi_*` do planeta, quando existirem.
 * A caixa de correio fica ao lado do templo, a não ser que tenha Empty próprio.
 */
export function resolveLandmarks(markers: Markers | null): LandmarkPoi[] {
  const placed = LANDMARKS.map((l) => {
    const m = markers?.landmarks[l.landmark]
    return m ? { ...l, dir: m.dir, forward: m.forward } : l
  })
  const temple = placed.find((l) => l.landmark === 'templo')
  return placed.map((l) =>
    l.landmark === 'correio' && temple && !markers?.landmarks.correio
      ? {
          ...l,
          dir: besideLandmark(temple, MAILBOX_RIGHT, MAILBOX_FORWARD),
          forward: temple.forward,
        }
      : l,
  )
}

/** Centro padrão da Praça dos Serviços (sem o Empty `area_servicos`). */
export const DEFAULT_SERVICES_CENTER = dirFromAngles(42, 120)
const PLAZA_RADIUS = 7 // prédios
const NPC_RADIUS = 4.2 // NPCs, entre o prédio e o centro

/**
 * Praça dos Serviços: prédios em ferradura ao redor de `center`, com a
 * abertura virada para o spawn. Cada NPC fica na porta, olhando para o centro.
 */
export function layoutServices(services: Service[], center: Vector3): ServicePoi[] {
  const north = tangentTowards(center, UP)
  const east = new Vector3().crossVectors(north, center).normalize()
  const n = services.length
  return services.map((service, i) => {
    const deg = n === 1 ? 180 : 60 + (i * 240) / (n - 1)
    const theta = (deg * Math.PI) / 180
    const heading = north
      .clone()
      .multiplyScalar(Math.cos(theta))
      .add(east.clone().multiplyScalar(Math.sin(theta)))
    return {
      kind: 'service',
      id: `servico:${service.slug}`,
      service,
      label: `${service.icon} ${service.name}`,
      dir: offsetDir(center, heading, NPC_RADIUS),
      buildingDir: offsetDir(center, heading, PLAZA_RADIUS),
      center,
    }
  })
}

/** Direções reservadas (spawn, marcos, praça, história) onde casas e props não devem ficar. */
export function reservedDirs(
  landmarks: LandmarkPoi[],
  story: StoryPoi[] = [],
  services: ServicePoi[] = [],
): Vector3[] {
  return [
    UP.clone(),
    ...landmarks.flatMap((l) => [l.dir, poiAnchor(l)]),
    ...story.flatMap((s) => [s.dir, s.signDir]),
    ...services.flatMap((s) => [s.dir, s.buildingDir]),
    ...(services[0] ? [services[0].center] : []),
  ]
}

/** Trilha da história: anel em torno do planeta, abaixo dos marcos. */
export const TRAIL_POLAR_DEG = 72
const TRAIL_POLAR = (TRAIL_POLAR_DEG * Math.PI) / 180
const TRAIL_START_AZIMUTH = 60 // entre o Templo e a Praça dos Serviços
const TRAIL_STEP_DEG = 36 // distância angular entre os NPCs da história

/** Pedras do caminho, a cada ~2 m, dando a volta inteira. */
export function trailDirs(): Vector3[] {
  const circumference = 2 * Math.PI * PLANET_RADIUS * Math.sin(TRAIL_POLAR)
  const n = Math.round(circumference / 2)
  return Array.from({ length: n }, (_, i) => dirFromAngles(TRAIL_POLAR_DEG, (i * 360) / n))
}

/**
 * NPCs da história: nos Empties `historia_N` ou à beira do anel, olhando
 * para o polo norte; a placa com o ano fica logo atrás de cada um.
 */
export function layoutStory(story: StoryMilestone[], markers: Markers | null): StoryPoi[] {
  return story.map((milestone, index) => {
    const dir =
      markers?.story[index] ??
      dirFromAngles(TRAIL_POLAR_DEG + 3, TRAIL_START_AZIMUTH + index * TRAIL_STEP_DEG)
    return {
      kind: 'story',
      id: `historia:${index}`,
      index,
      total: story.length,
      milestone,
      label: `${milestone.when} · ${milestone.title}`,
      dir,
      signDir: offsetDir(dir, tangentTowards(dir, UP).negate(), 1.3),
    }
  })
}

function awayFromTrail(p: Vector3): boolean {
  return Math.abs(Math.acos(Math.max(-1, Math.min(1, p.y))) - TRAIL_POLAR) > 0.18
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
    .filter((p) => awayFromTrail(p) && reserved.every((r) => angleBetween(p, r) > spacing * 1.5))
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
  story: StoryPoi[],
  services: ServicePoi[],
  vila: Markers['vila'] = null,
): HousePoi[] {
  const houses = world?.houses ?? []
  if (houses.length === 0) return []
  const reserved = reservedDirs(landmarks, story, services)
  if (vila) return layoutVillage(houses, reserved, vila)
  const minAngle = 0.42 // ~24°
  let count = houses.length + reserved.length * 2
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidates = fibonacciSphere(count).filter(
      (p) => awayFromTrail(p) && reserved.every((r) => angleBetween(p, r) > minAngle),
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
  if (poi.kind === 'service') return `${poi.service.npc.name} · ${poi.label}`
  if (poi.kind === 'landmark' || poi.kind === 'story') return poi.label
  return poi.house.secret ? 'Projeto secreto 🔒' : poi.house.name
}
