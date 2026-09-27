import { useProgress } from '@react-three/drei'

/** Tela de carregamento: some quando o mundo e os assets estiverem prontos. */
export function Loading({ ready }: { ready: boolean }) {
  const { active, progress } = useProgress()
  const done = ready && !active
  const pct = active ? Math.round(progress) : ready ? 100 : 30
  return (
    <div className={done ? 'loading loading--done' : 'loading'} aria-hidden={done}>
      <div className="loading__planet" />
      <p>Carregando o mundo da Aika… {pct}%</p>
      <div className="loading__bar">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
