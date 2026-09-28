import {
  BackSide,
  type BufferGeometry,
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
  SkinnedMesh,
  Mesh as ThreeMesh,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Gradiente de 2 tons (luz e sombra, borda dura), como no Messenger. A sombra
 * fica turquesa por causa da luz ambiente (hemisfério) em Atmosphere.
 */
function makeGradient(): DataTexture {
  const data = new Uint8Array([105, 255])
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

/** Multiplicador padrão dos emissivos: acima de 1 eles passam do limiar do bloom. */
export const GLOW = 2.6

/** Materiais emissivos vindos do glTF, para o ciclo dia/noite ajustar o brilho. */
const glowing = new Set<MeshBasicMaterial | MeshToonMaterial>()
let glowNow = GLOW

function applyGlow(m: MeshBasicMaterial | MeshToonMaterial) {
  const base = m.userData.glowBase as Color | number | undefined
  if (base === undefined) return
  if ((m as MeshBasicMaterial).isMeshBasicMaterial)
    m.color.copy(base as Color).multiplyScalar(glowNow)
  else (m as MeshToonMaterial).emissiveIntensity = (base as number) * glowNow
}

/** Brilho atual do neon (Atmosphere chama a cada frame, conforme o dia/noite). */
export function setGlow(k: number) {
  if (Math.abs(k - glowNow) < 0.004) return
  glowNow = k
  for (const m of glowing) applyGlow(m)
}

/**
 * Converte um material vindo do glTF (MeshStandardMaterial) para o visual
 * cartoon. Convenções pelo nome do material no Blender:
 * - termina com `@unlit` → sem luz/sombra (ex.: lâmpadas, neon);
 * - termina com `@tint`  → recebe a cor `tint` (ex.: parede da casa por linguagem).
 * Resultados são reaproveitados entre instâncias.
 */
/**
 * Cor para materiais `@tint`: uma cor para todos, ou uma por nome de material
 * (ex.: `{ 'Cima@tint': '#f00' }`); materiais fora do mapa mantêm a cor do Blender.
 */
export type Tint = string | Record<string, string>

export function toToon(source: Material, tint?: Tint): Material {
  const tintColor = typeof tint === 'string' ? tint : tint?.[source.name]
  const useTint = tintColor !== undefined && source.name.endsWith('@tint')
  const key = `${source.uuid}|${useTint ? tintColor : ''}`
  const cached = toonCache.get(key)
  if (cached) return cached

  const std = source as MeshStandardMaterial
  const common = {
    name: source.name,
    color: useTint ? new Color(tintColor) : (std.color?.clone() ?? new Color('#ffffff')),
    map: std.map ?? null,
    vertexColors: std.vertexColors,
    transparent: std.transparent,
    opacity: std.opacity,
    alphaTest: std.alphaTest,
    side: std.side,
  }
  // Emissivos (neon, lanternas, janelas) passam de 1 para acender o bloom (Effects.tsx).
  let result: MeshBasicMaterial | MeshToonMaterial
  if (source.name.endsWith('@unlit')) {
    result = new MeshBasicMaterial({ ...common })
    result.userData.glowBase = common.color.clone()
    glowing.add(result)
  } else {
    const emissive = std.emissive?.clone() ?? new Color('#000000')
    result = new MeshToonMaterial({
      ...common,
      gradientMap: toonGradient,
      emissive,
      emissiveMap: std.emissiveMap ?? null,
    })
    if (emissive.getHex() !== 0 || std.emissiveMap) {
      result.userData.glowBase = std.emissiveIntensity ?? 1
      glowing.add(result)
    } else {
      result.emissiveIntensity = std.emissiveIntensity ?? 1
    }
  }
  applyGlow(result)
  toonCache.set(key, result)
  return result
}

/** Aplica `toToon` em todos os meshes de `root` (in place) e devolve `root`. */
export function toonify<T extends Object3D>(root: T, tint?: Tint): T {
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => toToon(m, tint))
      : toToon(mesh.material, tint)
  })
  return root
}

/** Cor do contorno de tinta (quase preto arroxeado, nunca preto puro). */
export const INK = '#1e1a24'

const outlineMaterials = new Map<number, MeshBasicMaterial>()

/** Material da casca: só as faces de trás, empurradas para fora pela normal. */
function outlineMaterial(thickness: number): MeshBasicMaterial {
  const cached = outlineMaterials.get(thickness)
  if (cached) return cached
  const material = new MeshBasicMaterial({ color: INK, side: BackSide })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>\n  transformed += normalize(normal) * ${thickness.toFixed(4)};`,
    )
  }
  material.customProgramCacheKey = () => `contorno-${thickness}`
  outlineMaterials.set(thickness, material)
  return material
}

const outlineGeometries = new WeakMap<BufferGeometry, BufferGeometry>()

/**
 * Geometria da casca com normais suavizadas (vértices soldados), para a
 * linha não abrir nas quinas dos modelos low-poly. Mantém o esqueleto.
 */
function outlineGeometry(source: BufferGeometry): BufferGeometry {
  const cached = outlineGeometries.get(source)
  if (cached) return cached
  const geo = source.clone()
  for (const name of Object.keys(geo.attributes)) {
    if (!['position', 'skinIndex', 'skinWeight'].includes(name)) geo.deleteAttribute(name)
  }
  const merged = mergeVertices(geo, 1e-4)
  merged.computeVertexNormals()
  outlineGeometries.set(source, merged)
  return merged
}

const noRaycast = () => {}

/**
 * Contorno de tinta estilo Messenger (direção de arte v2): cada malha ganha
 * uma "casca" escura um pouco maior, desenhada pelo avesso. Não vale para
 * emissivos (`@unlit`) nem transparentes (água). As cascas não entram em
 * raycast (chão, barreiras) e seguem a visibilidade da peça (guarda-roupa).
 */
export function addOutlines<T extends Object3D>(root: T, thickness: number): T {
  const targets: Mesh[] = []
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh || mesh.userData.contorno) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    if (materials.every((m) => (m as MeshBasicMaterial).isMeshBasicMaterial || m.transparent))
      return
    targets.push(mesh)
  })
  const material = outlineMaterial(thickness)
  for (const mesh of targets) {
    const geo = outlineGeometry(mesh.geometry)
    const skinned = mesh as unknown as SkinnedMesh
    let outline: Mesh
    if (skinned.isSkinnedMesh) {
      const s = new SkinnedMesh(geo, material)
      s.bind(skinned.skeleton, skinned.bindMatrix)
      outline = s
    } else {
      outline = new ThreeMesh(geo, material)
    }
    outline.userData.contorno = true
    outline.raycast = noRaycast
    outline.frustumCulled = mesh.frustumCulled
    mesh.add(outline)
  }
  return root
}
