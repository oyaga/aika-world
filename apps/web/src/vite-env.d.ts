/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do WebSocket do servidor do mundo (ex.: wss://…/world). Vazio = sem multiplayer. */
  readonly VITE_WORLD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
