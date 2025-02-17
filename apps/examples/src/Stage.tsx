import { GroupProps, useFrame } from "@react-three/fiber"
import { FC, useRef } from "react"
import { Group } from "three"

type StageProps = GroupProps & { speed?: number }

export const Stage: FC<StageProps> = ({ children, speed = 0, ...props }) => {
  const stage = useRef<Group>(null!)

  if (speed) {
    useFrame((_, dt) => {
      stage.current.rotation.y += speed * dt
    })
  }

  return (
    <group ref={stage} {...props}>
      <group position-y={-8}>
        {/* Floor */}
        <mesh position-y={-5} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color="#555" />
        </mesh>

        {/* Upper pedestral */}
        <mesh position-y={-0} receiveShadow>
          <cylinderGeometry args={[16, 16, 1, 64]} />
          <meshStandardMaterial color="#eee" metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Lower pedestral */}
        <mesh position-y={-3.5} receiveShadow>
          <cylinderGeometry args={[18, 20, 5, 64]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.4} />
        </mesh>

        {children}
      </group>
    </group>
  )
}
