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
    <section aria-labelledby="hero-title" className="surface-brand relative">
      <div className="grid lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[9fr_11fr]">
        {/* Navy text panel */}
        <div className="relative flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:edge-pl lg:pb-48 lg:pr-12">
          <p className="eyebrow mb-4 flex items-center gap-3 text-brand-gold">
            <EyebrowMark />
            Online booking available
          </p>

          <h1 id="hero-title" className="text-5xl font-bold text-brand-foreground lg:text-6xl">
            Welcome to Margin Hotel
          </h1>

          <p className="mt-4 text-xl font-bold text-brand-gold">
            {siteConfig.tagline}
          </p>

          <p className="measure mt-4 text-lg text-brand-foreground/90">
            Experience the perfect blend of comfort, luxury, and convenience
            on the coast. Book your room today for an unforgettable stay.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="brand" size="lg">
              <Link href="/book">Book now</Link>
            </Button>
            <Button asChild variant="view" size="lg">
              <Link href="#rooms">View rooms</Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-brand-gold/40 pt-6">
            {highlights.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse gap-1">
                <dd className="text-base text-brand-foreground/90">{label}</dd>
                <dt className="text-3xl font-bold text-brand-gold">{value}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Photograph */}
        <div className="relative min-h-[56vw] sm:min-h-[26rem] lg:min-h-0">
          <Image
            src={brandImages.hero.src}
            alt={brandImages.hero.alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Availability search: under the photo on small screens, floating
          across the bottom of the hero on large screens. */}
      <div className="relative z-10 px-4 pb-10 sm:px-6 lg:absolute lg:inset-x-0 lg:bottom-8 lg:px-0 lg:pb-0">
        <div className="lg:container">
          <div className="-mt-8 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-lg sm:p-6 lg:mt-0">
            <BookingSearch layout="bar" />
          </div>
        </div>
      </div>
    </section>
  );
};
