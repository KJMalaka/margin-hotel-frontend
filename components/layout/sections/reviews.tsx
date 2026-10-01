import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/brand/section";
import { siteConfig } from "@/config/site";

interface Review {
  name: string;
  /** e.g. "Google", "Tripadvisor" - where the review was left. */
  source: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

// TODO: add real guest reviews here (copied with permission from Google /
// Tripadvisor). Never add made-up reviews - the section stays hidden until
// there is at least one real review or a review URL in config/site.ts.
const reviews: Review[] = [];

export const ReviewsSection = () => {
  const reviewsUrl = siteConfig.social.reviews;
  if (reviews.length === 0 && !reviewsUrl) return null;

  return (
    <Section id="reviews" tone="white" rules="top">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Guest Reviews"
          title="What our guests say"
          description="Real words from guests who have stayed with us."
          className="mb-16"
        />

        {reviews.length > 0 && (
          <ul className="mb-12 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {reviews.map(({ name, source, rating, quote }) => (
              <li key={`${name}-${quote}`} className="flex flex-col bg-card p-8">
                <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      strokeWidth={1.25}
                      className={i < rating ? "size-4 fill-gold text-gold-deep" : "size-4 text-border"}
                    />
                  ))}
                </div>
                <blockquote className="display-title mt-6 flex-1 text-2xl text-navy dark:text-ivory">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <p className="mt-6 font-heading text-[0.65rem] font-medium uppercase tracking-brand text-muted-foreground">
                  {name} · via {source}
                </p>
              </li>
            ))}
          </ul>
        )}

        {reviewsUrl && (
          <div className="flex justify-center">
            <Button asChild variant="navyOutline" size="brand">
              <a href={reviewsUrl} target="_blank" rel="noopener noreferrer">
                Read all reviews
                <ExternalLink className="ml-2 size-3.5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
};
