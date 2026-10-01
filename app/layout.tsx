import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/config/site";

// Brand fonts are self-hosted (latin subset, from Google Fonts - SIL Open
// Font License, see app/fonts/README.md) so builds don't depend on a network
// fetch and pages never flash a fallback font.

// Display titles: tall, condensed, high-contrast serif.
const display = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Headings, labels and the wordmark: geometric sans, set uppercase + tracked.
const heading = localFont({
  src: "./fonts/Montserrat-normal.woff2",
  weight: "400 600",
  variable: "--font-heading",
  display: "swap",
});

// Body copy.
const body = localFont({
  src: "./fonts/HankenGrotesk-normal.woff2",
  weight: "300 700",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#113F61" },
    { media: "(prefers-color-scheme: dark)", color: "#092336" },
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
          display.variable,
          heading.variable,
          body.variable
        )}
      >
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
