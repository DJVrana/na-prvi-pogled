import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  appDirectory: "src/app",
  buildDirectory: "dist",
  basename: process.env.BASE_PATH || "/",
  prerender: ["/", "/eventi", "/blog", "/kontakt", "/prijava", "/admin", "/profil", "/matching"],
} satisfies Config;
