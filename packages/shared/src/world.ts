/**
 * Dados do mundo gerados por `scripts/generate-world.mjs` e servidos em
 * `apps/web/public/world.json`.
 */

/** Casa de um repositório público: todos os metadados são visíveis. */
export interface PublicRepoHouse {
  secret: false
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  /** ISO 8601 */
  pushedAt: string
}

/**
 * Casa de um repositório privado: anonimizada. Nunca contém nome,
 * descrição ou URL. Apenas sinais genéricos de atividade.
 */
export interface SecretRepoHouse {
  secret: true
  language: string | null
  stars: number
  /** ISO 8601 */
  pushedAt: string
}

export type RepoHouse = PublicRepoHouse | SecretRepoHouse

export interface WorldData {
  /** Versão do formato do arquivo. */
  version: 1
  /** Usuário do GitHub dono do mundo. */
  owner: string
  /** ISO 8601 */
  generatedAt: string
  houses: RepoHouse[]
}

export function isSecretHouse(house: RepoHouse): house is SecretRepoHouse {
  return house.secret
}
