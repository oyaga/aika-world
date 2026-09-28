import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  type DirectionalLight,
  Float32BufferAttribute,
  type Fog,
  type HemisphereLight,
  IcosahedronGeometry,
  type Mesh,
  MeshBasicMaterial,
  PointsMaterial,
  ShaderMaterial,
  Vector3,
} from 'three'
import { playerState } from '../state/player'
import { dayNight } from './dayNight'
import { setGlow } from './materials'

/**
 * Céu e luz com ciclo dia/noite (direção de arte v3). De dia: céu claro
 * turquesa e sol quente. À noite: índigo profundo, lua fria, estrelas, luas
 * low-poly e o neon do planeta aceso (ver setGlow e Effects).
 */
const DAY = {
  horizon: '#9fdad2',
  zenith: '#4d7fc2',
  below: '#2c4f5a',
  fog: '#86bfc0',
  hemiSky: '#e4f6f1',
  hemiGround: '#3f7479',
  hemi: 1.3,
  sunColor: '#fff1dc',
  sun: 2.1,
}
const NIGHT = {
  horizon: '#2b2f72',
  zenith: '#0d0a2a',
  below: '#120f33',
  fog: '#1d1a4a',
  hemiSky: '#7d86e8',
  hemiGround: '#1f1a45',
  hemi: 0.95,
  sunColor: '#a9b8ff',
  sun: 0.75,
}

/** Mantido para quem importa as cores do céu (valores do dia). */
export const SKY = {
  horizon: DAY.horizon,
  zenith: DAY.zenith,
  below: DAY.below,
  fog: DAY.fog,
}

/** Brilho do neon: de dia aparece, à noite acende de verdade (passa do limiar do bloom). */
const GLOW_DAY = 1.3
const GLOW_NIGHT = 3.1

const cDay = {
  horizon: new Color(DAY.horizon),
  zenith: new Color(DAY.zenith),
  below: new Color(DAY.below),
  fog: new Color(DAY.fog),
  hemiSky: new Color(DAY.hemiSky),
  hemiGround: new Color(DAY.hemiGround),
  sun: new Color(DAY.sunColor),
}
const cNight = {
  horizon: new Color(NIGHT.horizon),
  zenith: new Color(NIGHT.zenith),
  below: new Color(NIGHT.below),
  fog: new Color(NIGHT.fog),
  hemiSky: new Color(NIGHT.hemiSky),
  hemiGround: new Color(NIGHT.hemiGround),
  sun: new Color(NIGHT.sunColor),
}
const mix = <K extends keyof typeof cDay>(k: K, t: number, out: Color) =>
  out.lerpColors(cDay[k], cNight[k], t)

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
          uHorizon: { value: new Color(DAY.horizon) },
          uZenith: { value: new Color(DAY.zenith) },
          uBelow: { value: new Color(DAY.below) },
        },
      }),
    [],
  )
  useFrame(({ camera }) => {
    const n = dayNight.night
    mesh.current?.position.copy(camera.position)
    const u = material.uniforms
    ;(u.uUp!.value as Vector3).copy(playerState.position).normalize()
    mix('horizon', n, u.uHorizon!.value as Color)
    mix('zenith', n, u.uZenith!.value as Color)
    mix('below', n, u.uBelow!.value as Color)
  })
  return (
    <mesh ref={mesh} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[150, 32, 16]} />
    </mesh>
  )
}

/** Estrelas que somem de dia (a opacidade acompanha a noite). */
function NightStars({ count = 1400 }: { count?: number }) {
  const material = useMemo(
    () =>
      new PointsMaterial({
        size: 1.6,
        sizeAttenuation: false,
        color: '#ffffff',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        blending: AdditiveBlending,
      }),
    [],
  )
  const geometry = useMemo(() => {
    const pos: number[] = []
    const v = new Vector3()
    for (let i = 0; i < count; i++) {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      if (v.lengthSq() < 0.01) v.set(0, 1, 0)
      v.normalize().multiplyScalar(95 + Math.random() * 30)
      pos.push(v.x, v.y, v.z)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    return g
  }, [count])
  useFrame(() => {
    material.opacity = Math.max(0, (dayNight.night - 0.25) / 0.75) * 0.95
  })
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />
}

/** Luas low-poly no céu (como na referência), visíveis à noite. */
const MOONS: { pos: [number, number, number]; r: number; color: string }[] = [
  { pos: [-62, 48, -40], r: 5.5, color: '#6f6ad8' },
  { pos: [58, -30, 55], r: 3.2, color: '#5a63c9' },
]

function Moons() {
  const geometry = useMemo(() => new IcosahedronGeometry(1, 1), [])
  const materials = useMemo(
    () =>
      MOONS.map(
        (m) => new MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0, fog: false }),
      ),
    [],
  )
  useFrame(() => {
    const o = Math.max(0, (dayNight.night - 0.3) / 0.7)
    for (const m of materials) {
      m.opacity = o
      m.visible = o > 0.01
    }
  })
  return (
    <>
      {MOONS.map((m, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={materials[i]}
          position={m.pos}
          scale={m.r}
          renderOrder={-1}
        />
      ))}
    </>
  )
}

const up = new Vector3()
const side = new Vector3()
const back = new Vector3()
const tmp = new Color()

/**
 * Sol (de dia) ou lua (à noite) no referencial do visitante: alto, de lado e
 * um pouco de trás, para a luz ficar igual em qualquer ponto do planeta.
 */
function SunRig() {
  const light = useRef<DirectionalLight>(null)
  useFrame(() => {
    const l = light.current
    if (!l) return
    const n = dayNight.night
    const q = playerState.orientation
    up.set(0, 1, 0).applyQuaternion(q)
    side.set(1, 0, 0).applyQuaternion(q)
    back.set(0, 0, -1).applyQuaternion(q)
    l.target.position.copy(playerState.position)
    l.position
      .copy(playerState.position)
      .addScaledVector(up, 30)
      .addScaledVector(side, 18 - 30 * n)
      .addScaledVector(back, 10)
    l.target.updateMatrixWorld()
    l.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * n
    l.color.copy(mix('sun', n, tmp))
  })
  return <directionalLight ref={light} color={DAY.sunColor} intensity={DAY.sun} />
}

function Ambient() {
  const hemi = useRef<HemisphereLight>(null)
  const scene = useThree((s) => s.scene)
  useFrame(() => {
    const n = dayNight.night
    const h = hemi.current
    if (h) {
      mix('hemiSky', n, h.color)
      mix('hemiGround', n, h.groundColor)
      h.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * n
    }
    const fog = scene.fog as Fog | null
    if (fog) {
      mix('fog', n, fog.color)
      fog.near = 28 + 6 * n
      fog.far = 75 + 20 * n
    }
    if (scene.background instanceof Color) mix('zenith', n, scene.background)
    setGlow(GLOW_DAY + (GLOW_NIGHT - GLOW_DAY) * n)
  })
  return <hemisphereLight ref={hemi} args={[DAY.hemiSky, DAY.hemiGround, DAY.hemi]} />
}

export function Atmosphere({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <>
      <color attach="background" args={[DAY.zenith]} />
      <fog attach="fog" args={[DAY.fog, 28, 75]} />
      <Ambient />
      <SunRig />
      <SkyDome />
      <NightStars count={reducedMotion ? 900 : 1400} />
      <Moons />
    </>
  )
}
