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

      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
        </DialogHeader>

        <InvoiceForm compact onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}