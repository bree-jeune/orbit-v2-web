export function CentralPlanet() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <sphereGeometry args={[20, 64, 64]} />
      <meshStandardMaterial
        color="#1e3fff"
        emissive="#000040"
        roughness={0.4}
      />
    </mesh>
  );
}
