import { notFound } from "next/navigation";
import Image from "next/image";
import { Users } from "lucide-react";
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

      <main className="container py-20 sm:py-28">
        <BackButton />

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden border border-border">
            <Image
              src={room.imageUrl}
              alt={`${label} at Margin Hotel`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            {!available && (
              <span className="absolute top-4 right-4 bg-navy-midnight/80 px-3 py-1.5 font-heading text-[0.6rem] font-medium uppercase tracking-brand text-ivory backdrop-blur">
                Currently booked
              </span>
            )}
          </div>

          <div>
            <SectionHeading
              as="h1"
              eyebrow={`Room ${room.roomNumber}`}
              title={label}
              description={room.description}
            />

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" strokeWidth={1.5} />
                {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
              </div>
              <p className="text-right text-navy dark:text-ivory">
                <span className="font-heading text-xl font-medium">
                  {zar.format(room.pricePerNight)}
                </span>
                <span className="text-xs text-muted-foreground"> / night</span>
              </p>
            </div>

            <div className="mt-8">
              <RoomBookingDialog room={room} />
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </>
  );
}
