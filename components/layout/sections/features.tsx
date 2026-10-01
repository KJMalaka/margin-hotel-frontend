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
  { icon: CircleParking, title: "Free Secure Parking" },
  { icon: AirVent, title: "Air Conditioning & Climate Control" },
  { icon: ConciergeBell, title: "24/7 Front Desk & Concierge" },
  { icon: Sparkles, title: "Daily Housekeeping" },
  { icon: Waves, title: "Swimming Pool & Lounge" },
  { icon: Coffee, title: "Complimentary Breakfast" },
  { icon: Tv, title: "Dedicated Workspaces & Smart TV" },
];

export const FeaturesSection = () => {
  return (
    <Section id="amenities" tone="navy">
      <div className="container">
        <SectionHeading
          tone="navy"
          align="center"
          eyebrow="Amenities"
          title="What this place offers"
          description="Everything you need for a comfortable, relaxing, and seamless stay."
          className="mb-16"
        />

        {/* Hairline grid: 1px gaps over a gold-tinted backdrop draw the dividers. */}
        <ul className="grid grid-cols-2 gap-px border border-gold/25 bg-gold/25 lg:grid-cols-4">
          {amenityList.map(({ icon: AmenityIcon, title }) => (
            <li
              key={title}
              className="group flex flex-col items-center gap-5 bg-navy px-4 py-10 text-center transition-colors duration-500 hover:bg-[#15496f] sm:px-6"
            >
              <AmenityIcon
                aria-hidden
                strokeWidth={1.25}
                className="size-8 text-gold transition-transform duration-500 motion-safe:group-hover:-translate-y-0.5"
              />
              <span className="text-sm leading-snug text-ivory/90 sm:text-base">
                {title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};
