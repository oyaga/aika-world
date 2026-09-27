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
  loadWorld: () => Promise<void>
  setNearPoi: (id: PoiId | null) => void
  open: (id: PoiId) => void
  close: () => void
  toggleSimpleView: () => void
  setMarkers: (markers: Markers) => void
}

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
}))

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => useStore.setState({ reducedMotion: e.matches }))
}
