import { useMemo } from 'react'
import { BufferAttribute, Color, IcosahedronGeometry } from 'three'
import { mulberry32, PLANET_RADIUS } from '../lib/sphere'
import { Toon } from './materials'

/** Planeta low-poly com leve variação de cor por face (determinística). */
export function Planet() {
  const geometry = useMemo(() => {
    const geo = new IcosahedronGeometry(PLANET_RADIUS, 14)
    // Geometria não indexada: recalcular normais gera normais por face (flat).
    geo.computeVertexNormals()
    const rand = mulberry32(7)
    const base = new Color('#8fd18a')
    const alt = new Color('#6fbf7a')
    const sand = new Color('#e9d8a6')
    const count = geo.attributes.position!.count
    const colors = new Float32Array(count * 3)
    const c = new Color()
    for (let i = 0; i < count; i += 3) {
      const r = rand()
      c.copy(base).lerp(alt, r)
      if (r > 0.97) c.copy(sand)
      for (let v = 0; v < 3; v++) c.toArray(colors, (i + v) * 3)
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow name="planet">
      <Toon color="#ffffff" vertexColors />
    </mesh>
  )
}
