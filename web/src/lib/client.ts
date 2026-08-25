"use client";

const KEY = "pc36_player_id";

export function getPlayerId(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setPlayerId(id: string) {
  window.localStorage.setItem(KEY, id);
}

export async function ensureSession(): Promise<string> {
  const saved = getPlayerId();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId: saved ?? undefined }),
  });
  if (res.ok) {
    const data = (await res.json()) as { playerId: string };
    setPlayerId(data.playerId);
    return data.playerId;
  }
  if (!saved) throw new Error("session failed");
  const retry = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!retry.ok) throw new Error("session failed");
  const data = (await retry.json()) as { playerId: string };
  setPlayerId(data.playerId);
  return data.playerId;
}

export async function fetchState() {
  const pid = await ensureSession();
  const res = await fetch(`/api/state?playerId=${pid}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("state failed");
  return res.json();
}
