"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadThree,
  loadGltfLoader,
  disposeThreeObject,
  type ThreeModule,
} from "@/lib/three-loader";
import type { IglooLandingData } from "../landing-igloo.data";

interface Props {
  data: IglooLandingData["artifacts"];
  onInteract?: () => void;
}

export function ArtifactChamber3D({ data, onInteract }: Props) {
  const [activeTierIndex, setActiveTierIndex] = useState(0);
  const activeTier = data.tiers[activeTierIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Rotation control state
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const modelRotation = useRef({ x: 0.1, y: 0 });
  const targetRotation = useRef({ x: 0.1, y: 0 });

  // References for three engine
  const currentModelGroup = useRef<InstanceType<ThreeModule["Group"]> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let animId: number | null = null;
    let renderer: InstanceType<ThreeModule["WebGLRenderer"]> | null = null;
    let scene: InstanceType<ThreeModule["Scene"]> | null = null;
    let camera: InstanceType<ThreeModule["PerspectiveCamera"]> | null = null;
    let dirLight: InstanceType<ThreeModule["DirectionalLight"]> | null = null;
    let rimLight: InstanceType<ThreeModule["PointLight"]> | null = null;

    setIsLoading(true);
    setLoadError(false);

    Promise.all([loadThree(), loadGltfLoader()])
      .then(([THREE, GLTFLoader]) => {
        if (destroyed || !containerRef.current) return;

        scene = new THREE.Scene();

        const w = container.clientWidth || 400;
        const h = container.clientHeight || 400;

        camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
        camera.position.set(0, 0.4, 3.2);

        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          });
        } catch {
          setLoadError(true);
          return;
        }

        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        container.appendChild(renderer.domElement);

        // Studio lighting
        const amb = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(amb);

        dirLight = new THREE.DirectionalLight(0xffeedd, 2.2);
        dirLight.position.set(2, 4, 3);
        scene.add(dirLight);

        rimLight = new THREE.PointLight(
          new THREE.Color(activeTier.color),
          3.5,
          6
        );
        rimLight.position.set(-2, 1, -1);
        scene.add(rimLight);

        // Ground reflection ring
        const ringGeo = new THREE.RingGeometry(0.8, 1.1, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(activeTier.color),
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.7;
        scene.add(ring);

        // Load active GLTF model
        const loader = new GLTFLoader();
        loader.load(
          activeTier.modelPath,
          (gltf) => {
            if (destroyed || !scene) return;
            const model = gltf.scene;

            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.3 / (maxDim || 1);
            model.scale.set(scale, scale, scale);

            const center = box.getCenter(new THREE.Vector3());
            model.position.set(-center.x * scale, -center.y * scale - 0.1, -center.z * scale);

            const group = new THREE.Group();
            group.add(model);
            scene.add(group);
            currentModelGroup.current = group;

            setIsLoading(false);
          },
          undefined,
          () => {
            if (!destroyed) {
              setIsLoading(false);
              setLoadError(true);
            }
          }
        );

        // Render loop with idle spin + interactive drag
        const clock = new THREE.Clock();
        const renderLoop = () => {
          if (destroyed || !renderer || !scene || !camera) return;

          const delta = clock.getDelta();
          const elapsed = clock.getElapsedTime();

          // Auto spin if not dragging
          if (!isDragging.current) {
            targetRotation.current.y += delta * 0.4;
          }

          // Smooth lerp to target rotation
          modelRotation.current.x += (targetRotation.current.x - modelRotation.current.x) * 0.1;
          modelRotation.current.y += (targetRotation.current.y - modelRotation.current.y) * 0.1;

          if (currentModelGroup.current) {
            currentModelGroup.current.rotation.x = modelRotation.current.x;
            currentModelGroup.current.rotation.y = modelRotation.current.y;
            currentModelGroup.current.position.y = Math.sin(elapsed * 1.5) * 0.05;
          }

          ring.rotation.z = elapsed * 0.2;

          renderer.render(scene, camera);
          animId = requestAnimationFrame(renderLoop);
        };

        animId = requestAnimationFrame(renderLoop);

        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera) return;
          const newW = containerRef.current.clientWidth;
          const newH = containerRef.current.clientHeight;
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      })
      .catch(() => {
        if (!destroyed) setLoadError(true);
      });

    return () => {
      destroyed = true;
      if (animId !== null) cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      if (scene) {
        disposeThreeObject(scene);
      }
      currentModelGroup.current = null;
    };
  }, [activeTier.modelPath, activeTier.color]);

  // Pointer drag listeners
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
    onInteract?.();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - prevPointer.current.x;
    const deltaY = e.clientY - prevPointer.current.y;
    prevPointer.current = { x: e.clientX, y: e.clientY };

    targetRotation.current.y += deltaX * 0.01;
    targetRotation.current.x = Math.max(
      -0.5,
      Math.min(0.5, targetRotation.current.x + deltaY * 0.01)
    );
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl md:p-10">
      {/* Glow highlight */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-[100px] transition-colors duration-700"
        style={{ backgroundColor: activeTier.color }}
      />

      {/* Tier Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
            {data.sectionTag}
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {data.heading}
          </h3>
        </div>

        {/* Tier Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {data.tiers.map((tier, idx) => {
            const isSelected = idx === activeTierIndex;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  setActiveTierIndex(idx);
                  onInteract?.();
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? "border border-white/30 bg-white/15 text-white shadow-lg"
                    : "border border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                {tier.name.split(" ")[1] || tier.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chamber Grid */}
      <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* 3D Canvas Viewport (7 cols) */}
        <div className="relative flex aspect-square w-full max-w-[500px] mx-auto items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 lg:col-span-7">
          {/* Subtle grid lines background */}
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] rounded-xl"
            aria-hidden="true"
          />

          {/* Prompt banner */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[11px] text-white/60 backdrop-blur-md">
            {data.inspectPrompt}
          </div>

          {/* Real Three.js Canvas Container */}
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="h-full w-full cursor-grab active:cursor-grabbing touch-none select-none"
          />

          {/* Loading / Error fallback */}
          {isLoading && !loadError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}

          {loadError && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div
                className="h-24 w-24 rounded-2xl border border-white/20 p-4"
                style={{ backgroundColor: activeTier.glowColor }}
              >
                <div className="h-full w-full rounded border border-white/40" />
              </div>
              <span className="mt-3 font-mono text-xs text-white/70">
                {activeTier.name} (Preview Model)
              </span>
            </div>
          )}
        </div>

        {/* Tier Details Panel (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div>
            <div
              className="inline-block rounded border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-widest"
              style={{
                borderColor: `${activeTier.color}55`,
                color: activeTier.color,
                backgroundColor: `${activeTier.color}15`,
              }}
            >
              {activeTier.rarity}
            </div>
            <h4 className="mt-2 text-3xl font-bold tracking-tight text-white">
              {activeTier.name}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {activeTier.desc}
            </p>
          </div>

          {/* Spec Badges */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between border-b border-white/5 pb-2.5 text-xs">
              <span className="font-mono text-white/50">TỶ LỆ RƠI / SPEC</span>
              <span className="font-mono text-right font-semibold text-white/90">
                {activeTier.spec}
              </span>
            </div>
            <div className="flex items-start justify-between border-b border-white/5 pb-2.5 text-xs">
              <span className="font-mono text-white/50">TỌA ĐỘ RƠI</span>
              <span className="font-mono text-right font-semibold text-white/90">
                {activeTier.dropLocation}
              </span>
            </div>
            <div className="flex items-start justify-between text-xs">
              <span className="font-mono text-white/50">BÍ MẬT KHO BÁU</span>
              <span className="font-mono text-right font-semibold text-amber-400">
                {activeTier.rewardHint}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
