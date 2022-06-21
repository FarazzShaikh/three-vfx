import { useFrame } from "@react-three/fiber"
import React, { forwardRef, useLayoutEffect, useMemo, useRef } from "react"
import mergeRefs from "react-merge-refs"
import { DepthTexture } from "three"
import CustomShaderMaterial, { iCSMProps } from "three-custom-shader-material"
import CustomShaderMaterialImpl from "three-custom-shader-material/vanilla"
import { composableShader, modules } from "../shaders/"

export type MeshParticlesMaterialProps = Omit<iCSMProps, "ref"> & {
  billboard?: boolean
  softness?: number
  scaleFunction?: string
  colorFunction?: string
  softnessFunction?: string
  depthTexture?: DepthTexture
}

export type MeshParticlesMaterial = CustomShaderMaterialImpl & {
  __vfx: {
    compiled: ReturnType<ReturnType<typeof composableShader>["compile"]> // TODO: eh
  }
}

export const MeshParticlesMaterial = forwardRef<
  MeshParticlesMaterial,
  MeshParticlesMaterialProps
>(
  (
    {
      billboard = false,
      softness = 0,
      scaleFunction,
      colorFunction,
      softnessFunction,
      depthTexture,
      ...props
    },
    ref
  ) => {
    const material = useRef<MeshParticlesMaterial>(null!)

    const compiled = useMemo(() => {
      const { addModule, compile } = composableShader()

      /* The Basics */
      addModule(modules.time())
      softness && addModule(modules.resolution())
      softness && addModule(modules.depthTexture(depthTexture!))
      addModule(modules.easings())

      /* The Specifics */
      addModule(modules.lifetime())
      billboard && addModule(modules.billboarding())
      addModule(modules.scale(scaleFunction))
      addModule(modules.movement())
      addModule(modules.colors(colorFunction))
      softness && addModule(modules.softparticles(softness, softnessFunction))

      return compile()
    }, [])

    useLayoutEffect(() => {
      material.current.__vfx = { compiled }
    }, [])

    const { update, ...shader } = compiled

    useFrame(update)

    return (
      <CustomShaderMaterial
        ref={mergeRefs([material, ref])}
        {...shader}
        {...props}
      />
    )
  }
)
