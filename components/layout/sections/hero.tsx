import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EyebrowMark } from "@/components/brand/section";
import { BookingSearch } from "@/components/layout/sections/booking-search";
import { brandImages } from "@/config/images";
import { siteConfig } from "@/config/site";

const highlights = [
  { value: "24/7", label: "Front desk" },
  { value: "Free", label: "Breakfast & parking" },
  { value: "48h", label: "Free cancellation" },
];

export const HeroSection = () => {
  return (
    <section className="relative bg-navy text-ivory">
      {/* 45 / 55 split - the photograph carries more of the frame. */}
      <div className="grid lg:grid-cols-[9fr_11fr] lg:min-h-[calc(100svh-6rem)]">
        {/* Navy text panel */}
        <div className="relative flex flex-col justify-center px-6 pt-20 pb-16 sm:pt-24 lg:edge-pl lg:pr-14 lg:pb-56 xl:pr-16">
          <span aria-hidden className="section-rule-gold top-10 lg:top-12" />

          {/* Warm glow behind the title, echoing the sunset in the photo. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-[12%] h-[34rem] w-[46rem] max-w-[140%] mix-blend-screen bg-[radial-gradient(closest-side,rgba(255,186,112,0.16),rgba(255,186,112,0.05)_50%,transparent)]"
          />

          <div className="relative">
            <p className="eyebrow mb-8 flex items-center gap-4 text-gold">
              <EyebrowMark />
              Online booking available
            </p>

            <h1 className="display-title text-gold text-6xl sm:text-7xl xl:text-8xl">
              Welcome to
              <br />
              Margin Hotel
            </h1>

            <p className="mt-8 font-heading text-xs sm:text-sm font-medium uppercase tracking-brand text-gold-light">
              {siteConfig.tagline}
            </p>

            <p className="mt-6 max-w-md text-lg text-[#E2E8F0]">
              Experience the perfect blend of comfort, luxury, and convenience
              on the coast. Book your room today for an unforgettable stay.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="gold" size="brand" className="sm:px-10">
                <Link href="/book">Book Now</Link>
              </Button>
              <Button asChild variant="goldOutline" size="brand" className="sm:px-10">
                <Link href="#rooms">View Rooms</Link>
              </Button>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-gold/30 pt-8">
              {highlights.map(({ value, label }) => (
                <div key={label}>
                  <dt className="display-title text-4xl text-gold">{value}</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-snug text-[#E2E8F0]">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Full-bleed photography */}
        <div className="relative min-h-[60vw] sm:min-h-[26rem] lg:min-h-0">
          <Image
            src={brandImages.hero.src}
            alt={brandImages.hero.alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
          {/* Soft bleed along the dividing line so the panel blends into the scene. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-navy via-navy/40 to-transparent lg:block"
          />
          {/* Mobile: fade the photo's top edge into the panel above it. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-navy to-transparent lg:hidden"
          />
          {/* Gentle shade behind the booking bar. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-navy-midnight/60 to-transparent lg:block"
          />
        </div>
      </div>

      {/* Floating booking bar: full width on desktop, stacked under the photo on mobile. */}
      <div className="relative z-10 px-6 pb-12 pt-0 -mt-10 sm:-mt-16 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0 lg:px-0 lg:pb-0">
        <div className="lg:container">
          <div className="border border-gold/30 bg-navy-midnight/90 p-6 shadow-[0_24px_48px_-24px_rgba(9,35,54,0.9)] backdrop-blur-md sm:p-8 lg:px-8 lg:py-6">
            <BookingSearch layout="bar" />
          </div>
        </div>
      </div>
    </section>
  );
};
