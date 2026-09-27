# Aika World 🪐

O planeta de **Felipe Kenji "Nakamura"** em 3D: seus projetos, serviços e história, com a
**Aika**, a agente de IA criada por ele, como guia. Cada casinha é um repositório do GitHub de
[@oyaga](https://github.com/oyaga). No templo japonês, o Felipe dá as boas-vindas e explica o mundo, e a
caixa de correio ao lado reúne todos os contatos; na Praça dos Serviços, um NPC na porta de cada prédio explica o serviço; e, na Trilha da história, o Felipe de cada época conta um capítulo da vida
dele.
Inspirado em
[messenger.abeto.co](https://messenger.abeto.co/).

![Captura de tela do protótipo](docs/screenshot.png)

## Como jogar

| Ação                   | Teclado              | Toque                     |
| ---------------------- | -------------------- | ------------------------- |
| Andar para frente/trás | `W` / `S` ou `↑` `↓` | Joystick (canto inferior) |
| Virar                  | `A` / `D` ou `←` `→` | Joystick                  |
| Interagir              | `E`                  | Botão "Toque para abrir"  |
| Fechar painel          | `Esc`                | ✕ no painel               |

O botão **Versão simples** (canto superior direito) mostra todo o conteúdo em uma lista HTML
acessível, sem 3D. A animação respeita `prefers-reduced-motion`.

## Stack

- **Monorepo** com pnpm workspaces e TypeScript `strict` em tudo
- **Web** (`apps/web`): Vite, React 19, [@react-three/fiber](https://r3f.docs.pmnd.rs/),
  [@react-three/drei](https://drei.docs.pmnd.rs/), three.js e zustand
- **Servidor** (`apps/server`): Cloudflare Worker + Durable Object (esqueleto para o multiplayer)
- **Compartilhado** (`packages/shared`): tipos do mundo e do protocolo WebSocket
- ESLint (flat config, typescript-eslint, react-hooks) + Prettier; CI no GitHub Actions

## Estrutura

```
aika-world/
├── apps/
│   ├── web/                    # Cliente 3D (Vite + React + R3F)
│   │   ├── public/world.json   # Dados do mundo (gerado por `pnpm world`)
│   │   └── src/
│   │       ├── world/          # Planet, Player, Aika, Houses, Landmarks, Props, CameraRig...
│   │       ├── ui/             # Panel, Hint, Joystick, Loading, SimpleView
│   │       ├── state/          # store (zustand), entrada, estado do jogador
│   │       ├── lib/sphere.ts   # Matemática na esfera (quaternions, Fibonacci, RNG)
│   │       ├── lib/models.ts   # Descobre os .glb disponíveis
│   │       ├── assets/models/  # Modelos .glb do Blender (ver docs/arte.md)
│   │       └── content.tsx     # Textos (na voz da Aika), serviços, contatos e a Trilha da história
│   └── server/                 # Cloudflare Worker (/health) + Durable Object `World` (stub)
├── packages/shared/            # Tipos: WorldData, RepoHouse, mensagens do protocolo
├── scripts/generate-world.mjs  # Gera world.json a partir da API do GitHub
├── docs/arte.md                # Guia para modelar e exportar do Blender
└── .github/workflows/ci.yml    # install → typecheck → lint → build
```

## Como rodar

Requisitos: Node 20+ e pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev          # abre o cliente em http://localhost:5173
pnpm typecheck    # checagem de tipos em todos os pacotes
pnpm lint         # ESLint
pnpm build        # build de produção (apps/web/dist)
```

Servidor (opcional, ainda é só um esqueleto):

```bash
pnpm --filter @aika-world/server dev   # wrangler dev → GET /health responde "ok"
```

### Gerando o mundo a partir do GitHub

```bash
pnpm world                          # repositórios públicos de "oyaga"
GITHUB_USER=outra-pessoa pnpm world # outro usuário
GITHUB_TOKEN=ghp_xxx pnpm world     # inclui repositórios privados (anonimizados)
```

Repositórios **privados** nunca têm nome, descrição ou URL expostos: viram casas secretas
(`{ "secret": true, ... }`, cinzas e com 🔒), mostrando apenas linguagem, estrelas e data da
última atividade. O `world.json` versionado é uma semente com dois repositórios públicos e
quatro casas secretas.

## Como funciona

- **Caminhar na esfera**: a orientação da Aika é um único quaternion. O "up" local é a normal da
  superfície e a posição é sempre `up × raio` (gravidade implícita, sem física). Andar é uma
  rotação em torno do eixo X local; virar, em torno do Y local.
- **Câmera**: terceira pessoa, atrás e acima no referencial local, suavizada com `lerp`/`slerp`.
- **Casas**: distribuídas com uma esfera de Fibonacci; altura por `log(estrelas + 1)` + atividade
  recente; cor pela linguagem.
- **NPCs e conversas**: `src/dialogues.ts` define as conversas como pequenos grafos (falas +
  opções de resposta); a do Felipe é escrita à mão e as dos serviços e da história são geradas a
  partir de `SERVICES` e `STORY` em `content.tsx`. A caixa de diálogo digita as falas, aceita E/Espaço/Enter para
  avançar e 1–9 para escolher. Os NPCs se viram para a Aika quando ela chega perto.
- **Árvores e pedras**: posicionamento determinístico (RNG com semente) e `InstancedMesh`.
- **Modelos 3D**: cada `.glb` em `apps/web/src/assets/models/` substitui a forma simples
  correspondente (com fallback se faltar ou falhar) e ganha materiais cartoon. Com `planeta.glb`,
  a Aika segue o relevo e os Empties `poi_*`, `area_vila` e `bloqueio_*` definem marcos, vila e
  barreiras. Detalhes em [`docs/arte.md`](docs/arte.md).

## Roadmap

1. **Protótipo** ✅ — planeta, Aika andando, câmera, pontos de interesse, painéis, versão simples.
2. **Multiplayer** — Cloudflare Durable Objects + WebSocket para ver outros visitantes andando.
3. **Commits ao vivo** — GitHub App enviando eventos de push; casas reagem em tempo real.
4. **Arte** 🚧 — carregamento dos `.glb` pronto; modelos no Blender (Aika em `.glb` com animações) e shader cartoon próprio.
5. **Conteúdo e acabamento** — textos finais, versão 2D completa, som, SEO e performance.
