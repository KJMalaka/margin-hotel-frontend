"use client";

import { useEffect, useState } from "react";
import { getPayments, type Payment } from "@/lib/api/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StatusFilter = "ALL" | "SUCCESS" | "FAILED";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  if (loading) return <p>Loading Payments...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Keep a payment only if it passes BOTH the status chip and the search box
  const visiblePayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === "ALL" || payment.paymentStatus === statusFilter;
    const matchesSearch = (payment.invoiceReference ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Counts shown on the chips, so staff see the totals at a glance
  const counts = {
    ALL: payments.length,
    SUCCESS: payments.filter((p) => p.paymentStatus === "SUCCESS").length,
    FAILED: payments.filter((p) => p.paymentStatus === "FAILED").length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <p className="mb-4">Payment activity across all invoices.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["ALL", "SUCCESS", "FAILED"] as StatusFilter[]).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={statusFilter === option ? "default" : "outline"}
              onClick={() => setStatusFilter(option)}
            >
              {option === "ALL"
                ? "All"
                : option === "SUCCESS"
                  ? "Success"
                  : "Failed"}{" "}
              ({counts[option]})
            </Button>
          ))}
        </div>

        <Input
          className="max-w-xs"
          placeholder="Search invoice reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-4">Payment ID</th>
            <th className="py-2 pr-4">Invoice ID</th>
            <th className="py-2 pr-4">Amount (ZAR)</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {/* Shown only when the filters leave nothing to display */}
          {visiblePayments.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-6 text-center text-muted-foreground"
              >
                No payments match your search.
              </td>
            </tr>
          )}

          {visiblePayments.map((payment) => (
            <tr key={payment.paymentId} className="border-b">
              <td className="py-2 pr-4">{payment.paymentId}</td>
              <td className="py-2 pr-4">{payment.invoiceReference}</td>
              <td className="py-2 pr-4">R{payment.amount.toFixed(2)}</td>
              <td className="py-2 pr-4">
                <span
                  className={
                    payment.paymentStatus === "SUCCESS"
                      ? "text-green-600"
                      : payment.paymentStatus === "FAILED"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }
                >
                  {payment.paymentStatus}
                </span>
              </td>
              <td className="py-2 pr-4">
                {new Date(payment.paymentDate).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
