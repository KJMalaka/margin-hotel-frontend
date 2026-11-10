import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/brand/section";
import { RoomCard } from "@/components/rooms/room-card";
import { roomList, type Room } from "@/data/rooms";

// One card per room type - the cheapest available room of each, so the
// price shown reads as a "from" price.
const featuredRooms = Object.values(
  roomList
    .filter((room) => room.status === "AVAILABLE")
    .reduce<Partial<Record<Room["type"], Room>>>((cheapest, room) => {
      const current = cheapest[room.type];
      if (!current || room.pricePerNight < current.pricePerNight) {
        cheapest[room.type] = room;
      }
      return cheapest;
    }, {})
).filter((room): room is Room => !!room);

export const RoomsPreviewSection = () => {
  return (
    <Section id="rooms" tone="white" divider>
      <div className="container">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Rooms & suites"
            title="Rest, beautifully"
            description="From cosy rooms for solo travellers to generous family suites - each one light-filled, calm and made for slow mornings. Prices are per room, per night."
          />
          <Button asChild variant="view" className="shrink-0 self-start md:self-auto">
            <Link href="/rooms">
              View all rooms
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.map((room) => (
            <li key={room.roomId}>
              <RoomCard room={room} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};
