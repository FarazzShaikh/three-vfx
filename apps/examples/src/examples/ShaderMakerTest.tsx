import CustomShaderMaterial from "three-custom-shader-material"
import CustomShaderMaterialImpl from "three-custom-shader-material/vanilla"
import { BufferGeometry, Mesh, MeshStandardMaterial } from "three"
import { compileShader, float, makeShaderModule } from "three-shadermaker"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

const makeTime = ({ timeUniform = "u_time" } = {}) =>
  makeShaderModule({
    name: "time",

    uniforms: {
      [timeUniform]: { type: "float", value: 0 }
    },

    frameCallback: (mesh, dt) =>
      (mesh.material.uniforms[timeUniform].value += dt)
  })

type WobbleProps = {
  timeUniform?: string
  axis?: "x" | "y" | "z"
  frequency?: number
  amplitude?: number
}

const makeWobble = ({
  timeUniform = "u_time",
  axis = "x",
  frequency = 1,
  amplitude = 1
}: WobbleProps = {}) =>
  makeShaderModule({
    name: "wobble",
    vertexMain: /*glsl*/ `
    csm_Position.${axis} += cos(${timeUniform}
       * ${float(frequency)}) * ${float(amplitude)};
    `
  })

export const ShaderMakerTest = () => {
  const mesh = useRef<Mesh<BufferGeometry, CustomShaderMaterialImpl>>(null!)

  /* pretty */
  const pretty = makeShaderModule({
    name: "pretty",
    fragmentMain: /*glsl*/ `csm_DiffuseColor = vec4(1.0, 0.3, 0.5, 1.0);`
  })

  /* Compile Shader */
  const { callback, ...shader } = compileShader(
    makeTime(),
    pretty,
    makeWobble({ axis: "x", frequency: 7 }),
    makeWobble({ axis: "y", frequency: 5 }),
    makeWobble({ axis: "z", frequency: 3 })
  )

  /* Update time */
  useFrame((_, dt) => callback(mesh.current, dt))

  /* Debug */
  console.log(shader.vertexShader)
  console.log(shader.fragmentShader)

  return (
    <mesh position-y={8} ref={mesh}>
      <sphereGeometry args={[5]} />
      <CustomShaderMaterial baseMaterial={MeshStandardMaterial} {...shader} />
    </mesh>
  )
}
