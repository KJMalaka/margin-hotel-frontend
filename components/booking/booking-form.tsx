"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
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
    localIsoDate,
    type BookingChannel,
    type BookingFormValues,
} from "@/lib/validations/booking-schema";
import { ROOM_TYPE_LABELS, type Room } from "@/data/rooms";
import { PaymentMethodStep } from "@/components/booking/payment-method-step";
import {
    PaymentProcessing,
    type ProcessingStepId,
} from "@/components/booking/payment-processing";
import {
    CARD_BRAND_LABELS,
    PAYMENT_METHOD_LABELS,
    type SimulatedPaymentDetails,
} from "@/lib/validations/payment-schema";

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

// Short pauses so each simulated checkout step is visible during the demo.
function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function describePaymentMethod(details: SimulatedPaymentDetails) {
    const card = `${CARD_BRAND_LABELS[details.brand]} •••• ${details.last4}`;
    return details.method === "CARD"
        ? card
        : `${PAYMENT_METHOD_LABELS[details.method]} (${card})`;
}

function BookingProgress({
    currentStep,
    stepTopRef,
}: {
    currentStep: 1 | 2 | 3;
    stepTopRef: React.RefObject<HTMLElement>;
}) {
    const steps = [
        { number: 1, label: "Guest details" },
        { number: 2, label: "Payment details" },
        { number: 3, label: "Confirmation" },
    ] as const;

    return (
        <nav
            ref={stepTopRef}
            aria-label="Booking progress"
            className="booking-progress mb-8 scroll-mt-4"
        >
            <ol className="flex items-start">
                {steps.map(({ number: step, label }, index) => {
                    const complete = step < currentStep;
                    const current = step === currentStep;

                    return (
                        <li
                            key={label}
                            aria-current={current ? "step" : undefined}
                            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
                        >
                            {index < steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute left-1/2 top-4 h-px w-full ${
                                        complete ? "bg-gold" : "bg-border"
                                    }`}
                                />
                            )}
                            <span
                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                                    current || complete
                                        ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-midnight"
                                        : "border-border bg-background text-muted-foreground"
                                }`}
                            >
                                {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : step}
                            </span>
                            <span
                                className={`mt-2 max-w-full whitespace-normal px-1 text-[0.6rem] font-medium leading-tight sm:text-xs ${
                                    current ? "text-foreground" : "text-muted-foreground"
                                }`}
                            >
                                {label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

interface BookingConfirmation {
    booking: BookingResponse;
    values: BookingFormValues;
    room: ApiRoom;
    nights: number;
    total: number;
    invoice: Invoice;
    payment?: Payment;
    paymentDetails: SimulatedPaymentDetails;
    paidAt: Date;
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
    const [processingStep, setProcessingStep] = useState<ProcessingStepId | null>(null);
    const [lastPaymentDetails, setLastPaymentDetails] =
        useState<SimulatedPaymentDetails | null>(null);
    const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
    const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [savingStaffBooking, setSavingStaffBooking] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const session = useSession();
    // Staff book on a guest's behalf, so their own details must never be
    // prefilled into the guest fields - only a signed-in guest's are.
    const isGuestSelfBooking = session?.role === "USER";

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            ...bookingFormDefaultValues,
            roomId: fixedRoom?.roomId ?? "",
            checkInDate: initialStay?.checkInDate ?? "",
            checkOutDate: initialStay?.checkOutDate ?? "",
        },
    });

    // Date limits: no past check-in, check-out at least one night later.
    // "today" is set on the client so it uses the guest's own timezone and
    // doesn't mismatch the server-rendered HTML.
    const [today, setToday] = useState<string>();
    useEffect(() => setToday(localIsoDate()), []);
    const watchedCheckIn = form.watch("checkInDate");
    const minCheckOut = watchedCheckIn ? nextDay(watchedCheckIn) : today && nextDay(today);

    useEffect(() => {
        if (!session || session.role !== "USER") return;

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

    // Guests see rooms free right now. Staff may book any room that isn't
    // under maintenance (e.g. a future stay in a room occupied today); the
    // backend rejects overlapping dates with a 409.
    const availableApiRooms = apiRooms.filter((room) =>
        channel === "ONLINE"
            ? room.roomStatus === "AVAILABLE"
            : room.roomStatus !== "MAINTENANCE"
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

        return saveStaffBooking(values);
    }

    /** Walk-in / telephonic booking made by staff: saved straight to the backend. */
    async function saveStaffBooking(values: BookingFormValues) {
        if (savingStaffBooking) return;
        const room = apiRooms.find((item) => String(item.roomId) === values.roomId);
        if (!room) {
            form.setError("roomId", { message: "Select a room listed by the hotel system" });
            return;
        }

        setSavingStaffBooking(true);
        setCheckoutError(null);
        try {
            // Reuse the guest record if this email is already known.
            let guest: Guest | undefined;
            try {
                guest = await findGuestByEmail(values.email);
            } catch (error) {
                if (!isAxiosError(error) || error.response?.status !== 404) throw error;
            }
            if (!guest) {
                guest = await createGuest({
                    firstName: values.firstName,
                    middleName: "",
                    lastName: values.lastName,
                    email: values.email,
                    mobile: values.contactNumber,
                });
            }

            const booking = await createBooking({
                bookingChannel: channel,
                guestId: guest.guestId,
                roomId: room.roomId,
                checkInDate: toCheckInDateTime(values.checkInDate),
                checkOutDate: toCheckOutDateTime(values.checkOutDate),
            });

            setSubmittedBooking(booking);
            form.reset({ ...bookingFormDefaultValues });
            onSuccess?.(booking, values);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 409) {
                form.setError("roomId", {
                    message: `Room ${room.roomNumber} is already booked for some of these dates. Choose other dates or another room.`,
                });
            } else {
                setCheckoutError(getCheckoutErrorMessage(error));
            }
        } finally {
            setSavingStaffBooking(false);
        }
    }

    async function completePayment(details: SimulatedPaymentDetails) {
        if (!checkout || processingPayment) return;
        if (!session || session.role !== "USER") {
            setCheckoutError("Your guest session has expired. Please sign in again.");
            return;
        }

        setProcessingPayment(true);
        setProcessingStep("verify");
        setLastPaymentDetails(details);
        setCheckoutError(null);
        let progress = checkout;

        try {
            // Simulated card / wallet check - nothing leaves the browser here.
            await wait(1200);
            if (details.simulateDecline) {
                throw new Error(
                    "Your card was declined (simulated). Try another card or payment method."
                );
            }

            setProcessingStep("booking");
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
            await wait(600);

            setProcessingStep("invoice");
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
            await wait(600);

            setProcessingStep("payment");
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
            await wait(800);

            setConfirmation({
                booking: bookingRecord,
                values: progress.values,
                room: progress.room,
                nights: progress.nights,
                total: progress.total,
                invoice,
                payment,
                paymentDetails: details,
                paidAt: new Date(),
            });
            setCheckout(null);
            form.reset({
                ...bookingFormDefaultValues,
                firstName: session?.role === "USER" ? session.firstName ?? "" : "",
                lastName: session?.role === "USER" ? session.lastName ?? "" : "",
                email: session?.role === "USER" ? session.email : "",
                contactNumber: session?.role === "USER" ? session.mobile ?? "" : "",
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
                            paymentDetails: details,
                            paidAt: new Date(),
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
            setProcessingStep(null);
        }
    }

    if (confirmation) {
        const { booking, values, room, nights, total, invoice, payment, paymentDetails, paidAt } =
            confirmation;

        return (
            <section aria-live="polite" className="booking-receipt space-y-6">
                {progress}
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-success-bg">
                        <Check className="size-8 text-success" aria-hidden="true" />
                    </span>
                    <p className="eyebrow">Booking confirmed</p>
                    <h2 className="text-3xl sm:text-4xl">Your stay is confirmed</h2>
                    <p className="text-muted-foreground">
                        Thank you, {values.firstName}. We look forward to welcoming you to Margin Hotel.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-md border-l-4 border-info bg-info-bg p-4">
                    <Mail className="mt-0.5 size-5 shrink-0 text-info" aria-hidden="true" />
                    <p>
                        A receipt and booking confirmation have been sent to{" "}
                        <strong>{values.email}</strong>. Check your spam folder if it doesn&apos;t
                        arrive within a few minutes.
                    </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <dl className="grid grid-cols-1 border-b border-border bg-muted sm:grid-cols-3">
                        <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
                            <dt className="font-bold text-muted-foreground">Booking ref</dt>
                            <dd className="mt-1 text-lg font-bold">#{booking.bookingId}</dd>
                        </div>
                        <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
                            <dt className="font-bold text-muted-foreground">Invoice</dt>
                            <dd className="mt-1 text-lg font-bold">{invoice.reference}</dd>
                        </div>
                        <div className="p-4">
                            <dt className="font-bold text-muted-foreground">Payment</dt>
                            <dd className="mt-1 flex flex-wrap items-center gap-2">
                                <StatusBadge status={invoice.status} />
                                {payment && <span className="font-bold">#{payment.paymentId}</span>}
                            </dd>
                        </div>
                    </dl>

                    <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                        <div>
                            <dt className="font-bold text-muted-foreground">Guest</dt>
                            <dd className="mt-1">{values.firstName} {values.lastName}</dd>
                            <dd className="text-muted-foreground">{values.contactNumber}</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-muted-foreground">Room</dt>
                            <dd className="mt-1">{backendRoomLabel(room)}</dd>
                            <dd className="text-muted-foreground">
                                {nights} {nights === 1 ? "night" : "nights"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-bold text-muted-foreground">Check-in</dt>
                            <dd className="mt-1">{formatStayDate(values.checkInDate)} · from 2:00 PM</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-muted-foreground">Check-out</dt>
                            <dd className="mt-1">{formatStayDate(values.checkOutDate)} · by 11:00 AM</dd>
                        </div>
                    </dl>

                    <div className="space-y-2 border-t border-border p-4">
                        <div className="flex justify-between gap-4">
                            <span>
                                Room rate ({zar.format(room.pricePerNight)} × {nights}{" "}
                                {nights === 1 ? "night" : "nights"})
                            </span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                            <span>
                                Paid with {describePaymentMethod(paymentDetails)} on{" "}
                                {paidAt.toLocaleDateString("en-ZA", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                            <span className="font-bold">Total paid</span>
                            <span className="text-2xl font-bold tabular-nums">{zar.format(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="receipt-actions grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => window.print()}
                    >
                        Print receipt
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setConfirmation(null)}
                    >
                        Create another booking
                    </Button>
                </div>
                <p className="text-center text-muted-foreground">
                    Your booking, invoice, and payment record have been saved. Payment
                    is simulated; no money was charged.
                </p>
            </section>
        );
    }

    if (submittedBooking) {
        const savedRoom = apiRooms.find(
            (room) => String(room.roomId) === String(submittedBooking.roomId)
        );
        const roomLabel = savedRoom
            ? backendRoomLabel(savedRoom)
            : fixedRoom
              ? `Room ${fixedRoom.roomNumber} · ${ROOM_TYPE_LABELS[fixedRoom.type]}`
              : `room ${submittedBooking.roomId}`;

        return (
            <div role="status" className="space-y-2 rounded-lg border-l-4 border-success bg-success-bg p-5">
                <p className="flex items-center gap-2 text-lg font-bold">
                    <Check aria-hidden className="size-5 text-success" />
                    Booking saved
                </p>
                <p>
                    Reference #{submittedBooking.bookingId} for {roomLabel}.
                </p>
                <p className="text-muted-foreground">
                    No payment was taken. Create an invoice from the Invoices page when the guest pays.
                </p>
                <Button variant="secondary" className="mt-2" onClick={() => setSubmittedBooking(null)}>
                    Create another booking
                </Button>
            </div>
        );
    }

    if (checkout) {
        const { values, room, nights, total, booking, invoice, payment } = checkout;

        if (processingPayment && processingStep) {
            return (
                <div>
                    {progress}
                    <PaymentProcessing
                        currentStep={processingStep}
                        amountLabel={zar.format(total)}
                        methodLabel={lastPaymentDetails ? describePaymentMethod(lastPaymentDetails) : ""}
                    />
                </div>
            );
        }

        const stayLabel = `${backendRoomLabel(room)} · ${formatStayDate(
            values.checkInDate
        )} – ${formatStayDate(values.checkOutDate)}`;
        const paymentIncomplete = Boolean(payment && payment.paymentStatus !== "SUCCESS");

        return (
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl">Review and pay</h2>
                    <p className="mt-1 text-muted-foreground">
                        Check your stay details, then choose how you&apos;d like to pay.
                    </p>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-muted p-4 sm:p-5">
                    <div>
                        <h3 className="text-lg">Guest</h3>
                        <p>
                            {values.firstName} {values.lastName}
                        </p>
                        <p className="break-all text-muted-foreground">{values.email}</p>
                    </div>

                    <div className="border-t border-input pt-4">
                        <h3 className="text-lg">Your stay</h3>
                        <p>
                            {backendRoomLabel(room)} · {nights} {nights === 1 ? "night" : "nights"}
                        </p>
                        <p className="text-muted-foreground">
                            {formatStayDate(values.checkInDate)} –{" "}
                            {formatStayDate(values.checkOutDate)}
                        </p>
                        <div className="mt-4 flex justify-between gap-4 border-t border-input pt-4">
                            <span>
                                Room rate ({zar.format(room.pricePerNight)} × {nights}{" "}
                                {nights === 1 ? "night" : "nights"})
                            </span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <div className="mt-2 flex justify-between gap-4 text-xl font-bold">
                            <span>Total due</span>
                            <span>{zar.format(total)}</span>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                            Free cancellation up to 48 hours before check-in.
                        </p>
                    </div>
                </div>

                {(booking || invoice || payment) && (
                    <p className="text-muted-foreground">
                        {booking && `Booking #${booking.bookingId} created. `}
                        {invoice && `Invoice ${invoice.reference} created. `}
                        {paymentIncomplete &&
                            `Last payment status: ${payment?.paymentStatus}. Please contact the hotel to complete checkout.`}
                    </p>
                )}
                {channel === "ONLINE" && session?.role !== "USER" && (
                    <Alert variant="warning" title="Sign in to book">
                        Please{" "}
                        <Link className="font-bold text-primary underline underline-offset-4 hover:no-underline" href="/login">
                            sign in
                        </Link>{" "}
                        with a guest account before making a booking.
                    </Alert>
                )}
                {checkoutError && (
                    <Alert variant="danger" title="Checkout problem">
                        {checkoutError}
                    </Alert>
                )}

                {payment && lastPaymentDetails ? (
                    // Payment already recorded - only the invoice check is left.
                    <Button
                        type="button"
                        size="lg"
                        className="w-full"
                        onClick={() => completePayment(lastPaymentDetails)}
                        disabled={processingPayment || paymentIncomplete}
                    >
                        {paymentIncomplete ? "Payment needs assistance" : "Verify invoice payment"}
                    </Button>
                ) : (
                    <PaymentMethodStep
                        total={total}
                        email={values.email}
                        stayLabel={stayLabel}
                        disabled={!room || nights <= 0 || processingPayment}
                        onPay={completePayment}
                    />
                )}

                {!booking && !invoice && !payment && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        disabled={processingPayment}
                        onClick={() => {
                            setCheckout(null);
                            setCheckoutError(null);
                        }}
                    >
                        Back to booking
                    </Button>
                )}
            </section>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
                <fieldset className="space-y-4">
                    <legend className={compact ? "sr-only" : "mb-4 text-xl font-bold"}>
                        Guest details
                    </legend>
                    {channel === "ONLINE" && session?.role !== "USER" && (
                        <Alert variant="warning" title="Sign in to book">
                            Please{" "}
                            <Link className="font-bold text-primary underline underline-offset-4 hover:no-underline" href="/login">
                                sign in
                            </Link>{" "}
                            with a guest account before making a booking.
                        </Alert>
                    )}
                    {checkoutError && (
                        <Alert variant="danger">{checkoutError}</Alert>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                            disabled={channel === "ONLINE" && isGuestSelfBooking}
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
                </fieldset>

                <fieldset className="space-y-4">
                    <legend className={compact ? "sr-only" : "mb-4 text-xl font-bold"}>
                        Stay details
                    </legend>
                    {fixedRoom ? (
                        <div>
                            <p className="font-bold">Room</p>
                            {roomsLoading ? (
                                <LoadingState label="Checking room in the hotel system…" className="mt-2 py-4" />
                            ) : roomsError ? (
                                <Alert variant="danger" className="mt-2">
                                    Unable to load rooms: {roomsError}
                                </Alert>
                            ) : (
                                <p className="mt-1">
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
                                            {availableApiRooms.map((room) => (
                                                <SelectItem
                                                    key={room.roomId}
                                                    value={String(room.roomId)}
                                                >
                                                    {backendRoomLabel(room)} (
                                                    {zar.format(room.pricePerNight)}/night)
                                                    {channel !== "ONLINE" &&
                                                        room.roomStatus === "OCCUPIED" &&
                                                        " · occupied today"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {roomsLoading && (
                                        <LoadingState label="Loading rooms from the hotel system…" className="py-4" />
                                    )}
                                    {roomsError && (
                                        <Alert variant="danger">
                                            Unable to load rooms: {roomsError}
                                        </Alert>
                                    )}
                                    {!roomsLoading &&
                                        !roomsError &&
                                        availableApiRooms.length === 0 && (
                                            <Alert variant="warning">
                                                No rooms are currently marked available. Please
                                                contact the hotel.
                                            </Alert>
                                        )}
                                    {initialStay?.guests && initialStay.guests > 1 && (
                                        <p className="text-muted-foreground">
                                            Showing rooms for {initialStay.guests} guests.
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="checkInDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Check-in date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            min={today}
                                            {...field}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                // Clear a check-out that is no longer after check-in.
                                                const checkOut = form.getValues("checkOutDate");
                                                if (checkOut && checkOut <= event.target.value) {
                                                    form.setValue("checkOutDate", "");
                                                }
                                            }}
                                        />
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
                                        <Input type="date" min={minCheckOut} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </fieldset>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                        roomsLoading ||
                        Boolean(roomsError) ||
                        savingStaffBooking ||
                        (channel === "ONLINE" &&
                            (session?.role !== "USER" ||
                                Boolean(fixedRoom && fixedRoomUnavailable)))
                    }
                >
                    {channel === "ONLINE"
                        ? "Review booking"
                        : savingStaffBooking
                          ? "Saving booking…"
                          : "Confirm booking"}
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
/** yyyy-MM-dd of the day after `isoDate` (local calendar, no timezone drift). */
function nextDay(isoDate: string) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return localIsoDate(new Date(y, m - 1, d + 1));
}
