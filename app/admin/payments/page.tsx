"use client";

import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/api/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { PageHeader } from "@/components/admin/page-header";
import { formatAdminDateTime } from "@/lib/date-format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatusFilter = "ALL" | Payment["paymentStatus"];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const data = await getPayments();
        setPayments(data);
      } catch {
        setError("Unable to load payments.");
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  const visiblePayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === "ALL" || payment.paymentStatus === statusFilter;
    const matchesSearch = (payment.invoiceReference ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesDate =
      !dateFilter || payment.paymentDate.slice(0, 10) === dateFilter;
    return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Payment activity across all invoices."
        className="mb-0"
      />

      <div
        role="group"
        aria-label="Filter payments"
        className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="payment-status" className="text-base font-bold">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger id="payment-status" className="lg:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="payment-date" className="text-base font-bold">
            Payment date
          </label>
          <Input
            id="payment-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="lg:w-44"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="payment-search" className="text-base font-bold">
            Invoice reference
          </label>
          <Input
            id="payment-search"
            className="lg:w-56"
            placeholder="e.g. INV-1001"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {(statusFilter !== "ALL" || dateFilter || search) && (
          <Button
            variant="secondary"
            className="sm:justify-self-start"
            onClick={() => {
              setStatusFilter("ALL");
              setDateFilter("");
              setSearch("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading && <LoadingState label="Loading payments…" />}
      {error && <ErrorState title="Payments could not be loaded" message={error} />}

      {!loading && !error && visiblePayments.length === 0 && (
        <EmptyState
          title="No payments found"
          description="Try clearing the filters, or check back after guests pay."
        />
      )}

      {!loading && !error && visiblePayments.length > 0 && (
        <Table label="Payments">
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Invoice reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePayments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell data-label="Payment ID" className="tabular-nums">{payment.paymentId}</TableCell>
                  <TableCell data-label="Invoice reference" className="font-bold">{payment.invoiceReference}</TableCell>
                  <TableCell data-label="Status">
                    <StatusBadge status={payment.paymentStatus} />
                  </TableCell>
                  <TableCell data-label="Payment date" className="whitespace-nowrap">
                    {formatAdminDateTime(payment.paymentDate)}
                  </TableCell>
                  <TableCell data-label="Amount" className="text-right font-bold tabular-nums">
                    R{payment.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
