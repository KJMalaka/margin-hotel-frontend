"use client";

import { useState } from "react";

import { AddBookingDialog } from "@/components/booking/add-booking-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ROOM_TYPE_LABELS, getRoomById } from "@/data/rooms";
import { formatAdminDate } from "@/lib/date-format";
import type { BookingChannel } from "@/lib/validations/booking-schema";

interface BookingRow {
    bookingId: number;
    guestName: string;
    room: string;
    channel: BookingChannel;
    checkInDate: string;
    checkOutDate: string;
    status: "CONFIRMED";
}

const CHANNEL_LABELS: Record<BookingChannel, string> = {
    ONLINE: "Online",
    WALK_IN: "Walk-in",
    TELEPHONIC: "Telephonic",
};

const demoBookings: BookingRow[] = [
    {
        bookingId: 1001,
        guestName: "Thabo Nkosi",
        room: "Room 101 — Standard Room",
        channel: "ONLINE",
        checkInDate: "2026-09-12",
        checkOutDate: "2026-09-14",
        status: "CONFIRMED",
    },
    {
        bookingId: 1002,
        guestName: "Amahle Dlamini",
        room: "Room 201 — Deluxe Room",
        channel: "WALK_IN",
        checkInDate: "2026-09-15",
        checkOutDate: "2026-09-18",
        status: "CONFIRMED",
    },
    {
        bookingId: 1003,
        guestName: "Sipho Mokoena",
        room: "Room 301 — Suite",
        channel: "TELEPHONIC",
        checkInDate: "2026-09-20",
        checkOutDate: "2026-09-22",
        status: "CONFIRMED",
    },
];

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingRow[]>(demoBookings);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Bookings</h1>

                <AddBookingDialog
                    onBookingCreated={(booking, values) => {
                        const room = getRoomById(values.roomId);

                        setBookings((prev) => [
                            {
                                bookingId: booking.bookingId,
                                guestName: `${values.firstName} ${values.lastName}`,
                                room: room
                                    ? `Room ${room.roomNumber} — ${ROOM_TYPE_LABELS[room.type]}`
                                    : values.roomId,
                                channel: booking.channel,
                                checkInDate: booking.checkInDate,
                                checkOutDate: booking.checkOutDate,
                                status: "CONFIRMED",
                            },
                            ...prev,
                        ]);
                    }}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-8 text-center text-muted-foreground"
                            >
                                No bookings found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        bookings.map((b) => (
                            <TableRow key={b.bookingId}>
                                <TableCell>{b.bookingId}</TableCell>
                                <TableCell>{b.guestName}</TableCell>
                                <TableCell>{b.room}</TableCell>
                                <TableCell>{CHANNEL_LABELS[b.channel]}</TableCell>
                                <TableCell>{formatAdminDate(b.checkInDate)}</TableCell>
                                <TableCell>{formatAdminDate(b.checkOutDate)}</TableCell>
                                <TableCell>
                                    <span className="text-green-600 font-medium">
                                        {b.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
