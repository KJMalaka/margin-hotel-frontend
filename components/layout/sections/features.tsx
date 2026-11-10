import {
  AirVent,
  CircleParking,
  ConciergeBell,
  Coffee,
  Sparkles,
  Tv,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/brand/section";

interface Amenity {
  icon: LucideIcon;
  title: string;
}

const amenityList: Amenity[] = [
  { icon: Wifi, title: "High-speed Wi-Fi" },
  { icon: CircleParking, title: "Free secure parking" },
  { icon: AirVent, title: "Air conditioning & climate control" },
  { icon: ConciergeBell, title: "24/7 front desk & concierge" },
  { icon: Sparkles, title: "Daily housekeeping" },
  { icon: Waves, title: "Swimming pool & lounge" },
  { icon: Coffee, title: "Complimentary breakfast" },
  { icon: Tv, title: "Dedicated workspaces & smart TV" },
];

/*
  Amenities sit on a full-width navy band - the only navy content section on
  the page - and close with a thick gold bar, so it reads as one finished
  block, clearly separate from the gallery that follows.
*/
export const FeaturesSection = () => {
  return (
    <Section
      id="amenities"
      tone="navy"
      aria-labelledby="amenities-title"
      className="border-b-[6px] border-brand-gold"
    >
      <div className="container">
        <SectionHeading
          tone="navy"
          align="center"
          eyebrow="Amenities"
          title={<span id="amenities-title">What this place offers</span>}
          description="Everything you need for a comfortable, relaxing, and seamless stay."
          className="mb-10 sm:mb-12"
        />

        <ul className="grid gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {amenityList.map(({ icon: AmenityIcon, title }) => (
            <li
              key={title}
              className="flex items-center gap-4 rounded-md border border-brand-gold/30 bg-brand-foreground/5 p-4 min-[360px]:flex-col min-[360px]:text-center sm:p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/15">
                <AmenityIcon aria-hidden strokeWidth={1.75} className="size-6 text-brand-gold" />
              </span>
              <span className="text-base text-brand-foreground sm:text-lg">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};
