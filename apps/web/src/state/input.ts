/**
 * Estado de entrada mutável (fora do React para não re-renderizar a cada frame).
 * Teclado e joystick escrevem aqui; o Player lê em useFrame.
 */
export const input = {
  /** -1 (trás) .. 1 (frente) vindo do teclado */
  keyForward: 0,
  /** -1 (direita) .. 1 (esquerda) vindo do teclado */
  keyTurn: 0,
  /** Joystick virtual: x -1..1 (direita positiva), y -1..1 (frente positiva) */
  joyX: 0,
  joyY: 0,
  /** Shift segurado. */
  keyRun: false,
  /** Pulo pedido (Espaço ou botão); consumido pelo Player no próximo frame. */
  jumpQueued: false,
}

export function readAxes(): { forward: number; turn: number; run: boolean } {
  const forward = Math.max(-1, Math.min(1, input.keyForward + input.joyY))
  const turn = Math.max(-1, Math.min(1, input.keyTurn - input.joyX))
  // No celular, empurrar o joystick até a borda também corre.
  const run = input.keyRun || Math.hypot(input.joyX, input.joyY) > 0.92
  return { forward, turn, run }
}

/** Devolve true uma vez por pulo pedido. */
export function consumeJump(): boolean {
  const queued = input.jumpQueued
  input.jumpQueued = false
  return queued
}
