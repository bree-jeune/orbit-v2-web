import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const planetsData = [
  { distance: 80, speed: 0.04, color: 0x00ffff },
  { distance: 140, speed: 0.02, color: 0xffeb3b },
  { distance: 100, speed: 0.06, color: 0x00ffcc },
];

export function PlanetOrbit({ paused }) {
  const group = useRef();

  useFrame(() => {
    if (!paused && group.current) {
      group.current.children.forEach((pl) => {
        pl.userData.angle += pl.userData.speed;
        pl.position.x = Math.cos(pl.userData.angle) * pl.userData.dist;
        pl.position.z = Math.sin(pl.userData.angle) * pl.userData.dist;
      });
    }
  });

  return (
    <group ref={group}>
      {planetsData.map((pd, i) => (
        <mesh
          key={i}
          position={[pd.distance, 0, 0]}
          userData={{ angle: Math.random() * Math.PI * 2, dist: pd.distance, speed: pd.speed }}
        >
          <sphereGeometry args={[8, 32, 32]} />
          <meshStandardMaterial color={pd.color} emissive={pd.color / 4} />
        </mesh>
      ))}
    </group>
  );
}
