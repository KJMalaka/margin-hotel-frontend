import { api } from "@/lib/api/axios";
import type { BookingChannel } from "@/lib/validations/booking-schema";

export interface CreateBookingGuest {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
}

export interface CreateBookingPayload {
  channel: BookingChannel;
  guest: CreateBookingGuest;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface BookingResponse {
  bookingId: number;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  channel: BookingChannel;
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<BookingResponse> {
  const response = await api.post<BookingResponse>("/booking/create", payload);
  return response.data;
}

export async function updateBooking(
  bookingId: number | string,
  payload: Partial<CreateBookingPayload>
): Promise<BookingResponse> {
  const response = await api.put<BookingResponse>(
    `/booking/update/${bookingId}`,
    payload
  );
  return response.data;
}