# Thiáº¿t káº¿: Há»‡ thá»‘ng HÃ²m thÆ°á»Ÿng & AR (RÆ°Æ¡ng kho bÃ¡u)

- NgÃ y: 2026-08-25 Â· Cáº­p nháº­t tiáº¿n Ä‘á»™: 2026-08-26
- Tráº¡ng thÃ¡i: ÄÃ£ duyá»‡t thiáº¿t káº¿ qua há»™i thoáº¡i (Pháº§n 1â€“4 + cÃ¡c Ä‘iá»ƒm khÃ³a cá»§a ngÆ°á»i duyá»‡t)
- Tiáº¿n Ä‘á»™: **M1 ÄÃƒ SHIP 2026-08-26** â€” 14/14 task plan M1 `[x]`, checkpoint cuá»‘i xanh (lint/typecheck/vitest 38/38 tests + E2E API Task 14). M2 káº¿ tiáº¿p â€” plan: `docs/superpowers/plans/2026-08-26-chest-system-m2.md`.
- Remote chÃ­nh thá»©c: https://github.com/zzgiabaozzbui/game_pho_co â€” working-dir local chÆ°a `git init` táº¡i thá»i Ä‘iá»ƒm nÃ y nÃªn cÃ¡c plan dÃ¹ng CHECKPOINT (lint/typecheck/test) thay bÆ°á»›c commit. File spec lÃ  nguá»“n sá»± tháº­t cho writing-plans.

## 1. Má»¥c tiÃªu & pháº¡m vi

Game truy tÃ¬m kho bÃ¡u Phá»‘ cá»• thÃªm há»‡ thá»‘ng **hÃ²m thÆ°á»Ÿng nhiá»u cáº¥p** vá»›i pháº§n thÆ°á»Ÿng Ä‘a loáº¡i (Ä‘iá»ƒm / cÃ¢u chuyá»‡n vi-en / áº£nh upload / video YouTube), tráº£i trÃªn 3 máº·t ná»n trong CÃ™NG má»™t dá»± Ã¡n:

| Má»‘c | Ná»™i dung | RÃ ng buá»™c nghiá»‡m thu |
|-----|----------|----------------------|
| **M1** âœ… ship 2026-08-26 | Engine rÆ¡i rÆ°Æ¡ng + API + admin + UI má»Ÿ 2D | HoÃ n chá»‰nh **khÃ´ng phá»¥ thuá»™c three.js** |
| **M2** â† Ä‘ang lÃªn plan | 3D inline + WebXR Android + Quick Look iOS | ChestReveal thay renderer, khÃ´ng Ä‘á»•i game logic |
| **M3** | QuÃ©t marker MindAR táº¡i Ä‘iá»ƒm Ä‘á»‘i tÃ¡c | MindAR tÃ¡ch hoÃ n toÃ n khá»i engine chest |

Quyáº¿t Ä‘á»‹nh Ä‘Ã£ chá»‘t vá»›i chá»§ sáº£n pháº©m: lÃ m trá»n 3 má»‘c; áº£nh tá»± quáº£n (upload), video dÃ¹ng link YouTube; cáº£ 3 cÆ¡ cháº¿ rÆ¡i (cá»‘ Ä‘á»‹nh theo tráº¡m, ngáº«u nhiÃªn cÃ³ pity, thÃ nh tÃ­ch); má»Ÿ ngay táº¡i chá»— (khÃ´ng tÃºi Ä‘á»“); phÆ°Æ¡ng Ã¡n ká»¹ thuáº­t B (WebXR hybrid).

## 2. Dá»¯ liá»‡u (Prisma, chá»‰ kiá»ƒu portable: String/Int/Float/Boolean/DateTime)

```
ChestTier   id, key(unique: common|gold|epic|grand), nameVi, nameEn,
            colorHex, modelGlbPath, modelUsdzPath, sortOrder
ChestLoot   id, scopeKey(indexed), type(POINTS|STORY|IMAGE|VIDEO),
            pointsAmount?, storyVi?, storyEn?, imagePath?, youtubeUrl?, sortOrder
ChestGrant  id, playerId, source(STATION|DROP|ACHIEVEMENT|FINAL|PARTNER),
            sourceRef, tierId, lootSnapshotJson(String), createdAt, openedAt?
            @@unique([playerId, source, sourceRef])
Player      +(chestPityCount Int @default 0)
Station     +(chestTierId Int?)           // gÃ¡n cáº¥p rÆ°Æ¡ng cá»‘ Ä‘á»‹nh, admin sá»­a
PartnerSpot id, key(unique), token(unique, random 32+ bytes)   // seed 1 dÃ²ng
DropRule    id, chancePct Int, tierKey String, weight Int      // cáº¥u hÃ¬nh admin
```

### Quy Æ°á»›c idempotency
- `sourceRef` phÃ¢n biá»‡t theo nguá»“n: `STATION` = slug tráº¡m Â· `ACHIEVEMENT` = key luáº­t Â· `FINAL` = `"final"` Â· `PARTNER` = token Â· `DROP` = `drop:<uuid>` (má»—i láº§n roll má»™t ref).
- Unique `(playerId, source, sourceRef)` báº£o Ä‘áº£m **retry / race khÃ´ng nhÃ¢n Ä‘Ã´i** báº¥t ká»³ nguá»“n nÃ o; táº¡o grant báº±ng exists-check + báº¯t P2002 (pattern CAS Ä‘Ã£ kiá»ƒm chá»©ng trong dá»± Ã¡n).
- **Loot khÃ³a lÃºc grant**: khi táº¡o `ChestGrant`, resolve danh sÃ¡ch `ChestLoot` theo scope vÃ  chá»¥p thÃ nh `lootSnapshotJson`. Admin sá»­a loot sau Ä‘Ã³ khÃ´ng Ä‘á»•i pháº§n thÆ°á»Ÿng Ä‘Ã£ rÆ¡i (audit Ä‘Æ°á»£c).
- **Pity chá»‰ Ã¡p dá»¥ng DROP**: `chestPityCount` tÄƒng khi má»™t lÆ°á»£t DROP khÃ´ng ra Epic+; ra Epic+ hoáº·c Ä‘áº¡t ngÆ°á»¡ng 10 thÃ¬ láº§n roll tiáº¿p theo Ã©p Epic+ rá»“i reset. Cá»‘ Ä‘á»‹nh/thÃ nh tÃ­ch/FINAL/PARTNER khÃ´ng Ä‘á»¥ng pity.
- Tráº¡m cÃ³ `chestTierId` null = **khÃ´ng cÃ³ rÆ°Æ¡ng cá»‘ Ä‘á»‹nh** (váº«n tham gia DROP/achievement bÃ¬nh thÆ°á»ng). Seed máº·c Ä‘á»‹nh gÃ¡n common cho cáº£ 36 tráº¡m + loot máº«u Ä‘á»ƒ cháº¡y Ä‘Æ°á»£c ná»™i dung ngay tá»« Ä‘áº§u.

### Luáº­t thÃ nh tÃ­ch v1 (key cá»‘ Ä‘á»‹nh trong code, ná»™i dung loot váº«n do admin soáº¡n)
`stations_6`â†’common Â· `stations_18`â†’gold Â· `perfect_5` (5 tráº¡m liÃªn tiáº¿p giáº£i Ä‘Ãºng ngay láº§n Ä‘áº§u)â†’gold Â· `score_2000`â†’epic. HoÃ n thÃ nh 36/36 Ä‘i qua grant `FINAL` (grand) chá»© khÃ´ng qua achievement.

## 3. Engine & luá»“ng

```
ANSWER Ä‘Ãºng
 â”œâ”€ cá»™ng Ä‘iá»ƒm (atomic, nhÆ° hiá»‡n táº¡i)
 â”œâ”€ STATION grant (theo Station.chestTierId, náº¿u cÃ³)
 â”œâ”€ DROP engine: roll chancePct â†’ chá»n tier theo weight â†’ Ã¡p pity
 â”œâ”€ ACHIEVEMENT engine: Ä‘Ã¡nh giÃ¡ cÃ¡c key v1
 â””â”€ táº¡o ChestGrant(s) â€” loot snapshot táº¡i Ä‘Ã¢y
        â–¼
GET /api/chests          (rÆ°Æ¡ng chÆ°a má»Ÿ + bá»™ sÆ°u táº­p)
        â–¼
POST /api/chests/open    (CAS openedAt nullâ†’now; POINTS cá»™ng Ä‘Ãºng 1 láº§n)
```

HoÃ n thÃ nh 36/36 â†’ grant `FINAL`. Claim Ä‘á»‘i tÃ¡c â†’ grant `PARTNER` (Epic).

## 4. API

| Endpoint | Ghi chÃº |
|----------|---------|
| `GET /api/chests?playerId=` | pending (chÆ°a má»Ÿ) + tá»•ng Ä‘Ã£ má»Ÿ + unopenedCount |
| `POST /api/chests/open` `{playerId, grantId}` | CAS; tráº£ loot + tier meta |
| `POST /api/chests/claim-partner` `{playerId, token, lat?, lng?}` | validate token â†’ check Ä‘Ã£ claim â†’ táº¡o Epic grant; idempotent |
| `/api/admin/chests/*` | CRUD tier (tÃªn/mÃ u/model path), loot theo scope, DropRule, gÃ¡n tier tráº¡m, xem/regenerate token PartnerSpot |

Báº£o máº­t: giá»¯ mÃ´ hÃ¬nh anonymous-playerId nhÆ° toÃ n bá»™ API hiá»‡n cÃ³ (playerId lÃ  bearer secret á»Ÿ MVP â€” ghi nháº­n upgrade path: session tháº­t náº¿u cáº§n). Token PARTNER lÃ  **random high-entropy â‰¥32 byte**, khÃ´ng pháº£i ID Ä‘oÃ¡n Ä‘Æ°á»£c. Rate-limit cÃ¡c POST má»›i báº±ng `lib/rate-limit` (open ~30/phÃºt/IP, claim ~10/phÃºt/IP).

## 5. Kiáº¿n trÃºc UI â€” ChestReveal tÃ¡ch renderer (khÃ³a kiáº¿n trÃºc)

```
ChestReveal (component Ä‘á»™c láº­p renderer; nháº­n grant/tier/loot)
 â”œâ”€â”€ InlineThreeRenderer  // má»i ná»n táº£ng: canvas xoay-tay, náº¯p rÆ°Æ¡ng animate má»Ÿ
 â”œâ”€â”€ WebXRRenderer        // Android Chrome: immersive-ar + hit-test
 â””â”€â”€ QuickLookLauncher    // iOS Safari: <a rel="ar"> tá»›i .usdz
```

- Game logic chá»‰ biáº¿t `ChestGrant â†’ ChestReveal`; renderer Ä‘Æ°á»£c chá»n theo platform detect.
- **KhÃ´ng tá»± khá»Ÿi Ä‘á»™ng camera/AR** khi má»Ÿ modal â€” WebXR session chá»‰ start sau cÃº báº¥m ngÆ°á»i dÃ¹ng qua `navigator.xr.isSessionSupported('immersive-ar')`.
- PhÃ¢n Ä‘á»‹nh rÃµ: **AR placement lÃ  cross-platform**; **reveal animation do app Ä‘iá»u khiá»ƒn** â€” Quick Look cÃ³ pipeline riÃªng nÃªn trÃªn iOS reveal (danh sÃ¡ch thÆ°á»Ÿng) diá»…n ra trÆ°á»›c/sau Quick Look, khÃ´ng giáº£ Ä‘á»‹nh Ä‘á»“ng bá»™ animation.
- Hiá»‡u nÄƒng: lazy-load chunk three.js chá»‰ khi cáº§n; cap pixelRatio â‰¤2; dispose renderer khi Ä‘Ã³ng overlay; dá»«ng render loop khi tab áº©n.
- Vá»‹ trÃ­ gáº¯n: panel thÃ nh cÃ´ng tráº¡m (station/drop/achievement) Â· `/treasure` (FINAL + lÆ°á»›i bá»™ sÆ°u táº­p) Â· badge chÆ°a má»Ÿ á»Ÿ header `/play` (modal hÃ ng Ä‘á»£i náº¿u lá»¡ thoÃ¡t app) Â· `/partner`.

## 6. Lá»›p AR & marker

- **WebXR Android**: session `immersive-ar` + hit-test â†’ Ä‘áº·t rÆ°Æ¡ng lÃªn máº·t pháº³ng â†’ tap rÆ°Æ¡ng â†’ náº¯p báº­t + particle vÃ ng. Fallback tá»± Ä‘á»™ng vá» InlineThreeRenderer khi thiáº¿t bá»‹/khÃ´ng HTTPS khÃ´ng há»— trá»£.
- **iOS Quick Look**: `<a rel="ar">` trá» tá»›i **asset .usdz build trÆ°á»›c** (khÃ´ng generate runtime).
- **MindAR (M3)**: trang `/partner` riÃªng biá»‡t; quÃ©t target `.mind` (sinh tá»« hÃ¬nh in báº±ng MindAR compiler â€” viá»‡c in áº¥n thuá»™c váº­n hÃ nh Ä‘á»‘i tÃ¡c) â†’ gá»i `claim-partner` â†’ tÃ¡i dÃ¹ng Ä‘Ãºng ChestReveal. MindAR khÃ´ng biáº¿t gÃ¬ vá» tier/drop/pity. Lib + target Ä‘Æ°á»£c service worker cache Ä‘á»ƒ chá»‹u wifi yáº¿u.

## 7. Assets

- Build script Node (three.js) dá»±ng model procedural low-poly 4 cáº¥p, xuáº¥t song song: `GLTFExporter â†’ public/models/chest-{tier}.glb` vÃ  `USDZExporter â†’ public/models/chest-{tier}.usdz`.
- **Budget má»¥c tiÃªu (cÃ³ check lÃºc build, cáº£nh bÃ¡o/fail khi vÆ°á»£t): GLB má»—i tier â‰¤150KB Â· USDZ má»—i tier â‰¤200KB Â· tá»•ng má»¥c tiÃªu <1MB.** VÆ°á»£t ngÆ°á»¡ng pháº£i bÃ¡o rÃµ, khÃ´ng Ã¢m tháº§m giáº£m cháº¥t lÆ°á»£ng.
- Thay model designer sau nÃ y = thay file + cáº­p nháº­t Ä‘Æ°á»ng dáº«n trong admin tier.

## 8. i18n & ná»™i dung

- ToÃ n bá»™ chuá»—i UI má»›i qua `dictionaries.ts` vi/en â€” cáº¥m chuá»—i cá»©ng tiáº¿ng Viá»‡t trong JSX ngÆ°á»i chÆ¡i.
- Seed máº·c Ä‘á»‹nh: 4 tier, DropRule máº«u (30%, trá»ng sá»‘ lá»‡ch common), loot placeholder vi/en cho `final`/`partner`/máº«u 1 tráº¡m + 1 achievement, 1 YouTube máº«u, 1 PartnerSpot.
- Admin tab má»›i "RÆ°Æ¡ng": tier Â· loot theo scope Â· DropRule Â· gÃ¡n tier tá»«ng tráº¡m Â· quáº£n lÃ½ PartnerSpot. áº¢nh thÆ°á»Ÿng upload tÃ¡i dÃ¹ng pipeline magic-bytes + `UPLOADS_DIR` (giá»›i háº¡n 5MB).

## 9. Kiá»ƒm thá»­

- **Unit**: engine rÆ¡i (weight/pity reset-Ã©p/khÃ³a-loot-snapshot), phÃ¡t hiá»‡n achievement, CAS open idempotent, unique grant chá»‘ng retry.
- **E2E API**: solve â†’ Ä‘Ãºng sá»‘/lá»ai grant; double-open race chá»‰ cá»™ng Ä‘iá»ƒm 1 láº§n; retry answer khÃ´ng nhÃ¢n Ä‘Ã´i achievement; claim-partner chá»‰ 1 láº§n/ngÆ°á»i chÆ¡i.
- **Thá»§ cÃ´ng theo má»‘c**: M1 cháº¡y trá»n khÃ´ng three.js Â· M2 checklist iPhone Safari (Quick Look) + Android Chrome (WebXR) + PWA standalone Â· M3 quÃ©t marker tháº­t táº¡i chá»— thiáº¿u sÃ¡ng.

## 10. Rá»§i ro ghi nháº­n

HTTPS báº¯t buá»™c cho camera/WebXR (trÃ¹ng Ä‘iá»u kiá»‡n PWA sáºµn cÃ³) Â· WebXR phá»¥ thuá»™c phiÃªn báº£n Android â†’ luÃ´n cÃ³ fallback inline Â· YouTube cáº§n máº¡ng Â· USDZ thÆ°á»ng phÃ¬nh hÆ¡n GLB â†’ budget check Â· mÃ´ hÃ¬nh playerId bearer cháº¥p nháº­n rá»§i ro theo spec MVP (Edge Cases Ä‘Ã£ ghi).
