import { Component, type ReactNode, Suspense, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { AnimationAction, Object3D } from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { type ModelName, modelUrl, DRACO_PATH } from '../lib/models'
import { type Tint, toonify } from './materials'

interface BoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

/** Se o .glb falhar (404, arquivo corrompido), mostra a forma simples. */
export class ModelBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown) {
    console.warn('[modelos] falha ao carregar, usando a forma simples:', error)
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Cópia independente da cena do glTF, já com materiais cartoon. */
export function useModelClone(url: string, tint?: Tint): Object3D {
  const { scene } = useGLTF(url, DRACO_PATH)
  const tintKey = typeof tint === 'string' || tint === undefined ? tint : JSON.stringify(tint)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `tintKey` representa `tint`
  return useMemo(() => toonify(cloneSkinned(scene), tint), [scene, tintKey])
}

type Scale = [number, number, number]

interface GlbProps {
  url: string
  tint?: string
  scale?: Scale
  animation?: string
}

function Glb({ url, tint, scale, animation }: GlbProps) {
  const object = useModelClone(url, tint)
  const { animations } = useGLTF(url, DRACO_PATH)
  const { actions } = useAnimations(animations, object)
  const current = useRef<AnimationAction | null>(null)
  // Troca de ação com transição (ex.: Idle → Talk ao abrir a conversa).
  useEffect(() => {
    const next = animation ? (actions[animation] ?? actions.Idle ?? null) : null
    const prev = current.current
    if (next === prev) return
    next
      ?.reset()
      .fadeIn(prev ? 0.3 : 0)
      .play()
    prev?.fadeOut(0.3)
    current.current = next
  }, [actions, animation])
  useEffect(
    () => () => {
      current.current?.stop()
      current.current = null
    },
    [actions],
  )
  return <primitive object={object} scale={scale ?? [1, 1, 1]} />
}

interface ModelProps {
  name: ModelName
  /** Forma simples usada enquanto o .glb não existe, carrega ou falha. */
  fallback: ReactNode
  /** Cor aplicada aos materiais cujo nome termina com `@tint`. */
  tint?: string
  /** Escala aplicada só ao .glb (a forma simples já tem o tamanho certo). */
  scale?: Scale
  /** Ação do .glb tocada em loop (sem ela no arquivo, usa `Idle`). Trocar faz transição. */
  animation?: string
}

export function Model({ name, fallback, tint, scale, animation }: ModelProps) {
  const url = modelUrl(name)
  if (!url) return <>{fallback}</>
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Glb url={url} tint={tint} scale={scale} animation={animation} />
      </Suspense>
    </ModelBoundary>
  )
}
