import { DataTexture, NearestFilter, RedFormat } from 'three'

/** Gradiente de 3 tons para o visual cartoon (MeshToonMaterial). */
function makeGradient(): DataTexture {
  const data = new Uint8Array([90, 170, 255])
  const tex = new DataTexture(data, data.length, 1, RedFormat)
  tex.minFilter = NearestFilter
  tex.magFilter = NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}

export const toonGradient = makeGradient()

interface ToonProps {
  color: string
  emissive?: string
  emissiveIntensity?: number
  vertexColors?: boolean
}

export function Toon({ color, emissive, emissiveIntensity, vertexColors }: ToonProps) {
  return (
    <meshToonMaterial
      color={color}
      gradientMap={toonGradient}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissiveIntensity ?? 1}
      vertexColors={vertexColors ?? false}
    />
  )
}
