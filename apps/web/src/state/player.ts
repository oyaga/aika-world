import { Quaternion, Vector3 } from 'three'

/**
 * Estado mutável do visitante, compartilhado entre Player, CameraRig, NPCs e proximidade.
 * `orientation` é a única fonte de verdade: a posição é derivada dela.
 */
export const playerState = {
  orientation: new Quaternion(),
  position: new Vector3(0, 20, 0),
  /** Distância do centro até os pés (altura do terreno, suavizada). 0 = ainda não calculada. */
  radius: 0,
  /** 0..1 — quão rápido está andando (para a animação). */
  speed: 0,
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
  speed: 0,
  /** false até o primeiro frame, quando ela aparece ao lado do visitante. */
  placed: false,
}
