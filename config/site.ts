// Single source of truth for hotel contact details, links and SEO metadata.
// Phone, email and website come from the Margin Hotel brand guide.
// TODO: the street address and social URLs are placeholders - replace them
// with the hotel's real details before launch.
export const siteConfig = {
  name: "Margin Hotel",
  tagline: "Your stay, your comfort, our priority.",
  description:
    "Margin Hotel is a coastal luxury hotel where calm, golden-hour living meets refined hospitality. Book beachfront rooms and suites, dining and more.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.marginhotel.com",
  website: "www.marginhotel.com",
  ogImage:
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&h=630&q=80",

  address: {
    street: "Beach Road, Sea Point",
    city: "Cape Town, 8005",
    directions: "On the Atlantic Seaboard promenade, 25 min from Cape Town International Airport",
  },
  phone: {
    frontDesk: "123-456-7890",
    reservations: "123-456-7890",
  },
  email: {
    reservations: "reservations@marginhotel.com",
    enquiries: "enquiries@marginhotel.com",
  },
  hours: {
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
  },

  // Leave a URL empty ("") to hide that link until the real one exists.
  social: {
    instagram: "",
    facebook: "",
    reviews: "",
  },
};

export const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.city}`;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
