"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import ChestReveal from "@/components/ChestReveal";
import type { RevealTier } from "@/components/ChestReveal";
import type { RevealLoot } from "@/components/RewardCard";

interface StationRow {
  slug: string;
  orderIndex: number;
  nameVi: string;
  nameEn: string;
  storyVi: string;
  storyEn: string;
  questionVi: string;
  questionEn: string;
  options: { vi: string; en: string }[];
  correctIndex: number;
  hintVi: string;
  hintEn: string;
  lat: number;
  lng: number;
  radiusM: number;
  qrToken: string;
  isActive: boolean;
  chestTierId?: number | null;
}

interface TierOption {
  id: number;
  nameVi: string;
  nameEn: string;
}

interface PendingReview {
  id: number;
  photoPath: string;
  createdAt: string;
  player: { id: string };
  station: { slug: string; nameVi: string; nameEn: string; orderIndex: number };
}

type Tab = "stations" | "reviews" | "qr" | "chests" | "paywall";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("stations");

  useEffect(() => {
    fetch("/api/admin/stations").then((r) => setAuthed(r.ok));
  }, []);

  async function login(password: string) {
    const r = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) setAuthed(true);
    else alert("Sai mật khẩu / wrong password");
  }

  if (authed === null)
    return (
      <main className="flex min-h-dvh items-center justify-center text-ink-soft">
        …
      </main>
    );

  if (!authed) return <Login onSubmit={login} />;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black">Quản trị · Kho báu Phố cổ</h1>
        <button
          onClick={async () => {
            await fetch("/api/admin/session", { method: "DELETE" });
            setAuthed(false);
          }}
          className="rounded-lg border border-line px-3 py-1.5 text-sm"
        >
          Đăng xuất
        </button>
      </header>

      <nav className="mt-4 flex gap-1 rounded-2xl bg-line/60 p-1">
        {(
          [
            ["stations", "Trạm & nội dung"],
            ["reviews", "Duyệt ảnh"],
            ["chests", "Rương"],
            ["paywall", "Paywall"],
            ["qr", "In mã QR"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl px-2 py-2 text-sm font-semibold ${
              tab === id ? "bg-cream text-ink-strong shadow" : "text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "stations" && <StationsTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "chests" && <ChestsTab />}
        {tab === "paywall" && <PaywallTab />}
        {tab === "qr" && <QrTab />}
      </div>

      <Link href="/" className="mt-10 block text-center text-sm text-ink-soft underline">
        ← Về trang chơi
      </Link>
    </main>
  );
}

function Login({ onSubmit }: { onSubmit: (p: string) => void }) {
  const [password, setPassword] = useState("");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xs flex-col justify-center px-4">
      <h1 className="text-center text-xl font-black">Quản trị</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(password);
        }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full rounded-xl border border-line px-4 py-3"
          autoFocus
        />
        <button className="btn-primary w-full py-3">Đăng nhập</button>
      </form>
      <Link href="/" className="mt-6 text-center text-sm text-ink-soft underline">
        ← Trang người chơi
      </Link>
    </main>
  );
}

const EMPTY_FIELD = "";

function StationsTab() {
  const [list, setList] = useState<StationRow[]>([]);
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [draft, setDraft] = useState<StationRow | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/stations");
    if (!r.ok) return;
    const rows = (await r.json()) as StationRow[];
    setList(rows);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/chests")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tiers?: TierOption[] } | null) => {
        if (d?.tiers) setTiers(d.tiers);
      })
      .catch(() => {});
  }, []);

  function pick(slug: string) {
    setSelectedSlug(slug);
    setMsg(EMPTY_FIELD);
    setDraft(JSON.parse(JSON.stringify(list.find((s) => s.slug === slug))) as StationRow);
  }

  async function save() {
    if (!draft) return;
    const r = await fetch("/api/admin/stations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (r.ok) {
      setMsg("Đã lưu ✓");
      await load();
    } else {
      const d = await r.json().catch(() => null);
      setMsg(`Lỗi: ${d?.error ?? r.status}`);
    }
  }

  if (!draft)
    return (
      <select
        className="w-full rounded-xl border border-line bg-cream px-4 py-3"
        value={selectedSlug}
        onChange={(e) => pick(e.target.value)}
      >
        <option value="">— Chọn trạm để sửa —</option>
        {list.map((s) => (
          <option key={s.slug} value={s.slug}>
            #{s.orderIndex} {s.nameVi} {!s.isActive && "(ẩn)"}
          </option>
        ))}
      </select>
    );

  const field =
    "mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm";
  const label = "block text-xs font-bold uppercase tracking-wide text-ink-soft mt-4 first:mt-0";

  return (
    <div className="rounded-2xl border border-line bg-cream p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <select
          className="min-w-0 flex-1 rounded-xl border border-line bg-cream px-3 py-2 text-sm"
          value={selectedSlug}
          onChange={(e) => pick(e.target.value)}
        >
          {list.map((s) => (
            <option key={s.slug} value={s.slug}>
              #{s.orderIndex} {s.nameVi}
            </option>
          ))}
        </select>
        <button onClick={() => setDraft(null)} className="text-sm text-ink-soft">
          ✕
        </button>
      </div>

      <label className={label}>Tên (VI)</label>
      <input className={field} value={draft.nameVi} onChange={(e) => setDraft({ ...draft, nameVi: e.target.value })} />
      <label className={label}>Name (EN)</label>
      <input className={field} value={draft.nameEn} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={label}>Lat</label>
          <input type="number" step="any" className={field} value={draft.lat} onChange={(e) => setDraft({ ...draft, lat: Number(e.target.value) })} />
        </div>
        <div>
          <label className={label}>Lng</label>
          <input type="number" step="any" className={field} value={draft.lng} onChange={(e) => setDraft({ ...draft, lng: Number(e.target.value) })} />
        </div>
        <div>
          <label className={label}>Radius m</label>
          <input type="number" className={field} value={draft.radiusM} onChange={(e) => setDraft({ ...draft, radiusM: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={label}>Thứ tự</label>
          <input type="number" className={field} value={draft.orderIndex} onChange={(e) => setDraft({ ...draft, orderIndex: Number(e.target.value) })} />
        </div>
        <div>
          <label className={label}>Đáp án đúng</label>
          <select className={field} value={draft.correctIndex} onChange={(e) => setDraft({ ...draft, correctIndex: Number(e.target.value) })}>
            {draft.options.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Kích hoạt</label>
          <select className={field} value={String(draft.isActive)} onChange={(e) => setDraft({ ...draft, isActive: e.target.value === "true" })}>
            <option value="true">Hiện</option>
            <option value="false">Ẩn</option>
          </select>
        </div>
      </div>

      <label className={label}>Rương tại trạm</label>
      <select
        className={field}
        value={draft.chestTierId == null ? "" : String(draft.chestTierId)}
        onChange={(e) =>
          setDraft({
            ...draft,
            chestTierId: e.target.value === "" ? null : Number(e.target.value),
          })
        }
      >
        <option value="">-- không rương --</option>
        {tiers.map((tr) => (
          <option key={tr.id} value={tr.id}>
            {tr.nameVi}
          </option>
        ))}
      </select>

      <label className={label}>Câu chuyện (VI)</label>
      <textarea rows={3} className={field} value={draft.storyVi} onChange={(e) => setDraft({ ...draft, storyVi: e.target.value })} />
      <label className={label}>Story (EN)</label>
      <textarea rows={3} className={field} value={draft.storyEn} onChange={(e) => setDraft({ ...draft, storyEn: e.target.value })} />

      <label className={label}>Câu hỏi (VI)</label>
      <textarea rows={2} className={field} value={draft.questionVi} onChange={(e) => setDraft({ ...draft, questionVi: e.target.value })} />
      <label className={label}>Question (EN)</label>
      <textarea rows={2} className={field} value={draft.questionEn} onChange={(e) => setDraft({ ...draft, questionEn: e.target.value })} />

      <label className={label}>Các phương án (vi/en)</label>
      <div className="space-y-2">
        {draft.options.map((o, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <input
              className="rounded-lg border border-line px-3 py-2 text-sm"
              value={o.vi}
              onChange={(e) => {
                const options = [...draft.options];
                options[i] = { vi: e.target.value, en: o.en };
                setDraft({ ...draft, options });
              }}
            />
            <input
              className="rounded-lg border border-line px-3 py-2 text-sm"
              value={o.en}
              onChange={(e) => {
                const options = [...draft.options];
                options[i] = { vi: o.vi, en: e.target.value };
                setDraft({ ...draft, options });
              }}
            />
            <span className={`text-xs font-bold ${i === draft.correctIndex ? "text-jade-deep" : "text-ink-soft/40"}`}>
              {i === draft.correctIndex ? "✓ đúng" : i + 1}
            </span>
          </div>
        ))}
      </div>

      <label className={label}>Gợi ý trạm kế (VI)</label>
      <textarea rows={2} className={field} value={draft.hintVi} onChange={(e) => setDraft({ ...draft, hintVi: e.target.value })} />
      <label className={label}>Hint to next (EN)</label>
      <textarea rows={2} className={field} value={draft.hintEn} onChange={(e) => setDraft({ ...draft, hintEn: e.target.value })} />

      <p className="mt-2 text-xs text-ink-soft/60">
        Mã QR token: <code>{draft.qrToken}</code>
      </p>

      <div className="sticky bottom-3 mt-5 flex items-center gap-3 rounded-2xl bg-cream/90 p-3 shadow-lg ring-1 ring-line backdrop-blur">
        <button onClick={save} className="btn-primary flex-1 py-3">
          Lưu thay đổi
        </button>
        <span className="text-sm font-medium text-jade-deep">{msg}</span>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const [rows, setRows] = useState<PendingReview[]>([]);
  const [overflow, setOverflow] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/reviews");
    if (!r.ok) return;
    const data = (await r.json()) as {
      items: PendingReview[];
      totalPending: number;
    };
    setRows(data.items);
    setOverflow(Math.max(0, data.totalPending - data.items.length));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: number, approve: boolean) {
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkInId: id, approve, note: notes[id] || undefined }),
    });
    await load();
  }

  if (rows.length === 0)
    return <p className="py-16 text-center text-ink-soft">Không có ảnh nào chờ duyệt.</p>;

  return (
    <div className="space-y-4">
      {overflow > 0 && (
        <p className="rounded-xl bg-clay-soft px-4 py-2.5 text-sm font-medium text-clay-deep">
          Còn {overflow} ảnh chờ duyệt khác chưa hiển thị — duyệt bớt rồi tải lại trang.
        </p>
      )}
      {rows.map((row) => (
        <div key={row.id} className="overflow-hidden rounded-2xl border border-line bg-cream shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/uploads/${row.photoPath}`}
            alt={`check-in ${row.station.nameVi}`}
            className="max-h-80 w-full object-contain bg-paper"
          />
          <div className="p-4">
            <div className="font-bold">
              #{row.station.orderIndex} {row.station.nameVi}{" "}
              <span className="text-xs font-normal text-ink-soft/60">{row.station.slug}</span>
            </div>
            <div className="text-xs text-ink-soft/60">
              Player {row.player.id.slice(0, 8)}… · {new Date(row.createdAt).toLocaleString("vi-VN")}
            </div>
            <input
              placeholder="Ghi chú nếu từ chối…"
              value={notes[row.id] ?? ""}
              onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })}
              className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decide(row.id, true)}
                className="flex-1 rounded-xl bg-jade py-2.5 hover:bg-jade-deep font-semibold text-white"
              >
                ✓ Chấp nhận — mở trạm
              </button>
              <button
                onClick={() => decide(row.id, false)}
                className="flex-1 rounded-xl bg-wine py-2.5 hover:bg-wine/85 font-semibold text-white"
              >
                ✕ Từ chối
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QrTab() {
  const [list, setList] = useState<StationRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/stations")
      .then((r) => (r.ok ? r.json() : []))
      .then(setList);
  }, []);

  return (
    <>
      <p className="mb-4 rounded-xl bg-gold-soft p-3 text-sm text-timber">
        In trang này rồi dán mã tại địa điểm tương ứng. Mã mở liên kết trạm kèm token bí mật.
        Người chơi quét bằng máy ảnh điện thoại là vào thẳng màn check-in.
      </p>
      <button
        onClick={() => window.print()}
        className="btn-primary mb-6 flex items-center gap-2 py-2.5"
      >
        <Printer className="h-4 w-4" /> In trang
      </button>
      <div className="grid grid-cols-2 gap-4 print:grid-cols-3">
        {list.map((s) => (
          <div key={s.slug} className="break-inside-avoid rounded-2xl border border-line bg-cream p-4 text-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/qr/${s.slug}`} alt={`QR ${s.nameVi}`} className="mx-auto h-36 w-36" />
            <div className="mt-2 text-sm font-bold">
              #{s.orderIndex} {s.nameVi}
            </div>
            <div className="text-xs text-ink-soft/60">{s.qrToken}</div>
          </div>
        ))}
      </div>
    </>
  );
}

interface ChestTierRow {
  id: number;
  key: string;
  nameVi: string;
  nameEn: string;
  colorHex: string;
  modelGlbPath: string;
  modelUsdzPath: string;
  sortOrder: number;
}

interface LootRow {
  id: number;
  scopeKey: string;
  type: string;
  pointsAmount: number | null;
  storyVi: string | null;
  storyEn: string | null;
  imagePath: string | null;
  youtubeUrl: string | null;
  sortOrder: number;
}

interface DropRuleRow {
  id: number;
  chancePct: number;
  tierKey: string;
  weight: number;
}

interface PartnerSpotRow {
  id: number;
  key: string;
  token: string;
}

interface ChestsData {
  tiers: ChestTierRow[];
  loot: LootRow[];
  dropRules: DropRuleRow[];
  partnerSpot: PartnerSpotRow | null;
}

type TierEdit = Partial<Pick<ChestTierRow, "nameVi" | "nameEn" | "colorHex" | "modelGlbPath" | "modelUsdzPath">>;

const LOOT_TYPES = ["POINTS", "STORY", "IMAGE", "VIDEO"] as const;

const EMPTY_LOOT = {
  scopeKey: "",
  type: "POINTS",
  pointsAmount: "",
  storyVi: "",
  storyEn: "",
  youtubeUrl: "",
  imagePath: "",
  sortOrder: "",
};

function lootImgSrc(p: string | null): string {
  if (!p) return "";
  if (p.startsWith("/api/")) return p;
  const m = p.match(/\/images\/loot\/([^/?]+)/);
  return m ? `/api/images/loot?name=${m[1]}` : p;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ChestsTab() {
  const [data, setData] = useState<ChestsData | null>(null);
  const [tierEdits, setTierEdits] = useState<Record<number, TierEdit>>({});
  const [dropChance, setDropChance] = useState(0);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [newLoot, setNewLoot] = useState(EMPTY_LOOT);
  const [msg, setMsg] = useState("");
  const [qr, setQr] = useState<{ token: string; dataUrl: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingLoot, setEditingLoot] = useState<LootRow | null>(null);
  const [editingLootForm, setEditingLootForm] = useState({ scopeKey: "", type: "POINTS", pointsAmount: "", storyVi: "", storyEn: "", youtubeUrl: "", imagePath: "", sortOrder: "" });
  const [editUploading, setEditUploading] = useState(false);
  const [previewTier, setPreviewTier] = useState<ChestTierRow | null>(null);
  const [addingLoot, setAddingLoot] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/chests");
    if (!r.ok) return;
    const d = (await r.json()) as ChestsData;
    setData(d);
    setDropChance(d.dropRules[0]?.chancePct ?? 0);
    const w: Record<string, number> = {};
    for (const rule of d.dropRules) w[rule.tierKey] = rule.weight;
    setWeights(w);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: unknown) {
    const r = await fetch("/api/admin/chests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMsg(r.ok ? "Đã lưu ✓" : `Lỗi: ${r.status}`);
    await load();
  }

  function saveTier(t: ChestTierRow) {
    const e = tierEdits[t.id] ?? {};
    patch({
      kind: "tier",
      id: t.id,
      nameVi: e.nameVi ?? t.nameVi,
      nameEn: e.nameEn ?? t.nameEn,
      colorHex: e.colorHex ?? t.colorHex,
      modelGlbPath: e.modelGlbPath ?? t.modelGlbPath,
      modelUsdzPath: e.modelUsdzPath ?? t.modelUsdzPath,
    });
  }

  async function addLoot() {
    if (!newLoot.scopeKey.trim()) {
      setMsg("Cần nhập scopeKey");
      return;
    }
    const points = Number(newLoot.pointsAmount);
    await patch({
      kind: "loot-create",
      scopeKey: newLoot.scopeKey.trim(),
      type: newLoot.type,
      sortOrder: Number(newLoot.sortOrder || 0),
      ...(Number.isInteger(points) ? { pointsAmount: points } : {}),
      ...(newLoot.storyVi ? { storyVi: newLoot.storyVi } : {}),
      ...(newLoot.storyEn ? { storyEn: newLoot.storyEn } : {}),
      ...(newLoot.youtubeUrl ? { youtubeUrl: newLoot.youtubeUrl } : {}),
      ...(newLoot.imagePath ? { imagePath: newLoot.imagePath } : {}),
    });
    setNewLoot(EMPTY_LOOT);
    setAddingLoot(false);
  }

  async function showPartnerQr() {
    const spot = data?.partnerSpot;
    if (!spot) return;
    try {
      const { toDataURL } = await import("qrcode");
      const dataUrl = await toDataURL(`${location.origin}/partner?t=${spot.token}`);
      setQr({ token: spot.token, dataUrl });
    } catch {
      setQr(null);
      setMsg("Lỗi tạo QR");
    }
  }

  async function uploadLootImage(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      setMsg("File quá lớn, tối đa 5MB");
      return;
    }
    if (!ALLOWED_UPLOAD_MIMES.includes(file.type)) {
      setMsg("Chỉ chấp nhận jpg, png, webp, gif");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/chest-loot/upload", { method: "POST", body: fd });
      if (!r.ok) {
        const e = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        setMsg(`Upload lỗi: ${e.error}`);
        return;
      }
      const { path } = (await r.json()) as { path: string };
      setNewLoot((prev) => ({ ...prev, imagePath: path }));
      setMsg("Upload thành công ✓");
    } catch {
      setMsg("Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function uploadLootImageEdit(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) { setMsg("File quá lớn, tối đa 5MB"); return; }
    if (!ALLOWED_UPLOAD_MIMES.includes(file.type)) { setMsg("Chỉ chấp nhận jpg, png, webp, gif"); return; }
    setEditUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/chest-loot/upload", { method: "POST", body: fd });
      if (!r.ok) { const e = await r.json().catch(() => ({ error: `HTTP ${r.status}` })); setMsg(`Upload lỗi: ${e.error}`); return; }
      const { path } = (await r.json()) as { path: string };
      setEditingLootForm((prev) => ({ ...prev, imagePath: path }));
      setMsg("Upload thành công ✓");
    } catch { setMsg("Upload thất bại"); } finally { setEditUploading(false); }
  }

  useEffect(() => {
    if (!previewTier && !addingLoot && !editingLoot) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPreviewTier(null);
        setAddingLoot(false);
        setEditingLoot(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewTier, addingLoot, editingLoot]);

  if (!data) return <p className="py-16 text-center text-ink-soft">…</p>;

  const field = "mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm";
  const label = "block text-xs font-bold uppercase tracking-wide text-ink-soft mt-4 first:mt-0";
  const section = "rounded-2xl border border-line bg-cream p-5 shadow-sm";

  const groups = new Map<string, LootRow[]>();
  for (const l of data.loot) {
    const arr = groups.get(l.scopeKey) ?? [];
    arr.push(l);
    groups.set(l.scopeKey, arr);
  }

  return (
    <>
    <div className="space-y-6">
      <section className={section}>
        <h2 className="text-sm font-black uppercase tracking-wide">Cấp rương</h2>
        {data.tiers.map((t) => {
          const e = tierEdits[t.id] ?? {};
          return (
            <div key={t.id} className="mt-4 rounded-xl border border-line p-3 first:mt-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: e.colorHex ?? t.colorHex }} />
                  {t.key}
                </span>
                <button
                  onClick={() => setPreviewTier(t)}
                  className="rounded-lg border border-line bg-cream px-3 py-1 text-xs font-semibold text-ink hover:bg-gold/10"
                >
                  Xem trước
                </button>
              </div>
              <label className={label}>Tên (VI)</label>
              <input className={field} value={e.nameVi ?? t.nameVi} onChange={(ev) => setTierEdits({ ...tierEdits, [t.id]: { ...e, nameVi: ev.target.value } })} />
              <label className={label}>Name (EN)</label>
              <input className={field} value={e.nameEn ?? t.nameEn} onChange={(ev) => setTierEdits({ ...tierEdits, [t.id]: { ...e, nameEn: ev.target.value } })} />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={label}>Màu (#hex)</label>
                  <input className={field} value={e.colorHex ?? t.colorHex} onChange={(ev) => setTierEdits({ ...tierEdits, [t.id]: { ...e, colorHex: ev.target.value } })} />
                </div>
                <div>
                  <label className={label}>GLB path</label>
                  <input className={field} value={e.modelGlbPath ?? t.modelGlbPath} onChange={(ev) => setTierEdits({ ...tierEdits, [t.id]: { ...e, modelGlbPath: ev.target.value } })} />
                </div>
                <div>
                  <label className={label}>USDZ path</label>
                  <input className={field} value={e.modelUsdzPath ?? t.modelUsdzPath} onChange={(ev) => setTierEdits({ ...tierEdits, [t.id]: { ...e, modelUsdzPath: ev.target.value } })} />
                </div>
              </div>
              <button onClick={() => saveTier(t)} className="btn-primary mt-3 px-4 py-2 text-sm">
                Lưu
              </button>
            </div>
          );
        })}
      </section>

      <section className={section}>
        <h2 className="text-sm font-black uppercase tracking-wide">Tỉ lệ rơi rương (DROP)</h2>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className={label}>Chance %</label>
            <input type="number" min={0} max={100} className={field} value={dropChance} onChange={(ev) => setDropChance(Number(ev.target.value))} />
          </div>
          {data.tiers.map((t) => (
            <div key={t.key}>
              <label className={label}>Weight {t.key}</label>
              <input
                type="number"
                min={0}
                className={field}
                value={weights[t.key] ?? 0}
                onChange={(ev) => setWeights({ ...weights, [t.key]: Number(ev.target.value) })}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            patch({
              kind: "drop-rule",
              chancePct: dropChance,
              rules: data.tiers.map((t) => ({ tierKey: t.key, weight: Math.round(weights[t.key] ?? 0) })),
            })
          }
          className="btn-primary mt-3 px-4 py-2 text-sm"
        >
          Lưu tỉ lệ
        </button>
      </section>

      <section className={section}>
        <h2 className="text-sm font-black uppercase tracking-wide">Loot</h2>
        {[...groups.entries()].map(([scopeKey, rows]) => (
          <div key={scopeKey} className="mt-4 rounded-xl border border-line p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-soft">{scopeKey}</div>
            {rows.map((l) => (
              <div key={l.id} className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  {l.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lootImgSrc(l.imagePath)} alt="" className="h-8 w-8 flex-shrink-0 rounded border border-line object-cover" />
                  )}
                  <span>
                    <span className="font-bold">{l.type}</span>{" "}
                    {l.type === "POINTS" && l.pointsAmount !== null
                      ? `${l.pointsAmount} điểm`
                      : l.storyVi || l.storyEn || l.imagePath || l.youtubeUrl || ""}
                    {l.sortOrder !== 0 && <span className="text-xs text-ink-soft/60"> · #{l.sortOrder}</span>}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingLoot(l);
                      setEditingLootForm({
                        scopeKey: l.scopeKey,
                        type: l.type,
                        pointsAmount: l.pointsAmount !== null ? String(l.pointsAmount) : "",
                        storyVi: l.storyVi ?? "",
                        storyEn: l.storyEn ?? "",
                        youtubeUrl: l.youtubeUrl ?? "",
                        imagePath: l.imagePath ?? "",
                        sortOrder: String(l.sortOrder),
                      });
                    }}
                    className="rounded-lg bg-gold/20 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gold/35"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => patch({ kind: "loot-delete", id: l.id })}
                    className="rounded-lg bg-wine px-3 py-1.5 text-xs font-semibold text-white hover:bg-wine/85"
                  >
                    Xóa
                  </button>
                </span>
              </div>
            ))}
          </div>
        ))}

        {editingLoot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm" onClick={() => setEditingLoot(null)}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-ink">Sửa loot #{editingLoot.id}</h3>
                <button onClick={() => setEditingLoot(null)} className="text-xs text-ink-soft hover:text-ink">Hủy</button>
              </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Scope key</label>
                <input className={field} value={editingLootForm.scopeKey} onChange={(ev) => setEditingLootForm({ ...editingLootForm, scopeKey: ev.target.value })} />
              </div>
              <div>
                <label className={label}>Loại</label>
                <select className={field} value={editingLootForm.type} onChange={(ev) => setEditingLootForm({ ...editingLootForm, type: ev.target.value })}>
                  {LOOT_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Điểm</label>
                <input type="number" className={field} value={editingLootForm.pointsAmount} onChange={(ev) => setEditingLootForm({ ...editingLootForm, pointsAmount: ev.target.value })} />
              </div>
              <div>
                <label className={label}>Thứ tự</label>
                <input type="number" className={field} value={editingLootForm.sortOrder} onChange={(ev) => setEditingLootForm({ ...editingLootForm, sortOrder: ev.target.value })} />
              </div>
            </div>
            <label className={label}>Story (VI)</label>
            <textarea rows={2} className={field} value={editingLootForm.storyVi} onChange={(ev) => setEditingLootForm({ ...editingLootForm, storyVi: ev.target.value })} />
            <label className={label}>Story (EN)</label>
            <textarea rows={2} className={field} value={editingLootForm.storyEn} onChange={(ev) => setEditingLootForm({ ...editingLootForm, storyEn: ev.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>YouTube URL</label>
                <input className={field} value={editingLootForm.youtubeUrl} onChange={(ev) => setEditingLootForm({ ...editingLootForm, youtubeUrl: ev.target.value })} />
              </div>
              <div>
                <label className={label}>Image</label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink hover:bg-gold/10">
                    {editUploading ? "Đang upload…" : "Chọn ảnh"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) uploadLootImageEdit(f); }} />
                  </label>
                  {editUploading && <span className="text-xs text-ink-soft">⏳</span>}
                </div>
                {editingLootForm.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lootImgSrc(editingLootForm.imagePath)} alt="preview" className="mt-2 h-32 max-w-full rounded-lg border border-line object-cover" />
                )}
                <label className={`${label} mt-2`}>Path thủ công</label>
                <input className={field} value={editingLootForm.imagePath} onChange={(ev) => setEditingLootForm({ ...editingLootForm, imagePath: ev.target.value })} placeholder="/images/loot/…" />
              </div>
            </div>
            <button
              onClick={() => {
                const points = Number(editingLootForm.pointsAmount);
                patch({
                  kind: "loot-update",
                  id: editingLoot.id,
                  scopeKey: editingLootForm.scopeKey.trim() || undefined,
                  type: editingLootForm.type || undefined,
                  sortOrder: editingLootForm.sortOrder !== "" ? Number(editingLootForm.sortOrder) : undefined,
                  ...(Number.isInteger(points) ? { pointsAmount: points } : {}),
                  ...(editingLootForm.storyVi ? { storyVi: editingLootForm.storyVi } : {}),
                  ...(editingLootForm.storyEn ? { storyEn: editingLootForm.storyEn } : {}),
                  ...(editingLootForm.youtubeUrl ? { youtubeUrl: editingLootForm.youtubeUrl } : {}),
                  ...(editingLootForm.imagePath ? { imagePath: editingLootForm.imagePath } : {}),
                });
                setEditingLoot(null);
              }}
              className="btn-primary mt-3 px-4 py-2 text-sm"
            >
              Lưu
            </button>
            </div>
          </div>
        )}

        <button onClick={() => setAddingLoot(true)} className="btn-primary mt-4 px-4 py-2 text-sm">
          Thêm loot
        </button>
        {addingLoot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm" onClick={() => setAddingLoot(false)}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-ink">Thêm loot mới</h3>
                <button onClick={() => setAddingLoot(false)} className="text-xs text-ink-soft hover:text-ink">Hủy</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Scope key (vd: station:hang-bac)</label>
                  <input className={field} value={newLoot.scopeKey} onChange={(ev) => setNewLoot({ ...newLoot, scopeKey: ev.target.value })} />
                </div>
                <div>
                  <label className={label}>Loại</label>
                  <select className={field} value={newLoot.type} onChange={(ev) => setNewLoot({ ...newLoot, type: ev.target.value })}>
                    {LOOT_TYPES.map((tp) => (
                      <option key={tp} value={tp}>
                        {tp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Điểm (nếu POINTS)</label>
                  <input type="number" className={field} value={newLoot.pointsAmount} onChange={(ev) => setNewLoot({ ...newLoot, pointsAmount: ev.target.value })} />
                </div>
                <div>
                  <label className={label}>Thứ tự</label>
                  <input type="number" className={field} value={newLoot.sortOrder} onChange={(ev) => setNewLoot({ ...newLoot, sortOrder: ev.target.value })} />
                </div>
              </div>
              <label className={label}>Story (VI)</label>
              <textarea rows={2} className={field} value={newLoot.storyVi} onChange={(ev) => setNewLoot({ ...newLoot, storyVi: ev.target.value })} />
              <label className={label}>Story (EN)</label>
              <textarea rows={2} className={field} value={newLoot.storyEn} onChange={(ev) => setNewLoot({ ...newLoot, storyEn: ev.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>YouTube URL</label>
                  <input className={field} value={newLoot.youtubeUrl} onChange={(ev) => setNewLoot({ ...newLoot, youtubeUrl: ev.target.value })} />
                </div>
                <div>
                  <label className={label}>Image</label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="cursor-pointer rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink hover:bg-gold/10">
                      {uploading ? "Đang upload…" : "Chọn ảnh"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(ev) => {
                          const f = ev.target.files?.[0];
                          if (f) uploadLootImage(f);
                        }}
                      />
                    </label>
                    {uploading && <span className="text-xs text-ink-soft">⏳</span>}
                  </div>
                  {newLoot.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lootImgSrc(newLoot.imagePath)} alt="preview" className="mt-2 h-32 max-w-full rounded-lg border border-line object-cover" />
                  )}
                  <label className={`${label} mt-2`}>Path thủ công</label>
                  <input className={field} value={newLoot.imagePath} onChange={(ev) => setNewLoot({ ...newLoot, imagePath: ev.target.value })} placeholder="/images/loot/…" />
                </div>
              </div>
              <button onClick={addLoot} className="btn-primary mt-3 px-4 py-2 text-sm">
                Thêm
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className="text-sm font-black uppercase tracking-wide">Địa điểm đối tác</h2>
        {data.partnerSpot ? (
          <>
            <p className="mt-3 text-sm">
              Key: <code>{data.partnerSpot.key}</code>
            </p>
            <p className="mt-1 break-all font-mono text-sm">
              Token: <code>{data.partnerSpot.token}</code>
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={showPartnerQr} className="btn-primary px-4 py-2 text-sm">
                QR
              </button>
              <button
                onClick={() => {
                  setQr(null);
                  patch({ kind: "regenerate_partner_token" });
                }}
                className="btn-primary px-4 py-2 text-sm"
              >
                Tạo token mới
              </button>
            </div>
            {qr && data.partnerSpot.token === qr.token && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr.dataUrl} alt="QR token đối tác" className="h-44 w-44 rounded-xl border border-line bg-white p-2" />
                <p className="mt-2 text-xs text-ink-soft">In QR này dán cạnh poster marker tại quầy.</p>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">Chưa có địa điểm đối tác.</p>
        )}
      </section>

      {msg && <p className="text-sm font-medium text-jade-deep">{msg}</p>}
    </div>
    {previewTier && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        onClick={(ev) => { if (ev.target === ev.currentTarget) setPreviewTier(null); }}
      >
        <ChestReveal
          tier={{
            key: previewTier.key,
            nameVi: previewTier.nameVi,
            nameEn: previewTier.nameEn,
            colorHex: previewTier.colorHex,
            modelGlbPath: previewTier.modelGlbPath,
            modelUsdzPath: previewTier.modelUsdzPath,
          } satisfies RevealTier}
          loot={data.loot.slice(0, 4).map((l) => ({
            type: l.type,
            pointsAmount: l.pointsAmount ?? undefined,
            storyVi: l.storyVi ?? undefined,
            storyEn: l.storyEn ?? undefined,
            imagePath: l.imagePath ?? undefined,
            youtubeUrl: l.youtubeUrl ?? undefined,
          })) satisfies RevealLoot[]}
          onClose={() => setPreviewTier(null)}
        />
      </div>
    )}
    </>
  );
}
