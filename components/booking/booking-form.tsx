"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
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
import { createBooking, type BookingResponse } from "@/lib/api/booking";
import {
    createInvoice,
    getInvoiceById,
    type Invoice,
} from "@/lib/api/invoice";
import {
    createDemoCheckout,
    type Payment,
} from "@/lib/api/payment";
import { getRooms, type ApiRoom } from "@/lib/api/rooms";
import { createGuest, findGuestByEmail, type Guest } from "@/lib/api/guest";
import { useSession } from "@/hooks/use-session";
import {
    bookingFormDefaultValues,
    bookingFormSchema,
    type BookingChannel,
    type BookingFormValues,
} from "@/lib/validations/booking-schema";
import { getRoomById, ROOM_TYPE_LABELS, roomList, type Room } from "@/data/rooms";

const zar = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
});

function getStayNights(checkInDate: string, checkOutDate: string) {
    const checkIn = new Date(`${checkInDate}T00:00:00Z`).getTime();
    const checkOut = new Date(`${checkOutDate}T00:00:00Z`).getTime();
    return Math.round((checkOut - checkIn) / (24 * 60 * 60 * 1000));
}

function formatStayDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function toCheckInDateTime(date: string) {
    return `${date}T14:00:00`;
}

function toCheckOutDateTime(date: string) {
    return `${date}T10:00:00`;
}

interface BookingConfirmation {
    booking: BookingResponse;
    values: BookingFormValues;
    room: ApiRoom;
    nights: number;
    total: number;
    invoice: Invoice;
    payment?: Payment;
}

interface CheckoutProgress {
    values: BookingFormValues;
    room: ApiRoom;
    nights: number;
    total: number;
    invoiceReference: string;
    booking?: BookingResponse;
    invoice?: Invoice;
    payment?: Payment;
}

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
    const [checkout, setCheckout] = useState<CheckoutProgress | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
    const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(channel === "ONLINE");
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const session = useSession();

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            ...bookingFormDefaultValues,
            roomId: fixedRoom?.roomId ?? "",
            checkInDate: initialStay?.checkInDate ?? "",
            checkOutDate: initialStay?.checkOutDate ?? "",
        },
    });

    useEffect(() => {
        if (!session) return;

        if (session.firstName) {
            form.setValue("firstName", session.firstName);
        }
        if (session.lastName) {
            form.setValue("lastName", session.lastName);
        }
        form.setValue("email", session.email);
        if (session.mobile) {
            form.setValue("contactNumber", session.mobile);
        }
    }, [form, session]);

    useEffect(() => {
        if (channel !== "ONLINE") return;

        let cancelled = false;
        setRoomsLoading(true);
        setRoomsError(null);

        getRooms()
            .then((rooms) => {
                if (cancelled) return;
                setApiRooms(rooms);
                if (fixedRoom) {
                    const matchingRoom = rooms.find(
                        (room) => room.roomNumber === fixedRoom.roomNumber
                    );
                    if (matchingRoom) {
                        form.setValue("roomId", String(matchingRoom.roomId));
                    }
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setRoomsError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load rooms from the hotel system."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setRoomsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [channel, fixedRoom, form]);

    const availableRooms = fixedRoom
        ? []
        : roomList.filter(
              (room) =>
                  room.status === "AVAILABLE" &&
                  room.capacity >= (initialStay?.guests ?? 1)
          );
    const availableApiRooms = apiRooms.filter(
        (room) => room.roomStatus === "AVAILABLE"
    );
    const selectedFixedApiRoom = fixedRoom
        ? apiRooms.find((room) => room.roomNumber === fixedRoom.roomNumber)
        : undefined;
    const fixedRoomUnavailable =
        Boolean(fixedRoom) && selectedFixedApiRoom?.roomStatus !== "AVAILABLE";

    function onSubmit(values: BookingFormValues) {
        if (channel === "ONLINE") {
            if (session?.role !== "USER") {
                setCheckoutError("Please sign in with a guest account before booking.");
                return;
            }
            setCheckoutError(null);
            const room = fixedRoom
                ? apiRooms.find((item) => item.roomNumber === fixedRoom.roomNumber)
                : apiRooms.find((item) => String(item.roomId) === values.roomId);
            if (roomsLoading || roomsError) return;
            if (!room) {
                form.setError("roomId", {
                    message: fixedRoom
                        ? `Room ${fixedRoom.roomNumber} is not listed by the hotel system`
                        : "Select a room listed as available",
                });
                return;
            }
            if (room.roomStatus !== "AVAILABLE") {
                form.setError("roomId", {
                    message: `Room ${room.roomNumber} is ${room.roomStatus.toLowerCase()}`,
                });
                return;
            }

            const nights = getStayNights(values.checkInDate, values.checkOutDate);
            setCheckout({
                values: { ...values, email: session.email },
                room,
                nights,
                total: room.pricePerNight * nights,
                invoiceReference: `INV-${Date.now().toString(36).toUpperCase()}`,
            });
            return;
        }

        const booking: BookingResponse = {
            bookingId: Math.floor(Math.random() * 90000) + 10000,
            guestId: `G-${Date.now()}`,
            roomId: getRoomById(values.roomId)?.roomId ?? values.roomId,
            checkInDate: values.checkInDate,
            checkOutDate: values.checkOutDate,
            channel,
        };

        setSubmittedBooking(booking);
        form.reset({
            ...bookingFormDefaultValues,
            firstName: session?.firstName ?? "",
            lastName: session?.lastName ?? "",
            email: session?.email ?? "",
            contactNumber: session?.mobile ?? "",
            roomId: fixedRoom?.roomId ?? "",
        });
        onSuccess?.(booking, values);
    }

    async function completePayment() {
        if (!checkout || processingPayment) return;
        if (!session || session.role !== "USER") {
            setCheckoutError("Your guest session has expired. Please sign in again.");
            return;
        }

        setProcessingPayment(true);
        setCheckoutError(null);
        let progress = checkout;

        try {
            let guest: Guest | undefined;
            if (!progress.booking) {
                try {
                    guest = await findGuestByEmail(session?.email ?? "");
                } catch (error) {
                    if (!isAxiosError(error) || error.response?.status !== 404) {
                        throw error;
                    }
                }

                if (!guest) {
                    guest = await createGuest({
                        firstName: progress.values.firstName,
                        middleName: "",
                        lastName: progress.values.lastName,
                        email: session.email,
                        mobile: progress.values.contactNumber,
                    });
                }

                const booking = await createBooking({
                    bookingChannel: channel,
                    guestId: guest.guestId,
                    roomId: progress.room.roomId,
                    checkInDate: toCheckInDateTime(progress.values.checkInDate),
                    checkOutDate: toCheckOutDateTime(progress.values.checkOutDate),
                });
                progress = { ...progress, booking };
                setCheckout(progress);
            }

            if (!progress.invoice) {
                const booking = progress.booking;
                if (!booking) {
                    throw new Error("The booking was not created. Please try again.");
                }
                const invoice = await createInvoice({
                    reference: progress.invoiceReference,
                    totalAmount: progress.total,
                    bookingId: booking.bookingId,
                });
                progress = { ...progress, invoice };
                setCheckout(progress);
            }

            const invoiceRecord = progress.invoice;
            const bookingRecord = progress.booking;
            if (!invoiceRecord || !bookingRecord) {
                throw new Error("Booking or invoice details are missing. Please try again.");
            }

            let payment = progress.payment;
            if (!payment) {
                payment = await createDemoCheckout({
                    invoiceId: invoiceRecord.invoiceId,
                });
                progress = { ...progress, payment };
                setCheckout(progress);
            }

            if (payment.paymentStatus !== "SUCCESS") {
                setCheckoutError(
                    `The backend reported payment status ${payment.paymentStatus}. Your booking and invoice were saved; please contact the hotel to complete checkout.`
                );
                return;
            }

            const invoice = await getInvoiceById(invoiceRecord.invoiceId);
            if (invoice.status !== "PAID") {
                throw new Error(
                    "Payment succeeded, but the invoice is not marked as paid yet. Please refresh or contact the hotel."
                );
            }
            if (invoice !== invoiceRecord) {
                progress = { ...progress, invoice };
                setCheckout(progress);
            }

            setConfirmation({
                booking: bookingRecord,
                values: progress.values,
                room: progress.room,
                nights: progress.nights,
                total: progress.total,
                invoice,
                payment,
            });
            setCheckout(null);
            form.reset({
                ...bookingFormDefaultValues,
                firstName: session?.firstName ?? "",
                lastName: session?.lastName ?? "",
                email: session?.email ?? "",
                contactNumber: session?.mobile ?? "",
                roomId: fixedRoom?.roomId ?? "",
            });
            onSuccess?.(bookingRecord, progress.values);
        } catch (error) {
            if (
                isAxiosError(error) &&
                error.response?.status === 409 &&
                progress.invoice
            ) {
                try {
                    const invoice = await getInvoiceById(progress.invoice.invoiceId);
                    if (invoice.status === "PAID" && progress.booking) {
                        setConfirmation({
                            booking: progress.booking,
                            values: progress.values,
                            room: progress.room,
                            nights: progress.nights,
                            total: progress.total,
                            invoice,
                            payment: progress.payment,
                        });
                        setCheckout(null);
                        return;
                    }
                } catch {
                    setCheckoutError(
                        "This checkout may already have been completed. Please check your booking or contact the hotel."
                    );
                    return;
                }
            }
            setCheckoutError(getCheckoutErrorMessage(error));
        } finally {
            setProcessingPayment(false);
        }
    }

    if (confirmation) {
        const { booking, values, room, nights, total, invoice, payment } =
            confirmation;

        return (
            <section
                aria-live="polite"
                className="space-y-6 rounded-lg border border-primary/30 bg-primary/5 p-6"
            >
                <div className="space-y-2 text-center">
                    <p className="font-semibold text-xl">Your stay is confirmed</p>
                    <p className="text-sm text-muted-foreground">
                        Booking reference #{booking.bookingId}
                    </p>
                </div>

                <div className="space-y-4 rounded-md border bg-background p-4">
                    <div>
                        <h3 className="font-semibold">Stay details</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {backendRoomLabel(room)} · {nights} {nights === 1 ? "night" : "nights"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {formatStayDate(values.checkInDate)} – {formatStayDate(values.checkOutDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Guest: {values.firstName} {values.lastName} · {values.email}
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between gap-4 text-sm">
                            <span>
                                Room rate ({zar.format(room.pricePerNight)} × {nights}{" "}
                                {nights === 1 ? "night" : "nights"})
                            </span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4 font-semibold">
                            <span>Invoice total · {invoice.reference}</span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Invoice status: {invoice.status}
                                {payment && ` · Payment reference: #${payment.paymentId}`}
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Your booking, invoice, and payment record have been saved. Payment
                    is simulated; no money was charged.
                </p>
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setConfirmation(null)}
                >
                    Create another booking
                </Button>
            </section>
        );
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
                    Demo mode: this booking isn&apos;t saved yet.
                </p>
                <Button variant="secondary" onClick={() => setSubmittedBooking(null)}>
                    Create another booking
                </Button>
            </div>
        );
    }

    if (checkout) {
        const { values, room, nights, total, booking, invoice, payment } = checkout;

        return (
            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">Review and pay</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Check your stay details before completing checkout.
                    </p>
                </div>

                <div className="space-y-4 border bg-card p-5">
                    <div>
                        <h3 className="font-semibold">Guest</h3>
                        <p className="text-sm text-muted-foreground">
                            {values.firstName} {values.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{values.email}</p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold">Your stay</h3>
                        <p className="text-sm text-muted-foreground">
                            {backendRoomLabel(room)} · {nights} {nights === 1 ? "night" : "nights"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {formatStayDate(values.checkInDate)} –{" "}
                            {formatStayDate(values.checkOutDate)}
                        </p>
                        <div className="mt-4 flex justify-between gap-4 border-t pt-4 text-sm">
                            <span>
                                Room rate ({zar.format(room.pricePerNight)} × {nights}{" "}
                                {nights === 1 ? "night" : "nights"})
                            </span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4 text-lg font-semibold">
                            <span>Total due</span>
                            <span>{zar.format(total)}</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Payment is simulated for this demo. Your booking, invoice, and payment
                    records will be saved; no real charge will be made.
                </p>
                {(booking || invoice || payment) && (
                    <p className="text-xs text-muted-foreground">
                        {booking && `Booking #${booking.bookingId} created. `}
                        {invoice && `Invoice ${invoice.reference} created. `}
                        {payment && payment.paymentStatus !== "SUCCESS" &&
                            `Last payment status: ${payment.paymentStatus}. `}
                        {payment && payment.paymentStatus !== "SUCCESS" &&
                            "Please contact the hotel to complete checkout."}
                    </p>
                )}
                {channel === "ONLINE" && session?.role !== "USER" && (
                    <p role="alert" className="text-sm text-destructive">
                        Please <Link className="underline" href="/login">sign in</Link> with a
                        guest account before making a booking.
                    </p>
                )}
                {checkoutError && (
                    <p role="alert" className="text-sm text-destructive">
                        Checkout error: {checkoutError}
                    </p>
                )}
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    {!booking && !invoice && !payment && (
                        <Button
                            type="button"
                            variant="outline"
                            className="sm:flex-1"
                            disabled={processingPayment}
                            onClick={() => {
                                setCheckout(null);
                                setCheckoutError(null);
                            }}
                        >
                            Back to booking
                        </Button>
                    )}
                    <Button
                        type="button"
                        className="sm:flex-1"
                        onClick={completePayment}
                        disabled={
                            !room ||
                            nights <= 0 ||
                            processingPayment ||
                            Boolean(payment && payment.paymentStatus !== "SUCCESS")
                        }
                    >
                        {processingPayment
                            ? "Processing..."
                            : payment
                                ? payment.paymentStatus === "SUCCESS"
                                    ? "Verify invoice payment"
                                    : "Payment needs assistance"
                                : `Pay ${zar.format(total)} (simulated)`}
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {!compact && <h3 className="font-semibold text-lg">Guest details</h3>}
                    {channel === "ONLINE" && session?.role !== "USER" && (
                        <p role="alert" className="text-sm text-destructive">
                            Please <Link className="underline" href="/login">sign in</Link> with
                            a guest account before making a booking.
                        </p>
                    )}
                    {checkoutError && (
                        <p role="alert" className="text-sm text-destructive">
                            {checkoutError}
                        </p>
                    )}
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
                                        <Input
                                            type="email"
                                            {...field}
                                            value={session?.role === "USER" ? session.email : field.value}
                                            disabled={channel === "ONLINE" && session?.role === "USER"}
                                        />
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
                            {roomsLoading ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Checking room in the hotel system...
                                </p>
                            ) : roomsError ? (
                                <p role="alert" className="mt-2 text-sm text-destructive">
                                    Unable to load rooms: {roomsError}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm">
                                    {selectedFixedApiRoom
                                        ? `${backendRoomLabel(
                                              selectedFixedApiRoom
                                          )} (${zar.format(
                                              selectedFixedApiRoom.pricePerNight
                                          )}/night · ${selectedFixedApiRoom.roomStatus.toLowerCase()})`
                                        : `Room ${fixedRoom.roomNumber} is not listed by the hotel system.`}
                                </p>
                            )}
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
                                            {channel === "ONLINE"
                                                ? availableApiRooms.map((room) => (
                                                      <SelectItem
                                                          key={room.roomId}
                                                          value={String(room.roomId)}
                                                      >
                                                          {backendRoomLabel(room)} (
                                                          {zar.format(room.pricePerNight)}/night)
                                                      </SelectItem>
                                                  ))
                                                : availableRooms.map((room) => (
                                                      <SelectItem
                                                          key={room.roomId}
                                                          value={room.roomId}
                                                      >
                                                          Room {room.roomNumber} —{" "}
                                                          {ROOM_TYPE_LABELS[room.type]} (
                                                          {zar.format(room.pricePerNight)}/night)
                                                      </SelectItem>
                                                  ))}
                                        </SelectContent>
                                    </Select>
                                    {channel === "ONLINE" && roomsLoading && (
                                        <p className="text-sm text-muted-foreground">
                                            Loading rooms from the hotel system...
                                        </p>
                                    )}
                                    {channel === "ONLINE" && roomsError && (
                                        <p role="alert" className="text-sm text-destructive">
                                            Unable to load rooms: {roomsError}
                                        </p>
                                    )}
                                    {channel === "ONLINE" &&
                                        !roomsLoading &&
                                        !roomsError &&
                                        availableApiRooms.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No rooms are currently marked available. Please
                                                contact the hotel.
                                            </p>
                                        )}
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

                <Button
                    type="submit"
                    className="w-full"
                    disabled={
                        channel === "ONLINE" &&
                        (session?.role !== "USER" ||
                            roomsLoading ||
                            Boolean(roomsError) ||
                            Boolean(fixedRoom && fixedRoomUnavailable))
                    }
                >
                    {channel === "ONLINE" ? "Review booking" : "Confirm booking"}
                </Button>
            </form>
        </Form>
    );
}

function backendRoomLabel(room: ApiRoom) {
    const typeLabels: Record<ApiRoom["roomType"], string> = {
        SINGLE: "Single Room",
        DOUBLE: "Double Room",
        SUITE: "Suite",
    };
    return `Room ${room.roomNumber} · ${typeLabels[room.roomType]}`;
}

function getCheckoutErrorMessage(error: unknown) {
    if (isAxiosError(error)) {
        const body: unknown = error.response?.data;
        if (typeof body === "string" && body.trim()) return body;
        if (body && typeof body === "object") {
            const response = body as {
                message?: unknown;
                error?: unknown;
                path?: unknown;
            };
            const detail =
                typeof response.message === "string"
                    ? response.message
                    : typeof response.error === "string"
                        ? response.error
                        : undefined;
            const path =
                typeof response.path === "string" ? ` (${response.path})` : "";
            if (detail) return `${detail}${path}`;
            if (error.response?.status) {
                return `Request failed with status ${error.response.status}${path}`;
            }
        }
    }
    return error instanceof Error
        ? error.message
        : "Unable to complete checkout. Please try again.";
}