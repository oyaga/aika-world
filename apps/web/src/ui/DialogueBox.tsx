import { useEffect, useRef, useState } from 'react'
import { BACK_CHOICES, type Dialogue, type DialogueChoice } from '../dialogues'
import { useStore } from '../state/store'

const CHARS_PER_SECOND = 45

/**
 * Caixa de conversa estilo RPG. E / Espaço / Enter / clique avançam (ou
 * completam a fala que está sendo digitada); 1–9 escolhem uma opção; Esc fecha.
 */
export function DialogueBox({ dialogue }: { dialogue: Dialogue }) {
  const close = useStore((s) => s.close)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const [nodeId, setNodeId] = useState('inicio')
  const [lineIndex, setLineIndex] = useState(0)
  const [typed, setTyped] = useState(0)
  const firstChoice = useRef<HTMLElement | null>(null)

  const node = dialogue.nodes[nodeId] ?? dialogue.nodes.inicio
  const line = node.lines[lineIndex] ?? ''
  const lineDone = reducedMotion || typed >= line.length
  const lastLine = lineIndex >= node.lines.length - 1
  const choices: DialogueChoice[] | null =
    lineDone && lastLine ? (node.choices ?? BACK_CHOICES) : null

  // Efeito de máquina de escrever.
  useEffect(() => {
    if (lineDone) return
    const id = window.setInterval(
      () => setTyped((t) => Math.min(line.length, t + 1)),
      1000 / CHARS_PER_SECOND,
    )
    return () => window.clearInterval(id)
  }, [line, lineDone])

  useEffect(() => {
    if (choices) firstChoice.current?.focus()
  }, [choices])

  const goTo = (next: string) => {
    setNodeId(next)
    setLineIndex(0)
    setTyped(0)
  }

  const choose = (choice: DialogueChoice) => {
    if (choice.href) window.open(choice.href, '_blank', 'noopener,noreferrer')
    else if (choice.next) goTo(choice.next)
    else close()
  }

  const advance = () => {
    if (!lineDone) setTyped(line.length)
    else if (!lastLine) {
      setLineIndex((i) => i + 1)
      setTyped(0)
    }
  }

  // Captura antes do atalho global (onde E fecharia o painel).
  const handlers = useRef({ advance, choose, choices })
  handlers.current = { advance, choose, choices }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') return
      const { advance, choose, choices } = handlers.current
      const onButton = e.target instanceof HTMLElement && e.target.closest('button, a')
      if (e.code === 'KeyE' || (!onButton && (e.code === 'Space' || e.code === 'Enter'))) {
        e.preventDefault()
        e.stopPropagation()
        if (!e.repeat) advance()
        return
      }
      const digit = /^Digit([1-9])$/.exec(e.code)?.[1]
      const picked = digit && choices?.[Number(digit) - 1]
      if (picked) {
        e.preventDefault()
        e.stopPropagation()
        choose(picked)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  return (
    <div className="dialogue-wrap">
      <section
        className="dialogue"
        role="dialog"
        aria-modal="true"
        aria-label={`Conversa com ${dialogue.speaker}`}
        onClick={advance}
      >
        <header className="dialogue__speaker">
          <strong>{dialogue.speaker}</strong>
          <span>{dialogue.role}</span>
        </header>
        <p className="dialogue__text">
          <span aria-hidden="true">{reducedMotion ? line : line.slice(0, typed)}</span>
          <span className="sr-only" aria-live="polite">
            {line}
          </span>
          {lineDone && !lastLine && (
            <span className="dialogue__next" aria-hidden="true">
              ▼
            </span>
          )}
        </p>
        {choices && (
          <ol className="dialogue__choices" onClick={(e) => e.stopPropagation()}>
            {choices.map((c, i) => (
              <li key={c.label}>
                {c.href ? (
                  <a
                    ref={i === 0 ? (el) => void (firstChoice.current = el) : undefined}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <kbd>{i + 1}</kbd> {c.label} ↗
                  </a>
                ) : (
                  <button
                    ref={i === 0 ? (el) => void (firstChoice.current = el) : undefined}
                    type="button"
                    onClick={() => choose(c)}
                  >
                    <kbd>{i + 1}</kbd> {c.label}
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
        <footer className="dialogue__help">
          {choices ? (
            <>
              <kbd>1</kbd>–<kbd>{choices.length}</kbd> escolher
            </>
          ) : (
            <>
              <kbd>E</kbd> avançar
            </>
          )}{' '}
          · <kbd>Esc</kbd> sair
        </footer>
      </section>
    </div>
  )
}
