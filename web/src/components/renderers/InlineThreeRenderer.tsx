"use client";

import { useEffect, useRef } from "react";
import {
  disposeThreeObject,
  easeOutBack,
  loadGltfLoader,
  loadThree,
} from "@/lib/three-loader";

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
        // ACES + exposure để vàng sáng rực mà không cháy trắng trên nền overlay tối
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
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
        camera.position.set(0, 1.35, 2.4);
        camera.lookAt(0, 0.45, 0);

        // Bộ 3 đèn storybook: key ấm trước-trên-trái, rim vàng từ sau-phải,
        // fill lạnh nhẹ — đủ sáng để thân đỏ/gold đọc rõ trên overlay tối.
        scene.add(new THREE.AmbientLight(0xfff6e0, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 2.2);
        key.position.set(-2.5, 4, 3);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffc98a, 1.0);
        rim.position.set(2.5, 3, -2.5);
        scene.add(rim);
        const fill = new THREE.DirectionalLight(0xbdd2ff, 0.5);
        fill.position.set(2, 1.2, 2.5);
        scene.add(fill);

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

        // xoay-tay (spec §5: "canvas xoay-tay") + auto-rotate chậm khi rảnh
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
        const clock = new THREE.Clock();
        const tick = () => {
          frame = requestAnimationFrame(tick);
          if (document.hidden) return; // dừng render khi tab ẩn
          const dt = Math.min(clock.getDelta(), 0.05);
          if (!dragging) yawTarget += dt * 0.25;
          yaw += (yawTarget - yaw) * Math.min(1, dt * 8);
          chest.rotation.y = yaw;
          if (lid) {
            if (openedRef.current && lidT < 1) lidT = Math.min(1, lidT + dt * 1.8);
            lid.rotation.x = -1.9 * easeOutBack(lidT);
          }
          renderer.render(scene, camera);
        };
        tick();
        notifyLoaded();

        teardown = () => {
          cancelAnimationFrame(frame);
          cleanupFns.forEach((f) => f());
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
