import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Artwork } from '../data/artworks'

/**
 * The hero's floating painting, rendered with Three.js.
 * A real gilt moulding (four bevelled rails), a canvas surface with
 * subtle roughness, gallery spot lighting and a soft cast shadow on the
 * wall. The frame drifts gently, follows the pointer and recedes on scroll.
 */

const FRAME_COLORS: Record<Artwork['frame'], { color: string; metalness: number; roughness: number }> = {
  gilt: { color: '#b39257', metalness: 0.65, roughness: 0.38 },
  oak: { color: '#b38a5c', metalness: 0.05, roughness: 0.7 },
  walnut: { color: '#4b3424', metalness: 0.05, roughness: 0.6 },
  black: { color: '#1c1a18', metalness: 0.2, roughness: 0.45 },
  white: { color: '#efebe4', metalness: 0, roughness: 0.6 },
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 20, 128, 128, 128)
  grad.addColorStop(0, 'rgba(40,28,18,0.55)')
  grad.addColorStop(0.55, 'rgba(40,28,18,0.22)')
  grad.addColorStop(1, 'rgba(40,28,18,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function FramedPainting({ art, onReady }: { art: Artwork; onReady?: () => void }) {
  const tex = useLoader(THREE.TextureLoader, art.image)
  const group = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const intro = useRef(0)
  const { viewport, gl } = useThree()

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = gl.capabilities.getMaxAnisotropy()
  }, [tex, gl])

  useEffect(() => {
    onReady?.()
    const on = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [onReady])

  // Fit the painting to the viewport
  const maxW = Math.min(viewport.width * 0.68, 3.1)
  const maxH = viewport.height * 0.6
  let w = maxW
  let h = w / art.aspect
  if (h > maxH) {
    h = maxH
    w = h * art.aspect
  }
  const rail = Math.min(w, h) * 0.075
  const depth = rail * 0.55
  const fc = FRAME_COLORS[art.frame]
  const shadowTex = useMemo(shadowTexture, [])

  useFrame((state, dt) => {
    if (!group.current) return
    intro.current = Math.min(1, intro.current + dt * 0.55)
    const e = 1 - Math.pow(1 - intro.current, 3)
    const t = state.clock.elapsedTime
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.2)
    const targetY = pointer.current.x * 0.28 + (1 - e) * -0.7 + scroll * 0.35
    const targetX = pointer.current.y * 0.14 + scroll * 0.12
    const g = group.current
    g.rotation.y += (targetY - g.rotation.y) * 0.06
    g.rotation.x += (targetX - g.rotation.x) * 0.06
    g.rotation.z = Math.sin(t * 0.4) * 0.008
    g.position.y = Math.sin(t * 0.7) * 0.05 + scroll * 0.4
    g.position.z = (1 - e) * -2.2 - scroll * 1.4
    if (shadow.current) {
      shadow.current.position.x = 0.18 - g.rotation.y * 0.5
      shadow.current.position.y = -0.28 + g.position.y * 0.4 - g.rotation.x * 0.5
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * e
    }
  })

  const rails = useMemo(() => {
    const W = w + rail * 2
    const H = h + rail * 2
    return [
      { pos: [0, h / 2 + rail / 2, 0], size: [W, rail, depth] },
      { pos: [0, -h / 2 - rail / 2, 0], size: [W, rail, depth] },
      { pos: [-w / 2 - rail / 2, 0, 0], size: [rail, H - rail * 2, depth] },
      { pos: [w / 2 + rail / 2, 0, 0], size: [rail, H - rail * 2, depth] },
    ] as { pos: [number, number, number]; size: [number, number, number] }[]
  }, [w, h, rail, depth])

  return (
    <>
      <mesh ref={shadow} position={[0.18, -0.28, -0.9]}>
        <planeGeometry args={[w * 1.45, h * 1.5]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0} />
      </mesh>
      <group ref={group}>
        {rails.map((r, i) => (
          <mesh key={i} position={r.pos} castShadow>
            <boxGeometry args={r.size} />
            <meshStandardMaterial color={fc.color} metalness={fc.metalness} roughness={fc.roughness} />
          </mesh>
        ))}
        {/* inner fillet / slip */}
        <mesh position={[0, 0, -depth * 0.1]}>
          <planeGeometry args={[w + rail * 0.25, h + rail * 0.25]} />
          <meshStandardMaterial color="#2a2018" roughness={0.9} />
        </mesh>
        {/* backing — gives the frame thickness when it rotates */}
        <mesh position={[0, 0, -depth / 2]}>
          <boxGeometry args={[w + rail * 2, h + rail * 2, 0.01]} />
          <meshStandardMaterial color="#3a2e22" />
        </mesh>
        <mesh position={[0, 0, -depth * 0.05]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.82} metalness={0} />
        </mesh>
      </group>
    </>
  )
}

export default function HeroCanvas({ art, onReady }: { art: Artwork; onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6.2], fov: 32 }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <ambientLight intensity={1.35} />
      <spotLight position={[0.5, 5, 5]} angle={0.5} penumbra={0.9} intensity={60} color="#fff3e2" />
      <directionalLight position={[-4, 2, 3]} intensity={0.6} color="#ffe9d0" />
      <directionalLight position={[3, -1, 4]} intensity={0.35} color="#dfe6ff" />
      <FramedPainting art={art} onReady={onReady} />
    </Canvas>
  )
}
