/**
 * Modelos .glb disponíveis. Basta soltar o arquivo em `src/assets/models/`
 * (ex.: `templo.glb`) que ele substitui a forma simples correspondente.
 * O Vite gera a URL com hash, então o cache é invalidado a cada nova versão.
 */
export type ModelName =
  | 'aika'
  | 'visitante'
  | 'felipe'
  | 'npc'
  | 'planeta'
  | 'templo'
  | 'correio'
  | 'servico'
  | 'casa'
  | 'arvore'
  | 'pedra'
  /** Prédio e atendente específicos de um serviço (slug de SERVICES). */
  | `servico_${string}`
  | `npc_${string}`

const found = import.meta.glob<string>('../assets/models/*.glb', {
  query: '?url',
  import: 'default',
  eager: true,
})

const urls = new Map<string, string>()
for (const [path, url] of Object.entries(found)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.glb'.length)
  urls.set(name, url)
}

export function modelUrl(name: ModelName): string | undefined {
  return urls.get(name)
}

/** O primeiro modelo da lista que existir (ex.: específico → genérico); senão o último. */
export function firstModel(...names: ModelName[]): ModelName {
  return names.find((n) => urls.has(n)) ?? (names[names.length - 1] as ModelName)
}

/**
 * Decodificador Draco hospedado junto com o site (public/draco), em vez do
 * CDN padrão do drei: funciona offline e não depende de terceiros.
 */
export const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`
