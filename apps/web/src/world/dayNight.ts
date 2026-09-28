import { useFrame } from '@react-three/fiber'

/**
 * Ciclo dia/noite (direção de arte v3). `dayNight.night` vai de 0 (dia) a 1
 * (noite) e é lido a cada frame pelo céu, pelas luzes, pelo neon e pelo bloom.
 *
 * Um ciclo completo dura CYCLE_SECONDS: ~40% de dia, ~40% de noite e as
 * transições (pôr e nascer do sol) no meio. A visita começa no fim da tarde,
 * para o neon acender logo nos primeiros segundos.
 *
 * `?hora=noite` ou `?hora=dia` na URL trava o ciclo (útil para prints e testes).
 */
export const CYCLE_SECONDS = 300
const START_PHASE = 0.27

function forcedFromUrl(): number | null {
  if (typeof window === 'undefined') return null
  const hora = new URLSearchParams(window.location.search).get('hora')
  if (hora === 'noite') return 1
  if (hora === 'dia') return 0
  return null
}

const FORCED = forcedFromUrl()

export const dayNight = {
  /** 0 = dia, 1 = noite. */
  night: FORCED ?? nightFromPhase(START_PHASE),
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Fase 0..1 do ciclo → fator de noite 0..1 (0 = meio-dia, 0,5 = meia-noite). */
export function nightFromPhase(phase: number): number {
  const c = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI)
  return smoothstep(0.35, 0.65, c)
}

/** Avança o relógio do ciclo. Fica uma vez na cena, antes de quem lê `dayNight`. */
export function DayNightClock() {
  useFrame(({ clock }) => {
    if (FORCED !== null) {
      dayNight.night = FORCED
      return
    }
    const phase = (START_PHASE + clock.elapsedTime / CYCLE_SECONDS) % 1
    dayNight.night = nightFromPhase(phase)
  })
  return null
}
