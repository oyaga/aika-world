import { useStore } from '../state/store'
import { poiTitle, type Poi } from '../world/layout'

export function Hint({ pois }: { pois: Poi[] }) {
  const nearPoi = useStore((s) => s.nearPoi)
  const openPoi = useStore((s) => s.openPoi)
  const open = useStore((s) => s.open)
  const poi = pois.find((p) => p.id === nearPoi)
  if (!poi || openPoi) return null
  return (
    <div className="hint" role="status" aria-live="polite">
      <span className="hint__title">{poiTitle(poi)}</span>
      <button type="button" className="hint__button" onClick={() => open(poi.id)}>
        <kbd>E</kbd>
        <span className="hint__desktop">Pressione E</span>
        <span className="hint__touch">Toque para abrir</span>
      </button>
    </div>
  )
}
