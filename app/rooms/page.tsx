import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { SectionHeading } from "@/components/brand/section";
import { RoomCard } from "@/components/rooms/room-card";
import { roomList } from "@/data/rooms";

export const metadata = {
  title: "Our Rooms · Margin Hotel",
  description:
    "Browse available rooms at Margin Hotel and view full details before you book.",
};

export default function RoomsPage() {
  return (
    <>
      <Navbar />

      <main className="container py-20 sm:py-28">
        <SectionHeading
          as="h1"
          eyebrow="Rooms & Suites"
          title="Find your perfect stay"
          description="Browse our rooms and view full details before you book."
          className="mb-14"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {roomList.map((room) => (
            <RoomCard key={room.roomId} room={room} />
          ))}
        </div>
      </main>
      <FooterSection />
    </>
  );
}
