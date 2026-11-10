"use client";

import { useCallback, useEffect, useState } from "react";

import { AddBookingDialog } from "@/components/booking/add-booking-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Alert } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatAdminDate } from "@/lib/date-format";
import { loadBookingRows, loadErrorMessage, type BookingRow } from "@/lib/admin/booking-rows";
import type { BookingChannel } from "@/lib/validations/booking-schema";

const CHANNEL_LABELS: Record<BookingChannel, string> = {
    ONLINE: "Online",
    WALK_IN: "Walk-in",
    TELEPHONIC: "Telephonic",
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [saved, setSaved] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setBookings(await loadBookingRows());
        } catch (err) {
            setError(loadErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const rows = bookings;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Bookings"
                description="All reservations across online, walk-in and phone channels, newest first."
                className="mb-0"
                actions={
                    <AddBookingDialog
                        onBookingCreated={(booking, values) => {
                            // Saved on the backend - reload so the list shows the real record.
                            setSaved(
                                `Booking #${booking.bookingId} saved for ${values.firstName} ${values.lastName}.`
                            );
                            load();
                        }}
                    />
                }
            />

            {saved && (
                <Alert variant="success" title="Booking saved">
                    {saved} No payment was taken - create an invoice from the Invoices page when the guest pays.
                </Alert>
            )}

            {loading && <LoadingState label="Loading bookings…" />}
            {error && (
                <ErrorState title="Bookings could not be loaded" message={error} onRetry={load} />
            )}

            {!loading && !error && rows.length === 0 && (
                <EmptyState
                    title="No bookings yet"
                    description="Bookings made on the website, or added here for walk-in and phone guests, will appear in this list."
                />
            )}

            {!loading && !error && rows.length > 0 && (
                <Table label="Bookings">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Stay</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((b) => (
                            <TableRow key={`${b.status}-${b.bookingId}`}>
                                <TableCell data-label="Booking ID" className="tabular-nums">{b.bookingId}</TableCell>
                                <TableCell data-label="Guest" className="font-bold">{b.guestName}</TableCell>
                                <TableCell data-label="Room">{b.room}</TableCell>
                                <TableCell data-label="Channel">{CHANNEL_LABELS[b.channel]}</TableCell>
                                <TableCell data-label="Check-in" className="whitespace-nowrap">{formatAdminDate(b.checkInDate)}</TableCell>
                                <TableCell data-label="Check-out" className="whitespace-nowrap">{formatAdminDate(b.checkOutDate)}</TableCell>
                                <TableCell data-label="Stay">
                                    <StatusBadge status={b.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
