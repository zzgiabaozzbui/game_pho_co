"use client";

import { useEffect, useRef } from "react";
import {
  disposeThreeObject,
  easeOutBack,
  loadGltfLoader,
  loadThree,
  type ThreeModule,
} from "@/lib/three-loader";

function createSparkleTexture(THREE: ThreeModule) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 64, 64);

  // Soft radiant center glow
  const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  radGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
  radGrad.addColorStop(0.2, "rgba(255, 235, 150, 0.85)");
  radGrad.addColorStop(0.55, "rgba(255, 200, 50, 0.25)");
  radGrad.addColorStop(1, "rgba(255, 200, 50, 0)");
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  // 4-point star rays
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(32, 2);
  ctx.quadraticCurveTo(32, 32, 62, 32);
  ctx.quadraticCurveTo(32, 32, 32, 62);
  ctx.quadraticCurveTo(32, 32, 2, 32);
  ctx.quadraticCurveTo(32, 32, 32, 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createStudioEnv(
  THREE: ThreeModule,
  renderer: InstanceType<ThreeModule["WebGLRenderer"]>
) {
  if (typeof document === "undefined") return null;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envCanvas = document.createElement("canvas");
  envCanvas.width = 128;
  envCanvas.height = 64;
  const ctx = envCanvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 64);
    grad.addColorStop(0, "#fff5d0");
    grad.addColorStop(0.3, "#f0be60");
    grad.addColorStop(0.7, "#402010");
    grad.addColorStop(1, "#180c05");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 64);

    const spot = ctx.createRadialGradient(40, 20, 0, 40, 20, 30);
    spot.addColorStop(0, "#ffffff");
    spot.addColorStop(0.5, "#ffe699");
    spot.addColorStop(1, "rgba(255, 230, 153, 0)");
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(40, 20, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
  envTexture.dispose();
  pmremGenerator.dispose();
  return envMap;
}

export default function InlineThreeRenderer({
  modelGlbPath,
  opened,
  onTapChest,
  onError,
  onLoaded,
}: {
  modelGlbPath: string;
  opened: boolean;
  onTapChest: () => void;
  onError: () => void;
  onLoaded?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(opened);

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let loadedNotified = false;
    const notifyLoaded = () => {
      if (loadedNotified || disposed) return;
      loadedNotified = true;
      onLoaded?.();
    };
    const cleanupFns: Array<() => void> = [];
    let teardown: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await loadThree();
        const GLTFLoader = await loadGltfLoader();
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mount.appendChild(renderer.domElement);
        teardown = () => {
          renderer.dispose();
          renderer.forceContextLoss?.();
          renderer.domElement.remove();
        };

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          38,
          mount.clientWidth / mount.clientHeight,
          0.1,
          50
        );
        camera.position.set(0, 1.28, 2.35);
        camera.lookAt(0, 0.42, 0);

        // Environment map for lustrous metallic reflections
        const envMap = createStudioEnv(THREE, renderer);
        if (envMap) {
          scene.environment = envMap;
        }

        // Three-point storybook lighting + cavity glow
        scene.add(new THREE.AmbientLight(0xfff5e4, 0.65));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(-2.5, 4, 3);
        scene.add(key);

        const rim = new THREE.DirectionalLight(0xffcc77, 1.4);
        rim.position.set(2.5, 3, -2.5);
        scene.add(rim);

        const fill = new THREE.DirectionalLight(0xc0d8ff, 0.6);
        fill.position.set(2, 1.2, 2.5);
        scene.add(fill);

        // Warm cavity light inside the chest that glows onto coins and velvet
        const cavityLight = new THREE.PointLight(0xffdf88, 1.5, 3);
        cavityLight.position.set(0, 0.55, 0.05);
        scene.add(cavityLight);

        const gltf = await new GLTFLoader().loadAsync(modelGlbPath);
        if (disposed) {
          renderer.dispose();
          renderer.forceContextLoss?.();
          renderer.domElement.remove();
          return;
        }
        const chest = gltf.scene;
        scene.add(chest);

        const lid = chest.getObjectByName("lid");

        // Dynamic 4-point star sparkles matching reference Image 2
        const sparkleTexture = createSparkleTexture(THREE);
        const sparkleGroup = new THREE.Group();
        const sparkles: Array<{
          sprite: InstanceType<ThreeModule["Sprite"]>;
          baseScale: number;
          speed: number;
          phase: number;
        }> = [];

        if (sparkleTexture) {
          const sparklePoints = [
            { pos: [0.02, 0.72, 0.10], scale: 0.16, speed: 2.5, phase: 0 }, // crown peak
            { pos: [0.36, 0.85, 0.04], scale: 0.18, speed: 2.2, phase: 1.2 }, // sword pommel
            { pos: [0.22, 0.60, 0.04], scale: 0.14, speed: 3.0, phase: 2.4 }, // sword blade
            { pos: [-0.30, 0.72, 0.10], scale: 0.17, speed: 2.7, phase: 3.6 }, // cross ruby
            { pos: [0.14, 0.65, 0.16], scale: 0.16, speed: 2.9, phase: 4.5 }, // sapphire cluster
            { pos: [-0.38, 0.60, 0.18], scale: 0.15, speed: 2.4, phase: 0.8 }, // ruby cluster
            { pos: [0.0, 0.38, 0.38], scale: 0.13, speed: 3.2, phase: 1.9 }, // pearl front loop
            { pos: [-0.12, 0.56, 0.36], scale: 0.14, speed: 2.8, phase: 5.1 }, // coins spill left
            { pos: [0.24, 0.54, 0.35], scale: 0.14, speed: 2.6, phase: 3.1 }, // coins spill right
          ];

          for (const sp of sparklePoints) {
            const mat = new THREE.SpriteMaterial({
              map: sparkleTexture,
              color: 0xfffae6,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);
            sprite.scale.set(sp.scale, sp.scale, 1);
            sparkleGroup.add(sprite);
            sparkles.push({
              sprite,
              baseScale: sp.scale,
              speed: sp.speed,
              phase: sp.phase,
            });
          }
          chest.add(sparkleGroup);
        }

        // Manual drag-rotation + idle auto-rotate
        let dragging = false;
        let lastX = 0;
        let movedPx = 0;
        let yawTarget = -0.45;
        let yaw = yawTarget;
        const canvas = renderer.domElement;

        const down = (e: PointerEvent) => {
          dragging = true;
          lastX = e.clientX;
          movedPx = 0;
        };
        const move = (e: PointerEvent) => {
          if (!dragging) return;
          movedPx += Math.abs(e.clientX - lastX);
          yawTarget += (e.clientX - lastX) * 0.01;
          lastX = e.clientX;
        };
        const up = () => {
          dragging = false;
        };
        const click = () => {
          if (movedPx <= 8) onTapChest();
        };
        canvas.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        canvas.addEventListener("click", click);
        cleanupFns.push(() => {
          canvas.removeEventListener("pointerdown", down);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          canvas.removeEventListener("click", click);
        });

        const ro = new ResizeObserver(() => {
          const w = mount.clientWidth || 288;
          const h = mount.clientHeight || 224;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
        ro.observe(mount);
        cleanupFns.push(() => ro.disconnect());

        let lidT = 0;
        let elapsedTime = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          frame = requestAnimationFrame(tick);
          if (document.hidden) return;
          const dt = Math.min(clock.getDelta(), 0.05);
          elapsedTime += dt;

          if (!dragging) yawTarget += dt * 0.22;
          yaw += (yawTarget - yaw) * Math.min(1, dt * 8);
          chest.rotation.y = yaw;

          if (lid) {
            if (openedRef.current && lidT < 1) lidT = Math.min(1, lidT + dt * 1.8);
            lid.rotation.x = -1.9 * easeOutBack(lidT);
          }

          // Animate twinkling sparkles
          for (const sp of sparkles) {
            const wave = Math.sin(elapsedTime * sp.speed + sp.phase);
            const scale = sp.baseScale * (0.65 + 0.45 * wave);
            sp.sprite.scale.set(scale, scale, 1);
            sp.sprite.material.opacity = Math.max(0.2, 0.4 + 0.6 * wave);
            sp.sprite.material.rotation = elapsedTime * 0.5 + sp.phase;
          }

          renderer.render(scene, camera);
        };
        tick();
        notifyLoaded();

        teardown = () => {
          cancelAnimationFrame(frame);
          cleanupFns.forEach((f) => f());
          if (envMap) envMap.dispose();
          if (sparkleTexture) sparkleTexture.dispose();
          disposeThreeObject(scene);
          renderer.dispose();
          renderer.forceContextLoss?.();
          canvas.remove();
        };
      } catch {
        if (!disposed) onError();
      }
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelGlbPath]);

  return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
