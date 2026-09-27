import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from './state/store'
import { useKeyboard } from './state/useKeyboard'
import { startMultiplayer } from './net/multiplayer'
import { EmoteBar } from './ui/EmoteBar'
import { Hint } from './ui/Hint'
import { Joystick } from './ui/Joystick'
import { Loading } from './ui/Loading'
import { Panel } from './ui/Panel'
import { SimpleView } from './ui/SimpleView'
import { SERVICES, STORY } from './content'
import {
  DEFAULT_SERVICES_CENTER,
  layoutHouses,
  layoutServices,
  layoutStory,
  resolveLandmarks,
  type Poi,
} from './world/layout'
import { Scene } from './world/Scene'

export function App() {
  const world = useStore((s) => s.world)
  const simpleView = useStore((s) => s.simpleView)
  const aikaLine = useStore((s) => s.aikaLine)
  const toggleSimpleView = useStore((s) => s.toggleSimpleView)
  const loadWorld = useStore((s) => s.loadWorld)
  const [sceneReady, setSceneReady] = useState(false)
  const onReady = useCallback(() => setSceneReady(true), [])

  useEffect(() => {
    void loadWorld()
    startMultiplayer()
  }, [loadWorld])
  useKeyboard()

  const markers = useStore((s) => s.markers)
  const landmarks = useMemo(() => resolveLandmarks(markers), [markers])
  const story = useMemo(() => layoutStory(STORY, markers), [markers])
  const services = useMemo(
    () => layoutServices(SERVICES, markers?.servicos ?? DEFAULT_SERVICES_CENTER),
    [markers],
  )
  const houses = useMemo(
    () => layoutHouses(world, landmarks, story, services, markers?.vila ?? null),
    [world, landmarks, story, services, markers],
  )
  const pois = useMemo<Poi[]>(
    () => [...landmarks, ...services, ...story, ...houses],
    [landmarks, services, story, houses],
  )

  return (
    <>
      <div className="canvas-wrap" aria-hidden={simpleView}>
        {world && (
          <Canvas
            dpr={[1, 2]}
            camera={{ fov: 55, near: 0.1, far: 200, position: [0, 30, -10] }}
            frameloop={simpleView ? 'never' : 'always'}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <Scene
                landmarks={landmarks}
                story={story}
                services={services}
                houses={houses}
                pois={pois}
                onReady={onReady}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      {!simpleView && (
        <>
          <header className="hud">
            <h1 className="hud__title">Planeta do Felipe</h1>
            <p className="hud__help">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> andar · <kbd>Shift</kbd> correr · <kbd>Espaço</kbd> pular · <kbd>E</kbd>{' '}
              interagir · <kbd>1</kbd>–<kbd>4</kbd> emotes
            </p>
          </header>
          <p className="sr-only" aria-live="polite">
            {aikaLine ? `Aika: ${aikaLine.text}` : ''}
          </p>
          <Hint pois={pois} />
          <EmoteBar />
          <Panel pois={pois} />
          <Joystick />
        </>
      )}

      {simpleView && <SimpleView houses={houses} />}

      <button
        type="button"
        className="simple-toggle"
        onClick={toggleSimpleView}
        aria-pressed={simpleView}
      >
        {simpleView ? 'Versão 3D' : 'Versão simples'}
      </button>

      <Loading ready={sceneReady || simpleView} />
    </>
  )
}
