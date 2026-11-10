import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { SectionHeading } from "@/components/brand/section";
import { RoomCard } from "@/components/rooms/room-card";
import { roomList } from "@/data/rooms";

export const metadata = {
  title: "Our Rooms | Margin Hotel",
  description:
    "Browse every room and suite at Margin Hotel and view full details before you book.",
};

export default function RoomsPage() {
  return (
    <>
      <Navbar />

      <main id="main" className="container section-y">
        <SectionHeading
          as="h1"
          eyebrow="Rooms & suites"
          title="Find your perfect stay"
          description="From cosy rooms for solo travellers to generous family suites - each one light-filled, calm and made for slow mornings. Prices are per room, per night."
          className="mb-10"
        />

        <h2 className="sr-only">All rooms</h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomList.map((room) => (
            <li key={room.roomId}>
              <RoomCard room={room} />
            </li>
          ))}
        </ul>
      </main>

      <FooterSection />
    </>
  );
}
