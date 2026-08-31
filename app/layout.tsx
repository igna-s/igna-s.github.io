import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://igna-s.is-a.dev"),
  title: "Stack & Slice — Ignacio's Dev Pizzeria",
  description: "Portfolio jugable bilingüe de Ignacio Schwindt: cada proyecto es una receta y cada tecnología, un topping que tenés que preparar, hornear y cortar.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Stack & Slice — Ignacio's Dev Pizzeria",
    description: "Un portfolio jugable donde los proyectos se cocinan componente por componente.",
    images: [{ url: "/pizzeria-facade.png", width: 1672, height: 941, alt: "Stack & Slice — pizzería digital interactiva" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stack & Slice — Ignacio's Dev Pizzeria",
    description: "Un portfolio jugable donde los proyectos se cocinan componente por componente.",
    images: ["/pizzeria-facade.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
