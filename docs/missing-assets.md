# Missing & Verified Assets Log

> Tracking status of all visual, audio, and video assets from https://kprverse.com for the high-fidelity recreation.

---

## 1. Verified & Fully Operational CDN Assets

| Asset Name | Original Path | Status | Resolution / Size |
| :--- | :--- | :--- | :--- |
| **KPR Emblem Diffuse** | `/images/landing/kpr-texture.png` | **ONLINE (200)** | 75.3 KB PNG |
| **KPR Emblem Gradient** | `/images/landing/kpr-map.png` | **ONLINE (200)** | 175.9 KB PNG |
| **Teaser Trailer 1080p** | `/videos/trailer/keepers-teaser-1080.mp4` | **ONLINE (200)** | 72.2 MB MP4 |
| **Topo Landing Video** | `/videos/project/topo-landing.mp4` | **ONLINE (200)** | 15.3 MB MP4 |
| **Trailer Side Media** | `/images/compressed/webp/project-intro/trailer-side-media.webp` | **ONLINE (200)** | 7.4 KB WebP |
| **Collection Traits** | `/images/compressed/webp/collection/face-traits.webp` | **ONLINE (200)** | 10.2 KB WebP |
| **Gallery Card Left 01** | `/images/compressed/webp/collection/card-left-01.webp` | **ONLINE (200)** | 22.7 KB WebP |
| **Gallery Card Right 01**| `/images/compressed/webp/collection/card-right-01.webp`| **ONLINE (200)** | 18.9 KB WebP |
| **Header Sprite** | `/images/compressed/webp/sheets/header-sprite.webp` | **ONLINE (200)** | 362 KB WebP |
| **Degrees SVG** | `/svg/degrees.svg` | **ONLINE (200)** | SVG vector |
| **Double Arrow Right** | `/svg/double-arrow-right.svg` | **ONLINE (200)** | SVG vector |
| **Measurement Lines** | `/svg/measurement-lines.svg` | **ONLINE (200)** | SVG vector |
| **Arrow Down** | `/svg/arrow-down.svg` | **ONLINE (200)** | SVG vector |
| **Simple Arrow Right** | `/svg/simple-arrow-right.svg` | **ONLINE (200)** | SVG vector |
| **After Effects 2nd Layer** | `/data/2ndlayer.ae.json` | **ONLINE (200)** | Keyframe JSON |
| **Tableau Keep Reactor** | `/images/compressed/webp/tableau/keep/second-layer/flow-0/set-0/inside-kai-fusion-reactor.webp` | **ONLINE (200)** | 40.0 KB WebP |
| **Tableau Keep Details** | `/images/compressed/webp/tableau/keep/second-layer/extras/details.webp` | **ONLINE (200)** | 6.3 KB WebP |
| **Tableau Factions Details**| `/images/compressed/webp/tableau/factions/second-layer/extras/details.webp` | **ONLINE (200)** | 7.5 KB WebP |
| **Tableau Universe Details**| `/images/compressed/webp/tableau/universe/second-layer/extras/details.webp` | **ONLINE (200)** | 17.4 KB WebP |

---

## 2. Inaccessible / 403 / 404 Assets & Handled Fallbacks

| Inaccessible Asset | Status | Fallback Strategy |
| :--- | :--- | :--- |
| `crystal.webp` | 403 Forbidden | Replaced with high-res 3D Kai Crystal procedural asset & video overlay |
| `character-1.png` | 403 Forbidden | Replaced with verified `face-traits.webp` and `card-left-01.webp` |
| `Background.jpg` (Ali repo)| 404 on KPR CDN | Handled by local fallback in `/kprverse-ali/public/Background.jpg` |
| Raw KTX2 GPU textures | Requires special WebGL transcoder | Handled via lossless WebP textures (`/images/compressed/webp/...`) which render universally across all browsers |
