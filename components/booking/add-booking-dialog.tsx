"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/booking/booking-form";
import type { BookingResponse } from "@/lib/api/booking";
import type { BookingChannel, BookingFormValues } from "@/lib/validations/booking-schema";

const STAFF_CHANNELS: { value: Extract<BookingChannel, "WALK_IN" | "TELEPHONIC">; label: string }[] = [
    { value: "WALK_IN", label: "Walk-in" },
    { value: "TELEPHONIC", label: "Telephonic" },
];

interface AddBookingDialogProps {
    /** Called after the booking is created successfully, before the dialog closes. */
    onBookingCreated?: (booking: BookingResponse, values: BookingFormValues) => void;
}

/**
 * "Add Booking" button that opens the staff booking form (walk-in/telephonic)
 * in a full-screen page-like dialog, reused
 * wherever staff need to create a booking on a guest's behalf (e.g. from
 * the payments table too).
 */
export function AddBookingDialog({ onBookingCreated }: AddBookingDialogProps) {
    const [open, setOpen] = useState(false);
    const [channel, setChannel] = useState<"WALK_IN" | "TELEPHONIC">("WALK_IN");

    function handleSuccess(booking: BookingResponse, values: BookingFormValues) {
        onBookingCreated?.(booking, values);
        setOpen(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) setChannel("WALK_IN");
            }}
        >
            <DialogTrigger asChild>
                <Button className="font-bold">Add Booking</Button>
            </DialogTrigger>

            <DialogContent
                overlayClassName="bg-background"
                closeButtonClassName="!fixed !right-4 !top-4 !z-[60] !flex !h-11 !w-11 items-center justify-center rounded-full border border-gold bg-navy text-gold opacity-100 shadow-lg hover:bg-gold hover:text-navy-midnight focus:ring-gold"
                className="!inset-0 !left-0 !top-0 !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !grid-cols-1 !gap-0 !rounded-none !border-0 !p-0 !shadow-none overflow-y-auto bg-background text-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12">
                    <div className="w-full max-w-3xl border border-gold/70 bg-background p-4 text-foreground sm:p-8">
                        <div className="mb-6 space-y-2 pr-12">
                            <h2 className="font-display text-3xl">New booking</h2>
                            <p className="text-sm text-muted-foreground">
                                Enter the guest&apos;s details and stay information.
                            </p>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            {STAFF_CHANNELS.map((c) => (
                                <Button
                                    key={c.value}
                                    type="button"
                                    variant={channel === c.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setChannel(c.value)}
                                >
                                    {c.label}
                                </Button>
                            ))}
                        </div>

                        <BookingForm
                            key={channel}
                            channel={channel}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
