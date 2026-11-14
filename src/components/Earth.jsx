export default function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#2876b8" />
    </mesh>
  );
}
