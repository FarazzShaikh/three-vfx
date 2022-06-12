import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import {
  BufferGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry
} from "three"
import CustomShaderMaterial from "three-custom-shader-material/vanilla"

const tmpObj = new Object3D()

type ShaderModule = {
  name: string
  chunk: string
}

const generateModuleFunction = ({ name, chunk }: ShaderModule) =>
  /*glsl*/ `vec3 ${name}(vec3 offset) { ${chunk} return offset; }`

const generateModuleInvocation = ({ name }: ShaderModule) =>
  /*glsl*/ `offset = ${name}(offset);`

const float = (num: number) => num.toFixed(8)

const wobble: ShaderModule = {
  name: "wobble_462378", // needs to be unique, will automate this
  chunk: /*glsl*/ `
    offset.y += 8.0 + cos(u_time * 13.0) * 2.0;
    offset.x += 0.0 + sin(u_time * 7.0) * 2.0;
    offset.z += 0.0 + cos(u_time * 5.0) * 2.0;
  `
}

const makeShake = (
  axis: "x" | "y" | "z",
  frequency = 1.234,
  amplitude = 1
): ShaderModule => ({
  name: "shake_48932749", // needs to be unique, will automate this
  chunk: /*glsl*/ `
    offset.${axis} += cos(u_time * ${float(frequency)}) * ${float(amplitude)};
  `
})

class ParticlesMaterial extends CustomShaderMaterial {}

const configureParticles = (
  geometry: BufferGeometry,
  material: ParticlesMaterial,
  modules: ShaderModule[]
) => {
  const vertexShader = /*glsl*/ `
  uniform float u_time;

  ${modules.map(generateModuleFunction).join("\n")}

  void main() {
    /* Start with an origin offset */
    vec3 offset = vec3(0.0, 0.0, 0.0);

    /* Invoke custom chunks */
    ${modules.map(generateModuleInvocation).join("\n")}

    /* Apply the instance matrix. */
    offset *= mat3(instanceMatrix);

    /* Apply the offset */
    csm_Position += offset;
  }
`

  const fragmentShader = /*glsl*/ `
`

  const uniforms = {
    u_time: { value: 0 }
  }

  material.update({ vertexShader, fragmentShader, uniforms })
}

export const Composable = () => {
  const material = useMemo(
    () =>
      new ParticlesMaterial({
        baseMaterial: new MeshStandardMaterial({ color: "white" })
      }),
    []
  )

  const mesh = useMemo(() => {
    const geometry = new SphereGeometry()
    const mesh = new InstancedMesh(geometry, material, 1100)

    configureParticles(geometry, material, [wobble, makeShake("x", 6, 8)])

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
