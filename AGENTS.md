# AGENTS.md

> Hướng dẫn cho các phiên OpenCode làm việc trong repo này.
> Chỉ ghi những điều mà agent khó tự nhận ra; bỏ qua lời khuyên chung chung.

## Sản phẩm: game truy tìm kho báu văn hóa Phố cổ Hà Nội

Web app cho du khách khám phá lịch sử và giá trị văn hóa phố cổ qua hành trình "truy tìm kho báu". Luồng chơi cốt lõi:

1. **36 phố phường**: mỗi phố là một trạm, có câu hỏi/câu đố về văn hóa - lịch sử kèm gợi ý chỉ đến địa điểm tiếp theo. Không giới hạn thứ tự — mọi trạm mở ngay từ đầu, du khách đến đâu trước cũng được.
2. **Check-in bằng ảnh**: khi đến địa điểm, người chơi chụp ảnh để xác nhận đúng vị trí (nhận diện qua tòa nhà đặc trưng hoặc biển tên đường) — đây là cơ chế mở câu đố của trạm, không dùng GPS thuần.
3. **Giải đố nhận gợi ý**: check-in đúng → câu hỏi/nhiệm vụ hiện ra; giải xong có thể bấm xem gợi ý sang địa điểm kế theo số thứ tự (lần đầu −20 điểm, sàn 50đ/trạm) — chỉ mang tính tham khảo, không khóa trạm nào. Server chỉ trả question/options cho trạm đã APPROVED.
4. **Đích cuối**: "kho báu văn hóa" — một địa điểm đối tác (workshop trải nghiệm văn hóa, sẽ ký hợp tác sau).

Từ ngữ chuẩn trong code/docs: *trạm* (station = 1 phố), *gợi ý* (hint sang trạm kế), *check-in*, *tuyến*, *kho báu* (đích cuối). Đặt tên entity/theo các từ này để thống nhất.

## Trạng thái hiện tại

- **App chạy được end-to-end**: Next.js 16 (App Router, TS, Tailwind v4, Turbopack) + Prisma 7 tại `web/`. Chi tiết lệnh + kiến trúc xem `README.md` ở root.
- Dev DB là SQLite (`web/dev.db`, git-ignored); schema chỉ dùng kiểu portable — chuyển MySQL = đổi `provider` trong `prisma/schema.prisma` + `DATABASE_URL` (compose profile `mysql` ở root — máy CÓ Docker, xem mục Quirks).
- Nội dung 36 trạm sống trong `web/prisma/seed.ts` (nguồn gốc) và DB; sửa nội dung vận hành qua `/admin`, không sửa seed cho dữ liệu đã deploy.
- Giao diện người chơi song ngữ vi/en qua `src/lib/dictionaries.ts` + `i18n.tsx`; cấm chuỗi cứng tiếng Việt trong JSX người chơi.
- **Hệ thống hòm thưởng M1 đã ship (2026-08-26)**: engine thuần `src/lib/chests.ts` + service grant idempotent `src/lib/chest-grants.ts`; API `/api/chests` (GET + POST open CAS), `/api/chests/claim-partner`, `/api/admin/chests`; UI `ChestReveal` 2D gắn ở StationFlow/play/treasure; admin tab "Rương". Spec: `docs/superpowers/specs/2026-08-25-ar-treasure-chest-design.md`.
- **M2 (three.js inline + WebXR Android + Quick Look iOS)**: plan tại `docs/superpowers/plans/2026-08-26-chest-system-m2.md` — chưa thực thi.
- **Git remote**: https://github.com/zzgiangbui/game_pho_co — working-dir local chưa `git init` tại 2026-08-26; các plan dùng CHECKPOINT (lint/typecheck/test) thay bước commit.

## Lệnh chính (chạy trong `web/`)

- `npm run dev` / `build` / `start`; `npm run lint` (eslint src); `npm run typecheck` (tsc --noEmit); `npm run test` (vitest).
- 1 test riêng: `npx vitest run src/lib/game.test.ts`.
- DB: `npm run db:seed` (push + seed), `npx prisma generate` tự chạy postinstall. Client Prisma sinh vào `src/generated/` (git-ignored).
- Admin local: `/admin`, mật khẩu = `ADMIN_PASSWORD` trong `web/.env` (mẫu `.env.example`).

## Bộ công cụ AI đã cài: Spec Kit + Superpowers + ECC

Cấu hình trong `opencode.json` + `.opencode/` + `.specify/`. Phân vai:

- **Spec Kit** (lệnh `/speckit.*`) — lập kế hoạch "CÁI GÌ": constitution → specify → clarify → plan → tasks. Artifact nằm trong `.specify/`.
- **Superpowers** (plugin, skill tự kích hoạt) — thực thi "CÁCH THỨC": worktree → TDD → subagent → code review → finish branch.
- **ECC** — cổng chất lượng & tối ưu: agents (`planner`, `code-reviewer`, `security-reviewer`, `tdd-guide`, `build-error-resolver`, `refactor-cleaner`), commands (`/plan` `/tdd` `/code-review` `/security` `/build-fix` `/refactor-clean` `/verify` `/checkpoint`), skills về pattern/tối ưu.

Quy trình feature chuẩn (chuyển giao tại `specs/<id>/tasks.md`):

1. Động não/thiết kế (Superpowers `brainstorming`) → `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks`.
2. Thực thi bằng Superpowers TDD + subagent, **đã có tasks.md thì đỘ认 lập kế hoạch lại**.
3. Trước khi merge: `/code-review` + `/security`; tính năng lớn thì `/verify`.

Lưu ý bắt buộc:

- **Đừng chạy `/speckit.implement` khi dùng Superpowers** — chọn MỘT executor; combo này dùng Superpowers, `/speckit.implement` chỉ dành cho chạy độc lập.
- Sửa mã mà thay đổi hành vi → cập nhật lại spec tương ứng, nếu không spec mất giá trị.
- Việc < 30 phút, < 3 file: bỏ qua cả hai, làm trực tiếp; không áp quy trình cho typo/sửa nhỏ.

Quirks cài máy này (Windows):

- ECC + Superpowers được **vendor trong project** tại `vendor/ECC` và `vendor/superpowers` (clone gốc); `opencode.json` trỏ plugin vào file trong `vendor/`, không phụ thuộc máy. **`vendor/` bị git-ignored** (clone con có `.git` riêng) — máy mới cần bootstrap: `git clone https://github.com/obra/superpowers vendor/superpowers` + clone ECC vào `vendor/ECC`, rồi `npm install` + `npm run build:opencode` trong `vendor/ECC`. Cập nhật: `git pull` trong thư mục vendor tương ứng; ECC phải chạy lại `npm install` + `npm run build:opencode` sau pull.
- ECC plugin **chỉ được trỏ vào `.opencode/dist/plugins/index.js`**, không phải `.opencode/dist/index.js` (file này export thêm `VERSION`/`metadata` khiến loader OpenCode từ chối với lỗi "Plugin export is not a function").
- Superpowers plugin resolve skills theo `__dirname` (`../../skills`) nên phải giữ nguyên cấu trúc repo khi vendor; không copy lẻ file plugin.

## Quirks công cụ đã kiểm chứng (đừng học lại bằng cách đốt thời gian)

- **Next.js 16**: `params`/`searchParams`/`cookies()` đều là Promise (phải `await`); Turbopack là default cho dev lẫn build; `next build` KHÔNG chạy lint (chạy `npm run lint` riêng); `middleware.ts` đổi thành `proxy.ts`. Docs bundled tại `web/node_modules/next/dist/docs/`.
- **Prisma 7**: không có `url` trong `schema.prisma` — kết nối nằm ở `prisma.config.ts` (`datasource.url` + `env()` từ `dotenv/config`, CLI không tự nạp `.env`). PrismaClient **bắt buộc truyền driver adapter**: SQLite = `PrismaBetterSqlite3`, MySQL = `PrismaMariaDb` (xem `src/lib/db.ts`). Generator `prisma-client` xuất TS vào `src/generated/prisma`.
- **ESLint flat config** tắt rule `react-hooks/set-state-in-effect` (cấm cả fetch-on-mount lẫn sync localStorage sau hydration — hai pattern có chủ ý của app này).
- **PS 5.1 decode JSON UTF-8 sai khi test API** (thiếu charset) — lỗi hiển thị, không phải lỗi dữ liệu; xác nhận qua `better-sqlite3` trực tiếp nếu nghi.
- **better-sqlite3 phải ở 12.x** (hiện `^12.11.1`): bản 13.x không phát hành prebuild nào → `npm install` rơi vào node-gyp và fail vì máy không có VS C++ Build Tools. 12.11.1 có prebuild `node-v137-win32-x64` cho Node 24 và khớp peer dep `^12.6.0` của `@prisma/adapter-better-sqlite3` — đừng nâng lên 13.
- **Máy CÓ Docker** (27.x, daemon chạy sẵn — ghi cũ "không có Docker" đã sai). Image production: `phoco-web:latest` từ `web/Dockerfile` (multi-stage, Next standalone + SQLite đã seed 36 trạm baked vào `/app/seed/phoco.db`, entrypoint copy sang volume `/data` nếu chưa có). Chạy: `docker compose up -d app` ở root (port 3000) hoặc `docker run -p 3000:3000 -v phoco_data:/data phoco-web:latest`. Admin mặc định `admin123` (override qua `ADMIN_PASSWORD`). MySQL service nằm ở compose profile `mysql`. Lưu ý: lockfile phải sinh trong Linux (`docker run --rm -v ${PWD}:/w -w /w node:24 npm install --package-lock-only`) nếu npm ci báo missing optional deps kiểu `@emnapi/*`.
- `DATABASE_URL="file:./dev.db"` resolve theo cwd → DB thật nằm `web/dev.db` (không phải `prisma/dev.db`).
- `npm audit`: 3 high thuộc Prisma CLI (deepmerge-ts, dev-only, chưa có bản vá) — đừng `audit fix --force` (sẽ downgrade Prisma 6 breaking).

## Việc cần cập nhật khi repo có code

Khi thêm mã nguồn, hãy bổ sung vào file này (ngắn gọn, đã kiểm chứng):

- **Lệnh chính**: build, test, lint, typecheck — kèm cách chạy 1 test / 1 gói riêng lẻ nếu khác mặc định.
- **Kiến trúc**: entrypoint thật, ranh giới package/thư mục lớn, luồng thực thi không rõ từ tên file.
- **Quirks công cụ**: codegen, migration, artifact sinh sẵn, biến môi trường, dev server.
- **Kiểm thử**: fixture, dịch vụ bắt buộc, suite tốn thời gian hoặc hay fail.
- **Quy ước riêng**: chỉ những điểm khác với mặc định của ngôn ngữ/framework.

## Quy tắc bảo trì file này

- Mỗi dòng phải trả lời được: "Agent có thể bỏ sót điều này nếu không có giúp đỡ?" — nếu không, xóa đi.
- Tin vào nguồn thực thi (script, config, CI) hơn là văn xuôi; chỉ ghi điều đã kiểm chứng được.
- Khi docs và config mâu thuẫn, ưu tiên config/script và sửa lại nội dung lỗi thời ở đây.
