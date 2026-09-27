#!/usr/bin/env node
/**
 * Confere os .glb em apps/web/src/assets/models/ contra a direção de arte
 * (docs/direcao-de-arte-v2.md): nomes, animações, material @tint, triângulos,
 * materiais, tamanho das texturas, altura, Empties do planeta e tamanho total.
 * Sem dependências: lê o GLB na mão.
 *
 *   pnpm models:check            # pasta padrão
 *   pnpm models:check <pasta>    # outra pasta (ex.: antes de copiar os arquivos)
 *
 * Sai com código 1 se houver erro (o deploy para); avisos não bloqueiam.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const DIR = resolve(process.argv[2] ?? 'apps/web/src/assets/models')
const TOTAL_BUDGET = 25 * 1024 * 1024
const DRACO_HINT = 1024 * 1024

/** Regras por arquivo (ver docs/arte.md). height = altura esperada em metros. */
const RULES = {
  aika: { tris: 15000, materials: 6, texture: 2048, actions: ['Idle', 'Walk'], height: [1.2, 3] },
  visitante: {
    tris: 40000,
    dressedTris: 15000,
    materials: 10,
    texture: 2048,
    actions: ['Idle', 'Walk'],
    height: [1.2, 3],
    wardrobe: true,
  },
  felipe: { tris: 12000, materials: 6, texture: 1024, height: [1.2, 3] },
  npc: { tris: 12000, materials: 6, texture: 1024, tint: true, height: [1.2, 3] },
  templo: { tris: 25000, materials: 10, texture: 2048, height: [3, 8] },
  servico: { tris: 8000, materials: 6, texture: 1024, tint: true, height: [2.5, 5.5] },
  correio: { tris: 2500, materials: 3, texture: 512, height: [0.8, 2.2] },
  casa: { tris: 4000, materials: 4, texture: 1024, tint: true, height: [2.2, 4] },
  arvore: { tris: 1500, materials: 3, texture: 512 },
  pedra: { tris: 800, materials: 2, texture: 512 },
  planeta: { tris: 80000, materials: 16, texture: 2048, planet: true },
}

/** Serviços da Praça (slugs de SERVICES em apps/web/src/content.tsx). */
const SERVICE_SLUGS = [
  'ia-assistente',
  'web-designer',
  'servidores',
  'design-grafico',
  'editor-de-video',
  'google',
]
const SERVICE_BUILDING = {
  tris: 10000,
  materials: 6,
  texture: 1024,
  tint: true,
  height: [2.5, 5.5],
}
const SERVICE_NPC = { tris: 12000, materials: 6, texture: 1024, tint: true, height: [1.2, 3] }

/** Regra de um arquivo: nome exato, ou servico_<slug> / npc_<slug>. */
function ruleFor(name) {
  if (RULES[name]) return RULES[name]
  const m = /^(servico|npc)_(.+)$/.exec(name)
  if (!m) return null
  if (!SERVICE_SLUGS.includes(m[2])) {
    warn(`serviço "${m[2]}" desconhecido (válidos: ${SERVICE_SLUGS.join(', ')})`)
    return null
  }
  return m[1] === 'servico' ? SERVICE_BUILDING : SERVICE_NPC
}

const WARDROBE_SLOTS = ['cabelo', 'cima', 'baixo', 'pes', 'acess']
const DEFAULT_OUTFIT = [
  'cabelo_curto',
  'cima_moletom',
  'baixo_calca_larga',
  'pes_tenis_grosso',
  'acess_bolsa_carteiro',
]

const PLANET_EMPTIES = ['poi_templo', 'area_servicos', 'area_vila']

let errors = 0
let warnings = 0
const err = (msg) => {
  errors++
  console.log(`  ✖ ${msg}`)
}
const warn = (msg) => {
  warnings++
  console.log(`  ⚠ ${msg}`)
}
const ok = (msg) => console.log(`  ✓ ${msg}`)

function parseGlb(buf) {
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('não é um arquivo GLB (use glTF Binary)')
  const jsonLen = buf.readUInt32LE(12)
  if (buf.readUInt32LE(16) !== 0x4e4f534a) throw new Error('primeiro chunk não é JSON')
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))
  const binStart = 20 + jsonLen + 8
  json.__bin = buf.subarray(binStart)
  return json
}

/** Largura × altura de uma imagem PNG ou JPEG embutida no GLB (ou null). */
function imageSize(gltf, image) {
  if (image.bufferView === undefined) return null
  const view = gltf.bufferViews[image.bufferView]
  const b = gltf.__bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength)
  if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)]
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i < b.length - 9) {
      if (b[i] !== 0xff) return null
      const marker = b[i + 1]
      const len = b.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]
      }
      i += 2 + len
    }
  }
  return null
}

// --- matemática mínima de matrizes 4x4 (coluna-maior, como no glTF) ---
const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
function multiply(a, b) {
  const o = new Array(16).fill(0)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]
  return o
}
function trs(node) {
  if (node.matrix) return node.matrix
  const [tx, ty, tz] = node.translation ?? [0, 0, 0]
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1]
  const [sx, sy, sz] = node.scale ?? [1, 1, 1]
  // prettier-ignore
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ]
}
const apply = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
]

/** Percorre a cena: triângulos (contando instâncias), caixa envolvente e nomes. */
function analyze(gltf) {
  const scene = gltf.scenes?.[gltf.scene ?? 0]
  const out = {
    tris: 0,
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
    names: [],
    trisByNode: {},
  }
  const visit = (index, parent) => {
    const node = gltf.nodes[index]
    const world = multiply(parent, trs(node))
    if (node.name) out.names.push(node.name)
    if (node.mesh !== undefined) {
      for (const prim of gltf.meshes[node.mesh].primitives) {
        const mode = prim.mode ?? 4
        const count =
          prim.indices !== undefined
            ? gltf.accessors[prim.indices].count
            : gltf.accessors[prim.attributes.POSITION].count
        if (mode === 4) {
          out.tris += count / 3
          const key = (node.name ?? '').toLowerCase()
          out.trisByNode[key] = (out.trisByNode[key] ?? 0) + count / 3
        }
        const pos = gltf.accessors[prim.attributes.POSITION]
        if (pos?.min && pos?.max) {
          for (const cx of [pos.min[0], pos.max[0]])
            for (const cy of [pos.min[1], pos.max[1]])
              for (const cz of [pos.min[2], pos.max[2]]) {
                const p = apply(world, [cx, cy, cz])
                for (let i = 0; i < 3; i++) {
                  out.min[i] = Math.min(out.min[i], p[i])
                  out.max[i] = Math.max(out.max[i], p[i])
                }
              }
        }
      }
    }
    for (const child of node.children ?? []) visit(child, world)
  }
  for (const root of scene?.nodes ?? []) visit(root, identity())
  return out
}

let files = []
try {
  files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.glb'))
} catch {
  console.log(`Pasta não encontrada: ${DIR}`)
  process.exit(1)
}

console.log(`Modelos em ${DIR}\n`)
if (files.length === 0) console.log('Nenhum .glb ainda: o site usa as formas simples.\n')

let total = 0
for (const file of files.sort()) {
  const name = basename(file, '.glb')
  const path = join(DIR, file)
  const size = statSync(path).size
  total += size
  console.log(`${file}  (${(size / 1024).toFixed(0)} KB)`)
  const rule = ruleFor(name)
  if (!rule && !/^(servico|npc)_/.test(name))
    warn(
      `nome desconhecido: o site não vai usar este arquivo (nomes válidos: ${Object.keys(RULES).join(', ')}, servico_<serviço>, npc_<serviço>)`,
    )

  let gltf
  try {
    gltf = parseGlb(readFileSync(path))
  } catch (e) {
    err(`arquivo inválido: ${e.message}`)
    console.log('')
    continue
  }
  const a = analyze(gltf)
  const height = a.max[1] - a.min[1]

  if (rule) {
    if (a.tris > rule.tris) warn(`${Math.round(a.tris)} triângulos (limite ${rule.tris})`)
    else ok(`${Math.round(a.tris)} triângulos (limite ${rule.tris})`)

    if (rule.height && Number.isFinite(height)) {
      const [lo, hi] = rule.height
      if (height < lo || height > hi)
        warn(
          `altura ${height.toFixed(2)} m (esperado ${lo}–${hi} m): confira escala e Apply Transforms`,
        )
      else ok(`altura ${height.toFixed(2)} m`)
      if (Math.abs(a.min[1]) > 0.15)
        warn(`a base está em y = ${a.min[1].toFixed(2)} m: a origem deve ficar nos pés/chão`)
    }

    const materials = (gltf.materials ?? []).length
    if (rule.materials && materials > rule.materials)
      warn(
        `${materials} materiais (limite ${rule.materials}): junte em atlas para pesar menos no celular`,
      )
    const images = gltf.images ?? []
    for (const img of images) {
      let size = null
      try {
        size = imageSize(gltf, img)
      } catch {
        // Imagem em formato inesperado: não bloqueia a verificação.
      }
      if (size && rule.texture && Math.max(...size) > rule.texture)
        warn(`textura ${size.join('×')} (máximo ${rule.texture} para este modelo)`)
    }
    if (images.length) ok(`${images.length} textura(s), ${materials} material(is)`)

    if (rule.actions) {
      const actions = (gltf.animations ?? []).map((x) => x.name)
      const missing = rule.actions.filter((x) => !actions.includes(x))
      if (missing.length)
        err(
          `faltam as ações ${missing.join(', ')} (encontradas: ${actions.join(', ') || 'nenhuma'})`,
        )
      else ok(`ações ${rule.actions.join(' e ')}`)
      const extra = ['Run', 'Jump', 'Swim'].filter((x) => !actions.includes(x))
      if (extra.length)
        console.log(`  · opcionais ausentes: ${extra.join(', ')} (usa Walk/pose parada no lugar)`)
      else ok('ações opcionais Run, Jump e Swim')
    }

    if (rule.wardrobe) {
      const nodes = Object.keys(a.trisByNode)
      const slotOf = (n) => WARDROBE_SLOTS.find((s) => n.startsWith(`${s}_`))
      const pieces = Object.fromEntries(
        WARDROBE_SLOTS.map((s) => [s, nodes.filter((n) => slotOf(n) === s)]),
      )
      const empty = WARDROBE_SLOTS.filter((s) => pieces[s].length === 0)
      if (empty.length === WARDROBE_SLOTS.length) {
        console.log(
          '  · sem guarda-roupa (peças cabelo_/cima_/baixo_/pes_/acess_): personagem único',
        )
      } else {
        for (const s of WARDROBE_SLOTS) {
          if (pieces[s].length) ok(`${s}: ${pieces[s].join(', ')}`)
          else if (s !== 'acess') warn(`guarda-roupa sem peças de "${s}"`)
        }
        const missingDefault = DEFAULT_OUTFIT.filter(
          (p) => !nodes.includes(p) && pieces[slotOf(p)].length,
        )
        if (missingDefault.length)
          warn(`faltam peças da combinação padrão: ${missingDefault.join(', ')}`)
        const base = nodes.filter((n) => !slotOf(n)).reduce((t, n) => t + a.trisByNode[n], 0)
        const dressed =
          base +
          WARDROBE_SLOTS.reduce((t, s) => {
            const pick = DEFAULT_OUTFIT.find((p) => slotOf(p) === s)
            return t + (a.trisByNode[pick] ?? a.trisByNode[pieces[s][0]] ?? 0)
          }, 0)
        if (dressed > rule.dressedTris)
          warn(
            `vestido com a combinação padrão: ${Math.round(dressed)} triângulos (limite ${rule.dressedTris})`,
          )
        else ok(`vestido com a combinação padrão: ${Math.round(dressed)} triângulos`)
        const tints = (gltf.materials ?? []).map((m) => m.name).filter((n) => n?.endsWith('@tint'))
        if (!tints.includes('Cima@tint'))
          warn('falta o material "Cima@tint" (cor escolhida pelo visitante)')
      }
    }

    if (rule.tint) {
      const tinted = (gltf.materials ?? []).some((m) => m.name?.endsWith('@tint'))
      if (!tinted) warn('nenhum material termina com "@tint": a cor variável não vai aparecer')
      else ok('material @tint')
    }

    if (rule.planet) {
      const radius = (a.max[1] - a.min[1]) / 2
      if (radius < 17 || radius > 26)
        warn(`raio aproximado ${radius.toFixed(1)} m (o mundo espera ~20 m)`)
      else ok(`raio aproximado ${radius.toFixed(1)} m`)
      const lower = a.names.map((n) => n.toLowerCase())
      const found = PLANET_EMPTIES.filter((e) => lower.includes(e))
      const missing = PLANET_EMPTIES.filter((e) => !lower.includes(e))
      if (found.length) ok(`Empties: ${found.join(', ')}`)
      if (missing.length)
        console.log(`  · sem ${missing.join(', ')}: o código usa as posições padrão`)
      const blockers = lower.filter((n) => n.startsWith('bloqueio_')).length
      const lakes = lower.filter((n) => n.startsWith('agua_')).length
      const walkable = lower.filter((n) => /^(terreno|trilha|chao|laje|ponte|piso)/.test(n))
      if (walkable.length === 0)
        err(
          'nenhum objeto de chão: nomeie o terreno como "terreno" (ou trilha*, chao*, laje*, ponte*, piso*)',
        )
      else ok(`chão: ${walkable.join(', ')} (o resto é decoração atravessável)`)
      console.log(`  · ${lakes} superfície(s) de água agua_* (lagos para nadar)`)
      const story = lower.filter((n) => /^historia_\d+$/.test(n)).length
      console.log(`  · ${blockers} bloqueio(s), ${story} Empty(s) historia_N`)
    }
  }

  const draco = (gltf.extensionsUsed ?? []).includes('KHR_draco_mesh_compression')
  if (size > DRACO_HINT && !draco)
    warn('passa de 1 MB sem compressão: marque "Compression" (Draco) na exportação')
  console.log('')
}

const mb = (total / 1024 / 1024).toFixed(2)
if (total > TOTAL_BUDGET) err(`total ${mb} MB passa do limite de 25 MB`)
else console.log(`Total: ${mb} MB de 25 MB`)
console.log(`\n${errors} erro(s), ${warnings} aviso(s)`)
process.exit(errors > 0 ? 1 : 0)
