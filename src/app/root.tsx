import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "../index.css"; // Ensure standard Tailwind and CSS load

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Na prvi pogled 💞 Speed dating u Hrvatskoj – susreti i eventi za samce uživo" },
    { name: "description", content: "Upoznaj nove ljude uživo kroz kratke 1 na 1 razgovore u ugodnoj atmosferi. Zaboravi aplikacije i dopisivanje – doživi stvarni prvi pogled. Najpopularniji speed dating eventi i susreti za samce u Hrvatskoj. Prijavi se!" },
    { name: "keywords", content: "speed dating hrvatska, speed dating u hrvatskoj, eventi za samce, susreti za samce, upoznavanje zagreb, speed dating zagreb, na prvi pogled, brzi spojevi, upoznavanje uživo, dejtanje hrvatska" },
    { name: "author", content: "Na prvi pogled" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "Croatian" },
    { name: "theme-color", content: "#5c141d" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://naprvipogled.com/" },
    { property: "og:title", content: "Na prvi pogled 💞 Speed dating u Hrvatskoj – susreti i eventi za samce uživo" },
    { property: "og:description", content: "Upoznaj nove ljude uživo kroz kratke 1 na 1 razgovore u ugodnoj atmosferi. Zaboravi aplikacije i dopisivanje – doživi stvarni prvi pogled. Najpopularniji speed dating eventi i susreti za samce u Hrvatskoj. Prijavi se!" },
    { property: "og:image", content: "https://naprvipogled.com/images/hero-speed-dating.jpg" },
    { property: "og:image:secure_url", content: "https://naprvipogled.com/images/hero-speed-dating.jpg" },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Na prvi pogled – Speed dating susreti i eventi za samce uživo" },
    { property: "og:site_name", content: "Na prvi pogled" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: "https://naprvipogled.com/" },
    { name: "twitter:title", content: "Na prvi pogled 💞 Speed dating u Hrvatskoj – susreti i eventi za samce uživo" },
    { name: "twitter:description", content: "Upoznaj nove ljude uživo kroz kratke 1 na 1 razgovore u ugodnoj atmosferi. Zaboravi aplikacije i dopisivanje – doživi stvarni prvi pogled. Najpopularniji speed dating eventi i susreti za samce u Hrvatskoj. Prijavi se!" },
    { name: "twitter:image", content: "https://naprvipogled.com/images/hero-speed-dating.jpg" },
    { name: "apple-mobile-web-app-title", content: "Na prvi pogled" }
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href={`${import.meta.env.BASE_URL}favicon-96x96.png`} sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
        <link rel="shortcut icon" href={`${import.meta.env.BASE_URL}favicon.ico`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${import.meta.env.BASE_URL}apple-touch-icon.png`} />
        <link rel="manifest" href={`${import.meta.env.BASE_URL}site.webmanifest`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
