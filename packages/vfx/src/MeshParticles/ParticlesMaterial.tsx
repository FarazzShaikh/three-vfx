import { useFrame } from "@react-three/fiber"
import React, { forwardRef, useLayoutEffect, useMemo, useRef } from "react"
import mergeRefs from "react-merge-refs"
import {
  AddNode,
  ColorNode,
  compileShader,
  CSMMasterNode,
  float,
  MultiplyNode,
  nodeFactory,
  TimeNode,
  Value,
  vec2,
  vec3,
  VertexPositionNode
} from "shadenfreude"
import { Color, DepthTexture, Vector3 } from "three"
import CustomShaderMaterial, { iCSMProps } from "three-custom-shader-material"
import CustomShaderMaterialImpl from "three-custom-shader-material/vanilla"

export type ParticlesMaterialProps = Omit<iCSMProps, "ref"> & {
  billboard?: boolean
  softness?: number
  scaleFunction?: string
  colorFunction?: string
  softnessFunction?: string
  depthTexture?: DepthTexture
}

export type ParticlesMaterial = CustomShaderMaterialImpl & {
  __vfx: {
    shader: Shader
  }
}

const LifetimeNode = nodeFactory<{
  time: Value<"float">
  startTime: Value<"float">
  endTime: Value<"float">
}>(({ time, startTime, endTime }) => ({
  inputs: {
    time: float(time),
    startTime: float(startTime),
    endTime: float(endTime)
  },
  outputs: {
    age: float(`time - startTime`),
    value: float(`age / (endTime - startTime)`)
  },
  fragment: {
    body: `if (value < 0.0 || value > 1.0) { discard; }`
  }
}))

const StatelessVelocityNode = nodeFactory<{
  time: Value<"float">
  velocity: Value<"vec3">
}>(({ time, velocity }) => ({
  inputs: {
    time: float(time),
    velocity: vec3(velocity)
  },
  outputs: {
    value: vec3()
  },
  vertex: {
    body: "value = velocity * time * mat3(instanceMatrix);"
  }
}))

const StatelessAccelerationNode = nodeFactory<{
  time: Value<"float">
  acceleration: Value<"vec3">
}>(({ time, acceleration }) => ({
  inputs: {
    time: float(time),
    acceleration: vec3(acceleration)
  },
  outputs: {
    value: vec3()
  },
  vertex: {
    body: "value = 0.5 * time * time * acceleration * mat3(instanceMatrix);"
  }
}))

// TODO: automatically provide attribute values as a varying - I think?
const LifetimeAttributeNode = nodeFactory(() => ({
  varyings: {
    v_lifetime: vec2()
  },
  vertex: {
    header: `
      attribute vec2 lifetime;
    `,
    body: `
      v_lifetime = lifetime;
      startTime = v_lifetime.x;
      endTime = v_lifetime.y;
    `
  },
  outputs: {
    startTime: float("v_lifetime.x"),
    endTime: float("v_lifetime.y")
  }
}))

export const ParticlesMaterial = forwardRef<
  ParticlesMaterial,
  ParticlesMaterialProps
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
    const material = useRef<ParticlesMaterial>(null!)

    const shader = useMemo(() => {
      const time = TimeNode()
      const lifetimeAttribute = LifetimeAttributeNode()
      const lifetime = LifetimeNode({
        time,
        startTime: lifetimeAttribute.outputs.startTime,
        endTime: lifetimeAttribute.outputs.endTime
      })

      const movement = AddNode({
        a: StatelessVelocityNode({
          time: lifetime.outputs.age,
          velocity: new Vector3(0, 0, 0)
        }),
        b: StatelessAccelerationNode({
          time: lifetime.outputs.age,
          acceleration: new Vector3(0, -10, 0)
        })
      })

      const position = AddNode({
        a: VertexPositionNode(),
        b: movement
      })

      const diffuseColor = MultiplyNode({
        a: ColorNode({ color: new Color("#fff") }),
        b: lifetime
      })

      const root = CSMMasterNode({
        position,
        diffuseColor
      })

      return compileShader(root)

      // const layers = [
      //   provideTime(),
      //   provideLifetime(),
      //   provideResolution(),
      //   provideEasingFunctions(),
      //   softness && provideDepthTexture(depthTexture!),
      //   billboard && billboarding(),
      //   animateScale(scaleFunction),
      //   animateMovement(),
      //   animateColors(colorFunction),
      //   softness && softParticles(softness, softnessFunction)
      // ].filter((l) => l) as Shader[]

      // return combineShaders(layers)
    }, [])

    const { update, ...attrs } = shader

    useLayoutEffect(() => {
      material.current.__vfx = { shader }
    }, [])

    useFrame(update)

    return (
      <CustomShaderMaterial
        ref={mergeRefs([material, ref])}
        {...attrs}
        {...props}
      />
    )
  }
)
