import { extend, Node, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { MeshStandardMaterial } from "three"
import { MeshParticles, ParticlesMaterial } from "./v2/fiber"
import {
  MeshParticles as MeshParticlesImpl,
  ParticlesMaterial as ParticlesMaterialImpl,
  wobble
} from "./v2/vanilla"

extend({ ParticlesMaterial: ParticlesMaterialImpl })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      particlesMaterial: Node<
        ParticlesMaterialImpl,
        typeof ParticlesMaterialImpl
      >
    }
  }
}

export const ComposableFiber = () => {
  const ref = useRef<MeshParticlesImpl>(null!)

  useEffect(() => {
    ref.current.spawnParticle()
    ref.current.configureParticles([wobble])
  }, [])

  useFrame((_, dt) => {
    ref.current.material.uniforms.u_time.value += dt
  })

  return (
    <MeshParticles ref={ref}>
      <sphereGeometry />
      <ParticlesMaterial args={[{ baseMaterial: MeshStandardMaterial }]} />
    </MeshParticles>
  )
}
