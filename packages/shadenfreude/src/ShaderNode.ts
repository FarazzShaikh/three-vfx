import { GLSLType, Program, Variables } from "./types"
import { Value, Variable } from "./Variable"

export type ShaderNodeProps = any
export type ShaderNodeOptions = { [key: string]: any }

export abstract class ShaderNode<O extends ShaderNodeOptions = {}> {
  constructor(protected props: any = {}, protected opts: O = {} as O) {}

  /** Human-readable name. */
  name: string = "Unnamed Shader Node"

  /** Machine-readable name; will be used as part of GLSL variable names. */
  slug?: string

  vertex: Program = {}
  fragment: Program = {}
  inputs: Variables = {}
  outputs: Variables = {}

  /** Returns this node's immediate dependencies. */
  getDependencies() {
    const dependencies = new Set<ShaderNode>()

    for (const input of Object.values(this.inputs)) {
      if (input.value instanceof Variable) {
        dependencies.add(input.value.node)
      }
    }

    return [...dependencies]
  }

  /** Creates a variable of the specified type, linked to this node. */
  variable<T extends GLSLType>(type: T, value?: Value<T>): Variable<T> {
    const variable = new Variable(this, type, value)
    return variable
  }

  float(value?: Value<"float">) {
    return this.variable("float", value)
  }

  vec3(value?: Value<"vec3">) {
    return this.variable("vec3", value)
  }
}

export abstract class RootNode extends ShaderNode {}
