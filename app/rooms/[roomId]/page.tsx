import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { BackButton } from "@/components/layout/back-button";
import { SectionHeading } from "@/components/brand/section";
import { RoomBookingDialog } from "@/components/rooms/room-booking-dialog";
import { getRoomById, roomList, ROOM_TYPE_LABELS } from "@/data/rooms";

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

interface RoomPageProps {
  params: { roomId: string };
}

export function generateStaticParams() {
  return roomList.map((room) => ({ roomId: room.roomId }));
}

export function generateMetadata({ params }: RoomPageProps) {
  const room = getRoomById(params.roomId);

  return {
    title: room
      ? `${ROOM_TYPE_LABELS[room.type]} | Margin Hotel`
      : "Room not found",
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const room = getRoomById(params.roomId);

  if (!room) {
    notFound();
  }

  const available = room.status === "AVAILABLE";
  const label = ROOM_TYPE_LABELS[room.type];

  return (
    <>
      <Navbar />

      <main id="main" className="container py-8 sm:py-12">
        <BackButton />

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted shadow-md">
            <Image
              src={room.imageUrl}
              alt={`${label} at Margin Hotel`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            {!available && (
              <Badge variant="warning" className="absolute right-3 top-3 shadow-sm">
                <CalendarX aria-hidden />
                Currently booked
              </Badge>
            )}
          </div>

          <div>
            <SectionHeading
              as="h1"
              eyebrow={`Room ${room.roomNumber}`}
              title={label}
              description={room.description}
            />

            <dl className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-border py-4">
              <div className="text-muted-foreground">
                <dt className="sr-only">Sleeps</dt>
                <dd className="flex items-center gap-2 text-lg">
                  <Users aria-hidden className="size-5" />
                  {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
                </dd>
              </div>
              <div className="text-right">
                <dt className="sr-only">Price</dt>
                <dd>
                  <span className="text-2xl font-bold">
                    {zar.format(room.pricePerNight)}
                  </span>
                  <span className="text-muted-foreground"> per night</span>
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <RoomBookingDialog room={room} />
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
