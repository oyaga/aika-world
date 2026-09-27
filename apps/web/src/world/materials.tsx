import {
  Color,
  DataTexture,
  type Material,
  type Mesh,
  MeshBasicMaterial,
  type MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  type Object3D,
  RedFormat,
} from 'three'

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

const toonCache = new Map<string, Material>()

/**
 * Converte um material vindo do glTF (MeshStandardMaterial) para o visual
 * cartoon. Convenções pelo nome do material no Blender:
 * - termina com `@unlit` → sem luz/sombra (ex.: lâmpadas, neon);
 * - termina com `@tint`  → recebe a cor `tint` (ex.: parede da casa por linguagem).
 * Resultados são reaproveitados entre instâncias.
 */
export function toToon(source: Material, tint?: string): Material {
  const useTint = tint !== undefined && source.name.endsWith('@tint')
  const key = `${source.uuid}|${useTint ? tint : ''}`
  const cached = toonCache.get(key)
  if (cached) return cached

  const std = source as MeshStandardMaterial
  const common = {
    name: source.name,
    color: useTint ? new Color(tint) : (std.color?.clone() ?? new Color('#ffffff')),
    map: std.map ?? null,
    vertexColors: std.vertexColors,
    transparent: std.transparent,
    opacity: std.opacity,
    alphaTest: std.alphaTest,
    side: std.side,
  }
  const result: Material = source.name.endsWith('@unlit')
    ? new MeshBasicMaterial(common)
    : new MeshToonMaterial({
        ...common,
        gradientMap: toonGradient,
        emissive: std.emissive?.clone() ?? new Color('#000000'),
        emissiveMap: std.emissiveMap ?? null,
        emissiveIntensity: std.emissiveIntensity ?? 1,
      })
  toonCache.set(key, result)
  return result
}

/** Aplica `toToon` em todos os meshes de `root` (in place) e devolve `root`. */
export function toonify<T extends Object3D>(root: T, tint?: string): T {
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => toToon(m, tint))
      : toToon(mesh.material, tint)
  })
  return root
}
