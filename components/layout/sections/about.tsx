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
    <Section id="about" tone="light">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-last overflow-hidden rounded-lg shadow-md lg:order-first">
          <div className="relative aspect-[4/3] lg:aspect-[4/5]">
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
            title="A calm retreat by the sea"
            description="Margin Hotel brings together the ease of the coast and the care of a true luxury hotel. Every detail - from golden-hour terraces to sunlit lounges - is designed to help you slow down."
          />

          <ol className="mt-8 divide-y divide-border border-y border-border">
            {pillars.map(({ title, text }, i) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-bronze"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
};
