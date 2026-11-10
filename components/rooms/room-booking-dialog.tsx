"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/booking/booking-form";
import { ROOM_TYPE_LABELS, type Room } from "@/data/rooms";

interface RoomBookingDialogProps {
  room: Room;
}

// "Book Room" opens a focused overlay containing just the booking form,
// pinned to this room (no room picker) - reuses the same BookingForm used
// on /book and the staff admin portal. Room details stay on the page
// behind it; nothing is duplicated inside the dialog.
export const RoomBookingDialog = ({ room }: RoomBookingDialogProps) => {
  if (room.status !== "AVAILABLE") {
    return (
      <div>
        <Button disabled size="lg" aria-describedby="room-unavailable">
          Book this room
        </Button>
        <p id="room-unavailable" className="mt-2 text-muted-foreground">
          This room is currently unavailable. Please check back later or
          browse our other rooms.
        </p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">Book this room</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Reserve room {room.roomNumber} · {ROOM_TYPE_LABELS[room.type]}
          </DialogTitle>
        </DialogHeader>

        <BookingForm channel="ONLINE" fixedRoom={room} compact />
      </DialogContent>
    </Dialog>
  );
};
