import { useEffect, useRef } from 'react'
import { SECTIONS } from '../content'
import { useStore } from '../state/store'
import { poiTitle, type Poi } from '../world/layout'
import { dialogueFor } from '../dialogues'
import { DialogueBox } from './DialogueBox'
import { RepoDetails } from './RepoDetails'

/** Painel HTML (fora do canvas) com o conteúdo do ponto de interesse aberto. */
export function Panel({ pois }: { pois: Poi[] }) {
  const openPoi = useStore((s) => s.openPoi)
  const close = useStore((s) => s.close)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const poi = pois.find((p) => p.id === openPoi)
  const dialogue = poi ? dialogueFor(poi) : null

  useEffect(() => {
    if (poi && !dialogue) closeBtn.current?.focus()
  }, [poi, dialogue])

  if (!poi) return null
  if (dialogue) return <DialogueBox key={poi.id} dialogue={dialogue} />
  const title = poi.kind === 'landmark' ? SECTIONS[poi.id].title : poiTitle(poi)

  return (
    <div className="panel-backdrop" onClick={close}>
      <section
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel__header">
          <h2 id="panel-title">{title}</h2>
          <button
            ref={closeBtn}
            type="button"
            className="panel__close"
            onClick={close}
            aria-label="Fechar (Esc)"
          >
            ✕
          </button>
        </header>
        <div className="panel__body">
          {poi.kind === 'landmark' && SECTIONS[poi.id].body}
          {poi.kind === 'house' && <RepoDetails house={poi.house} />}
        </div>
        <footer className="panel__footer">
          <kbd>Esc</kbd> para fechar
        </footer>
      </section>
    </div>
  )
}
