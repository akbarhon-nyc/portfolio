import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/fraunces";
import "./globals.css";
import NavDock from "@/components/NavDock";
import SiteFooter from "@/components/SiteFooter";
import { THEME_KEY } from "@/lib/theme";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s · Adam Toshkhujayev" },
  description: site.description,
  openGraph: {
    title: site.title,
    description: "Ask my portfolio anything. Case studies and tips from building AirBrew with Claude, Cursor and Codex.",
    type: "website",
    url: site.url,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F2EE" },
    { media: "(prefers-color-scheme: dark)", color: "#F4F2EE" },
  ],
};

// Light by default; dark only when the visitor picked it with the toggle.
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top">
        <NavDock />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
