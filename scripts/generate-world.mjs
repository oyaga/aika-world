#!/usr/bin/env node
/**
 * Gera apps/web/public/world.json a partir dos repositórios de um usuário do GitHub.
 *
 * Uso:
 *   pnpm world                 # usuário padrão: oyaga (somente repositórios públicos)
 *   GITHUB_USER=fulano pnpm world
 *   GITHUB_TOKEN=ghp_... pnpm world   # inclui repositórios privados (anonimizados)
 *
 * Repositórios PRIVADOS são sempre anonimizados: o arquivo final contém apenas
 * { secret: true, language, stars, pushedAt } — nunca nome, descrição ou URL.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../apps/web/public/world.json')
const USER = process.env.GITHUB_USER || process.argv[2] || 'oyaga'
const TOKEN = process.env.GITHUB_TOKEN || ''
const API = 'https://api.github.com'

/** @param {string} url */
async function gh(url) {
  /** @type {Record<string, string>} */
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'aika-world-generator',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} em ${url}: ${body.slice(0, 200)}`)
  }
  const link = res.headers.get('link') || ''
  const next = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null
  return { data: await res.json(), next }
}

/** @param {string} first */
async function paginate(first) {
  const all = []
  /** @type {string | null} */
  let url = first
  while (url) {
    const { data, next } = await gh(url)
    if (!Array.isArray(data)) throw new Error('Resposta inesperada da API do GitHub')
    all.push(...data)
    url = next
  }
  return all
}

async function fetchRepos() {
  if (TOKEN) {
    // Com token: /user/repos inclui privados. Filtramos pelo dono para não
    // misturar repositórios de organizações/colaborações.
    const repos = await paginate(`${API}/user/repos?per_page=100&affiliation=owner&visibility=all`)
    return repos.filter((r) => r.owner?.login?.toLowerCase() === USER.toLowerCase())
  }
  return paginate(`${API}/users/${encodeURIComponent(USER)}/repos?per_page=100&type=owner`)
}

/**
 * Converte um repositório da API em uma casa do mundo.
 * IMPORTANTE: para privados, só campos não identificáveis são copiados.
 */
function toHouse(repo) {
  const isPrivate = repo.private === true || repo.visibility === 'private'
  const base = {
    language: typeof repo.language === 'string' ? repo.language : null,
    stars: Number(repo.stargazers_count) || 0,
    pushedAt: repo.pushed_at || repo.updated_at || new Date(0).toISOString(),
  }
  if (isPrivate) {
    return { secret: true, ...base }
  }
  return {
    secret: false,
    name: String(repo.name),
    description: repo.description ?? null,
    url: String(repo.html_url),
    ...base,
  }
}

async function main() {
  console.log(
    `Buscando repositórios de ${USER}${TOKEN ? ' (com token, incluindo privados)' : ''}...`,
  )
  const repos = await fetchRepos()
  const houses = repos
    .filter((r) => !r.fork && !r.archived)
    .map(toHouse)
    // Públicos primeiro, depois por atividade recente.
    .sort((a, b) => Number(a.secret) - Number(b.secret) || b.pushedAt.localeCompare(a.pushedAt))

  const world = {
    version: 1,
    owner: USER,
    generatedAt: new Date().toISOString(),
    houses,
  }

  // Checagem defensiva: nenhuma casa secreta pode carregar campos identificáveis.
  for (const h of houses) {
    if (h.secret && ('name' in h || 'description' in h || 'url' in h)) {
      throw new Error('Casa secreta com campos identificáveis — abortando.')
    }
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(world, null, 2) + '\n', 'utf8')
  const secret = houses.filter((h) => h.secret).length
  console.log(`OK: ${houses.length} casas (${secret} secretas) -> ${OUT}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
