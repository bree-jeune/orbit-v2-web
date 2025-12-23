import { useThree, useFrame } from "@react-three/fiber";

export function AutoRotateControl({ paused }) {
  const controls = useThree((state) => state.controls);

  useFrame(() => {
    if (!paused && controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
    } else if (controls) {
      controls.autoRotate = false;
    }
  });

  return null;
}
