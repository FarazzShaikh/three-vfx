import { useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { MeshStandardMaterial } from "three"
import { Emitter, MeshParticles, ParticlesMaterial } from "./v2/fiber"
import { MeshParticles as MeshParticlesImpl, wobble } from "./v2/vanilla"

export const ComposableFiber = () => {
  const ref = useRef<MeshParticlesImpl>(null!)

  useEffect(() => {
    ref.current.configureParticles([wobble])
  }, [])

  useFrame((_, dt) => {
    ref.current.material.uniforms.u_time.value += dt
  })

  return (
    <MeshParticles ref={ref}>
      <sphereGeometry />
      <ParticlesMaterial baseMaterial={MeshStandardMaterial} />

      <Emitter />
    </MeshParticles>
  )
}
