import { Bloom, EffectComposer } from '@react-three/postprocessing'

/**
 * Pós-processamento: brilho (bloom) só no que passa do limiar, ou seja, nos
 * emissivos (neon, lanternas, janelas acesas, cachoeira), que os materiais
 * multiplicam por GLOW. Em telas pequenas usa menos amostras.
 */
export function Effects({ lowPower }: { lowPower: boolean }) {
  return (
    <EffectComposer multisampling={lowPower ? 0 : 4}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.25}
        intensity={0.85}
        radius={0.7}
      />
    </EffectComposer>
  )
}
