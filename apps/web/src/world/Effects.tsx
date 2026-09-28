import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import { dayNight } from './dayNight'

/**
 * Pós-processamento: brilho (bloom) só no que passa do limiar, ou seja, nos
 * emissivos (neon, lanternas, janelas acesas, cachoeira), cujo brilho vem de
 * setGlow (materials.tsx). À noite o bloom fica mais forte e mais aberto.
 * Em telas pequenas usa menos amostras.
 */
export function Effects({ lowPower }: { lowPower: boolean }) {
  const bloom = useRef<BloomEffect>(null)
  useFrame(() => {
    const b = bloom.current
    if (!b) return
    const n = dayNight.night
    b.intensity = 0.6 + 0.75 * n
  })
  return (
    <EffectComposer multisampling={lowPower ? 0 : 4}>
      <Bloom
        ref={bloom}
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.25}
        intensity={0.85}
        radius={0.72}
      />
    </EffectComposer>
  )
}
