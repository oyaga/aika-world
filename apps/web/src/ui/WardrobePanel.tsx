import { useEffect, useRef } from 'react'
import { LOOK_COLOR_SLOTS, LOOK_SLOTS, type LookColorSlot, type LookSlot } from '@aika-world/shared'
import { useStore } from '../state/store'
import { pieceLabel } from '../world/wardrobe'

const SLOT_LABELS: Record<LookSlot, string> = {
  cabelo: 'Cabelo',
  cima: 'Parte de cima',
  baixo: 'Parte de baixo',
  pes: 'Calçado',
  acess: 'Acessório',
}

const COLOR_LABELS: Record<LookColorSlot, string> = {
  cima: 'Cor de cima',
  baixo: 'Cor de baixo',
  pes: 'Cor do calçado',
}

/** Paleta das roupas: cores da marca e do Messenger. */
const SWATCHES: [string, string][] = [
  ['#ff5a02', 'laranja'],
  ['#e9577d', 'rosa'],
  ['#9b6bff', 'roxo'],
  ['#4f8cff', 'azul'],
  ['#3fb5a0', 'turquesa'],
  ['#44b86b', 'verde'],
  ['#e0a92e', 'mostarda'],
  ['#f4f1ea', 'creme'],
  ['#8e2f3c', 'vinho'],
  ['#2b2a33', 'grafite'],
]

/** Botão "👕 Visual" (só aparece quando o visitante.glb tem guarda-roupa). */
export function WardrobeButton() {
  const available = useStore((s) => s.wardrobe !== null)
  const open = useStore((s) => s.wardrobeOpen)
  const setOpen = useStore((s) => s.setWardrobeOpen)
  if (!available) return null
  return (
    <button
      type="button"
      className="top-button"
      onClick={() => setOpen(!open)}
      aria-pressed={open}
      aria-label="Trocar visual"
    >
      <span aria-hidden="true">👕</span> Visual
    </button>
  )
}

/**
 * Guarda-roupa do visitante, como a tela de personagem do Messenger: setas por
 * categoria e cores para cima, baixo e calçado. O personagem muda na hora
 * (a câmera vira de frente para ele) e o visual fica salvo neste navegador.
 */
export function WardrobePanel() {
  const open = useStore((s) => s.wardrobeOpen)
  const catalog = useStore((s) => s.wardrobe)
  const look = useStore((s) => s.look)
  const setOpen = useStore((s) => s.setWardrobeOpen)
  const setPiece = useStore((s) => s.setPiece)
  const setLookColor = useStore((s) => s.setLookColor)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (open) heading.current?.focus()
  }, [open])

  if (!open || !catalog) return null

  const options = (slot: LookSlot) =>
    slot === 'acess' ? ['acess_nenhum', ...catalog.acess] : catalog[slot]

  const step = (slot: LookSlot, dir: 1 | -1) => {
    const list = options(slot)
    if (list.length === 0) return
    const i = Math.max(0, list.indexOf(look.outfit[slot]))
    setPiece(slot, list[(i + dir + list.length) % list.length] as string)
  }

  const randomize = () => {
    for (const slot of LOOK_SLOTS) {
      const list = options(slot)
      if (list.length) setPiece(slot, list[Math.floor(Math.random() * list.length)] as string)
    }
    for (const slot of LOOK_COLOR_SLOTS) {
      setLookColor(
        slot,
        (SWATCHES[Math.floor(Math.random() * SWATCHES.length)] as [string, string])[0],
      )
    }
  }

  return (
    <section className="wardrobe" role="dialog" aria-modal="false" aria-labelledby="wardrobe-title">
      <header className="wardrobe__header">
        <h2 id="wardrobe-title" ref={heading} tabIndex={-1}>
          Seu visual
        </h2>
        <button
          type="button"
          className="panel__close"
          onClick={() => setOpen(false)}
          aria-label="Fechar (Esc)"
        >
          ✕
        </button>
      </header>

      <div className="wardrobe__body">
        {LOOK_SLOTS.map((slot) =>
          options(slot).length === 0 ? null : (
            <div key={slot} className="wardrobe__row">
              <span className="wardrobe__label">{SLOT_LABELS[slot]}</span>
              <div className="wardrobe__picker">
                <button
                  type="button"
                  onClick={() => step(slot, -1)}
                  aria-label={`${SLOT_LABELS[slot]}: anterior`}
                >
                  ◀
                </button>
                <output aria-live="polite">{pieceLabel(look.outfit[slot])}</output>
                <button
                  type="button"
                  onClick={() => step(slot, 1)}
                  aria-label={`${SLOT_LABELS[slot]}: próximo`}
                >
                  ▶
                </button>
              </div>
            </div>
          ),
        )}

        {LOOK_COLOR_SLOTS.map((slot) => (
          <div key={slot} className="wardrobe__row">
            <span className="wardrobe__label">{COLOR_LABELS[slot]}</span>
            <div className="wardrobe__swatches" role="radiogroup" aria-label={COLOR_LABELS[slot]}>
              <button
                type="button"
                role="radio"
                aria-checked={!look.colors[slot]}
                className="wardrobe__swatch wardrobe__swatch--auto"
                onClick={() => setLookColor(slot, null)}
                title="Cor original"
                aria-label="Cor original"
              />
              {SWATCHES.map(([color, name]) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={look.colors[slot] === color}
                  className="wardrobe__swatch"
                  style={{ background: color }}
                  onClick={() => setLookColor(slot, color)}
                  title={name}
                  aria-label={name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="wardrobe__footer">
        <button type="button" className="wardrobe__secondary" onClick={randomize}>
          🎲 Aleatório
        </button>
        <button type="button" className="wardrobe__primary" onClick={() => setOpen(false)}>
          Pronto
        </button>
      </footer>
    </section>
  )
}
