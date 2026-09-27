import { Quaternion, Vector3 } from 'three'
import type { MoveState } from '../world/locomotion'

/**
 * Estado mutável do visitante, compartilhado entre Player, CameraRig, NPCs e proximidade.
 * `orientation` é a única fonte de verdade: a posição é derivada dela.
 */
export const playerState = {
  orientation: new Quaternion(),
  position: new Vector3(0, 20, 0),
  /** Distância do centro até os pés (chão, água ou no ar). 0 = ainda não calculada. */
  radius: 0,
  /** Velocidade radial (pulo/queda). */
  vy: 0,
  state: 'ground' as MoveState,
  /** Velocidade para a animação: 1 = andando, ~1,75 = correndo. */
  speed: 0,
  /** Momento (performance.now) do último pulo, para a Aika pular junto. */
  jumpedAt: 0,
}

/**
 * Estado mutável da Aika, a guia que segue o visitante. Diferente do
 * visitante, ela é movida por "seguir" (não pela entrada): `dir` é a direção
 * na esfera e `orientation` vem dela + para onde ela olha.
 */
export const aikaState = {
  dir: new Vector3(0, 1, 0),
  orientation: new Quaternion(),
  position: new Vector3(0, 20, 0),
  radius: 0,
  vy: 0,
  state: 'ground' as MoveState,
  speed: 0,
  /** Último pulo do visitante que a Aika já imitou. */
  copiedJump: 0,
  /** false até o primeiro frame, quando ela aparece ao lado do visitante. */
  placed: false,
}
