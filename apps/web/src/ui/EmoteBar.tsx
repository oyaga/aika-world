import { EMOTES } from '@aika-world/shared'
import { multiplayerEnabled, sendEmote } from '../net/multiplayer'
import { useStore } from '../state/store'

/** Emotes (teclas 1–4) e quantos visitantes estão no planeta agora. */
export function EmoteBar() {
  const net = useStore((s) => s.net)
  const others = useStore((s) => s.remoteIds.length)
  return (
    <div className="emote-bar">
      {multiplayerEnabled && (
        <p className="online" role="status">
          <span className={`online__dot online__dot--${net.status}`} aria-hidden="true" />
          {net.status === 'online'
            ? others === 0
              ? 'Só você no planeta'
              : `${others + 1} viajantes no planeta`
            : net.status === 'connecting'
              ? 'Conectando…'
              : 'Offline'}
        </p>
      )}
      <div className="emote-bar__buttons" role="group" aria-label="Emotes">
        {EMOTES.map((emote, i) => (
          <button
            key={emote}
            type="button"
            onClick={() => sendEmote(emote)}
            aria-label={`Emote ${emote} (tecla ${i + 1})`}
            title={`Tecla ${i + 1}`}
          >
            {emote}
          </button>
        ))}
      </div>
    </div>
  )
}
