'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatAdminDate } from '@/lib/date-format';
import { AddInvoiceDialog } from '@/components/invoice/add-invoice-dialog';
import { EditInvoiceDialog } from '@/components/invoice/edit-invoice-dialog';
import {
  Invoice,
  InvoiceStatus,
  getInvoices,
  findInvoicesByStatus,
  deleteInvoice,
} from '@/lib/api/invoice';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Invoice[] = statusFilter
        ? await findInvoicesByStatus(statusFilter)
        : await getInvoices();

      if (dateFilter) {
        data = data.filter((inv) => inv.issueDate === dateFilter);
      }

      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  async function handleDelete(invoice: Invoice) {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.reference}? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(invoice.invoiceId);
    try {
      await deleteInvoice(invoice.invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.invoiceId !== invoice.invoiceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="All invoices, filterable by status and issue date."
        actions={<AddInvoiceDialog onInvoiceCreated={() => fetchInvoices()} />}
        className="mb-0"
      />

      {/* Filters */}
      <div
        role="group"
        aria-label="Filter invoices"
        className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invoice-status" className="text-base font-bold">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus)}
          >
            <SelectTrigger id="invoice-status" className="lg:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="invoice-date" className="text-base font-bold">Issue date</label>
          <Input
            id="invoice-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="lg:w-44"
          />
        </div>

        {(statusFilter || dateFilter) && (
          <Button
            variant="secondary"
            className="sm:justify-self-start"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* States */}
      {loading && <LoadingState label="Loading invoices…" />}
      {error && (
        <ErrorState
          title="Invoices could not be loaded"
          message={error}
          onRetry={() => fetchInvoices()}
        />
      )}

      {!loading && !error && invoices.length === 0 && (
        <EmptyState
          title="No invoices found"
          description="Try clearing the filters, or use Add invoice to create one."
        />
      )}

      {!loading && !error && invoices.length > 0 && (
        <Table label="Invoices">
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell data-label="Reference" className="font-bold">{invoice.reference}</TableCell>
                  <TableCell data-label="Booking ID" className="tabular-nums">{invoice.bookingId}</TableCell>
                  <TableCell data-label="Status">
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell data-label="Issue date" className="whitespace-nowrap">{formatAdminDate(invoice.issueDate)}</TableCell>
                  <TableCell data-label="Amount" className="text-right font-bold tabular-nums">
                    R{invoice.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell data-label="Actions" className="text-right">
                    <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                      <EditInvoiceDialog
                        invoice={invoice}
                        onInvoiceUpdated={(updated) =>
                          setInvoices((prev) =>
                            prev.map((inv) =>
                              inv.invoiceId === updated.invoiceId ? updated : inv
                            )
                          )
                        }
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(invoice)}
                        disabled={deletingId === invoice.invoiceId}
                      >
                        <Trash2 aria-hidden />
                        {deletingId === invoice.invoiceId ? "Deleting…" : "Delete"}
                        <span className="sr-only">invoice {invoice.reference}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}