import { GLSLChunk } from "three-vfx"
import { ShaderNode } from "./ShaderNode"
import { GLSLtoJSType, GLSLType } from "./types"

export type Value<T extends GLSLType> =
  | GLSLtoJSType<T>
  | Variable<T>
  | ShaderNode<T>
  | GLSLChunk

export class Variable<T extends GLSLType> {}
