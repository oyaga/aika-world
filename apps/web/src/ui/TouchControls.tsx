import { useEffect, useState } from 'react'
import { EMOTES } from '@aika-world/shared'
import { dialogueFor } from '../dialogues'
import { isTouchDevice } from '../lib/device'
import { sendEmote } from '../net/multiplayer'
import { input } from '../state/input'
import { useStore } from '../state/store'
import type { Poi } from '../world/layout'

/**
 * Botões de ação para celular, em arco no canto inferior direito (estilo
 * jogos mobile): Pular (grande), Correr (liga/desliga), Interagir e emotes.
 * O joystick, à esquerda, só anda.
 */
export function TouchControls({ pois }: { pois: Poi[] }) {
  const [touch] = useState(isTouchDevice)
  const [running, setRunning] = useState(false)
  const nearPoi = useStore((s) => s.nearPoi)
  const openPoi = useStore((s) => s.openPoi)
  const open = useStore((s) => s.open)

  useEffect(() => {
    input.runToggle = running
  }, [running])
  useEffect(
    () => () => {
      input.runToggle = false
    },
    [],
  )

  if (!touch || openPoi) return null
  const near = pois.find((p) => p.id === nearPoi)
  const talk = near ? dialogueFor(near) !== null : false

  return (
    <div className="touch-actions" role="group" aria-label="Controles">
      <button
        type="button"
        className="touch-btn touch-btn--jump"
        onPointerDown={(e) => {
          e.preventDefault()
          input.jumpQueued = true
        }}
        aria-label="Pular"
      >
        <span aria-hidden="true">⤒</span>
        <small>Pular</small>
      </button>
      <button
        type="button"
        className={`touch-btn touch-btn--run${running ? ' is-on' : ''}`}
        onClick={() => setRunning((r) => !r)}
        aria-pressed={running}
        aria-label="Modo corrida"
      >
        <span aria-hidden="true">»</span>
        <small>{running ? 'Correndo' : 'Correr'}</small>
      </button>
      <button
        type="button"
        className={`touch-btn touch-btn--use${near ? ' is-ready' : ''}`}
        disabled={!near}
        onClick={() => near && open(near.id)}
        aria-label={near ? `${talk ? 'Conversar' : 'Abrir'}` : 'Nada por perto'}
      >
        <span aria-hidden="true">{talk ? '💬' : '✋'}</span>
        <small>{talk ? 'Falar' : 'Abrir'}</small>
      </button>
      {EMOTES.map((emote, i) => (
        <button
          key={emote}
          type="button"
          className={`touch-btn touch-btn--emote touch-btn--emote-${i}`}
          onClick={() => sendEmote(emote)}
          aria-label={`Emote ${emote}`}
        >
          {emote}
        </button>
      ))}
    </div>
  )
}
