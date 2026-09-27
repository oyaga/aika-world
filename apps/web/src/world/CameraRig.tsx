import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Matrix4, type PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { fittingLift } from './locomotion'

const OFFSET = new Vector3(0, 6.5, -10) // atrás (-Z) e acima (+Y) no referencial local
const LOOK_AHEAD = new Vector3(0, 1.2, 4)
/** Guarda-roupa aberto: câmera de frente para o visitante, como num provador. */
const FITTING_OFFSET = new Vector3(0, 1.6, 3.8)
const FITTING_LOOK = new Vector3(0, 1.05, 0)
/** Em tela em pé, o painel cobre a parte de baixo: mira abaixo para o personagem subir na tela. */
const FITTING_LOOK_PORTRAIT = new Vector3(0, -0.3, 0)

const desiredPos = new Vector3()
const lookAt = new Vector3()
const up = new Vector3()
const base = new Vector3()
const m = new Matrix4()
const desiredQuat = new Quaternion()

/** Câmera em terceira pessoa que segue o visitante suavemente no referencial local dele. */
export function CameraRig() {
  const initialized = useRef(false)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)

  // Celular em pé: campo de visão mais aberto para a cena não ficar espremida.
  useEffect(() => {
    camera.fov = aspect < 0.8 ? 78 : aspect < 1.2 ? 66 : 55
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const q = playerState.orientation
    const fitting = useStore.getState().wardrobeOpen
    const offset = fitting ? FITTING_OFFSET : OFFSET
    const target = fitting ? (aspect < 0.8 ? FITTING_LOOK_PORTRAIT : FITTING_LOOK) : LOOK_AHEAD
    up.set(0, 1, 0).applyQuaternion(q)
    // Nadando com o guarda-roupa aberto, o visitante sobe para a superfície (ver Player).
    base.copy(playerState.position).addScaledVector(up, fittingLift(playerState.state, fitting))
    desiredPos.copy(offset).applyQuaternion(q).add(base)
    lookAt.copy(target).applyQuaternion(q).add(base)

    m.lookAt(desiredPos, lookAt, up)
    desiredQuat.setFromRotationMatrix(m)

    if (!initialized.current) {
      camera.position.copy(desiredPos)
      camera.quaternion.copy(desiredQuat)
      initialized.current = true
      return
    }
    const k = 1 - Math.exp(-delta * 5)
    camera.position.lerp(desiredPos, k)
    camera.quaternion.slerp(desiredQuat, k)
  })

  return null
}
