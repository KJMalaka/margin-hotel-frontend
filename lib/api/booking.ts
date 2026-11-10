import { api } from "@/lib/api/axios";
import type { BookingChannel } from "@/lib/validations/booking-schema";

export interface CreateBookingPayload {
  bookingChannel: BookingChannel;
  guestId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface BookingResponse {
  bookingId: number;
  guestId: number | string;
  roomId: number | string;
  checkInDate: string;
  checkOutDate: string;
  channel: BookingChannel;
}

interface BookingDto {
  bookingId: number;
  guestId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  bookingChannel: BookingChannel;
  /** Sent by GET /booking/getall and /booking/read. */
  bookingDate?: string;
  roomNumber?: number;
}

/** A booking as listed for staff (GET /booking/getall). */
export interface BookingRecord {
  bookingId: number;
  guestId: number;
  roomId: number;
  roomNumber?: number;
  bookingDate?: string;
  checkInDate: string;
  checkOutDate: string;
  channel: BookingChannel;
}

function mapBooking(dto: BookingDto): BookingResponse {
  return {
    bookingId: dto.bookingId,
    guestId: dto.guestId,
    roomId: dto.roomId,
    checkInDate: dto.checkInDate,
    checkOutDate: dto.checkOutDate,
    channel: dto.bookingChannel,
  };
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<BookingResponse> {
  const response = await api.post<BookingDto>("/booking/create", payload);
  return mapBooking(response.data);
}

export async function updateBooking(
  bookingId: number | string,
  payload: Partial<CreateBookingPayload>
): Promise<BookingResponse> {
  const response = await api.put<BookingDto>(
    `/booking/update/${bookingId}`,
    payload
  );
  return mapBooking(response.data);
}
/** Every booking in the system - staff only (RECEPTIONIST / ADMIN). */
export async function getBookings(): Promise<BookingRecord[]> {
  const response = await api.get<BookingDto[]>("/booking/getall");
  return response.data.map((dto) => ({
    bookingId: dto.bookingId,
    guestId: dto.guestId,
    roomId: dto.roomId,
    roomNumber: dto.roomNumber,
    bookingDate: dto.bookingDate,
    checkInDate: dto.checkInDate,
    checkOutDate: dto.checkOutDate,
    channel: dto.bookingChannel,
  }));
}
