import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarX, Users } from "lucide-react";
import { ROOM_TYPE_LABELS, type Room } from "@/data/rooms";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

interface RoomCardProps {
  room: Room;
}

// Preview card for the rooms listing page - "View room" navigates to the
// room's own page (see app/rooms/[roomId]/page.tsx) for full details and
// booking.
export const RoomCard = ({ room }: RoomCardProps) => {
  const available = room.status === "AVAILABLE";
  const label = ROOM_TYPE_LABELS[room.type];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={room.imageUrl}
          alt={`${label} at Margin Hotel`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {!available && (
          <Badge variant="warning" className="absolute right-3 top-3 shadow-sm">
            <CalendarX aria-hidden />
            Currently booked
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-bold text-bronze">Room {room.roomNumber}</p>
        <h3 className="mt-1 text-2xl">{label}</h3>

        <p className="mt-2 line-clamp-3 text-muted-foreground">
          {room.description}
        </p>

        <dl className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
          <div className="text-muted-foreground">
            <dt className="sr-only">Sleeps</dt>
            <dd className="flex items-center gap-2">
              <Users aria-hidden className="size-5" />
              {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
            </dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Price</dt>
            <dd>
              <span className="text-xl font-bold">{zar.format(room.pricePerNight)}</span>
              <span className="text-muted-foreground"> per night</span>
            </dd>
          </div>
        </dl>

        <Link
          href={`/rooms/${room.roomId}`}
          className={cn(buttonVariants({ variant: "view" }), "mt-5 w-full sm:w-auto sm:self-start")}
        >
          View room
          <ArrowRight aria-hidden />
          <span className="sr-only">: {label}, room {room.roomNumber}</span>
        </Link>
      </div>
    </article>
  );
};
