import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignacio's Lab — Engineering, Served Fresh",
  description: "Jugá un turno en la cocina digital de Ignacio Schwindt: cada receta es un proyecto y cada ingrediente, una tecnología real.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Ignacio's Lab — Engineering, Served Fresh",
    description: "Un portfolio jugable donde los proyectos se cocinan componente por componente.",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "Ignacio's Lab — cocina digital interactiva" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ignacio's Lab — Engineering, Served Fresh",
    description: "Un portfolio jugable donde los proyectos se cocinan componente por componente.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
