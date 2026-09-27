# Deploy — colocando o Aika World no ar

## Como fica

Um único **Worker da Cloudflare** serve tudo no mesmo endereço:

```
https://aika-world.<seu-subdominio>.workers.dev   (ou o seu domínio)
├── /            → o site (arquivos de apps/web/dist)
├── /world       → multiplayer (WebSocket → Durable Object "World", uma sala por instância)
└── /health      → "ok" (para monitoramento)
```

O deploy é automático pelo GitHub Actions (`.github/workflows/deploy.yml`):

- a cada push na `main`;
- uma vez por dia, para as casas acompanharem os seus repositórios;
- ou manualmente, em Actions → Deploy → Run workflow.

Antes de publicar, ele confere os modelos 3D (`pnpm models:check`), atualiza o `world.json` com os
seus repositórios e gera o site com o multiplayer ligado (`VITE_WORLD_URL=same-origin`).

## O que você faz (uma vez só)

1. **Conta na Cloudflare** — [dash.cloudflare.com](https://dash.cloudflare.com) (o plano grátis
   inclui Workers e Durable Objects com SQLite, que é o que o projeto usa; se o painel pedir
   upgrade ao publicar, o plano Workers Paid resolve).
2. **Token de API** — My Profile → API Tokens → Create Token → modelo **"Edit Cloudflare
   Workers"** → escolha a sua conta → Create. Copie o token (ele só aparece uma vez).
3. **Account ID** — na página inicial de Workers & Pages, na lateral direita.
4. **Secrets no GitHub** — no repositório `oyaga/aika-world`: Settings → Secrets and variables →
   Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN` = o token do passo 2
   - `CLOUDFLARE_ACCOUNT_ID` = o ID do passo 3
   - `WORLD_GITHUB_TOKEN` (opcional) = um token do GitHub (fine-grained, "All repositories",
     permissão **Metadata: read-only**) para incluir os repositórios privados como casas secretas
     — sem nome, descrição nem link. Sem ele, entram só os públicos.
5. **Publicar** — faça merge da branch na `main` (ou rode o workflow manualmente). O endereço
   aparece no fim do log do job "Deploy".
6. **Domínio próprio (opcional)** — Workers & Pages → `aika-world` → Settings → Domains & Routes
   → Add → Custom domain. O domínio precisa estar com o DNS na Cloudflare.

> **Nunca mande tokens ou senhas no chat.** Eles ficam só nos secrets do GitHub. Para testar,
> eu preciso apenas do endereço público do site.

## O que me mandar

- Os modelos `.glb` (e os `.blend`, se quiser guardar no repositório). Eu rodo o
  `pnpm models:check`, ajusto o que for preciso e coloco em `apps/web/src/assets/models/`.
- O domínio que você quer usar, se tiver um.
- O endereço do site depois do primeiro deploy, para eu testar o multiplayer em produção.

## Deploy manual (sem GitHub Actions)

```bash
pnpm install
pnpm --filter @aika-world/server exec wrangler login   # abre o navegador
pnpm release                                           # gera o site e publica o Worker
```

## Testar igual à produção, no seu computador

```bash
pnpm preview:prod     # gera o site com multiplayer e sobe o Worker em http://localhost:8787
```

Abra duas abas em `http://localhost:8787` para se ver andando. Com o servidor rodando,
`pnpm --filter @aika-world/server smoke` testa o protocolo (entrada, movimento, limites, sala cheia).
