import { Component, type ReactNode, Suspense, useEffect, useMemo } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'
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
  useEffect(() => {
    const action = animation ? actions[animation] : undefined
    action?.reset().play()
    return () => {
      action?.stop()
    }
  }, [actions, animation])
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
  /** Ação do .glb tocada em loop, se existir (ex.: `Idle` dos NPCs). */
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
