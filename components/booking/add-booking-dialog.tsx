"use client";

import { useState } from "react";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
                <Button>
                    <Plus aria-hidden />
                    Add booking
                </Button>
            </DialogTrigger>

            {/* Full-screen, page-like dialog (teammate's layout). */}
            <DialogContent
                overlayClassName="bg-background"
                closeButtonClassName="fixed right-4 top-4 z-[60] rounded-full border border-input bg-card shadow-md"
                className="inset-0 left-0 top-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background p-0 shadow-none data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0"
            >
                <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12">
                    <div className="w-full max-w-3xl rounded-lg border border-border bg-card p-4 shadow-sm sm:p-8">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-3xl">New booking</DialogTitle>
                            <DialogDescription>
                                Enter the guest&apos;s details and stay information, for walk-ins or
                                phone reservations.
                            </DialogDescription>
                        </DialogHeader>

                        <div role="group" aria-label="Booking channel" className="mb-6 flex flex-wrap gap-2">
                            {STAFF_CHANNELS.map((c) => (
                                <Button
                                    key={c.value}
                                    type="button"
                                    variant={channel === c.value ? "default" : "outline"}
                                    size="sm"
                                    aria-pressed={channel === c.value}
                                    onClick={() => setChannel(c.value)}
                                >
                                    {/* Tick marks the choice without relying on colour. */}
                                    {channel === c.value && <Check aria-hidden />}
                                    {c.label}
                                </Button>
                            ))}
                        </div>

                        <BookingForm key={channel} channel={channel} onSuccess={handleSuccess} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
