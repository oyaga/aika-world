import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Matrix4, type PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { playerState } from '../state/player'
import { useStore } from '../state/store'
import { fittingLift } from './locomotion'

/** Posição padrão: atrás (-Z) e acima (+Y) do visitante, no referencial dele. */
const BASE_DISTANCE = Math.hypot(6.5, 10)
const BASE_ELEVATION = Math.atan2(6.5, 10)
const LOOK_HEIGHT = 1.2
const LOOK_AHEAD = 4
/** Guarda-roupa aberto: câmera de frente para o visitante, como num provador. */
const FITTING_OFFSET = new Vector3(0, 1.6, 3.8)
const FITTING_LOOK = new Vector3(0, 1.05, 0)
/** Em tela em pé, o painel cobre a parte de baixo: mira abaixo para o personagem subir na tela. */
const FITTING_LOOK_PORTRAIT = new Vector3(0, -0.3, 0)

/** Limites do mouse: zoom (multiplica a distância) e inclinação (rad). */
const ZOOM_MIN = 0.45
const ZOOM_MAX = 2.2
const ELEVATION_MIN = 0.12
const ELEVATION_MAX = 1.35
/** Andando sem arrastar, o giro volta aos poucos para trás do visitante (1/s). */
const YAW_RECENTER = 1.6

/**
 * Controle da câmera pelo mouse: rolagem aproxima/afasta, arrastar com
 * qualquer botão gira em volta do visitante e muda a inclinação.
 */
const orbit = { zoom: 1, yaw: 0, pitch: 0, dragging: false }

const desiredPos = new Vector3()
const lookAt = new Vector3()
const offset = new Vector3()
const up = new Vector3()
const base = new Vector3()
const m = new Matrix4()
const desiredQuat = new Quaternion()

/** Câmera em terceira pessoa que segue o visitante suavemente no referencial local dele. */
export function CameraRig() {
  const initialized = useRef(false)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)
  const canvas = useThree((s) => s.gl.domElement)

  // Celular em pé: campo de visão mais aberto para a cena não ficar espremida.
  useEffect(() => {
    camera.fov = aspect < 0.8 ? 78 : aspect < 1.2 ? 66 : 55
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  // Mouse: rolagem = zoom; arrastar = girar/inclinar. Toque fica com o joystick.
  useEffect(() => {
    let lastX = 0
    let lastY = 0
    const onWheel = (e: WheelEvent) => {
      if (useStore.getState().wardrobeOpen) return
      e.preventDefault()
      orbit.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, orbit.zoom * Math.exp(e.deltaY * 0.0012)))
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || useStore.getState().wardrobeOpen) return
      orbit.dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!orbit.dragging) return
      orbit.yaw -= (e.clientX - lastX) * 0.006
      orbit.pitch += (e.clientY - lastY) * 0.005
      orbit.pitch = Math.min(
        ELEVATION_MAX - BASE_ELEVATION,
        Math.max(ELEVATION_MIN - BASE_ELEVATION, orbit.pitch),
      )
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      if (!orbit.dragging) return
      orbit.dragging = false
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    }
    const onContext = (e: MouseEvent) => e.preventDefault()
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('contextmenu', onContext)
    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('contextmenu', onContext)
    }
  }, [canvas])

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const q = playerState.orientation
    const fitting = useStore.getState().wardrobeOpen
    up.set(0, 1, 0).applyQuaternion(q)
    // Nadando com o guarda-roupa aberto, o visitante sobe para a superfície (ver Player).
    base.copy(playerState.position).addScaledVector(up, fittingLift(playerState.state, fitting))

    if (fitting) {
      offset.copy(FITTING_OFFSET)
      lookAt.copy(aspect < 0.8 ? FITTING_LOOK_PORTRAIT : FITTING_LOOK)
    } else {
      if (!orbit.dragging && playerState.speed > 0.1) {
        orbit.yaw *= Math.exp(-delta * YAW_RECENTER)
      }
      const dist = BASE_DISTANCE * orbit.zoom
      const elev = BASE_ELEVATION + orbit.pitch
      const h = dist * Math.cos(elev)
      offset.set(-Math.sin(orbit.yaw) * h, dist * Math.sin(elev), -Math.cos(orbit.yaw) * h)
      const ahead = LOOK_AHEAD * Math.min(1, orbit.zoom)
      lookAt.set(Math.sin(orbit.yaw) * ahead, LOOK_HEIGHT, Math.cos(orbit.yaw) * ahead)
    }
    desiredPos.copy(offset).applyQuaternion(q).add(base)
    lookAt.applyQuaternion(q).add(base)

    m.lookAt(desiredPos, lookAt, up)
    desiredQuat.setFromRotationMatrix(m)

    if (!initialized.current) {
      camera.position.copy(desiredPos)
      camera.quaternion.copy(desiredQuat)
      initialized.current = true
      return
    }
    const k = 1 - Math.exp(-delta * (orbit.dragging ? 14 : 5))
    camera.position.lerp(desiredPos, k)
    camera.quaternion.slerp(desiredQuat, k)
  })

  return null
}
