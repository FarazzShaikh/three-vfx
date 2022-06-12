import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { MeshStandardMaterial, Object3D, SphereGeometry } from "three"
import {
  makeShake,
  MeshParticles,
  ParticlesMaterial,
  wobble
} from "./v2/vanilla"

const tmpObj = new Object3D()

export const ComposableVanilla = () => {
  const material = useMemo(
    () =>
      new ParticlesMaterial({
        baseMaterial: new MeshStandardMaterial({ color: "white" })
      }),
    []
  )

  const mesh = useMemo(() => {
    const geometry = new SphereGeometry()
    const mesh = new MeshParticles(geometry, material, 1100)

    mesh.configureParticles([wobble, makeShake("x", 6, 8)])

    return mesh
  }, [])

  /* Animate */
  useFrame((_, dt) => {
    material.uniforms.u_time.value += dt
  })

  useEffect(() => {
    /* Spawn a single particle */
    tmpObj.position.set(0, 0, 0)
    tmpObj.quaternion.set(0, 0, 0, 1)
    tmpObj.scale.setScalar(1)

    mesh.setMatrixAt(0, tmpObj.matrix)
    mesh.count = 1
  }, [mesh])

  return <primitive object={mesh} />
}

export const ComposableFiber = () => {
  return <group />
}
