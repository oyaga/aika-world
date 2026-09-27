import { create } from 'zustand'
import type { Vector3 } from 'three'
import type {
  Emote,
  Look,
  LookColorSlot,
  LookSlot,
  PlayerInfo,
  WorldData,
} from '@aika-world/shared'
import { DEFAULT_OUTFIT } from '../world/wardrobe'
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
  /** Cor da roupa do visitante, sorteada a cada visita (ou pelo servidor, online). */
  visitorColor: string
  /** Estado do multiplayer. */
  net: { status: 'offline' | 'connecting' | 'online'; me: PlayerInfo | null; room: number }
  /** Ids dos outros visitantes na sala (os dados por frame ficam em net/multiplayer). */
  remoteIds: string[]
  /** Emote visível sobre a cabeça de cada visitante (id → emote); some sozinho. */
  emotes: Record<string, { emote: Emote; key: number }>
  /** Tela do guarda-roupa aberta (visitante parado, câmera de frente). */
  wardrobeOpen: boolean
  /** Visual do visitante (salvo neste navegador). */
  look: Look
  /** Peças que existem no visitante.glb; null = sem guarda-roupa (sem modelo). */
  wardrobe: Record<LookSlot, string[]> | null
  /** Visual dos outros visitantes (id → visual). */
  remoteLooks: Record<string, Look>
  loadWorld: () => Promise<void>
  setNearPoi: (id: PoiId | null) => void
  open: (id: PoiId) => void
  close: () => void
  toggleSimpleView: () => void
  setMarkers: (markers: Markers) => void
  aikaSay: (text: string) => void
  aikaHush: () => void
  setVisitorColor: (color: string) => void
  setNet: (net: Partial<AppState['net']>) => void
  setRemoteIds: (ids: string[]) => void
  showEmote: (id: string, emote: Emote) => void
  setWardrobeOpen: (open: boolean) => void
  setWardrobe: (catalog: Record<LookSlot, string[]>) => void
  setPiece: (slot: LookSlot, piece: string) => void
  setLookColor: (slot: LookColorSlot, color: string | null) => void
  setRemoteLook: (id: string, look: Look | null) => void
}

const LOOK_KEY = 'aika-world:visual'

function loadLook(): Look {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LOOK_KEY) ?? 'null') as Look | null
    if (saved?.outfit && saved.colors)
      return { outfit: { ...DEFAULT_OUTFIT, ...saved.outfit }, colors: saved.colors }
  } catch {
    // Sem armazenamento (aba anônima, bloqueado): usa o padrão.
  }
  return { outfit: { ...DEFAULT_OUTFIT }, colors: {} }
}

function saveLook(look: Look) {
  try {
    window.localStorage.setItem(LOOK_KEY, JSON.stringify(look))
  } catch {
    // Ignora: o visual só não fica salvo para a próxima visita.
  }
}

const EMOTE_MS = 2500
let emoteKey = 0

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
  net: { status: 'offline', me: null, room: 1 },
  remoteIds: [],
  emotes: {},
  wardrobeOpen: false,
  look: loadLook(),
  wardrobe: null,
  remoteLooks: {},
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
  setVisitorColor: (visitorColor) => set({ visitorColor }),
  setNet: (net) => set((s) => ({ net: { ...s.net, ...net } })),
  setRemoteIds: (remoteIds) => set({ remoteIds }),
  setWardrobeOpen: (wardrobeOpen) => set({ wardrobeOpen, openPoi: null }),
  setWardrobe: (wardrobe) => set({ wardrobe }),
  setPiece: (slot, piece) =>
    set((s) => {
      const look = { ...s.look, outfit: { ...s.look.outfit, [slot]: piece } }
      saveLook(look)
      return { look }
    }),
  setLookColor: (slot, color) =>
    set((s) => {
      const colors = { ...s.look.colors }
      if (color) colors[slot] = color
      else delete colors[slot]
      const look = { ...s.look, colors }
      saveLook(look)
      return { look }
    }),
  setRemoteLook: (id, look) =>
    set((s) => {
      const remoteLooks = { ...s.remoteLooks }
      if (look) remoteLooks[id] = look
      else delete remoteLooks[id]
      return { remoteLooks }
    }),
  showEmote: (id, emote) => {
    const key = ++emoteKey
    set((s) => ({ emotes: { ...s.emotes, [id]: { emote, key } } }))
    window.setTimeout(() => {
      const current = get().emotes[id]
      if (current?.key !== key) return
      const rest = { ...get().emotes }
      delete rest[id]
      set({ emotes: rest })
    }, EMOTE_MS)
  },
}))

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => useStore.setState({ reducedMotion: e.matches }))
}
