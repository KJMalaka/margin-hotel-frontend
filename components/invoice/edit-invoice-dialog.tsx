"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import type { Invoice } from "@/lib/api/invoice";

interface EditInvoiceDialogProps {
  invoice: Invoice;
  /** Called after the invoice is updated successfully, before the dialog closes. */
  onInvoiceUpdated?: (invoice: Invoice) => void;
}

/**
 * Per-row "Edit" button that opens InvoiceForm pre-filled with the given
 * invoice, in edit mode (status/amount only, per the backend contract).
 */
export function EditInvoiceDialog({ invoice, onInvoiceUpdated }: EditInvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSuccess(updated: Invoice) {
    onInvoiceUpdated?.(updated);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Edit invoice ${invoice.reference}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit invoice {invoice.reference}</DialogTitle>
        </DialogHeader>

        <InvoiceForm invoice={invoice} compact onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}