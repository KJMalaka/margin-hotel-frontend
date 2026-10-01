// Placeholder photography (Unsplash), chosen to match the brand guide's
// imagery: warm golden-hour light, beachfront palms, sunlit cream lounges and
// large windows. Swap for the hotel's own photography when available.
const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const brandImages = {
  hero: {
    src: unsplash("1596436889106-be35e843f974", 1800),
    alt: "Palm-lined pool and loungers at Margin Hotel at dusk",
  },
  about: {
    src: unsplash("1600210492486-724fe5c67fb0", 1400),
    alt: "Sunlit lounge with cream upholstery and tall windows",
  },
  booking: {
    src: unsplash("1507525428034-b723cf961d3e", 1800),
    alt: "Golden sunset over the beach in front of the hotel",
  },
  gallery: [
    {
      src: unsplash("1551882547-ff40c63fe5fa", 1400),
      alt: "Hotel exterior framed by palm trees at golden hour",
      label: "The Hotel",
    },
    {
      src: unsplash("1566073771259-6a8506099945", 1000),
      alt: "Pool deck with cream loungers in warm evening light",
      label: "Pool Deck",
    },
    {
      src: unsplash("1602002418082-a4443e081dd1", 1000),
      alt: "Lounge with floor-to-ceiling windows facing the ocean",
      label: "Ocean Lounge",
    },
    {
      src: unsplash("1615880484746-a134be9a6ecf", 1000),
      alt: "Private balcony overlooking the gardens at sunset",
      label: "Balcony Views",
    },
    {
      src: unsplash("1582719508461-905c673771fd", 1000),
      alt: "Sun loungers on a timber deck beside the sea",
      label: "Beach Deck",
    },
    {
      src: unsplash("1578683010236-d716f9a3f461", 1400),
      alt: "Suite bedroom with large windows and soft natural light",
      label: "Suites",
    },
  ],
};
