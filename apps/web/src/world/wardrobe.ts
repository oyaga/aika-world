import type { Object3D } from 'three'

/**
 * Guarda-roupa do visitante: o `visitante.glb` traz o corpo e todas as peças
 * (meshes `cabelo_*`, `cima_*`, `baixo_*`, `pes_*`, `acess_*`) no mesmo
 * esqueleto; aqui escolhemos uma peça por categoria e escondemos as outras.
 * Ver docs/direcao-de-arte-v2.md, seção 4.1.
 */
export const WARDROBE_SLOTS = ['cabelo', 'cima', 'baixo', 'pes', 'acess'] as const
export type WardrobeSlot = (typeof WARDROBE_SLOTS)[number]
export type Outfit = Record<WardrobeSlot, string>

export const DEFAULT_OUTFIT: Outfit = {
  cabelo: 'cabelo_curto',
  cima: 'cima_moletom',
  baixo: 'baixo_calca_larga',
  pes: 'pes_tenis_grosso',
  acess: 'acess_bolsa_carteiro',
}

const slotOf = (name: string): WardrobeSlot | undefined =>
  WARDROBE_SLOTS.find((slot) => name.toLowerCase().startsWith(`${slot}_`))

/** Peças encontradas no modelo, por categoria (o objeto mais alto de cada peça). */
export function wardrobeCatalog(root: Object3D): Record<WardrobeSlot, Object3D[]> {
  const catalog = Object.fromEntries(WARDROBE_SLOTS.map((s) => [s, []])) as unknown as Record<
    WardrobeSlot,
    Object3D[]
  >
  root.traverse((obj) => {
    const slot = slotOf(obj.name)
    if (!slot) return
    // Malhas com vários materiais têm filhos com o mesmo prefixo: vale só o pai.
    for (let p = obj.parent; p && p !== root; p = p.parent) if (slotOf(p.name)) return
    catalog[slot].push(obj)
  })
  return catalog
}

/**
 * Mostra só a peça escolhida de cada categoria (ou a primeira que existir, se
 * a escolhida não estiver no arquivo). Peças com `esconde = "cima"` (ex.:
 * macacão) escondem a categoria indicada. Modelos sem peças não mudam.
 */
export function applyOutfit(root: Object3D, outfit: Outfit = DEFAULT_OUTFIT) {
  const catalog = wardrobeCatalog(root)
  const hidden = new Set<WardrobeSlot>()
  const chosen = new Map<WardrobeSlot, Object3D>()
  for (const slot of WARDROBE_SLOTS) {
    const pieces = catalog[slot]
    const pick =
      pieces.find((p) => p.name.toLowerCase() === outfit[slot]) ??
      pieces.find((p) => p.name.toLowerCase() !== 'acess_nenhum') ??
      pieces[0]
    if (!pick) continue
    chosen.set(slot, pick)
    const hides = (pick.userData as { esconde?: unknown }).esconde
    if (typeof hides === 'string' && slotOf(`${hides}_`)) hidden.add(hides as WardrobeSlot)
  }
  for (const slot of WARDROBE_SLOTS) {
    for (const piece of catalog[slot]) {
      piece.visible = !hidden.has(slot) && piece === chosen.get(slot)
    }
  }
}
