"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  disposeThreeObject,
  easeOutBack,
  loadGltfLoader,
  loadThree,
} from "@/lib/three-loader";

const PARTICLE_COUNT = 60;

export default function WebXRRenderer({
  modelGlbPath,
  onOpened,
  onUnavailable,
}: {
  modelGlbPath: string;
  onOpened: () => void;
  onUnavailable: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<() => void>(() => {});
  const { t } = useLang();
  const [phase, setPhase] = useState<"placing" | "placed" | "opening">(
    "placing"
  );

  useEffect(() => {
    const overlayRoot = overlayRef.current;
    if (!overlayRoot) return;

    let disposed = false;
    let ended = false;
    let stopEarly: (() => void) | null = null;
    let liveSession: XRSession | null = null;
    let teardownStartup: (() => void) | null = null;

    (async () => {
      try {
        const THREE = await loadThree();
        const GLTFLoader = await loadGltfLoader();

        // lib.dom của TS đã có sẵn kiểu WebXR (navigator.xr: XRSystem)
        if (!navigator.xr) throw new Error("no webxr");
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: { root: overlayRoot },
        });
        liveSession = session;
        if (disposed) {
          void session.end().catch(() => {});
          return;
        }

        const gltf = await new GLTFLoader().loadAsync(modelGlbPath);
        if (disposed) {
          void session.end().catch(() => {});
          return;
        }
        const chest = gltf.scene;
        chest.visible = false;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.xr.enabled = true;
        await renderer.xr.setSession(session);
        if (disposed) {
          void session.end().catch(() => {});
          renderer.dispose();
          return;
        }

        const scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xfff6e0, 0x33301f, 1.2));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
        dirLight.position.set(1.5, 4, 2);
        scene.add(dirLight);
        const camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          40
        );

        // reticle mặt phẳng
        const ringGeo = new THREE.RingGeometry(0.09, 0.12, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const reticle = new THREE.Mesh(
          ringGeo,
          new THREE.MeshBasicMaterial({ color: 0xf7c948 })
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add(reticle);
        scene.add(chest);

        // particle vàng khi mở nắp
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
          color: 0xf7c948,
          size: 0.04,
          transparent: true,
          opacity: 1,
        });
        const particles = new THREE.Points(pGeo, pMat);
        particles.visible = false;
        scene.add(particles);
        let particleLife = -1;

        teardownStartup = () => {
          renderer.setAnimationLoop(null);
          renderer.domElement.remove();
          disposeThreeObject(scene);
          renderer.dispose();
        };

        const viewerSpace = await session.requestReferenceSpace("viewer");
        if (disposed) {
          void session.end().catch(() => {});
          teardownStartup();
          return;
        }
        const hitTestSource =
          await session.requestHitTestSource?.({ space: viewerSpace });
        if (disposed) {
          void session.end().catch(() => {});
          teardownStartup();
          return;
        }
        const refSpace = await session.requestReferenceSpace("local");
        if (disposed) {
          void session.end().catch(() => {});
          teardownStartup();
          return;
        }

        document.body.appendChild(renderer.domElement);

        const lid = chest.getObjectByName("lid");
        let placed = false;
        let lidT = 0;
        let openAtMs: number | null = null;

        const onSelect = () => {
          if (!placed && reticle.visible) {
            chest.position.setFromMatrixPosition(reticle.matrix);
            chest.position.y += 0.02;
            chest.visible = true;
            placed = true;
            reticle.visible = false;
            setPhase("placed");
          } else if (placed && openAtMs === null) {
            openAtMs = performance.now();
            setPhase("opening");
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              positions[i * 3] = chest.position.x;
              positions[i * 3 + 1] = chest.position.y + 0.55;
              positions[i * 3 + 2] = chest.position.z;
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.4 + Math.random() * 0.8;
              velocities[i * 3] = Math.cos(angle) * speed;
              velocities[i * 3 + 1] = 1.2 + Math.random() * 1.2;
              velocities[i * 3 + 2] = Math.sin(angle) * speed;
            }
            particles.visible = true;
            particleLife = 0;
          }
        };
        session.addEventListener("select", onSelect);

        const finish = () => {
          if (ended) return;
          ended = true;
          renderer.setAnimationLoop(null);
          session.removeEventListener("select", onSelect);
          renderer.domElement.remove();
          disposeThreeObject(scene);
          renderer.dispose();
          onOpened();
        };
        session.addEventListener("end", finish);

        stopEarly = () => {
          if (ended) return;
          void session.end().catch(() => {});
        };
        endRef.current = stopEarly;

        const clock = new THREE.Clock();
        renderer.setAnimationLoop((_, frame) => {
          const dt = Math.min(clock.getDelta(), 0.05);
          if (frame && hitTestSource && !placed) {
            const hits = frame.getHitTestResults(hitTestSource);
            const pose = hits.length > 0 ? hits[0].getPose(refSpace) : null;
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            } else {
              reticle.visible = false;
            }
          }
          if (placed) {
            chest.rotation.y += dt * 0.4;
            if (openAtMs !== null && lid) {
              lidT = Math.min(1, lidT + dt * 1.6);
              lid.rotation.x = -1.9 * easeOutBack(lidT);
            }
          }
          if (particleLife >= 0) {
            particleLife += dt;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              positions[i * 3] += velocities[i * 3] * dt;
              positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
              positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
              velocities[i * 3 + 1] -= 2.2 * dt;
            }
            pMat.opacity = Math.max(0, 1 - particleLife / 1.2);
            pGeo.attributes.position.needsUpdate = true;
            if (particleLife > 1.2) {
              particles.visible = false;
              particleLife = -1;
            }
          }
          if (openAtMs !== null && performance.now() - openAtMs > 1800) {
            void session.end().catch(() => {});
          }
          renderer.render(scene, camera);
        });
      } catch {
        if (liveSession) void liveSession.end().catch(() => {});
        teardownStartup?.();
        if (!disposed) onUnavailable(); // fallback inline theo spec §6
      }
    })();

    return () => {
      disposed = true;
      stopEarly?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelGlbPath]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[60]">
      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
        <p className="rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-paper">
          {phase === "placing" ? t("ar.place_hint") : t("ar.tap_chest_ar")}
        </p>
        <button
          onClick={() => endRef.current()}
          className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink shadow-lg active:scale-95"
        >
          <X className="h-4 w-4" />
          {t("ar.exit_ar")}
        </button>
      </div>
    </div>
  );
}
