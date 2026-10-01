import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/layout/sections/hero";
import { AboutSection } from "@/components/layout/sections/about";
import { BookingCtaSection } from "@/components/layout/sections/booking-cta";
import { RoomsPreviewSection } from "@/components/layout/sections/rooms-preview";
import { GallerySection } from "@/components/layout/sections/gallery";
import { ReviewsSection } from "@/components/layout/sections/reviews";
import { FeaturesSection } from "@/components/layout/sections/features";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} exterior and pool`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <RoomsPreviewSection />
        <FeaturesSection />
        <GallerySection />
        <ReviewsSection />
        <BookingCtaSection />
        <FAQSection />
        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
