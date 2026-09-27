import { Quaternion, Vector3 } from 'three'

/**
 * Estado mutável da Aika, compartilhado entre Player, CameraRig e proximidade.
 * `orientation` é a única fonte de verdade: a posição é derivada dela.
 */
export const playerState = {
  orientation: new Quaternion(),
  position: new Vector3(0, 20, 0),
  /** 0..1 — quão rápido está andando (para a animação). */
  speed: 0,
}
