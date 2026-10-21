"use client";

import { useEffect, useRef, useState } from "react";
import {
  disposeThreeObject,
  loadGltfLoader,
  loadThree,
  type ThreeModule,
} from "@/lib/three-loader";

export function InteractiveChest3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let renderer: InstanceType<ThreeModule["WebGLRenderer"]> | null = null;
    let scene: InstanceType<ThreeModule["Scene"]> | null = null;
    let camera: InstanceType<ThreeModule["PerspectiveCamera"]> | null = null;
    let rootGroup: InstanceType<ThreeModule["Group"]> | null = null;
    let animFrameId: number | null = null;

    // Pointer rotation controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.4;
    let targetRotationX = 0.15;
    let currentRotationY = 0.4;
    let currentRotationX = 0.15;

    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    async function init() {
      try {
        const THREE = await loadThree();
        const GLTFLoader = await loadGltfLoader();
        if (cancelled || !el) return;

        scene = new THREE.Scene();

        const width = el.clientWidth || 360;
        const height = el.clientHeight || 360;

        camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0.6, 2.6);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;

        renderer.domElement.style.maxWidth = "100%";
        renderer.domElement.style.maxHeight = "100%";
        renderer.domElement.style.objectFit = "contain";
        el.appendChild(renderer.domElement);

        // Night twilight lighting setup
        const ambient = new THREE.AmbientLight(0x8979c2, 1.2);
        scene.add(ambient);

        // Key light: Warm moonlight gold
        const keyLight = new THREE.DirectionalLight(0xfff1cf, 3.2);
        keyLight.position.set(2, 4, 3);
        scene.add(keyLight);

        // Rim light: Ethereal lilac
        const rimLight = new THREE.DirectionalLight(0xcbbcf6, 2.5);
        rimLight.position.set(-3, -1, -2);
        scene.add(rimLight);

        // Accent fill: Warm lantern glow
        const fillLight = new THREE.DirectionalLight(0xffa726, 1.2);
        fillLight.position.set(0, -2, 2);
        scene.add(fillLight);

        const loader = new GLTFLoader();
        loader.load(
          "/models/chest-gold.glb",
          (gltf) => {
            if (cancelled || !scene) return;
            rootGroup = gltf.scene;
            rootGroup.position.set(0, -0.12, 0);
            rootGroup.scale.set(0.8, 0.8, 0.8);
            scene.add(rootGroup);
            setLoading(false);
          },
          undefined,
          (err) => {
            console.warn("Failed loading chest-gold model, using fallback", err);
            setHasWebGL(false);
            setLoading(false);
          }
        );

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
          isDragging = true;
          const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
          const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
          prevMouseX = clientX;
          prevMouseY = clientY;
        };

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
          if (!isDragging) return;
          const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
          const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
          const deltaX = clientX - prevMouseX;
          const deltaY = clientY - prevMouseY;
          prevMouseX = clientX;
          prevMouseY = clientY;

          targetRotationY += deltaX * 0.008;
          targetRotationX += deltaY * 0.006;
          targetRotationX = Math.max(-0.4, Math.min(0.5, targetRotationX));
        };

        const onPointerUp = () => {
          isDragging = false;
        };

        el.addEventListener("mousedown", onPointerDown);
        window.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", onPointerUp);

        el.addEventListener("touchstart", onPointerDown, { passive: true });
        window.addEventListener("touchmove", onPointerMove, { passive: true });
        window.addEventListener("touchend", onPointerUp);

        const handleResize = () => {
          if (!el || !camera || !renderer) return;
          const w = el.clientWidth;
          const h = el.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        const animate = () => {
          if (cancelled) return;
          animFrameId = requestAnimationFrame(animate);

          if (!isDragging && !prefersReducedMotion) {
            targetRotationY += 0.0035;
          }

          currentRotationY += (targetRotationY - currentRotationY) * 0.08;
          currentRotationX += (targetRotationX - currentRotationX) * 0.08;

          if (rootGroup) {
            rootGroup.rotation.y = currentRotationY;
            rootGroup.rotation.x = currentRotationX;
          }

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        };

        animate();

        return () => {
          window.removeEventListener("resize", handleResize);
          el.removeEventListener("mousedown", onPointerDown);
          window.removeEventListener("mousemove", onPointerMove);
          window.removeEventListener("mouseup", onPointerUp);
          el.removeEventListener("touchstart", onPointerDown);
          window.removeEventListener("touchmove", onPointerMove);
          window.removeEventListener("touchend", onPointerUp);
        };
      } catch {
        setHasWebGL(false);
        setLoading(false);
      }
    }

    const cleanupPromise = init();

    return () => {
      cancelled = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      cleanupPromise.then((cleanup) => cleanup?.());
      if (scene) disposeThreeObject(scene);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div className="relative flex h-[180px] w-full max-w-[280px] items-center justify-center sm:h-[200px] lg:h-[210px]">
      {/* Radiant moonlight violet & golden ambient halo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 blur-3xl transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle, rgba(200, 187, 248, 0.45) 0%, rgba(254, 213, 114, 0.3) 35%, rgba(46, 40, 88, 0.2) 65%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Interactive canvas mount */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center select-none"
        role="region"
        aria-label="3D Interactive Treasure Chest"
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#13112a]/60 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#c8bbf8]" />
            <span className="font-mono text-xs text-[#c8bbf8]">
              ✦ Bảo vật 3D…
            </span>
          </div>
        </div>
      )}

      {/* 2D Fallback if WebGL fails */}
      {!hasWebGL && !loading && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="chest-box chest-opened scale-110">
            <svg
              viewBox="0 0 200 160"
              className="chest-svg drop-shadow-2xl"
              role="img"
              aria-label="Rương vàng hoàng gia"
            >
              <defs>
                <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fed572" />
                  <stop offset="100%" stopColor="#b27f18" />
                </linearGradient>
              </defs>
              <rect x="25" y="65" width="150" height="85" rx="10" fill="#181531" />
              <rect x="25" y="65" width="150" height="85" rx="10" fill="url(#gold-metal)" opacity="0.4" />
              <path d="M 25 65 Q 100 20 175 65 Z" fill="#b4432f" />
              <circle cx="100" cy="85" r="8" fill="#fed572" />
            </svg>
          </div>
          <p className="font-mono text-xs text-[#c8bbf8]">
            ✦ Rương Vàng Phẩm Cấp Hoàng Gia
          </p>
        </div>
      )}
    </div>
  );
}
