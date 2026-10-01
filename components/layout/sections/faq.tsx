import Link from "next/link";
import { Section, SectionHeading } from "@/components/brand/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What are the check-in and check-out times?",
    answer:
      "Check-in starts at 2:00 PM, and check-out is until 11:00 AM. Early check-in and late check-out can be arranged based on availability.",
    value: "item-1",
  },
  {
    question: "Is breakfast included in my stay?",
    answer:
      "Yes, complimentary buffet breakfast is served daily for all registered guests from 6:30 AM to 10:30 AM.",
    value: "item-2",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "Free cancellation is available up to 48 hours prior to your scheduled check-in date. Late cancellations may incur a one-night fee.",
    value: "item-3",
  },
  {
    question: "Is parking available on site?",
    answer:
      "Yes, we provide complimentary secure on-site parking for all our staying guests.",
    value: "item-4",
  },
  {
    question: "Do you accommodate airport transfers or shuttle services?",
    answer:
      "Yes, airport pick-up and drop-off can be arranged upon request. Please contact our front desk at least 24 hours in advance.",
    value: "item-5",
  },
  {
    question: "Are pets allowed at Margin Hotel?",
    answer:
      "We allow service animals and select pet-friendly rooms upon prior request. Please contact our team before booking.",
    value: "item-6",
  },
];

export const FAQSection = () => {
  return (
    <Section id="faq" tone="white" rules="top">
      <div className="container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <SectionHeading
          eyebrow="Guest Help"
          title="Frequently asked questions"
          description={
            <>
              Everything you need to know before you arrive. For anything else,
              see our{" "}
              <Link href="/policies" className="text-ocean underline underline-offset-4 hover:text-navy dark:text-gold">
                guest policies
              </Link>{" "}
              or contact the front desk.
            </>
          }
        />

        <Accordion type="single" collapsible className="border-t border-border">
          {FAQList.map(({ question, answer, value }) => (
            <AccordionItem key={value} value={value} className="my-0 rounded-none border-0 border-b border-border bg-transparent px-0 dark:bg-transparent">
              <AccordionTrigger className="py-6 text-left font-heading text-sm font-medium tracking-wide text-navy hover:no-underline hover:text-ocean dark:text-ivory dark:hover:text-gold [&>svg]:text-gold-deep">
                {question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};
