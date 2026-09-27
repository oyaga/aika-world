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
}

export function readAxes(): { forward: number; turn: number } {
  const forward = Math.max(-1, Math.min(1, input.keyForward + input.joyY))
  const turn = Math.max(-1, Math.min(1, input.keyTurn - input.joyX))
  return { forward, turn }
}
