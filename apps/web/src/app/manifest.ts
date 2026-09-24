import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReciboFácil",
    short_name: "ReciboFácil",
    description: "Sistema de geração de recibos",
    start_url: "/admin/login",
    display: "standalone",
    background_color: "#F1F6F4",
    theme_color: "#3C6680",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}