import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from './state/store'
import { useKeyboard } from './state/useKeyboard'
import { Hint } from './ui/Hint'
import { Joystick } from './ui/Joystick'
import { Loading } from './ui/Loading'
import { Panel } from './ui/Panel'
import { SimpleView } from './ui/SimpleView'
import { STORY } from './content'
import { layoutHouses, layoutStory, resolveLandmarks, type Poi } from './world/layout'
import { Scene } from './world/Scene'

export function App() {
  const world = useStore((s) => s.world)
  const simpleView = useStore((s) => s.simpleView)
  const toggleSimpleView = useStore((s) => s.toggleSimpleView)
  const loadWorld = useStore((s) => s.loadWorld)
  const [sceneReady, setSceneReady] = useState(false)
  const onReady = useCallback(() => setSceneReady(true), [])

  useEffect(() => {
    void loadWorld()
  }, [loadWorld])
  useKeyboard()

  const markers = useStore((s) => s.markers)
  const landmarks = useMemo(() => resolveLandmarks(markers), [markers])
  const story = useMemo(() => layoutStory(STORY, markers), [markers])
  const houses = useMemo(
    () => layoutHouses(world, landmarks, story, markers?.vila ?? null),
    [world, landmarks, story, markers],
  )
  const pois = useMemo<Poi[]>(() => [...landmarks, ...story, ...houses], [landmarks, story, houses])

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
              <kbd>D</kbd> para andar · <kbd>E</kbd> para interagir
            </p>
          </header>
          <Hint pois={pois} />
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
