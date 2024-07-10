import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  extend,
  useThree,
  useFrame,
  Object3DNode,
  MaterialNode,
} from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
  RigidBodyProps,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useControls } from "leva";
import {
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  RepeatWrapping,
  Vector2,
  Vector3,
} from "three";

extend({
  MeshLineGeometry,
  MeshLineMaterial,
  MeshPhysicalMaterial,
});

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>;
  }
}

function Component() {
  const { debug } = useControls({ debug: false });

  return (
    <Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
      <ambientLight intensity={Math.PI} />
      <Physics
        debug={debug}
        interpolate
        gravity={[0, -40, 0]}
        timeStep={1 / 60}
      >
        <Band />
      </Physics>
      <Environment background blur={0.75}>
        <color attach="background" args={["black"]} />
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={10}
          color="white"
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
    </Canvas>
  );
}

interface Lerped {
  lerped?: Vector3;
}

export function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef<Mesh>(null);
  const fixed = useRef<RapierRigidBody & Lerped>(null);
  const j1 = useRef<RapierRigidBody & Lerped>(null);
  const j2 = useRef<RapierRigidBody & Lerped>(null);
  const j3 = useRef<RapierRigidBody & Lerped>(null);
  const card = useRef<RapierRigidBody & Lerped>(null);
  const vec = new Vector3(),
    ang = new Vector3(),
    rot = new Vector3(),
    dir = new Vector3();
  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };
  const { nodes, materials } = useGLTF("/tag.glb");
  const texture = useTexture("/band.jpg");
  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(
    () =>
      new CatmullRomCurve3([
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
      ])
  );
  const [dragged, drag] = useState(false as false | Vector3);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      // Fix most of the jitter when over pulling the card
      [j1, j2].forEach((ref) => {
        if (ref.current && !ref.current.lerped)
          ref.current.lerped = new Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(
            1,
            ref.current?.lerped?.distanceTo(ref.current.translation()) ?? 0
          )
        );
        ref.current?.lerped?.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      // Calculate catmul curve
      curve.points[0].copy(j3.current?.translation() ?? new Vector3());
      curve.points[1].copy(j2.current?.lerped ?? new Vector3());
      curve.points[2].copy(j1.current?.lerped ?? new Vector3());
      curve.points[3].copy(fixed.current.translation());
      (band.current?.geometry as MeshLineGeometry).setPoints(
        curve.getPoints(16)
      );
      // Tilt it back towards the screen
      ang.copy(card.current?.angvel() ?? new Vector3());
      rot.copy(card.current?.rotation() ?? new Vector3());
      card.current?.setAngvel(
        { x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z },
        true
      );
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (
              (e.target as HTMLDivElement)?.releasePointerCapture(e.pointerId),
              drag(false)
            )}
            onPointerDown={(e) => (
              (e.target as HTMLDivElement)?.setPointerCapture(e.pointerId),
              drag(
                new Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current?.translation() ?? new Vector3()))
              )
            )}
          >
            <mesh geometry={(nodes.card as Mesh).geometry}>
              <meshPhysicalMaterial
                map={(materials.base as MeshBasicMaterial).map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
            <mesh
              geometry={(nodes.clip as Mesh).geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh
              geometry={(nodes.clamp as Mesh).geometry}
              material={materials.metal}
            />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={new Vector2(width, height)}
          useMap={1}
          map={texture}
          repeat={new Vector2(-3, 1)}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

export default Component;
