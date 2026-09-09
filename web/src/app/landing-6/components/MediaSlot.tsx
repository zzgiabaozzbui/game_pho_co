"use client";

/**
 * Shared PLACEHOLDER-safe media slot — extracted at T16 from StoryIntroChapter
 * (T14) and StoryProjectChapter (T15), which each carried a byte-identical
 * file-local copy (T15's doc comment flagged this: "two call sites is a
 * coincidence, three is a pattern worth extracting" — T16 is the 3rd).
 *
 * Resolves `path` via `resolveAsset()`: PLACEHOLDER renders a labelled opaque
 * hairline box, a real path renders a plain `<img>`. The box is opaque (not
 * just a border) because the persistent WebGL card (`CardMesh.ts`) parks
 * behind chapter content at several keyframes — a transparent placeholder
 * would let it show through and read as clutter behind the label text.
 *
 * **T25: stayed on `<img>`, didn't switch to `next/image`.** Every call site
 * (8 chapter files) sizes its box entirely via the PARENT's CSS
 * (`aspect-ratio`/`height: 100%`/`min-height`, see each chapter's own
 * `.module.css`) precisely so this component can stay a dumb 100%-fill box —
 * none of those parent selectors carry `position: relative`, which
 * `next/image`'s `fill` mode requires on its parent. Adding it to ~10 selectors
 * across 8 files to unlock `next/image` is exactly the "restructuring
 * MediaSlot in a way that fights its existing design" the T25 brief warns
 * against, for zero visible benefit today: `resolveAsset()` returns
 * PLACEHOLDER for all 31 new-art call sites right now (T04's inventory), so
 * `<img>` never actually renders yet. `loading="lazy" decoding="async"` below
 * gets the real, measurable win (deferred fetch/decode below the fold) at
 * zero risk. No explicit `width`/`height` attrs either — the parent's CSS
 * already fully determines the box before the image loads (that's the whole
 * point of `.media { width/height: 100% }`), so there's no intrinsic-size-driven
 * layout shift to guard against. Revisit `next/image` once real art lands and
 * parent CSS is being touched anyway for that content work.
 */

import { assetLabel, PLACEHOLDER, resolveAsset } from "../assets";
import styles from "./MediaSlot.module.css";

export function MediaSlot({ path, alt }: { path: string; alt: string }) {
  const resolved = resolveAsset(path);
  if (resolved === PLACEHOLDER) {
    return (
      <div className={styles.placeholder}>
        <span className="l6-hud">{assetLabel(path)}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- static public asset, not part of next/image's optimization pipeline in this section (see doc comment above)
  return (
    <img
      src={resolved}
      alt={alt}
      className={styles.media}
      loading="lazy"
      decoding="async"
    />
  );
}
