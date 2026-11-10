import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/brand/section";

export const metadata: Metadata = {
  title: `Guest Policies | ${siteConfig.name}`,
  description: `Check-in, cancellation, privacy and booking terms for guests of ${siteConfig.name}.`,
};

// TODO: have the privacy and terms sections reviewed before launch - they
// are a plain-language starting point, not legal advice.
const policies = [
  {
    id: "check-in",
    title: "Check-in & check-out",
    paragraphs: [
      `Check-in starts at ${siteConfig.hours.checkIn} and check-out is by ${siteConfig.hours.checkOut}. Our front desk is open 24/7, so late arrivals are always welcome.`,
      "Please bring a valid ID or passport and the card used for your booking. Early check-in and late check-out can be arranged based on availability - just ask the front desk.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation & refunds",
    paragraphs: [
      "Free cancellation is available up to 48 hours prior to your scheduled check-in date. Late cancellations and no-shows may incur a one-night fee.",
      "Refunds for eligible cancellations are returned to the original payment method.",
    ],
  },
  {
    id: "pets",
    title: "Pets & service animals",
    paragraphs: [
      "We allow service animals and select pet-friendly rooms upon prior request. Please contact our team before booking so we can prepare a suitable room.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    paragraphs: [
      "We collect only the personal information needed to manage your booking and stay - such as your name, contact details and payment information - and process it in line with the Protection of Personal Information Act (POPIA).",
      "Your information is never sold. It is shared only with service providers who help us run your booking (for example, payment processors), and you may ask us to access, correct or delete your data at any time.",
    ],
  },
  {
    id: "terms",
    title: "Terms of booking",
    paragraphs: [
      "By making a booking you confirm that the details provided are accurate and that you are at least 18 years old. Rates are quoted per room per night in South African Rand (ZAR).",
      "Guests are responsible for any damage to hotel property during their stay. Margin Hotel is a non-smoking property.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="container max-w-3xl section-y">
        <SectionHeading
          as="h1"
          eyebrow="Guest help"
          title="Guest policies"
          description={
            <>
              Everything you need to know before your stay. Still have
              questions?{" "}
              <Link href="/#contact" className="font-bold text-primary underline underline-offset-4 hover:no-underline">
                Contact our team
              </Link>
              .
            </>
          }
          className="mb-10"
        />

        <nav aria-label="On this page" className="mb-10 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-2 text-lg">On this page</h2>
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {policies.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-tap items-center font-bold text-primary underline underline-offset-4 hover:no-underline"
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {policies.map(({ id, title, paragraphs }) => (
            <section key={id} id={id} aria-labelledby={`${id}-title`}>
              <h2 id={`${id}-title`} className="mb-3 text-3xl">{title}</h2>
              <div className="measure space-y-3 text-lg">
                {paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
