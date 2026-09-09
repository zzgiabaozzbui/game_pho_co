"use client";

/**
 * Static degrade path (T12) for WebGL init failure — `Stage.tsx` wraps its
 * `THREE.WebGLRenderer(...)` construction in try/catch and swaps to this
 * component if it throws (no WebGL support / context creation failed).
 *
 * Reduced motion is handled by `Stage.tsx` itself, NOT by swapping to this
 * component: Stage still builds the real scene and renders exactly one
 * static WebGL frame (no rAF loop) — see the doc comment there. That
 * satisfies "no animation loop" without giving up the actual emblem/card, and
 * needs no separate path here. This component only covers the
 * no-WebGL-at-all case.
 *
 * Plain DOM, no canvas: an accent-tinted radial gradient plus the emblem
 * word as styled text, sized to roughly the hero's visual weight so nothing
 * shifts layout if this is what a viewer sees from first paint.
 */
export function Fallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--l6-z-webgl)",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(60% 50% at 50% 45%, var(--l6-accent-glow), transparent 70%)",
      }}
    >
      <span
        className="l6-display"
        style={{ color: "var(--l6-accent)", opacity: 0.5 }}
      >
        PHỞ
      </span>
    </div>
  );
}
