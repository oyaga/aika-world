import { create } from 'zustand'
import type { Vector3 } from 'three'
import type { WorldData } from '@aika-world/shared'
import type { LandmarkKind } from '../world/layout'

export type PoiId = string

/** Posições lidas dos Empties do `planeta.glb` (`poi_*`, `area_vila`). */
export interface Markers {
  landmarks: Partial<Record<LandmarkKind, { dir: Vector3; forward: Vector3 | null }>>
  vila: { dir: Vector3; radius: number } | null
  /** Empty `area_servicos`: centro da Praça dos Serviços. */
  servicos: Vector3 | null
  /** Empties `historia_1`, `historia_2`… (índice 0 = historia_1). */
  story: Vector3[]
}

interface AppState {
  world: WorldData | null
  worldError: string | null
  /** POI mais próximo dentro do raio de interação. */
  nearPoi: PoiId | null
  /** POI com painel aberto. */
  openPoi: PoiId | null
  simpleView: boolean
  reducedMotion: boolean
  /** null até o `planeta.glb` carregar (ou para sempre, sem ele). */
  markers: Markers | null
  /** Fala atual da Aika (balão sobre a cabeça dela). `id` muda a cada fala. */
  aikaLine: { text: string; id: number } | null
  /** Cor da roupa do visitante, sorteada a cada visita. */
  visitorColor: string
  loadWorld: () => Promise<void>
  setNearPoi: (id: PoiId | null) => void
  open: (id: PoiId) => void
  close: () => void
  toggleSimpleView: () => void
  setMarkers: (markers: Markers) => void
  aikaSay: (text: string) => void
  aikaHush: () => void
}

let speechId = 0

const VISITOR_COLORS = ['#3fb5a0', '#4f8cff', '#f2a93b', '#9b6bff', '#e9577d', '#44b86b']

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useStore = create<AppState>((set, get) => ({
  world: null,
  worldError: null,
  nearPoi: null,
  openPoi: null,
  simpleView: false,
  reducedMotion: prefersReducedMotion(),
  markers: null,
  aikaLine: null,
  visitorColor: VISITOR_COLORS[Math.floor(Math.random() * VISITOR_COLORS.length)] ?? '#3fb5a0',
  loadWorld: async () => {
    if (get().world) return
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}world.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const world = (await res.json()) as WorldData
      set({ world, worldError: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Mundo vazio para que o planeta ainda funcione sem as casas.
      set({
        worldError: message,
        world: { version: 1, owner: 'oyaga', generatedAt: new Date(0).toISOString(), houses: [] },
      })
    }
  },
  setNearPoi: (id) => {
    if (get().nearPoi !== id) set({ nearPoi: id })
  },
  open: (id) => set({ openPoi: id }),
  close: () => set({ openPoi: null }),
  toggleSimpleView: () => set((s) => ({ simpleView: !s.simpleView, openPoi: null })),
  setMarkers: (markers) => set({ markers }),
  aikaSay: (text) => set({ aikaLine: { text, id: ++speechId } }),
  aikaHush: () => set({ aikaLine: null }),
}))

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => useStore.setState({ reducedMotion: e.matches }))
}
