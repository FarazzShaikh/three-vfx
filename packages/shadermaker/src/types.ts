import { BufferGeometry, Material, Mesh } from "three"
import CustomShaderMaterialImpl from "three-custom-shader-material/vanilla"

export type Chunk = string

export type GLSLType = "float" | "vec2" | "vec3" | "vec4" | "mat4"

export type Uniform = {
  type: GLSLType
  value: any
}

export type Uniforms = Record<string, Uniform>

export type FrameCallback = (
  mesh: Mesh<BufferGeometry, CustomShaderMaterialImpl>,
  dt: number
) => void

export type ShaderModule = {
  name: string
  uniforms: Uniforms
  vertexHeader: Chunk
  vertexMain: Chunk
  fragmentHeader: Chunk
  fragmentMain: Chunk
  frameCallback?: FrameCallback
}
