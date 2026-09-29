import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { isTouchDevice } from '../lib/device'
import { useStore } from '../state/store'

const touch = isTouchDevice()

/**
 * Boas-vindas no início: uma frase sobre o planeta e como andar, correr,
 * pular e interagir. Aparece quando o carregamento termina; o visitante fica
 * parado até fechar (botão, Enter, Espaço ou Esc — ver useKeyboard).
 */
export function Welcome({ ready }: { ready: boolean }) {
  const open = useStore((s) => s.welcomeOpen)
  const close = useStore((s) => s.closeWelcome)
  const { active } = useProgress()
  // Uma vez na tela, fica até fechar (modelos que carregam depois não a escondem).
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open && ready && !active) setShown(true)
  }, [open, ready, active])
  const visible = open && shown
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (visible) button.current?.focus()
  }, [visible])

  if (!visible) return null
  return (
    <div className="panel-backdrop welcome-backdrop">
      <section
        className="panel welcome"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        <div className="panel__header">
          <h2 id="welcome-title">Bem-vindo ao Planeta do Felipe!</h2>
        </div>
        <div className="panel__body">
          <p>
            Um mini planeta onde cada casinha é um projeto do Felipe. A <strong>Aika</strong>, a
            huskyzinha de moletom laranja, vai te acompanhar pelo caminho.
          </p>
          {touch ? (
            <ul className="welcome__keys">
              <li>
                <span className="welcome__key">🕹️</span> Joystick: andar
              </li>
              <li>
                <span className="welcome__key">Correr</span> liga e desliga a corrida
              </li>
              <li>
                <span className="welcome__key">Pular</span> pula (e sai da água)
              </li>
              <li>
                <span className="welcome__key">Interagir</span> conversa com quem estiver perto
              </li>
            </ul>
          ) : (
            <ul className="welcome__keys">
              <li>
                <span>
                  <kbd>W</kbd>
                  <kbd>A</kbd>
                  <kbd>S</kbd>
                  <kbd>D</kbd>
                </span>{' '}
                andar (ou as setas)
              </li>
              <li>
                <kbd>Shift</kbd> segurar para correr
              </li>
              <li>
                <kbd>Espaço</kbd> pular (e sair da água)
              </li>
              <li>
                <kbd>E</kbd> conversar com quem estiver perto
              </li>
              <li>
                <kbd>1</kbd>–<kbd>4</kbd> emotes
              </li>
              <li>
                <span className="welcome__key">🖱️ Mouse</span> arraste para girar a câmera e use a
                rolagem para o zoom
              </li>
            </ul>
          )}
          <p className="welcome__tip">
            Dica: suba a escadaria até o templo para conhecer o Felipe, e troque de roupa no botão
            👕 Visual.
          </p>
        </div>
        <div className="welcome__actions">
          <button ref={button} type="button" className="welcome__start" onClick={close}>
            Vamos lá!
          </button>
        </div>
      </section>
    </div>
  )
}
