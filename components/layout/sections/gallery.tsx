import { Section, SectionHeading } from "@/components/brand/section";
import { GalleryGrid } from "@/components/layout/sections/gallery-grid";
import { brandImages } from "@/config/images";

export const GallerySection = () => {
  return (
    <Section id="gallery" tone="light">
      <div className="container">
        <SectionHeading
          eyebrow="Gallery"
          title="Golden hour, every day"
          description="A closer look at the spaces waiting for you - from sunlit lounges to the pool deck at dusk. Select a photo to see it larger."
          className="mb-10"
        />
        <GalleryGrid images={brandImages.gallery} />
      </div>
    </Section>
  );
};
