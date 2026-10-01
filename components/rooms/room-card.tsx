import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { ROOM_TYPE_LABELS, type Room } from "@/data/rooms";

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

interface RoomCardProps {
  room: Room;
}

// Preview card for the rooms listing page - "View Room" navigates to the
// room's own page (see app/rooms/[roomId]/page.tsx) for full details and
// booking.
export const RoomCard = ({ room }: RoomCardProps) => {
  const available = room.status === "AVAILABLE";
  const label = ROOM_TYPE_LABELS[room.type];

  return (
    <article className="group flex h-full flex-col border border-border bg-card transition-colors duration-500 hover:border-gold-light">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.imageUrl}
          alt={`${label} at Margin Hotel`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
        />
        {!available && (
          <span className="absolute top-4 right-4 bg-navy-midnight/80 px-3 py-1.5 font-heading text-[0.6rem] font-medium uppercase tracking-brand text-ivory backdrop-blur">
            Currently booked
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="eyebrow text-[0.65rem] text-ocean dark:text-gold">
          Room {room.roomNumber}
        </p>
        <h3 className="display-title mt-3 text-3xl text-navy dark:text-ivory">
          {label}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {room.description}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" strokeWidth={1.5} />
            {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
          </div>
          <p className="text-right text-navy dark:text-ivory">
            <span className="font-heading text-lg font-medium">
              {zar.format(room.pricePerNight)}
            </span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </p>
        </div>

        <Link
          href={`/rooms/${room.roomId}`}
          className="mt-6 inline-flex items-center gap-2 self-start font-heading text-[0.7rem] font-medium uppercase tracking-brand text-ocean transition-colors hover:text-navy dark:text-gold dark:hover:text-gold-light"
        >
          View room
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          <span className="sr-only">: {label}, room {room.roomNumber}</span>
        </Link>
      </div>
    </article>
  );
};
