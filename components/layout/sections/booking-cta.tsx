import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/brand/section";
import { brandImages } from "@/config/images";
import { siteConfig, telHref } from "@/config/site";

/** Split layout: full-bleed sunset photo, navy panel with one booking CTA.
 *  (The full date search lives in the hero - no second copy here.) */
export const BookingCtaSection = () => {
  return (
    <section id="book" className="surface-brand relative grid lg:grid-cols-2">
      <div className="relative min-h-[56vw] sm:min-h-[24rem] lg:min-h-[36rem]">
        <Image
          src={brandImages.booking.src}
          alt={brandImages.booking.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="section-y relative flex flex-col justify-center px-4 sm:px-6 lg:edge-pr lg:pl-12 xl:pl-16">

        <SectionHeading
          tone="navy"
          eyebrow="Reservations"
          title="Your stay begins here"
          description="Choose your dates and we'll show you the rooms that fit. Free cancellation up to 48 hours before check-in."
        />

        <Button asChild variant="brand" size="lg" className="mt-8 self-start">
          <Link href="/book">
            <CalendarDays aria-hidden />
            Choose your dates
          </Link>
        </Button>

        <p className="measure mt-8 text-brand-foreground/90">
          Check-in from {siteConfig.hours.checkIn}, check-out by{" "}
          {siteConfig.hours.checkOut}. Prefer to speak to someone? Call our
          reservations team on{" "}
          <a
            href={telHref(siteConfig.phone.reservations)}
            className="whitespace-nowrap font-bold text-brand-gold underline underline-offset-4 hover:no-underline"
          >
            {siteConfig.phone.reservations}
          </a>
          .
        </p>

      </div>
    </section>
  );
};
