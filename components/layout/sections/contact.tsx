"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading } from "@/components/brand/section";
import { createEnquiry } from "@/lib/api/enquiry";
import { fullAddress, siteConfig, telHref } from "@/config/site";

const formSchema = z.object({
  firstName: z.string().trim().min(2, "Please enter your first name").max(255),
  lastName: z.string().trim().min(2, "Please enter your last name").max(255),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2).max(255),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters)")
    .max(2000),
});

type ContactFormValues = z.infer<typeof formSchema>;

const subjectOptions = [
  "Room Reservation & Availability",
  "Group / Event Booking",
  "Check-in / Check-out Inquiries",
  "Special Accommodations & Requests",
  "General Inquiries",
];

const defaultValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  subject: subjectOptions[0],
  message: "",
};

interface ContactDetail {
  icon: LucideIcon;
  title: string;
  lines: { text: string; href?: string }[];
}

const contactDetails: ContactDetail[] = [
  {
    icon: MapPin,
    title: "Location",
    lines: [
      { text: siteConfig.address.street },
      { text: siteConfig.address.city },
      { text: siteConfig.address.directions },
    ],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: [
      {
        text: `Front desk & reservations: ${siteConfig.phone.frontDesk}`,
        href: telHref(siteConfig.phone.frontDesk),
      },
    ],
  },
  {
    icon: Mail,
    title: "Email",
    lines: [
      {
        text: siteConfig.email.reservations,
        href: `mailto:${siteConfig.email.reservations}`,
      },
      {
        text: siteConfig.email.enquiries,
        href: `mailto:${siteConfig.email.enquiries}`,
      },
    ],
  },
  {
    icon: Clock,
    title: "Front Desk Hours",
    lines: [
      { text: "24/7 Front Desk Assistance" },
      { text: `Check-in from ${siteConfig.hours.checkIn}` },
      { text: `Check-out by ${siteConfig.hours.checkOut}` },
    ],
  },
  {
    icon: Globe,
    title: "Website",
    lines: [{ text: siteConfig.website, href: siteConfig.siteUrl }],
  },
];

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  fullAddress
)}&z=15&output=embed`;

function buildMailto({
  firstName,
  lastName,
  email,
  subject,
  message,
}: ContactFormValues) {
  const body = `Hello, I am ${firstName} ${lastName}, my email is ${email}.\n\n${message}`;
  return `mailto:${siteConfig.email.enquiries}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

type SubmitState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; mailto: string };

// Minimal underlined fields, echoing the booking panel.
const fieldClass =
  "rounded-none border-0 border-b border-input bg-transparent px-0 text-base shadow-none placeholder:text-muted-foreground/55 focus-visible:border-b-2 focus-visible:border-ocean focus-visible:ring-0 focus-visible:ring-offset-0 dark:focus-visible:border-gold";
const labelClass = "eyebrow text-[0.65rem] text-navy dark:text-gold";

export const ContactSection = () => {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: ContactFormValues) {
    try {
      await createEnquiry(values);
      form.reset(defaultValues);
      setSubmitState({ status: "sent" });
    } catch {
      // Enquiry endpoint unreachable - keep the guest's input and offer
      // their email app as a fallback instead of failing silently.
      setSubmitState({ status: "error", mailto: buildMailto(values) });
    }
  }

  return (
    <Section id="contact" tone="light" rules="top">
      <div className="container grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <SectionHeading
            eyebrow="Contact Us"
            title="Get in touch"
            description="Have questions about your stay, special reservations, or event bookings? Reach out to our team."
          />

          <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {contactDetails.map(({ icon: DetailIcon, title, lines }) => (
              <div key={title} className="flex gap-4">
                <DetailIcon
                  aria-hidden
                  strokeWidth={1.25}
                  className="mt-0.5 size-5 shrink-0 text-ocean dark:text-gold"
                />
                <div className="min-w-0">
                  <dt className="font-heading text-[0.7rem] font-semibold uppercase tracking-brand text-navy dark:text-ivory">
                    {title}
                  </dt>
                  {lines.map(({ text, href }) => (
                    <dd key={text} className="mt-1 break-words text-sm text-muted-foreground">
                      {href ? (
                        <a
                          href={href}
                          className="transition-colors hover:text-ocean dark:hover:text-gold"
                        >
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </dd>
                  ))}
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-12 overflow-hidden border border-border">
            <iframe
              title={`Map showing ${siteConfig.name} at ${fullAddress}`}
              src={mapSrc}
              className="block h-64 w-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="h-fit border border-border bg-card p-8 sm:p-10">
          <h3 className="display-title text-4xl text-navy dark:text-ivory">
            Send us a message
          </h3>
          <p className="mt-3 text-muted-foreground">
            We will get back to you as soon as possible.
          </p>
          <div aria-hidden className="my-8 h-px w-16 bg-gold" />

          {submitState.status === "sent" ? (
            <div role="status" className="flex flex-col items-start gap-4 py-6">
              <CheckCircle2 strokeWidth={1.25} className="size-10 text-ocean dark:text-gold" />
              <p className="display-title text-3xl text-navy dark:text-ivory">
                Thank you
              </p>
              <p className="text-muted-foreground">
                Your message is on its way. Our team will reply to your email
                shortly.
              </p>
              <Button
                variant="navyOutline"
                size="brand"
                onClick={() => setSubmitState({ status: "idle" })}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-7">
                <div className="grid gap-7 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pitso"
                            autoComplete="given-name"
                            className={fieldClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mosimane"
                            autoComplete="family-name"
                            className={fieldClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="pitsomosimane@example.com"
                          autoComplete="email"
                          className={fieldClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className={`${fieldClass} focus:border-b-2 focus:border-ocean focus:ring-0 focus:ring-offset-0 dark:focus:border-gold`}
                          >
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Tell us about your stay, dates, or special requests..."
                          className={`${fieldClass} resize-none`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitState.status === "error" && (
                  <div
                    role="alert"
                    className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm"
                  >
                    We couldn&apos;t send your message right now.{" "}
                    <a
                      href={submitState.mailto}
                      className="font-semibold text-ocean underline underline-offset-2 dark:text-gold"
                    >
                      Send it by email instead
                    </a>{" "}
                    or call us on{" "}
                    <a
                      href={telHref(siteConfig.phone.frontDesk)}
                      className="font-semibold text-ocean underline underline-offset-2 dark:text-gold"
                    >
                      {siteConfig.phone.frontDesk}
                    </a>
                    .
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gold"
                  size="brand"
                  className="justify-self-start"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Send message
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Section>
  );
};
