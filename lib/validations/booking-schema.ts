import { z } from "zod";

// Matches the BookingChannel enum assumed on the backend - see the
// contract notes in lib/api/booking.ts.
export const BOOKING_CHANNELS = ["ONLINE", "WALK_IN", "TELEPHONIC"] as const;
export type BookingChannel = (typeof BOOKING_CHANNELS)[number];

/** Today in the user's own timezone, as yyyy-MM-dd (the date input format). */
export function localIsoDate(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const bookingFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    contactNumber: z.string().min(10, "Enter a valid contact number"),
    roomId: z.string().min(1, "Select a room"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
  })
  // Local "today" as yyyy-MM-dd, compared at validation time.
  .refine((data) => data.checkInDate >= localIsoDate(), {
    message: "Check-in date can't be in the past",
    path: ["checkInDate"],
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const bookingFormDefaultValues: BookingFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  roomId: "",
  checkInDate: "",
  checkOutDate: "",
};
