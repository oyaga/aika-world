import type { RepoHouse } from '@aika-world/shared'
import { languageColor } from '../world/layout'

const dateFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })

function formatDate(iso: string): string {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? dateFmt.format(t) : '—'
}

export function RepoDetails({ house }: { house: RepoHouse }) {
  const lang = house.language ?? 'Sem linguagem'
  return (
    <>
      {house.secret ? (
        <p>
          Esta casa guarda um projeto privado. As portas estão trancadas 🔒 — mas dá pra ver que
          alguém trabalha aqui.
        </p>
      ) : (
        <p>{house.description ?? 'Sem descrição (ainda).'}</p>
      )}
      <dl className="meta">
        <dt>Linguagem</dt>
        <dd>
          <span className="dot" style={{ background: languageColor(house.language) }} /> {lang}
        </dd>
        <dt>Estrelas</dt>
        <dd>★ {house.stars}</dd>
        <dt>Última atividade</dt>
        <dd>{formatDate(house.pushedAt)}</dd>
      </dl>
      {!house.secret && (
        <p>
          <a href={house.url} target="_blank" rel="noreferrer">
            Ver no GitHub →
          </a>
        </p>
      )}
    </>
  )
}
