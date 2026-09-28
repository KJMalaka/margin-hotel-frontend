import { z } from "zod";

// Matches the InvoiceStatus enum on the backend (InvoiceController /findByStatus).
export const INVOICE_STATUSES = ["PENDING", "PAID"] as const;
export type InvoiceStatusValue = (typeof INVOICE_STATUSES)[number];

export const invoiceFormSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  totalAmount: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  status: z.enum(INVOICE_STATUSES),
  issueDate: z.string().min(1, "Issue date is required"),
  bookingId: z.coerce
    .number({ invalid_type_error: "Enter a valid booking ID" })
    .int("Booking ID must be a whole number")
    .positive("Enter a valid booking ID"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const invoiceFormDefaultValues: InvoiceFormValues = {
  reference: "",
  totalAmount: 0,
  status: "PENDING",
  issueDate: new Date().toISOString().slice(0, 10),
  bookingId: 0,
};