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
    title: "Quick links",
    links: [
      { label: "Rooms & Suites", href: "/rooms" },
      { label: "What we offer", href: "/#amenities" },
      { label: "Contact us", href: "/#contact" },
      { label: "Book a stay", href: "/book" },
    ],
  },
  {
    title: "Hospitality & services",
    links: [
      { label: "Dining & breakfast", href: "/#amenities" },
      { label: "Airport shuttle", href: "/#faq" },
      { label: "Event & group bookings", href: "/#contact" },
      { label: "Parking & accessibility", href: "/#amenities" },
    ],
  },
  {
    title: "Guest help & policies",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Check-in & check-out guide", href: "/policies#check-in" },
      { label: "Cancellation & refund policy", href: "/policies#cancellation" },
      { label: "Terms & privacy policy", href: "/policies#privacy" },
    ],
  },
];

// Social links only render once a URL is set in config/site.ts.
const socialLinks = [
  { label: "Instagram", href: siteConfig.social.instagram, icon: Instagram },
  { label: "Facebook", href: siteConfig.social.facebook, icon: Facebook },
  { label: "Tripadvisor / Google Reviews", href: siteConfig.social.reviews, icon: Star },
].filter(({ href }) => href);

const headingClass = "mb-3 text-lg font-bold text-brand-gold";
const linkClass =
  "inline-flex min-h-tap items-center gap-2 text-brand-foreground underline-offset-4 hover:text-brand-gold hover:underline";

export const FooterSection = () => {
  return (
    <footer id="footer" className="surface-brand relative border-t-4 border-brand-gold">

      <div className="container pb-8 pt-12 sm:pt-16">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand - clear space around the logo matches the icon height (pr-8 ~ size-8). */}
          <div className="sm:col-span-2 xl:col-span-1">
            <Link href="/" aria-label="Margin Hotel home" className="inline-flex min-h-tap items-center rounded-md">
              <Logo className="text-base" markClassName="size-8" />
            </Link>
            <p className="mt-4 max-w-xs text-brand-foreground/90">
              Your stay, your comfort, our priority. Experience relaxed luxury
              and hospitality.
            </p>
          </div>

          {footerColumns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className={headingClass}>{title}</h2>
              <ul>
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
            <h2 className={headingClass}>Connect</h2>
            <ul>
              {socialLinks.map(({ label, href, icon: SocialIcon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <SocialIcon aria-hidden className="size-5" />
                    {label}
                    <span className="sr-only">(opens in a new tab)</span>
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

        <div className="mt-10 flex flex-col gap-2 border-t border-brand-gold/30 pt-6 text-brand-foreground/90 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Margin Hotel. All rights reserved.</p>
          <p>Coastal luxury · Refined hospitality</p>
        </div>
      </div>
    </footer>
  );
};
