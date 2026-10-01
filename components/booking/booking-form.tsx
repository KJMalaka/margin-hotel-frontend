"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { BookingResponse } from "@/lib/api/booking";
import {
    bookingFormDefaultValues,
    bookingFormSchema,
    type BookingChannel,
    type BookingFormValues,
} from "@/lib/validations/booking-schema";
import { ROOM_TYPE_LABELS, roomList, type Room } from "@/data/rooms";

export interface BookingFormProps {
    /** Fixed booking channel for this instance of the form. */
    channel: BookingChannel;
    /** Called after the booking is created successfully. */
    onSuccess?: (booking: BookingResponse, values: BookingFormValues) => void;
    /** Hide the section titles when embedding inside another card/dialog. */
    compact?: boolean;
    /**
     * Pin the booking to a specific room instead of showing the room picker
     * - used when the form is opened from that room's own page/dialog.
     */
    fixedRoom?: Room;
    /**
     * Pre-fill the stay from the home page search bar (/book?checkIn=...).
     * `guests` narrows the room picker to rooms that fit the party.
     */
    initialStay?: {
        checkInDate?: string;
        checkOutDate?: string;
        guests?: number;
    };
}

/**
 * Guest details + room + stay dates. Eventually submitted to
 * POST /booking/create (see lib/api/booking.ts) - there's no live backend
 * for Room/Booking yet, so submitting here just mocks a response locally.
 * Swap `onSubmit` below for `createBooking(...)` once that endpoint exists.
 *
 * This is the one form used everywhere a booking is created:
 *  - guest-facing site -> <BookingForm channel="ONLINE" />
 *  - staff admin portal -> <BookingForm channel="WALK_IN" /> or "TELEPHONIC"
 *  - a specific room's page/dialog -> <BookingForm channel="ONLINE" fixedRoom={room} />
 *
 * Only the fixed `channel` (and optional `fixedRoom`) differ between
 * contexts; fields, validation, and submit behaviour are identical, so
 * channel-specific screens should wrap this component rather than
 * duplicate it.
 */
export function BookingForm({ channel, onSuccess, compact, fixedRoom, initialStay }: BookingFormProps) {
    const [submittedBooking, setSubmittedBooking] = useState<BookingResponse | null>(null);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            ...bookingFormDefaultValues,
            roomId: fixedRoom?.roomId ?? "",
            checkInDate: initialStay?.checkInDate ?? "",
            checkOutDate: initialStay?.checkOutDate ?? "",
        },
    });

    // No Room endpoint yet - list available rooms from local demo data
    // instead of hitting the server. Not needed at all when the room is
    // already fixed by the caller.
    const availableRooms = fixedRoom
        ? []
        : roomList.filter(
              (room) =>
                  room.status === "AVAILABLE" &&
                  room.capacity >= (initialStay?.guests ?? 1)
          );

    function onSubmit(values: BookingFormValues) {
        // Booking endpoint isn't live yet - mock the response locally so
        // the guest still gets a confirmation.
        const booking: BookingResponse = {
            bookingId: Math.floor(Math.random() * 90000) + 10000,
            guestId: `G-${Date.now()}`,
            roomId: values.roomId,
            checkInDate: values.checkInDate,
            checkOutDate: values.checkOutDate,
            channel,
        };

        console.log("New booking request (mock - no backend yet)", {
            channel,
            guest: {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                contactNumber: values.contactNumber,
            },
            roomId: values.roomId,
            checkInDate: values.checkInDate,
            checkOutDate: values.checkOutDate,
        });

        setSubmittedBooking(booking);
        form.reset({ ...bookingFormDefaultValues, roomId: fixedRoom?.roomId ?? "" });
        onSuccess?.(booking, values);
    }

    if (submittedBooking) {
        const roomLabel = fixedRoom
            ? `Room ${fixedRoom.roomNumber} · ${ROOM_TYPE_LABELS[fixedRoom.type]}`
            : `room ${submittedBooking.roomId}`;

        return (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center space-y-2">
                <p className="font-semibold">Booking confirmed</p>
                <p className="text-sm text-muted-foreground">
                    Booking #{submittedBooking.bookingId} for {roomLabel} has been created.
                </p>
                <Button variant="secondary" onClick={() => setSubmittedBooking(null)}>
                    Create another booking
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {!compact && <h3 className="font-semibold text-lg">Guest details</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contactNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact number</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {!compact && <h3 className="font-semibold text-lg">Stay details</h3>}
                    {fixedRoom ? (
                        <div>
                            <Label>Room</Label>
                            <p className="text-sm mt-2">
                                Room {fixedRoom.roomNumber} — {ROOM_TYPE_LABELS[fixedRoom.type]} (R
                                {fixedRoom.pricePerNight}/night)
                            </p>
                        </div>
                    ) : (
                        <FormField
                            control={form.control}
                            name="roomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an available room" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableRooms.map((room) => (
                                                <SelectItem key={room.roomId} value={room.roomId}>
                                                    Room {room.roomNumber} — {ROOM_TYPE_LABELS[room.type]} (R
                                                    {room.pricePerNight}/night)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {initialStay?.guests && initialStay.guests > 1 && (
                                        <p className="text-sm text-muted-foreground">
                                            Showing rooms for {initialStay.guests} guests.
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="checkInDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check-in date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="checkOutDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check-out date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    Confirm booking
                </Button>
            </form>
        </Form>
    );
}
