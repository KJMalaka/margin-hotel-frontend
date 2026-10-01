import Link from "next/link";
import { Facebook, Instagram, Star } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig, telHref } from "@/config/site";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Quick Links",
    links: [
      { label: "Rooms & Suites", href: "/rooms" },
      { label: "What We Offer", href: "/#amenities" },
      { label: "Contact Us", href: "/#contact" },
      { label: "Book a Stay", href: "/book" },
    ],
  },
  {
    title: "Hospitality & Services",
    links: [
      { label: "Dining & Breakfast", href: "/#amenities" },
      { label: "Airport Shuttle", href: "/#faq" },
      { label: "Event & Group Bookings", href: "/#contact" },
      { label: "Parking & Accessibility", href: "/#amenities" },
    ],
  },
  {
    title: "Guest Help & Policies",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Check-in & Check-out Guide", href: "/policies#check-in" },
      { label: "Cancellation & Refund Policy", href: "/policies#cancellation" },
      { label: "Terms & Privacy Policy", href: "/policies#privacy" },
    ],
  },
];

// Social links only render once a URL is set in config/site.ts.
const socialLinks = [
  { label: "Instagram", href: siteConfig.social.instagram, icon: Instagram },
  { label: "Facebook", href: siteConfig.social.facebook, icon: Facebook },
  { label: "Tripadvisor / Google Reviews", href: siteConfig.social.reviews, icon: Star },
].filter(({ href }) => href);

const headingClass = "eyebrow text-[0.65rem] text-gold mb-6";
const linkClass =
  "text-sm text-ivory/70 transition-colors duration-300 hover:text-gold";

export const FooterSection = () => {
  return (
    <footer id="footer" className="relative bg-navy-midnight text-ivory">
      <span aria-hidden className="section-rule-gold top-0 bg-gold/50" />

      <div className="container pt-20 pb-10 sm:pt-24">
        <div className="grid gap-y-14 gap-x-12 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand - clear space around the logo matches the icon height (pr-8 ~ size-8). */}
          <div className="md:col-span-2 xl:col-span-1">
            <Link href="/" aria-label="Margin Hotel home" className="inline-block py-2 pr-8">
              <Logo className="text-sm" markClassName="size-8" />
            </Link>
            <p className="mt-8 max-w-xs text-gold-light">
              Your stay, your comfort, our priority. Experience relaxed luxury
              and hospitality.
            </p>
          </div>

          {footerColumns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h3 className={headingClass}>{title}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className={headingClass}>Connect</h3>
            <ul className="space-y-3">
              {socialLinks.map(({ label, href, icon: SocialIcon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} inline-flex items-center gap-2`}
                  >
                    <SocialIcon aria-hidden strokeWidth={1.5} className="size-4" />
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href={telHref(siteConfig.phone.frontDesk)} className={linkClass}>
                  {siteConfig.phone.frontDesk}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email.enquiries}`} className={`${linkClass} break-all`}>
                  {siteConfig.email.enquiries}
                </a>
              </li>
              <li>
                <a href={siteConfig.siteUrl} className={linkClass}>
                  {siteConfig.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-gold/25 pt-8 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Margin Hotel. All rights reserved.</p>
          <p className="font-heading uppercase tracking-brand text-[0.6rem]">
            Coastal luxury · Refined hospitality
          </p>
        </div>
      </div>
    </footer>
  );
};
