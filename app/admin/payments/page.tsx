"use client";

import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/api/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Payment activity across all invoices.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[160px]">
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
          <label htmlFor="payment-date" className="text-sm font-medium">
            Payment date
          </label>
          <Input
            id="payment-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="payment-search" className="text-sm font-medium">
            Invoice reference
          </label>
          <Input
            id="payment-search"
            className="w-[220px]"
            placeholder="Search reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {(statusFilter !== "ALL" || dateFilter || search) && (
          <Button
            variant="ghost"
            size="sm"
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

      {loading && (
        <p className="text-sm text-muted-foreground">Loading payments...</p>
      )}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && (
        <Table>
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
            {visiblePayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              visiblePayments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell>{payment.paymentId}</TableCell>
                  <TableCell>{payment.invoiceReference}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.paymentStatus === "FAILED"
                          ? "destructive"
                          : payment.paymentStatus === "PENDING"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {payment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    R{payment.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
