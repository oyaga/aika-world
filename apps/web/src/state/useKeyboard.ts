import { useEffect } from 'react'
import { EMOTES } from '@aika-world/shared'
import { sendEmote } from '../net/multiplayer'
import { input } from './input'
import { useStore } from './store'

const FORWARD = new Set(['KeyW', 'ArrowUp'])
const BACK = new Set(['KeyS', 'ArrowDown'])
const LEFT = new Set(['KeyA', 'ArrowLeft'])
const RIGHT = new Set(['KeyD', 'ArrowRight'])

/** Teclado: WASD/setas para andar, E para interagir, 1–4 emotes, Esc para fechar. */
export function useKeyboard() {
  useEffect(() => {
    const pressed = new Set<string>()
    const sync = () => {
      const has = (s: Set<string>) => [...s].some((k) => pressed.has(k))
      input.keyForward = (has(FORWARD) ? 1 : 0) - (has(BACK) ? 1 : 0)
      input.keyTurn = (has(LEFT) ? 1 : 0) - (has(RIGHT) ? 1 : 0)
    }
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

    const onDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      const store = useStore.getState()
      if (e.code === 'Escape') {
        if (store.openPoi) store.close()
        else if (store.simpleView) store.toggleSimpleView()
        return
      }
      if (store.simpleView) return
      const digit = /^Digit([1-9])$/.exec(e.code)?.[1]
      const emote = digit ? EMOTES[Number(digit) - 1] : undefined
      if (emote && !store.openPoi && !e.repeat) {
        sendEmote(emote)
        return
      }
      if (e.code === 'KeyE' && !e.repeat) {
        if (store.openPoi) store.close()
        else if (store.nearPoi) store.open(store.nearPoi)
        return
      }
      if (FORWARD.has(e.code) || BACK.has(e.code) || LEFT.has(e.code) || RIGHT.has(e.code)) {
        if (!store.openPoi) e.preventDefault()
        pressed.add(e.code)
        sync()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      pressed.delete(e.code)
      sync()
    }
    const onBlur = () => {
      pressed.clear()
      sync()
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
      onBlur()
    }
  }, [])
}
