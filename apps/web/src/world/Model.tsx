import { Component, type ReactNode, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Object3D } from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { type ModelName, modelUrl } from '../lib/models'
import { toonify } from './materials'

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
export function useModelClone(url: string, tint?: string): Object3D {
  const { scene } = useGLTF(url)
  return useMemo(() => toonify(cloneSkinned(scene), tint), [scene, tint])
}

type Scale = [number, number, number]

function Glb({ url, tint, scale }: { url: string; tint?: string; scale?: Scale }) {
  const object = useModelClone(url, tint)
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
}

export function Model({ name, fallback, tint, scale }: ModelProps) {
  const url = modelUrl(name)
  if (!url) return <>{fallback}</>
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <Glb url={url} tint={tint} scale={scale} />
      </Suspense>
    </ModelBoundary>
  )
}
