"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const k of keys) {
            caches.delete(k);
          }
        });
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
