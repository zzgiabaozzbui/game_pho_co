# AGENTS.md

> HÆ°á»›ng dáº«n cho cÃ¡c phiÃªn OpenCode lÃ m viá»‡c trong repo nÃ y.
> Chá»‰ ghi nhá»¯ng Ä‘iá»u mÃ  agent khÃ³ tá»± nháº­n ra; bá» qua lá»i khuyÃªn chung chung.

## Sáº£n pháº©m: game truy tÃ¬m kho bÃ¡u vÄƒn hÃ³a Phá»‘ cá»• HÃ  Ná»™i

Web app cho du khÃ¡ch khÃ¡m phÃ¡ lá»‹ch sá»­ vÃ  giÃ¡ trá»‹ vÄƒn hÃ³a phá»‘ cá»• qua hÃ nh trÃ¬nh "truy tÃ¬m kho bÃ¡u". Luá»“ng chÆ¡i cá»‘t lÃµi:

1. **36 phá»‘ phÆ°á»ng**: má»—i phá»‘ lÃ  má»™t tráº¡m, cÃ³ cÃ¢u há»i/cÃ¢u Ä‘á»‘ vá» vÄƒn hÃ³a - lá»‹ch sá»­ kÃ¨m gá»£i Ã½ chá»‰ Ä‘áº¿n Ä‘á»‹a Ä‘iá»ƒm tiáº¿p theo. KhÃ´ng giá»›i háº¡n thá»© tá»± â€” má»i tráº¡m má»Ÿ ngay tá»« Ä‘áº§u, du khÃ¡ch Ä‘áº¿n Ä‘Ã¢u trÆ°á»›c cÅ©ng Ä‘Æ°á»£c.
2. **Check-in báº±ng áº£nh**: khi Ä‘áº¿n Ä‘á»‹a Ä‘iá»ƒm, ngÆ°á»i chÆ¡i chá»¥p áº£nh Ä‘á»ƒ xÃ¡c nháº­n Ä‘Ãºng vá»‹ trÃ­ (nháº­n diá»‡n qua tÃ²a nhÃ  Ä‘áº·c trÆ°ng hoáº·c biá»ƒn tÃªn Ä‘Æ°á»ng) â€” Ä‘Ã¢y lÃ  cÆ¡ cháº¿ má»Ÿ cÃ¢u Ä‘á»‘ cá»§a tráº¡m, khÃ´ng dÃ¹ng GPS thuáº§n.
3. **Giáº£i Ä‘á»‘ nháº­n gá»£i Ã½**: check-in Ä‘Ãºng â†’ cÃ¢u há»i/nhiá»‡m vá»¥ hiá»‡n ra; giáº£i xong cÃ³ thá»ƒ báº¥m xem gá»£i Ã½ sang Ä‘á»‹a Ä‘iá»ƒm káº¿ theo sá»‘ thá»© tá»± (láº§n Ä‘áº§u âˆ’20 Ä‘iá»ƒm, sÃ n 50Ä‘/tráº¡m) â€” chá»‰ mang tÃ­nh tham kháº£o, khÃ´ng khÃ³a tráº¡m nÃ o. Server chá»‰ tráº£ question/options cho tráº¡m Ä‘Ã£ APPROVED.
4. **ÄÃ­ch cuá»‘i**: "kho bÃ¡u vÄƒn hÃ³a" â€” má»™t Ä‘á»‹a Ä‘iá»ƒm Ä‘á»‘i tÃ¡c (workshop tráº£i nghiá»‡m vÄƒn hÃ³a, sáº½ kÃ½ há»£p tÃ¡c sau).

Tá»« ngá»¯ chuáº©n trong code/docs: *tráº¡m* (station = 1 phá»‘), *gá»£i Ã½* (hint sang tráº¡m káº¿), *check-in*, *tuyáº¿n*, *kho bÃ¡u* (Ä‘Ã­ch cuá»‘i). Äáº·t tÃªn entity/theo cÃ¡c tá»« nÃ y Ä‘á»ƒ thá»‘ng nháº¥t.

## Tráº¡ng thÃ¡i hiá»‡n táº¡i

- **App cháº¡y Ä‘Æ°á»£c end-to-end**: Next.js 16 (App Router, TS, Tailwind v4, Turbopack) + Prisma 7 táº¡i `web/`. Chi tiáº¿t lá»‡nh + kiáº¿n trÃºc xem `README.md` á»Ÿ root.
- Dev DB lÃ  SQLite (`web/dev.db`, git-ignored); schema chá»‰ dÃ¹ng kiá»ƒu portable â€” chuyá»ƒn MySQL = Ä‘á»•i `provider` trong `prisma/schema.prisma` + `DATABASE_URL` (compose profile `mysql` á»Ÿ root â€” mÃ¡y CÃ“ Docker, xem má»¥c Quirks).
- Ná»™i dung 36 tráº¡m sá»‘ng trong `web/prisma/seed.ts` (nguá»“n gá»‘c) vÃ  DB; sá»­a ná»™i dung váº­n hÃ nh qua `/admin`, khÃ´ng sá»­a seed cho dá»¯ liá»‡u Ä‘Ã£ deploy.
- Giao diá»‡n ngÆ°á»i chÆ¡i song ngá»¯ vi/en qua `src/lib/dictionaries.ts` + `i18n.tsx`; cáº¥m chuá»—i cá»©ng tiáº¿ng Viá»‡t trong JSX ngÆ°á»i chÆ¡i.
- **Há»‡ thá»‘ng hÃ²m thÆ°á»Ÿng M1 Ä‘Ã£ ship (2026-08-26)**: engine thuáº§n `src/lib/chests.ts` + service grant idempotent `src/lib/chest-grants.ts`; API `/api/chests` (GET + POST open CAS), `/api/chests/claim-partner`, `/api/admin/chests`; UI `ChestReveal` 2D gáº¯n á»Ÿ StationFlow/play/treasure; admin tab "RÆ°Æ¡ng". Spec: `docs/superpowers/specs/2026-08-25-ar-treasure-chest-design.md`.
- **M2 (three.js inline + WebXR Android + Quick Look iOS)**: plan táº¡i `docs/superpowers/plans/2026-08-26-chest-system-m2.md` â€” chÆ°a thá»±c thi.
- **Git remote**: https://github.com/zzgiabaozzbui/game_pho_co â€” working-dir local chÆ°a `git init` táº¡i 2026-08-26; cÃ¡c plan dÃ¹ng CHECKPOINT (lint/typecheck/test) thay bÆ°á»›c commit.

## Lá»‡nh chÃ­nh (cháº¡y trong `web/`)

- `npm run dev` / `build` / `start`; `npm run lint` (eslint src); `npm run typecheck` (tsc --noEmit); `npm run test` (vitest).
- 1 test riÃªng: `npx vitest run src/lib/game.test.ts`.
- DB: `npm run db:seed` (push + seed), `npx prisma generate` tá»± cháº¡y postinstall. Client Prisma sinh vÃ o `src/generated/` (git-ignored).
- Admin local: `/admin`, máº­t kháº©u = `ADMIN_PASSWORD` trong `web/.env` (máº«u `.env.example`).

## Bá»™ cÃ´ng cá»¥ AI Ä‘Ã£ cÃ i: Spec Kit + Superpowers + ECC

Cáº¥u hÃ¬nh trong `opencode.json` + `.opencode/` + `.specify/`. PhÃ¢n vai:

- **Spec Kit** (lá»‡nh `/speckit.*`) â€” láº­p káº¿ hoáº¡ch "CÃI GÃŒ": constitution â†’ specify â†’ clarify â†’ plan â†’ tasks. Artifact náº±m trong `.specify/`.
- **Superpowers** (plugin, skill tá»± kÃ­ch hoáº¡t) â€” thá»±c thi "CÃCH THá»¨C": worktree â†’ TDD â†’ subagent â†’ code review â†’ finish branch.
- **ECC** â€” cá»•ng cháº¥t lÆ°á»£ng & tá»‘i Æ°u: agents (`planner`, `code-reviewer`, `security-reviewer`, `tdd-guide`, `build-error-resolver`, `refactor-cleaner`), commands (`/plan` `/tdd` `/code-review` `/security` `/build-fix` `/refactor-clean` `/verify` `/checkpoint`), skills vá» pattern/tá»‘i Æ°u.

Quy trÃ¬nh feature chuáº©n (chuyá»ƒn giao táº¡i `specs/<id>/tasks.md`):

1. Äá»™ng nÃ£o/thiáº¿t káº¿ (Superpowers `brainstorming`) â†’ `/speckit.specify` â†’ `/speckit.clarify` â†’ `/speckit.plan` â†’ `/speckit.tasks`.
2. Thá»±c thi báº±ng Superpowers TDD + subagent, **Ä‘Ã£ cÃ³ tasks.md thÃ¬ Ä‘á»˜è®¤ láº­p káº¿ hoáº¡ch láº¡i**.
3. TrÆ°á»›c khi merge: `/code-review` + `/security`; tÃ­nh nÄƒng lá»›n thÃ¬ `/verify`.

LÆ°u Ã½ báº¯t buá»™c:

- **Äá»«ng cháº¡y `/speckit.implement` khi dÃ¹ng Superpowers** â€” chá»n Má»˜T executor; combo nÃ y dÃ¹ng Superpowers, `/speckit.implement` chá»‰ dÃ nh cho cháº¡y Ä‘á»™c láº­p.
- Sá»­a mÃ£ mÃ  thay Ä‘á»•i hÃ nh vi â†’ cáº­p nháº­t láº¡i spec tÆ°Æ¡ng á»©ng, náº¿u khÃ´ng spec máº¥t giÃ¡ trá»‹.
- Viá»‡c < 30 phÃºt, < 3 file: bá» qua cáº£ hai, lÃ m trá»±c tiáº¿p; khÃ´ng Ã¡p quy trÃ¬nh cho typo/sá»­a nhá».

Quirks cÃ i mÃ¡y nÃ y (Windows):

- ECC + Superpowers Ä‘Æ°á»£c **vendor trong project** táº¡i `vendor/ECC` vÃ  `vendor/superpowers` (clone gá»‘c); `opencode.json` trá» plugin vÃ o file trong `vendor/`, khÃ´ng phá»¥ thuá»™c mÃ¡y. **`vendor/` bá»‹ git-ignored** (clone con cÃ³ `.git` riÃªng) â€” mÃ¡y má»›i cáº§n bootstrap: `git clone https://github.com/obra/superpowers vendor/superpowers` + clone ECC vÃ o `vendor/ECC`, rá»“i `npm install` + `npm run build:opencode` trong `vendor/ECC`. Cáº­p nháº­t: `git pull` trong thÆ° má»¥c vendor tÆ°Æ¡ng á»©ng; ECC pháº£i cháº¡y láº¡i `npm install` + `npm run build:opencode` sau pull.
- ECC plugin **chá»‰ Ä‘Æ°á»£c trá» vÃ o `.opencode/dist/plugins/index.js`**, khÃ´ng pháº£i `.opencode/dist/index.js` (file nÃ y export thÃªm `VERSION`/`metadata` khiáº¿n loader OpenCode tá»« chá»‘i vá»›i lá»—i "Plugin export is not a function").
- Superpowers plugin resolve skills theo `__dirname` (`../../skills`) nÃªn pháº£i giá»¯ nguyÃªn cáº¥u trÃºc repo khi vendor; khÃ´ng copy láº» file plugin.

## Quirks cÃ´ng cá»¥ Ä‘Ã£ kiá»ƒm chá»©ng (Ä‘á»«ng há»c láº¡i báº±ng cÃ¡ch Ä‘á»‘t thá»i gian)

- **Next.js 16**: `params`/`searchParams`/`cookies()` Ä‘á»u lÃ  Promise (pháº£i `await`); Turbopack lÃ  default cho dev láº«n build; `next build` KHÃ”NG cháº¡y lint (cháº¡y `npm run lint` riÃªng); `middleware.ts` Ä‘á»•i thÃ nh `proxy.ts`. Docs bundled táº¡i `web/node_modules/next/dist/docs/`.
- **Prisma 7**: khÃ´ng cÃ³ `url` trong `schema.prisma` â€” káº¿t ná»‘i náº±m á»Ÿ `prisma.config.ts` (`datasource.url` + `env()` tá»« `dotenv/config`, CLI khÃ´ng tá»± náº¡p `.env`). PrismaClient **báº¯t buá»™c truyá»n driver adapter**: SQLite = `PrismaBetterSqlite3`, MySQL = `PrismaMariaDb` (xem `src/lib/db.ts`). Generator `prisma-client` xuáº¥t TS vÃ o `src/generated/prisma`.
- **ESLint flat config** táº¯t rule `react-hooks/set-state-in-effect` (cáº¥m cáº£ fetch-on-mount láº«n sync localStorage sau hydration â€” hai pattern cÃ³ chá»§ Ã½ cá»§a app nÃ y).
- **PS 5.1 decode JSON UTF-8 sai khi test API** (thiáº¿u charset) â€” lá»—i hiá»ƒn thá»‹, khÃ´ng pháº£i lá»—i dá»¯ liá»‡u; xÃ¡c nháº­n qua `better-sqlite3` trá»±c tiáº¿p náº¿u nghi.
- **better-sqlite3 pháº£i á»Ÿ 12.x** (hiá»‡n `^12.11.1`): báº£n 13.x khÃ´ng phÃ¡t hÃ nh prebuild nÃ o â†’ `npm install` rÆ¡i vÃ o node-gyp vÃ  fail vÃ¬ mÃ¡y khÃ´ng cÃ³ VS C++ Build Tools. 12.11.1 cÃ³ prebuild `node-v137-win32-x64` cho Node 24 vÃ  khá»›p peer dep `^12.6.0` cá»§a `@prisma/adapter-better-sqlite3` â€” Ä‘á»«ng nÃ¢ng lÃªn 13.
- **MÃ¡y CÃ“ Docker** (27.x, daemon cháº¡y sáºµn â€” ghi cÅ© "khÃ´ng cÃ³ Docker" Ä‘Ã£ sai). Image production: `phoco-web:latest` tá»« `web/Dockerfile` (multi-stage, Next standalone + SQLite Ä‘Ã£ seed 36 tráº¡m baked vÃ o `/app/seed/phoco.db`, entrypoint copy sang volume `/data` náº¿u chÆ°a cÃ³). Cháº¡y: `docker compose up -d app` á»Ÿ root (port 3000) hoáº·c `docker run -p 3000:3000 -v phoco_data:/data phoco-web:latest`. Admin máº·c Ä‘á»‹nh `admin123` (override qua `ADMIN_PASSWORD`). MySQL service náº±m á»Ÿ compose profile `mysql`. LÆ°u Ã½: lockfile pháº£i sinh trong Linux (`docker run --rm -v ${PWD}:/w -w /w node:24 npm install --package-lock-only`) náº¿u npm ci bÃ¡o missing optional deps kiá»ƒu `@emnapi/*`.
- `DATABASE_URL="file:./dev.db"` resolve theo cwd â†’ DB tháº­t náº±m `web/dev.db` (khÃ´ng pháº£i `prisma/dev.db`).
- `npm audit`: 3 high thuá»™c Prisma CLI (deepmerge-ts, dev-only, chÆ°a cÃ³ báº£n vÃ¡) â€” Ä‘á»«ng `audit fix --force` (sáº½ downgrade Prisma 6 breaking).

## Viá»‡c cáº§n cáº­p nháº­t khi repo cÃ³ code

Khi thÃªm mÃ£ nguá»“n, hÃ£y bá»• sung vÃ o file nÃ y (ngáº¯n gá»n, Ä‘Ã£ kiá»ƒm chá»©ng):

- **Lá»‡nh chÃ­nh**: build, test, lint, typecheck â€” kÃ¨m cÃ¡ch cháº¡y 1 test / 1 gÃ³i riÃªng láº» náº¿u khÃ¡c máº·c Ä‘á»‹nh.
- **Kiáº¿n trÃºc**: entrypoint tháº­t, ranh giá»›i package/thÆ° má»¥c lá»›n, luá»“ng thá»±c thi khÃ´ng rÃµ tá»« tÃªn file.
- **Quirks cÃ´ng cá»¥**: codegen, migration, artifact sinh sáºµn, biáº¿n mÃ´i trÆ°á»ng, dev server.
- **Kiá»ƒm thá»­**: fixture, dá»‹ch vá»¥ báº¯t buá»™c, suite tá»‘n thá»i gian hoáº·c hay fail.
- **Quy Æ°á»›c riÃªng**: chá»‰ nhá»¯ng Ä‘iá»ƒm khÃ¡c vá»›i máº·c Ä‘á»‹nh cá»§a ngÃ´n ngá»¯/framework.

## Quy táº¯c báº£o trÃ¬ file nÃ y

- Má»—i dÃ²ng pháº£i tráº£ lá»i Ä‘Æ°á»£c: "Agent cÃ³ thá»ƒ bá» sÃ³t Ä‘iá»u nÃ y náº¿u khÃ´ng cÃ³ giÃºp Ä‘á»¡?" â€” náº¿u khÃ´ng, xÃ³a Ä‘i.
- Tin vÃ o nguá»“n thá»±c thi (script, config, CI) hÆ¡n lÃ  vÄƒn xuÃ´i; chá»‰ ghi Ä‘iá»u Ä‘Ã£ kiá»ƒm chá»©ng Ä‘Æ°á»£c.
- Khi docs vÃ  config mÃ¢u thuáº«n, Æ°u tiÃªn config/script vÃ  sá»­a láº¡i ná»™i dung lá»—i thá»i á»Ÿ Ä‘Ã¢y.
