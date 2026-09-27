import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { input } from '../state/input'

const RADIUS = 48

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
  )
}

/** Joystick virtual (toque) no canto inferior esquerdo. */
export function Joystick() {
  const [visible] = useState(isTouchDevice)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const base = useRef<HTMLDivElement>(null)
  const active = useRef<number | null>(null)

  useEffect(
    () => () => {
      input.joyX = 0
      input.joyY = 0
    },
    [],
  )

  if (!visible) return null

  const update = (e: PointerEvent<HTMLDivElement>) => {
    const rect = base.current?.getBoundingClientRect()
    if (!rect) return
    let dx = e.clientX - (rect.left + rect.width / 2)
    let dy = e.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS
      dy = (dy / len) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    const dead = (v: number) => (Math.abs(v) < 0.15 ? 0 : v)
    input.joyX = dead(dx / RADIUS)
    input.joyY = dead(-dy / RADIUS)
  }

  const reset = () => {
    active.current = null
    setKnob({ x: 0, y: 0 })
    input.joyX = 0
    input.joyY = 0
  }

  return (
    <div
      ref={base}
      className="joystick"
      aria-hidden="true"
      onPointerDown={(e) => {
        active.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e)
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) update(e)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        className="joystick__knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  )
}
