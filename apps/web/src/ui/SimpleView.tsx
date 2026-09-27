import { useEffect, useRef } from 'react'
import { SECTIONS, STORY } from '../content'
import { useStore } from '../state/store'
import { LANDMARKS, type HousePoi } from '../world/layout'
import { RepoDetails } from './RepoDetails'

/** Versão 2D acessível com todas as seções e repositórios. */
export function SimpleView({ houses }: { houses: HousePoi[] }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const toggle = useStore((s) => s.toggleSimpleView)
  useEffect(() => heading.current?.focus(), [])

  return (
    <main className="simple" aria-labelledby="simple-title">
      <div className="simple__inner">
        <h1 id="simple-title" ref={heading} tabIndex={-1}>
          Planeta do Felipe — versão simples
        </h1>
        <p>
          Todo o conteúdo do planeta em uma lista.{' '}
          <button type="button" className="link-button" onClick={toggle}>
            Voltar ao planeta 3D
          </button>
        </p>
        {LANDMARKS.map((l) => (
          <section key={l.id} aria-labelledby={`s-${l.id}`}>
            <h2 id={`s-${l.id}`}>{SECTIONS[l.id].title}</h2>
            {SECTIONS[l.id].body}
          </section>
        ))}
        <section aria-labelledby="s-historia">
          <h2 id="s-historia">Minha história</h2>
          <ol className="timeline">
            {STORY.map((m) => (
              <li key={`${m.when}-${m.title}`}>
                <span className="story__when">{m.when}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="s-repos">
          <h2 id="s-repos">Projetos</h2>
          <ul className="simple__repos">
            {houses.map((h) => (
              <li key={h.id}>
                <h3>{h.house.secret ? 'Projeto secreto 🔒' : h.house.name}</h3>
                <RepoDetails house={h.house} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
