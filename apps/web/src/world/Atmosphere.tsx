import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, type DirectionalLight, type Mesh, ShaderMaterial, Vector3 } from 'three'
import { playerState } from '../state/player'

/**
 * Céu e luz da "hora azul" (direção de arte v2): degradê de turquesa-menta
 * no horizonte para índigo no alto, e um sol que acompanha o visitante, para
 * a luz e a sombra turquesa ficarem iguais em qualquer ponto do planeta.
 */
export const SKY = {
  horizon: '#7fc9c3',
  zenith: '#1b1733',
  /** Abaixo do horizonte (visto por entre as rochas flutuantes). */
  below: '#2c4f5a',
  fog: '#5f98a0',
}

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w; // sempre no fundo
  }
`

const fragment = /* glsl */ `
  uniform vec3 uUp;
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  uniform vec3 uBelow;
  varying vec3 vDir;
  void main() {
    float h = dot(normalize(vDir), uUp);
    vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.02, 0.42, h));
    vec3 color = h < 0.0 ? mix(uHorizon, uBelow, smoothstep(0.0, -0.35, h)) : sky;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

function SkyDome() {
  const mesh = useRef<Mesh>(null)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uUp: { value: new Vector3(0, 1, 0) },
          uHorizon: { value: new Color(SKY.horizon) },
          uZenith: { value: new Color(SKY.zenith) },
          uBelow: { value: new Color(SKY.below) },
        },
      }),
    [],
  )
  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position)
    ;(material.uniforms.uUp!.value as Vector3).copy(playerState.position).normalize()
  })
  return (
    <mesh ref={mesh} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[150, 32, 16]} />
    </mesh>
  )
}

const up = new Vector3()
const side = new Vector3()
const back = new Vector3()

/** Sol no referencial do visitante: alto, de lado e um pouco de trás (luz de fim de tarde). */
function SunRig() {
  const light = useRef<DirectionalLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    const q = playerState.orientation
    up.set(0, 1, 0).applyQuaternion(q)
    side.set(1, 0, 0).applyQuaternion(q)
    back.set(0, 0, -1).applyQuaternion(q)
    l.target.position.copy(playerState.position)
    l.position
      .copy(playerState.position)
      .addScaledVector(up, 30)
      .addScaledVector(side, 18)
      .addScaledVector(back, 10)
    l.target.updateMatrixWorld()
  })
  return <directionalLight ref={light} color="#fff1dc" intensity={2.1} />
}

export function Atmosphere() {
  return (
    <>
      <color attach="background" args={[SKY.zenith]} />
      <fog attach="fog" args={[SKY.fog, 28, 75]} />
      {/* Céu claro e chão turquesa: é o que tinge as sombras de turquesa. */}
      <hemisphereLight args={['#dff4ef', '#3f7479', 1.25]} />
      <SunRig />
      <SkyDome />
    </>
  )
}
