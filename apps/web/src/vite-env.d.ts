/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `same-origin`, ou a URL do WebSocket do servidor (ex.: ws://localhost:8787/world). Vazio = sem multiplayer. */
  readonly VITE_WORLD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
