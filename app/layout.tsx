import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";

// Atkinson Hyperlegible (Braille Institute) for all text. Self-hosted latin
// subset - see app/fonts/README.md - so builds need no network fetch, and
// next/font generates a size-adjusted Arial fallback so the swap causes no
// layout shift.
const body = localFont({
  src: [
    { path: "./fonts/AtkinsonHyperlegible-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/AtkinsonHyperlegible-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14324A" },
    { media: "(prefers-color-scheme: dark)", color: "#0D2232" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background",
          body.variable
        )}
      >
        {/* First tab stop on every page: jump past the menu. */}
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
