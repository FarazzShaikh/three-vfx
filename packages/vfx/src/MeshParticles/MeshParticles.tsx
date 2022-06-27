import { InstancedMeshProps } from "@react-three/fiber"
import React, { forwardRef, ReactNode, useLayoutEffect } from "react"
import mergeRefs from "react-merge-refs"
import { InstancedBufferAttribute, Matrix4 } from "three"
import { ParticlesContext } from "../ParticlesContext"
import {
  useMeshParticles,
  MeshParticles as MeshParticlesType
} from "./useMeshParticles"

export type MeshParticlesProps = InstancedMeshProps & {
  children?: ReactNode
  maxParticles?: number
  safetySize?: number
}

export const MeshParticles = forwardRef<MeshParticlesType, MeshParticlesProps>(
  (
    { maxParticles = 1_000, safetySize = 100, children, geometry, ...props },
    ref
  ) => {
    const [imesh, api] = useMeshParticles(maxParticles, safetySize)

    useLayoutEffect(() => {
      /* Fake the lifetime attribute */
      imesh.current.geometry.setAttribute(
        "lifetime",
        new InstancedBufferAttribute(new Float32Array(maxParticles), 2)
      )

      imesh.current.geometry.attributes.lifetime.setXY(0, 0, 1)

      /* Spawn a single particle */
      imesh.current.setMatrixAt(0, new Matrix4())
    }, [])

    return (
      <instancedMesh
        ref={mergeRefs([imesh, ref])}
        args={[geometry, undefined, maxParticles + safetySize]}
        {...props}
      >
        <ParticlesContext.Provider value={api}>
          {children}
        </ParticlesContext.Provider>
      </instancedMesh>
    )
  }
)
