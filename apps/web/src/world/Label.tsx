import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'
import { PLANET_RADIUS } from '../lib/sphere'

interface LabelProps {
  /** Posição no mundo (sobre a superfície). */
  position: Vector3
  text: string
  muted?: boolean
}

const dir = new Vector3()

/** True se o segmento câmera→ponto atravessa o planeta (raio `r`, centro na origem). */
function occludedByPlanet(cam: Vector3, target: Vector3, r: number): boolean {
  dir.copy(target).sub(cam)
  const a = dir.dot(dir)
  const b = 2 * cam.dot(dir)
  const c = cam.dot(cam) - r * r
  const disc = b * b - 4 * a * c
  if (disc <= 0) return false
  const sq = Math.sqrt(disc)
  const t1 = (-b - sq) / (2 * a)
  const t2 = (-b + sq) / (2 * a)
  return (t1 > 0 && t1 < 1) || (t2 > 0 && t2 < 1)
}

/**
 * Rótulo HTML flutuante. Some quando está do outro lado do planeta
 * (interseção analítica segmento–esfera, sem raycast na malha).
 */
export function Label({ position, text, muted }: LabelProps) {
  const ref = useRef<HTMLDivElement>(null)
  useFrame(({ camera }) => {
    const el = ref.current
    if (!el) return
    const dist = camera.position.distanceTo(position)
    const visible = dist < 34 && !occludedByPlanet(camera.position, position, PLANET_RADIUS)
    el.style.opacity = visible ? String(Math.min(1, (34 - dist) / 8)) : '0'
  })
  return (
    <Html position={position} center zIndexRange={[10, 0]} pointerEvents="none">
      <div ref={ref} className={muted ? 'label label--muted' : 'label'}>
        {text}
      </div>
    </Html>
  )
}
