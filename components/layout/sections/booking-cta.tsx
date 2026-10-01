import Image from "next/image";
import { BookingSearch } from "@/components/layout/sections/booking-search";
import { SectionHeading } from "@/components/brand/section";
import { brandImages } from "@/config/images";
import { siteConfig, telHref } from "@/config/site";

/** Split layout: full-bleed sunset photo, navy panel with the availability search. */
export const BookingCtaSection = () => {
  return (
    <section id="book" className="relative grid scroll-mt-24 bg-navy text-ivory lg:grid-cols-2">
      <div className="relative min-h-[60vw] sm:min-h-[24rem] lg:min-h-[40rem]">
        <Image
          src={brandImages.booking.src}
          alt={brandImages.booking.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="relative flex flex-col justify-center px-6 py-20 sm:py-24 lg:edge-pr lg:pl-16 xl:pl-24">
        <span aria-hidden className="section-rule-gold top-10" />

        <SectionHeading
          tone="navy"
          eyebrow="Reservations"
          title={
            <>
              Your stay
              <br />
              begins here
            </>
          }
          description="Choose your dates and we'll show you the rooms that fit. Free cancellation up to 48 hours before check-in."
        />

        <BookingSearch className="mt-12 max-w-xl" />

        <p className="mt-10 text-sm text-ivory/70">
          Check-in from {siteConfig.hours.checkIn}, check-out by{" "}
          {siteConfig.hours.checkOut}. Prefer to speak to someone? Call our
          reservations team on{" "}
          <a
            href={telHref(siteConfig.phone.reservations)}
            className="text-gold underline-offset-4 hover:underline"
          >
            {siteConfig.phone.reservations}
          </a>
          .
        </p>

        <span aria-hidden className="section-rule-gold bottom-10" />
      </div>
    </section>
  );
};
