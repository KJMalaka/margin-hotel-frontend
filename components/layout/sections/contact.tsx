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
import { Alert } from "@/components/ui/alert";
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
    title: "Front desk hours",
    lines: [
      { text: "24/7 front desk assistance" },
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
    <Section id="contact" tone="light" divider>
      <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Contact us"
            title="Get in touch"
            description="Have questions about your stay, special reservations, or event bookings? Reach out to our team."
          />

          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {contactDetails.map(({ icon: DetailIcon, title, lines }) => (
              <li key={title} className="flex gap-3">
                <DetailIcon
                  aria-hidden
                  className="mt-0.5 size-6 shrink-0 text-bronze"
                />
                <div className="min-w-0">
                  <h3 className="text-lg">{title}</h3>
                  <ul>
                    {lines.map(({ text, href }) => (
                      <li key={text} className="mt-1 break-words text-muted-foreground">
                        {href ? (
                          <a
                            href={href}
                            className="inline-flex min-h-tap items-center font-bold text-primary underline underline-offset-4 hover:no-underline"
                          >
                            {text}
                          </a>
                        ) : (
                          text
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <iframe
              title={`Map showing ${siteConfig.name} at ${fullAddress}`}
              src={mapSrc}
              className="block h-64 w-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
          <h3 className="text-3xl">Send us a message</h3>
          <p className="mt-2 text-muted-foreground">
            We will get back to you as soon as possible. All fields are required.
          </p>
          <div aria-hidden className="my-6 h-1 w-12 rounded-full bg-bronze" />

          {submitState.status === "sent" ? (
            <div role="status" className="flex flex-col items-start gap-4 py-4">
              <CheckCircle2 aria-hidden className="size-10 text-success" />
              <p className="text-2xl font-bold">Message sent - thank you</p>
              <p className="text-muted-foreground">
                Your message is on its way. Our team will reply to your email
                shortly.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSubmitState({ status: "idle" })}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pitso"
                            autoComplete="given-name"
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
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mosimane"
                            autoComplete="family-name"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="pitsomosimane@example.com"
                          autoComplete="email"
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
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Tell us about your stay, dates, or special requests..."
                          className="resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitState.status === "error" && (
                  <Alert variant="danger" title="We couldn't send your message right now">
                    <a
                      href={submitState.mailto}
                      className="font-bold text-primary underline underline-offset-4 hover:no-underline"
                    >
                      Send it by email instead
                    </a>{" "}
                    or call us on{" "}
                    <a
                      href={telHref(siteConfig.phone.frontDesk)}
                      className="font-bold text-primary underline underline-offset-4 hover:no-underline"
                    >
                      {siteConfig.phone.frontDesk}
                    </a>
                    .
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto sm:justify-self-start"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 aria-hidden className="motion-safe:animate-spin" />
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
