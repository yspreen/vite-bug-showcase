import { useGLTF, useTexture } from "@react-three/drei";
import Canvas from "./Canvas";

function Component() {
  return <Canvas />;
}
export default Component;

useGLTF.preload("/tag.glb");
useTexture.preload("/band.jpg");
