/**
 * Teste de fumaça do multiplayer contra um servidor rodando:
 *   pnpm --filter @aika-world/server dev      (em outro terminal)
 *   pnpm --filter @aika-world/server smoke
 * WORLD_URL muda o alvo (padrão ws://127.0.0.1:8787/world).
 */
const BASE = process.env.WORLD_URL ?? 'ws://127.0.0.1:8787/world'
const HTTP = BASE.replace(/^ws/, 'http')
const URL = BASE + '?v=1&room='
const open = (room = 1) =>
  new Promise((res, rej) => {
    const ws = new WebSocket(URL + room)
    const inbox = []
    ws.inbox = inbox
    ws.onmessage = (e) => inbox.push(e.data === 'pong' ? 'pong' : JSON.parse(e.data))
    ws.onopen = () => res(ws)
    ws.onerror = rej
  })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) process.exitCode = 1
}

const a = await open()
await wait(200)
const welA = a.inbox.find((m) => m.type === 'welcome')
check(
  'A recebe welcome com nome e cor',
  !!welA && /^Viajante #\d{3}$/.test(welA.you.name) && /^#/.test(welA.you.color),
)
const b = await open()
await wait(200)
const welB = b.inbox.find((m) => m.type === 'welcome')
check(
  'B vê A na lista',
  welB?.players.some((p) => p.id === welA.you.id),
)
check(
  'A recebe join de B',
  a.inbox.some((m) => m.type === 'join' && m.player.id === welB.you.id),
)

a.send(JSON.stringify({ type: 'move', q: [0.1, 0, 0, 0.995], s: 0.8, r: 21.5, a: 1 }))
await wait(200)
const mv = b.inbox.find((m) => m.type === 'move')
check(
  'B recebe move de A (normalizado)',
  mv?.id === welA.you.id &&
    Math.abs(Math.hypot(...mv.q) - 1) < 1e-3 &&
    mv.s === 0.8 &&
    mv.r === 21.5 &&
    mv.a === 1,
)
check('A não recebe o próprio move', !a.inbox.some((m) => m.type === 'move'))

a.send(JSON.stringify({ type: 'move', q: [NaN, 0, 0, 1], s: 1, r: 20, a: 0 }))
a.send(JSON.stringify({ type: 'emote', emote: '💣' }))
a.send('lixo{')
a.send(JSON.stringify({ type: 'move', q: [0, 0, 0, 1], s: 99, r: 999, a: 0 }))
await wait(200)
const moves = b.inbox.filter((m) => m.type === 'move')
check(
  'inválidos ignorados; s e r limitados',
  moves.length === 2 && moves[1].s === 2 && moves[1].r === 30,
)
check('emote fora da lista ignorado', !b.inbox.some((m) => m.type === 'emote'))

for (let i = 0; i < 5; i++) a.send(JSON.stringify({ type: 'emote', emote: '👋' }))
await wait(200)
check('emotes limitados (máx. 2 de rajada)', b.inbox.filter((m) => m.type === 'emote').length === 2)

const before = b.inbox.filter((m) => m.type === 'move').length
for (let i = 0; i < 60; i++)
  a.send(JSON.stringify({ type: 'move', q: [0, 0, 0, 1], s: 0, r: 20, a: 0 }))
await wait(300)
const burst = b.inbox.filter((m) => m.type === 'move').length - before
check(`moves limitados (${burst} de 60 passaram)`, burst > 0 && burst <= 16)

const look = {
  outfit: {
    cabelo: 'cabelo_rabo',
    cima: 'cima_regata',
    baixo: 'baixo_saia',
    pes: 'pes_bota',
    acess: 'acess_nenhum',
  },
  colors: { cima: '#FF5A02', pes: 'vermelho' },
}
a.send(JSON.stringify({ type: 'look', look }))
await wait(200)
const lk = b.inbox.find((m) => m.type === 'look')
check(
  'B recebe o visual de A (cor inválida descartada)',
  lk?.id === welA.you.id &&
    lk.look.outfit.cima === 'cima_regata' &&
    lk.look.colors.cima === '#ff5a02' &&
    !('pes' in lk.look.colors),
)
a.send(JSON.stringify({ type: 'look', look: { outfit: { ...look.outfit, cima: 'baixo_saia' } } }))
await wait(200)
check(
  'visual com peça na categoria errada é ignorado',
  b.inbox.filter((m) => m.type === 'look').length === 1,
)
const c = await open()
await wait(200)
check(
  'quem entra depois recebe o visual de A',
  c.inbox.find((m) => m.type === 'welcome')?.players.find((p) => p.id === welA.you.id)?.look?.outfit
    .pes === 'pes_bota',
)
c.close()
await wait(200)

a.send('ping')
await wait(200)
check('ping → pong automático', a.inbox.includes('pong'))

const bad = await fetch(HTTP + '?v=99&room=1')
check('versão errada → 400', bad.status === 400)
const badRoom = await fetch(HTTP + '?v=1&room=9')
check('sala inválida → 400', badRoom.status === 400)

a.close()
await wait(300)
check(
  'B recebe leave de A',
  b.inbox.some((m) => m.type === 'leave' && m.id === welA.you.id),
)
b.close()

// Sala cheia
const crowd = []
for (let i = 0; i < 50; i++) crowd.push(await open(3))
const extra = new WebSocket(URL + 3)
const code = await new Promise((r) => {
  extra.onclose = (e) => r(e.code)
})
check(`51º visitante recebe close 4001 (recebeu ${code})`, code === 4001)
crowd.forEach((w) => w.close())
await wait(300)
process.exit()
