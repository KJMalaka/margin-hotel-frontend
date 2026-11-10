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

      <DialogContent
        overlayClassName="bg-background"
        closeButtonClassName="!fixed !right-4 !top-4 !z-[60] !flex !h-11 !w-11 items-center justify-center rounded-full border border-gold bg-navy text-gold opacity-100 shadow-lg hover:bg-gold hover:text-navy-midnight focus:ring-gold"
        className="!inset-0 !left-0 !top-0 !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !grid-cols-1 !gap-0 !rounded-none !border-0 !p-0 !shadow-none overflow-y-auto bg-background text-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12">
          <div className="w-full max-w-3xl border border-gold/70 bg-background p-4 text-foreground sm:p-8">
            <DialogHeader className="mb-6 pr-12">
              <DialogTitle className="font-display text-3xl">
                Edit invoice {invoice.reference}
              </DialogTitle>
            </DialogHeader>

            <InvoiceForm invoice={invoice} compact onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}