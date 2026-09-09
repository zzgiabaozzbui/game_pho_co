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
  // eslint-disable-next-line @next/next/no-img-element -- static public asset, not part of next/image's optimization pipeline in this section
  return <img src={resolved} alt={alt} className={styles.media} />;
}
