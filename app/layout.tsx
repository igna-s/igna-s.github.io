import type { Metadata } from "next";
import "./globals.css";
import "./game-v2.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://igna-s.is-a.dev"),
  title: {
    default: "Ignacio Schwindt — Computer Engineer",
    template: "%s — Ignacio Schwindt",
  },
  description: "Portfolio bilingüe de Ignacio Schwindt: inteligencia artificial, sistemas, computación cuántica, hardware e interfaces interactivas.",
  applicationName: "Ignacio Schwindt — Portfolio",
  authors: [{ name: "Ignacio Schwindt", url: "https://github.com/igna-s" }],
  creator: "Ignacio Schwindt",
  referrer: "strict-origin-when-cross-origin",
  keywords: ["Ignacio Schwindt", "computer engineer", "AI", "embedded systems", "quantum computing", "portfolio"],
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/github-avatar.png?v=5", type: "image/png", sizes: "512x512" }],
    shortcut: "/github-avatar.png?v=5",
    apple: "/github-avatar.png?v=5",
  },
  other: { "codex-preview": "development" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Ignacio Schwindt — Computer Engineer",
    description: "Ingeniería de software, IA y sistemas que conectan la lógica de alto nivel con el mundo físico.",
    images: [{ url: "/modern-facade-v2.png", width: 1672, height: 941, alt: "Portfolio interactivo de Ignacio Schwindt" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ignacio Schwindt — Computer Engineer",
    description: "Ingeniería de software, IA, sistemas e interfaces interactivas.",
    images: ["/modern-facade-v2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'"/></head><body>{children}</body></html>;
}
