import { GLSLType, Program, Variables } from "./types"
import { Value, Variable } from "./Variable"

type Outputs<T extends GLSLType | undefined> = T extends GLSLType
  ? Variables & { value: Variable<T> }
  : Variables

export abstract class ShaderNode<T extends GLSLType | undefined = any> {
  /** Human-readable name. */
  name: string = "Unnamed Shader Node"

  /** Machine-readable name; will be used as part of GLSL variable names. */
  slug?: string

  vertex: Program = {}
  fragment: Program = {}

  inputs: Variables = {}

  abstract outputs: Outputs<T>

  /** Returns this node's immediate dependencies. */
  getDependencies() {
    const dependencies = new Set<ShaderNode<GLSLType>>()

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

  float(value?: Value<"float">): Variable<"float"> {
    return this.variable("float", value)
  }
}

export abstract class RootNode extends ShaderNode<undefined> {
  outputs: Outputs<undefined> = {}
}
