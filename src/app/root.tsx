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
    { title: "Na prvi pogled 💞 | Speed Dating Zagreb" },
    { name: "description", content: "Na prvi pogled - Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo u opuštenoj atmosferi. Prijavi se na sljedeći događaj!" },
    { name: "keywords", content: "speed dating zagreb, upoznavanje zagreb, izlasci, na prvi pogled, traženje partnera, druženje, mladi, event zagreb, zabava" },
    { name: "author", content: "Na prvi pogled" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "Croatian" },
    { name: "theme-color", content: "#E85D75" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://naprvipogled.com/" },
    { property: "og:title", content: "Na prvi pogled 💞 | Speed Dating Zagreb" },
    { property: "og:description", content: "Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo. Prijavi se!" },
    { property: "og:image", content: "/apple-touch-icon.png" },
    { property: "og:site_name", content: "Na prvi pogled" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: "https://naprvipogled.com/" },
    { name: "twitter:title", content: "Na prvi pogled 💞 | Speed Dating Zagreb" },
    { name: "twitter:description", content: "Ekskluzivni speed dating eventi u Zagrebu. Upoznaj nove ljude, stvori stvarna poznanstva i doživi nezaboravno iskustvo. Prijavi se!" },
    { name: "twitter:image", content: "/apple-touch-icon.png" },
    { name: "apple-mobile-web-app-title", content: "Na prvi pogled" }
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
