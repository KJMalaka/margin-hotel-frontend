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

      {/* Full-screen, page-like dialog so the multi-step checkout has room. */}
      <DialogContent
        overlayClassName="bg-background"
        closeButtonClassName="fixed right-4 top-4 z-[60] rounded-full border border-input bg-card shadow-md"
        className="inset-0 left-0 top-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background p-0 shadow-none data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0"
      >
        <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12">
          <div className="w-full min-w-0 max-w-5xl rounded-lg border border-border bg-card p-4 shadow-sm sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">
                Reserve room {room.roomNumber} · {ROOM_TYPE_LABELS[room.type]}
              </DialogTitle>
            </DialogHeader>

            <BookingForm channel="ONLINE" fixedRoom={room} compact />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
