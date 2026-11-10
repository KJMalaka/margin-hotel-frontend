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
        <Button disabled className="font-bold">
          Book Room
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          This room is currently unavailable. Please check back later or
          browse our other rooms.
        </p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-bold">Book Room</Button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-background"
        closeButtonClassName="!fixed !right-4 !top-4 !z-[60] !flex !h-11 !w-11 items-center justify-center rounded-full border border-gold bg-navy text-gold opacity-100 shadow-lg hover:bg-gold hover:text-navy-midnight focus:ring-gold"
        className="!inset-0 !left-0 !top-0 !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !grid-cols-1 !gap-0 !rounded-none !border-0 !p-0 !shadow-none overflow-y-auto bg-background text-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12 sm:pt-20">
          <div className="w-full min-w-0 max-w-5xl border border-gold/70 bg-background p-4 text-foreground sm:p-8">
            <DialogHeader className="mb-6 pr-8">
              <DialogTitle className="font-display text-2xl">
                Reserve Room {room.roomNumber} · {ROOM_TYPE_LABELS[room.type]}
              </DialogTitle>
            </DialogHeader>

            <BookingForm channel="ONLINE" fixedRoom={room} compact />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
