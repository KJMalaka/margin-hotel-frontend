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
    channel: BookingChannel;
    onSuccess?: (booking: BookingResponse, values: BookingFormValues) => void;
    compact?: boolean;
    fixedRoom?: Room;
    initialStay?: {
        checkInDate?: string;
        checkOutDate?: string;
        guests?: number;
    };
}

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

    const availableRooms = fixedRoom
        ? []
        : roomList.filter(
              (room) =>
                  room.status === "AVAILABLE" &&
                  room.capacity >= (initialStay?.guests ?? 1)
          );

    function onSubmit(values: BookingFormValues) {
        const booking: BookingResponse = {
            bookingId: Math.floor(Math.random() * 90000) + 10000,
            guestId: `G-${Date.now()}`,
            roomId: fixedRoom?.roomId ?? values.roomId,
            checkInDate: values.checkInDate,
            checkOutDate: values.checkOutDate,
            channel,
        };

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
                <p className="font-semibold">Booking request received</p>
                <p className="text-sm text-muted-foreground">
                    Reference #{submittedBooking.bookingId} for {roomLabel}.
                </p>
                <p className="text-xs text-muted-foreground">
                    Demo mode: this booking isn't saved yet.
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