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
    <Section id="reviews" tone="white" divider>
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Guest reviews"
          title="What our guests say"
          description="Real words from guests who have stayed with us."
          className="mb-10"
        />

        {reviews.length > 0 && (
          <ul className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map(({ name, source, rating, quote }) => (
              <li key={`${name}-${quote}`} className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden
                      className={i < rating ? "size-5 fill-bronze text-bronze" : "size-5 text-input"}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-lg">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <p className="mt-4 font-bold text-muted-foreground">
                  {name} · via {source}
                </p>
              </li>
            ))}
          </ul>
        )}

        {reviewsUrl && (
          <div className="flex justify-center">
            <Button asChild variant="secondary">
              <a href={reviewsUrl} target="_blank" rel="noopener noreferrer">
                Read all reviews
                <ExternalLink aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
};
