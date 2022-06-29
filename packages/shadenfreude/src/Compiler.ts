import { ShaderNode } from "./ShaderNode"
import { ProgramType } from "./types"

export class Compiler {
  constructor(public root: ShaderNode<any>) {}

  compile() {
    const vertexShader = this.compileProgram("vertex")
    const fragmentShader = this.compileProgram("fragment")

    return { vertexShader, fragmentShader }
  }

  private compileProgram(programType: ProgramType) {
    return `
      ${this.compileProgramHeader(this.root, programType)}

      void main() {
        ${this.compileProgramBody(this.root, programType)}
      }
    `
  }

  private compileProgramHeader(
    node: ShaderNode<any>,
    programType: ProgramType
  ) {
    return `
      /* TODO: Dependencies */

      /*** BEGIN: ${this.root.name} ***/
      ${node[programType].header ?? ""}
      /*** END: ${this.root.name} ***/
    `
  }

  private compileProgramBody(node: ShaderNode<any>, programType: ProgramType) {
    return `
      /*** BEGIN: ${this.root.name} ***/

      /* TODO: Dependencies */

      /* TODO: Output Variables */

      {
        /* TODO: Input Variables */

        /* Body Chunk */
        ${node[programType].body ?? ""}

        /* TODO: Assign Output Variables */
      }

      /*** END: ${this.root.name} ***/
    `
  }
}
