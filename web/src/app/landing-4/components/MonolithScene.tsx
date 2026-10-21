"use client";

import { useEffect, useRef, useState } from "react";
import { loadThree, disposeThreeObject, type ThreeModule } from "@/lib/three-loader";

export function MonolithScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let animId: number | null = null;
    let renderer: InstanceType<ThreeModule["WebGLRenderer"]> | null = null;
    let scene: InstanceType<ThreeModule["Scene"]> | null = null;

    // Mouse coordinates tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 1.2;
      targetY = (e.clientY / innerHeight - 0.5) * 0.9;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    loadThree()
      .then((THREE) => {
        if (destroyed || !containerRef.current) return;

        // 1. Scene setup
        scene = new THREE.Scene();

        // 2. Camera setup
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 600;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 4.8);

        // 3. Renderer setup
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          });
        } catch {
          setHasError(true);
          return;
        }

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // 4. Lighting (Igloo style: dark dramatic contrast + amber/cyan accents)
        const ambientLight = new THREE.AmbientLight(0x0a101d, 1.2);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
        keyLight.position.set(3, 4, 3);
        scene.add(keyLight);

        const goldRimLight = new THREE.DirectionalLight(0xf59e0b, 3.2);
        goldRimLight.position.set(-3, -2, -2);
        scene.add(goldRimLight);

        const cyanFillLight = new THREE.PointLight(0x00f0ff, 2.0, 8);
        cyanFillLight.position.set(0, -2, 2);
        scene.add(cyanFillLight);

        // 5. Monolith Group (Root object)
        const monolithGroup = new THREE.Group();
        scene.add(monolithGroup);

        // Outer Faceted Monolith (Faceted Dodecahedron / Ancient Shard)
        const outerGeo = new THREE.DodecahedronGeometry(1.35, 1);
        const outerMat = new THREE.MeshPhysicalMaterial({
          color: 0x0f172a,
          metalness: 0.85,
          roughness: 0.18,
          transmission: 0.45,
          thickness: 0.8,
          ior: 1.6,
          reflectivity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          flatShading: true,
        });
        const outerMesh = new THREE.Mesh(outerGeo, outerMat);
        monolithGroup.add(outerMesh);

        // Golden Wireframe Edges
        const edgesGeo = new THREE.EdgesGeometry(outerGeo, 15);
        const edgesMat = new THREE.LineBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.65,
          linewidth: 1,
        });
        const wireframeLines = new THREE.LineSegments(edgesGeo, edgesMat);
        monolithGroup.add(wireframeLines);

        // Inner Pulsing Core (Imperial Amber/Gold)
        const innerGeo = new THREE.OctahedronGeometry(0.7, 0);
        const innerMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 1.5,
          roughness: 0.2,
          metalness: 0.8,
          wireframe: true,
        });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        monolithGroup.add(innerMesh);

        // Core Point Light
        const coreLight = new THREE.PointLight(0xf59e0b, 3.5, 4);
        monolithGroup.add(coreLight);

        // Floating Dust & Embers (1000-year history motes)
        const particleCount = 160;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleVelocities: { x: number; y: number; z: number }[] = [];

        for (let i = 0; i < particleCount; i++) {
          const r = 1.8 + Math.random() * 2.2;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          particlePositions[i * 3 + 2] = r * Math.cos(phi);

          particleVelocities.push({
            x: (Math.random() - 0.5) * 0.003,
            y: (Math.random() - 0.5) * 0.004 + 0.002, // drift upward
            z: (Math.random() - 0.5) * 0.003,
          });
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );

        const particleMat = new THREE.PointsMaterial({
          color: 0xfde68a,
          size: 0.035,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Resize handler
        const handleResize = () => {
          if (!containerRef.current || !renderer) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        window.addEventListener("resize", handleResize);

        // Render loop
        const clock = new THREE.Clock();
        setIsLoaded(true);

        const renderFrame = () => {
          if (destroyed || !renderer || !scene) return;

          clock.getDelta();
          const elapsed = clock.getElapsedTime();

          // Smooth mouse lerping
          currentX += (targetX - currentX) * 0.05;
          currentY += (targetY - currentY) * 0.05;

          // Scroll reactivity
          const scrollY = window.scrollY || 0;
          const scrollFactor = Math.min(scrollY / 1000, 2);

          // Monolith idle animation + mouse parallax + scroll rotation
          monolithGroup.rotation.y = elapsed * 0.18 + currentX * 0.8 + scrollFactor * 1.5;
          monolithGroup.rotation.x = currentY * 0.6 + Math.sin(elapsed * 0.4) * 0.1;
          monolithGroup.rotation.z = Math.cos(elapsed * 0.3) * 0.05;

          // Gentle floating bob
          monolithGroup.position.y = Math.sin(elapsed * 0.8) * 0.12 - scrollFactor * 0.4;

          // Core pulse
          const pulse = 1 + Math.sin(elapsed * 2.2) * 0.25;
          innerMesh.scale.set(pulse, pulse, pulse);
          innerMesh.rotation.y = -elapsed * 0.35;
          coreLight.intensity = 2.5 + Math.sin(elapsed * 2.2) * 1.2;

          // Animate particle dust
          const pos = particleGeo.attributes.position as InstanceType<
            ThreeModule["BufferAttribute"]
          >;
          const arr = pos.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            arr[i * 3] += particleVelocities[i].x;
            arr[i * 3 + 1] += particleVelocities[i].y;
            arr[i * 3 + 2] += particleVelocities[i].z;

            // Reset bounds
            if (arr[i * 3 + 1] > 3.0) arr[i * 3 + 1] = -3.0;
            if (arr[i * 3 + 1] < -3.0) arr[i * 3 + 1] = 3.0;
          }
          pos.needsUpdate = true;
          particles.rotation.y = elapsed * 0.04;

          renderer.render(scene, camera);
          animId = requestAnimationFrame(renderFrame);
        };

        animId = requestAnimationFrame(renderFrame);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      })
      .catch(() => {
        if (!destroyed) setHasError(true);
      });

    return () => {
      destroyed = true;
      window.removeEventListener("mousemove", handleMouseMove);
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
    };
  }, []);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full border border-amber-500/20 bg-amber-500/5 blur-xl" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}
