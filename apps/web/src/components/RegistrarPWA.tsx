"use client";

import { useEffect } from "react";

export default function RegistrarPWA() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Falha ao registrar o service worker:", err);
      });
    }
  }, []);

  return null;
}