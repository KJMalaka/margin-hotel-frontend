"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSameMonth, isValid, parseISO } from "date-fns";
import { ArrowRight, BedDouble, CalendarCheck, Receipt, Wallet, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge, formatStatus } from "@/components/ui/status-badge";
import { ErrorState, LoadingState, EmptyState } from "@/components/ui/state";
import { PageHeader } from "@/components/admin/page-header";
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
import { getInvoices, type Invoice } from "@/lib/api/invoice";
import { getPayments, type Payment } from "@/lib/api/payment";

const zar = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

interface DashboardData {
  bookings: BookingRow[];
  /** null = that list couldn't be loaded; the stat shows "Unavailable". */
  invoices: Invoice[] | null;
  payments: Payment[] | null;
}

function paidThisMonth(payments: Payment[], now = new Date()) {
  return payments
    .filter((p) => p.paymentStatus === "SUCCESS")
    .filter((p) => {
      const date = parseISO(p.paymentDate);
      return isValid(date) && isSameMonth(date, now);
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setData(null);
    setError(null);
    try {
      // Bookings are required; invoices and payments only feed two stats.
      const [bookings, invoices, payments] = await Promise.all([
        loadBookingRows(),
        getInvoices().catch(() => null),
        getPayments().catch(() => null),
      ]);
      setData({ bookings, invoices, payments });
    } catch (err) {
      setError(loadErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const header = <PageHeader title="Dashboard" description="Today at a glance, from the live hotel system." />;

  if (error) {
    return (
      <div>
        {header}
        <ErrorState title="Dashboard could not be loaded" message={error} onRetry={load} />
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        {header}
        <LoadingState label="Loading dashboard…" />
      </div>
    );
  }

  const staying = new Set(
    data.bookings.filter((b) => b.status === "CHECKED_IN").map((b) => b.guestId ?? b.bookingId)
  ).size;

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Total bookings", value: String(data.bookings.length), icon: CalendarCheck },
    { label: "Guests currently staying", value: String(staying), icon: BedDouble },
    {
      label: "Pending invoices",
      value: data.invoices ? String(data.invoices.filter((i) => i.status === "PENDING").length) : "Unavailable",
      icon: Receipt,
    },
    {
      label: "Paid this month",
      value: data.payments ? zar.format(paidThisMonth(data.payments)) : "Unavailable",
      icon: Wallet,
    },
  ];

  const recent = data.bookings.slice(0, 5);

  return (
    <div>
      {header}

      <ul className="mb-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <li key={label} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-info-bg text-info">
              <Icon aria-hidden className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold tabular-nums">{value}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl">Recent bookings</h2>
        <Link href="/admin/bookings" className={buttonVariants({ variant: "view", size: "sm" })}>
          View all bookings
          <ArrowRight aria-hidden />
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Bookings made on the website or at the front desk will appear here."
        />
      ) : (
        <Table label="Recent bookings">
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Stay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((booking) => (
              <TableRow key={booking.bookingId}>
                <TableCell data-label="Guest" className="font-bold">{booking.guestName}</TableCell>
                <TableCell data-label="Room">{booking.room}</TableCell>
                <TableCell data-label="Check-in" className="whitespace-nowrap">{formatAdminDate(booking.checkInDate)}</TableCell>
                <TableCell data-label="Channel">
                  <Badge variant="secondary">{formatStatus(booking.channel)}</Badge>
                </TableCell>
                <TableCell data-label="Stay">
                  <StatusBadge status={booking.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
