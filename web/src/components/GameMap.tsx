"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { Compass, Navigation, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { haversineM } from "@/lib/geo";
import type { StationDTO } from "@/lib/state";

const COLOR: Record<StationDTO["status"], string> = {
  completed: "#3f6c51",
  checked_in: "#c07a2d",
  current: "#b4432f",
};

interface Fix {
  lat: number;
  lng: number;
  accuracyM: number;
}

export default function GameMap({
  stations,
  activeSlug,
  onPosition,
}: {
  stations: StationDTO[];
  activeSlug: string | null;
  onPosition?: (pos: { lat: number; lng: number }) => void;
}) {
  const { t, lang } = useLang();
  const [guiding, setGuiding] = useState(false);
  const [fix, setFix] = useState<Fix | null>(null);
  const [denied, setDenied] = useState(false);

  const visible = stations;
  const active = stations.find((s) => s.slug === activeSlug) ?? null;

  useEffect(() => {
    if (!guiding) return;
    if (!("geolocation" in navigator)) {
      setDenied(true);
      setGuiding(false);
      return;
    }
    setDenied(false);
    setFix(null);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setFix({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
        });
        onPosition?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setDenied(true);
        setGuiding(false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [guiding, onPosition]);

  const lats = visible.map((s) => s.lat);
  const lngs = visible.map((s) => s.lng);
  const centerLat = lats.reduce((a, b) => a + b, 0) / Math.max(1, lats.length);
  const centerLng = lngs.reduce((a, b) => a + b, 0) / Math.max(1, lngs.length);

  const distanceM =
    fix && active
      ? Math.round(haversineM(fix.lat, fix.lng, active.lat, active.lng))
      : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {visible.map((s) => {
          const color = COLOR[s.status];
          return (
            <Circle
              key={s.slug}
              center={[s.lat, s.lng]}
              radius={s.radiusM}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: s.slug === activeSlug ? 0.35 : 0.18,
                weight: s.slug === activeSlug ? 3 : 1.5,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>
                    #{s.orderIndex} {s.nameVi}
                  </strong>
                  <div className="mt-1">{s.nameEn}</div>
                  <a
                    href={`/station/${s.slug}`}
                    className="mt-2 inline-block rounded-lg bg-son px-3 py-1.5 font-semibold text-paper"
                  >
                    {t("map.enter_station")} →
                  </a>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {guiding && fix && (
          <>
            <Circle
              center={[fix.lat, fix.lng]}
              radius={Math.min(Math.max(fix.accuracyM, 10), 120)}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.08, weight: 1 }}
            />
            <CircleMarker
              center={[fix.lat, fix.lng]}
              radius={7}
              pathOptions={{ color: "#ffffff", weight: 2.5, fillColor: "#2563eb", fillOpacity: 1 }}
            />
          </>
        )}

        {guiding && fix && active && (
          <Polyline
            positions={[
              [fix.lat, fix.lng],
              [active.lat, active.lng],
            ]}
            pathOptions={{ color: COLOR.current, weight: 3, dashArray: "6 8" }}
          />
        )}
      </MapContainer>

      {active && (
        <button
          onClick={() => setGuiding((g) => !g)}
          aria-pressed={guiding}
          className={`absolute bottom-3 left-3 z-[500] flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-lg transition-colors ${
            guiding ? "bg-timber text-paper border border-gold/60" : "bg-son text-paper"
          }`}
        >
          {guiding ? <X className="h-3.5 w-3.5" /> : <Navigation className="h-3.5 w-3.5" />}
          {guiding ? t("guide.stop") : t("guide.start")}
        </button>
      )}

      {guiding && fix && active && distanceM !== null && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-[500] max-w-[85%] -translate-x-1/2 truncate rounded-full bg-timber/90 px-4 py-1.5 text-xs font-semibold text-paper shadow-lg">
          <Compass className="mr-1.5 inline h-3.5 w-3.5 align-[-2px]" />
          {t("guide.to_target", { distance: distanceM, name: lang === "vi" ? active.nameVi : active.nameEn })}
        </div>
      )}

      {denied && (
        <div className="absolute bottom-16 left-3 z-[500] rounded-xl bg-wine px-4 py-2 text-xs font-semibold text-paper shadow-lg">
          {t("guide.denied")}
        </div>
      )}
    </div>
  );
}
