import Image from "next/image";
import { Section, SectionHeading } from "@/components/brand/section";
import { brandImages } from "@/config/images";
import { cn } from "@/lib/utils";

// Desktop layout (4 columns): one large feature image, then a mix of single
// and double-width tiles that fill three rows exactly.
const tileClasses = [
  "col-span-2 h-72 sm:h-96 lg:h-auto lg:row-span-2",
  "",
  "",
  "lg:col-span-2",
  "lg:col-span-2",
  "col-span-2",
];

export const GallerySection = () => {
  return (
    <Section id="gallery" tone="light" rules="none">
      <div className="container">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Gallery"
            title="Golden hour, every day"
            description="A closer look at the spaces waiting for you - from sunlit lounges to the pool deck at dusk."
          />
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:auto-rows-[15rem]">
          {brandImages.gallery.map(({ src, alt, label }, i) => (
            <li
              key={label}
              className={cn(
                "group relative h-44 overflow-hidden sm:h-56 lg:h-auto",
                tileClasses[i]
              )}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-1000 ease-out motion-safe:group-hover:scale-[1.04]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-midnight/70 via-navy-midnight/0 to-transparent" />
              <span className="absolute bottom-4 left-4 flex items-center gap-3 font-heading text-[0.65rem] font-medium uppercase tracking-brand text-white">
                <span aria-hidden className="h-px w-6 bg-gold" />
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};
