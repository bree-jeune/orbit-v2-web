import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { CentralPlanet } from "./CentralPlanet";
import { PlanetOrbit } from "./PlanetOrbit";
import { AutoRotateControl } from "./controls";

export default function OrbitScene({ paused, zoomed }) {
  return (
    <Canvas camera={{ position: [0, 60, zoomed ? 180 : 280] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} />
      <Stars />
      <OrbitControls enableDamping makeDefault />
      <CentralPlanet paused={paused} />
      <PlanetOrbit paused={paused} />
      <AutoRotateControl paused={paused} />
      <SoundManager />
    </Canvas>
  );
}

function SoundManager() {
  const { camera } = useThree();

  useEffect(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);

    const ambientSound = new THREE.Audio(listener);

    new THREE.AudioLoader().load("/sounds/Space Ambience.mp3", (buffer) => {
      ambientSound.setBuffer(buffer);
      ambientSound.setLoop(true);
      ambientSound.setVolume(0.4);
      ambientSound.play();
    });

    return () => {
      camera.remove(listener);
      if (ambientSound.isPlaying) ambientSound.stop();
    };
  }, [camera]);

  return null;
}
