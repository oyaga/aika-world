/**
 * Modelos .glb disponíveis. Basta soltar o arquivo em `src/assets/models/`
 * (ex.: `templo.glb`) que ele substitui a forma simples correspondente.
 * O Vite gera a URL com hash, então o cache é invalidado a cada nova versão.
 */
export type ModelName =
  | 'aika'
  | 'felipe'
  | 'npc'
  | 'planeta'
  | 'templo'
  | 'torre'
  | 'servico'
  | 'casa'
  | 'arvore'
  | 'pedra'

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
