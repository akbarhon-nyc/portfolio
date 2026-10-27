import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam Toshkhujayev · AI Engineer",
  description:
    "Chat with Adam's portfolio: deterministic memory for AI agents, a free-first AI import pipeline, multi-agent context systems and AI-driven design systems.",
  openGraph: {
    title: "Adam Toshkhujayev · AI Engineer",
    description: "Ask my portfolio anything. Case studies from building AirBrew with Claude, Cursor and Codex.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0d0d0e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
