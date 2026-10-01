import { notFound } from "next/navigation";
import Image from "next/image";
import { Users } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { BackButton } from "@/components/layout/back-button";
import { RoomBookingDialog } from "@/components/rooms/room-booking-dialog";
import { Separator } from "@/components/ui/separator";
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
    title: room ? `${ROOM_TYPE_LABELS[room.type]} · Margin Hotel` : "Room not found",
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const room = getRoomById(params.roomId);

  if (!room) {
    notFound();
  }

  const available = room.status === "AVAILABLE";

  return (
    <>
      <Navbar />

      <main className="container py-12 sm:py-20">
        <BackButton />

        <div className="grid gap-10 lg:grid-cols-2 mt-4">
          <div className="relative overflow-hidden border border-border">
            <Image
              src={room.imageUrl}
              alt={`${ROOM_TYPE_LABELS[room.type]} room`}
              width={900}
              height={700}
              className="w-full h-[320px] sm:h-[420px] lg:h-full object-cover"
              priority
            />
            {!available && (
              <span className="absolute top-4 right-4 bg-navy-midnight/80 px-3 py-1.5 font-heading text-[0.6rem] font-medium uppercase tracking-brand text-ivory backdrop-blur">
                Currently booked
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className="eyebrow text-ocean dark:text-gold">Room {room.roomNumber}</span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" strokeWidth={1.5} />
                {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
              </span>
            </div>

            <h1 className="display-title text-5xl md:text-6xl text-navy dark:text-ivory">
              {ROOM_TYPE_LABELS[room.type]}
            </h1>

            <div className="font-heading text-2xl font-medium mt-5 text-navy dark:text-ivory">
              {zar.format(room.pricePerNight)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / night
              </span>
            </div>

            <p className="text-lg text-muted-foreground mt-6">{room.description}</p>

            <Separator className="my-6" />

            <RoomBookingDialog room={room} />
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
