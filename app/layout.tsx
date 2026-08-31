import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IGNA // Project Galaxy",
  description: "Interactive 3D portfolio of Ignacio A. Schwindt — AI, quantum computing, immersive systems and embedded engineering.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
