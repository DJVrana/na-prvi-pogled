import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  appDirectory: "src/app",
  buildDirectory: "dist",
  basename: process.env.BASE_PATH || "/",
  prerender: [
    "/",
    "/eventi",
    "/blog",
    "/blog/kako-je-nastala-ideja-za-naprvipogled",
    "/blog/zasto-je-danas-toliko-tesko-upoznati-nekoga-uzivo",
    "/kontakt",
    "/prijava",
    "/admin",
    "/profil",
    "/matching",
    "/pravila-privatnosti",
    "/uvjeti-koristenja"
  ],
} satisfies Config;
