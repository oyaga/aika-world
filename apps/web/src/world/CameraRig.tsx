import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { playerState } from '../state/player'

const OFFSET = new Vector3(0, 6.5, -10) // atrás (-Z) e acima (+Y) no referencial local
const LOOK_AHEAD = new Vector3(0, 1.2, 4)

const desiredPos = new Vector3()
const lookAt = new Vector3()
const up = new Vector3()
const m = new Matrix4()
const desiredQuat = new Quaternion()

/** Câmera em terceira pessoa que segue a Aika suavemente no referencial local dela. */
export function CameraRig() {
  const initialized = useRef(false)

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const q = playerState.orientation
    desiredPos.copy(OFFSET).applyQuaternion(q).add(playerState.position)
    lookAt.copy(LOOK_AHEAD).applyQuaternion(q).add(playerState.position)
    up.set(0, 1, 0).applyQuaternion(q)

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
