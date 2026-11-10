"use client";

import { useState } from "react";

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

interface AddInvoiceDialogProps {
  /** Called after the invoice is created successfully, before the dialog closes. */
  onInvoiceCreated?: (invoice: Invoice) => void;
}

/**
 * "Add Invoice" button that opens the create form in a modal, matching
 * the AddBookingDialog pattern used elsewhere in the admin portal.
 */
export function AddInvoiceDialog({ onInvoiceCreated }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSuccess(invoice: Invoice) {
    onInvoiceCreated?.(invoice);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold">Add Invoice</Button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-background"
        closeButtonClassName="!fixed !right-4 !top-4 !z-[60] !flex !h-11 !w-11 items-center justify-center rounded-full border border-gold bg-navy text-gold opacity-100 shadow-lg hover:bg-gold hover:text-navy-midnight focus:ring-gold"
        className="!inset-0 !left-0 !top-0 !h-dvh !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 !grid-cols-1 !gap-0 !rounded-none !border-0 !p-0 !shadow-none overflow-y-auto bg-background text-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-h-full items-start justify-center px-3 pb-8 pt-20 sm:px-8 sm:pb-12">
          <div className="w-full max-w-3xl border border-gold/70 bg-background p-4 text-foreground sm:p-8">
            <DialogHeader className="mb-6 pr-12">
              <DialogTitle className="font-display text-3xl">New invoice</DialogTitle>
            </DialogHeader>

            <InvoiceForm compact onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}