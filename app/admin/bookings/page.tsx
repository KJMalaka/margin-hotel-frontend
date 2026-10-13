"use client";

import { useState } from "react";

import { AddBookingDialog } from "@/components/booking/add-booking-dialog";
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

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        <th className="py-2 pr-4">Booking ID</th>
                        <th className="py-2 pr-4">Guest</th>
                        <th className="py-2 pr-4">Room</th>
                        <th className="py-2 pr-4">Channel</th>
                        <th className="py-2 pr-4">Check-in</th>
                        <th className="py-2 pr-4">Check-out</th>
                        <th className="py-2 pr-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.bookingId} className="border-b">
                            <td className="py-2 pr-4">{b.bookingId}</td>
                            <td className="py-2 pr-4">{b.guestName}</td>
                            <td className="py-2 pr-4">{b.room}</td>
                            <td className="py-2 pr-4">{CHANNEL_LABELS[b.channel]}</td>
                            <td className="py-2 pr-4">{formatAdminDate(b.checkInDate)}</td>
                            <td className="py-2 pr-4">{formatAdminDate(b.checkOutDate)}</td>
                            <td className="py-2 pr-4">
                                <span className="text-green-600 font-medium">{b.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
