"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  INVOICE_STATUSES,
  invoiceFormDefaultValues,
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice-schema";
import {
  createInvoice,
  updateInvoice,
  type Invoice,
} from "@/lib/api/invoice";

export interface InvoiceFormProps {
  /** When provided, the form edits this invoice instead of creating a new one. */
  invoice?: Invoice;
  /** Called after a successful create or update. */
  onSuccess?: (invoice: Invoice) => void;
  /** Hide extra spacing when embedded inside a dialog. */
  compact?: boolean;
}

/**
 * Create or edit an invoice. Mirrors the layout/validation pattern used by
 * BookingForm, but — unlike that form — this one talks to a real, live
 * backend (see lib/api/invoice.ts), so it surfaces real submit errors
 * rather than mocking a response.
 *
 * Per the backend contract, UpdateInvoiceRequest only allows changing
 * `status` and `totalAmount` — reference/issueDate/bookingId are fixed
 * after creation, so those fields are disabled (not hidden) in edit mode.
 */
export function InvoiceForm({ invoice, onSuccess, compact }: InvoiceFormProps) {
  const isEditing = Boolean(invoice);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          reference: invoice.reference,
          totalAmount: invoice.totalAmount,
          status: invoice.status,
          issueDate: invoice.issueDate,
          bookingId: invoice.bookingId,
        }
      : invoiceFormDefaultValues,
  });

  async function onSubmit(values: InvoiceFormValues) {
    setSubmitting(true);
    setError(null);
    try {
      let result: Invoice;
      if (isEditing && invoice) {
        result = await updateInvoice(invoice.invoiceId, {
          status: values.status,
          totalAmount: values.totalAmount,
        });
      } else {
        result = await createInvoice({
          reference: values.reference,
          totalAmount: values.totalAmount,
          status: values.status,
          issueDate: values.issueDate,
          bookingId: values.bookingId,
        });
        form.reset(invoiceFormDefaultValues);
      }
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input {...field} disabled={isEditing} />
              </FormControl>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Reference can&apos;t be changed after creation.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking ID</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isEditing} />
              </FormControl>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Booking link can&apos;t be changed after creation.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INVOICE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "PAID" ? "Paid" : "Pending"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isEditing} />
              </FormControl>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Issue date can&apos;t be changed after creation.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className={compact ? "w-full" : ""} disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Save changes" : "Create invoice"}
        </Button>
      </form>
    </Form>
  );
}