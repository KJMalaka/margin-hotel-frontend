import Image from "next/image";
import { Section, SectionHeading } from "@/components/brand/section";
import { brandImages } from "@/config/images";

const pillars = [
  {
    title: "On the shoreline",
    text: "Wake to the sound of the ocean, with the beach promenade just steps from the lobby.",
  },
  {
    title: "Refined hospitality",
    text: "A 24/7 front desk and concierge team who know every guest by name.",
  },
  {
    title: "Quiet comfort",
    text: "Light-filled rooms, soft linens and calm interiors designed for rest.",
  },
];

export const AboutSection = () => {
  return (
    <Section id="about" tone="light" rules="top">
      <div className="container grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative order-last lg:order-first">
          {/* Offset gold frame - a quiet nod to the brand's thin gold lines. */}
          <div aria-hidden className="absolute -bottom-4 -left-4 h-full w-full border border-gold-light sm:-bottom-6 sm:-left-6" />
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={brandImages.about.src}
              alt={brandImages.about.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="About Margin"
            title={
              <>
                A calm retreat
                <br />
                by the sea
              </>
            }
            description="Margin Hotel brings together the ease of the coast and the care of a true luxury hotel. Every detail - from golden-hour terraces to sunlit lounges - is designed to help you slow down."
          />

          <ul className="mt-12 divide-y divide-border border-y border-border">
            {pillars.map(({ title, text }, i) => (
              <li key={title} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
                <span className="display-title text-3xl text-gold-deep" aria-hidden>
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-brand text-navy dark:text-ivory">
                    {title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};
