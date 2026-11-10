import { isValid, parseISO } from "date-fns";
import { getBookings, type BookingRecord } from "@/lib/api/booking";
import { getGuests, type Guest } from "@/lib/api/guest";
import { getRooms, type ApiRoom } from "@/lib/api/rooms";
import type { BookingChannel } from "@/lib/validations/booking-schema";

/**
 * Where a stay is right now, worked out from its dates. The backend has no
 * booking status field, so this is date-based, not a record of check-in.
 */
export type StayStatus = "UPCOMING" | "CHECKED_IN" | "CHECKED_OUT";

export interface BookingRow {
  bookingId: number | string;
  guestId?: number;
  guestName: string;
  room: string;
  channel: BookingChannel;
  bookingDate?: string;
  checkInDate: string;
  checkOutDate: string;
  status: StayStatus;
}

const ROOM_TYPE: Record<ApiRoom["roomType"], string> = {
  SINGLE: "Single room",
  DOUBLE: "Double room",
  SUITE: "Suite",
};

function toDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function getStayStatus(checkIn: string, checkOut: string, now = new Date()): StayStatus {
  const start = toDate(checkIn);
  const end = toDate(checkOut);
  if (end && end <= now) return "CHECKED_OUT";
  if (start && start <= now) return "CHECKED_IN";
  return "UPCOMING";
}

function guestName(guest: Guest | undefined, guestId: number) {
  if (!guest) return `Guest #${guestId}`;
  return [guest.firstName, guest.middleName, guest.lastName].filter(Boolean).join(" ");
}

function roomLabel(booking: BookingRecord, room: ApiRoom | undefined) {
  const number = room?.roomNumber ?? booking.roomNumber;
  const type = room ? ` · ${ROOM_TYPE[room.roomType]}` : "";
  return number !== undefined ? `Room ${number}${type}` : `Room #${booking.roomId}`;
}

/** Newest first: by booking date when the API sends one, then by ID. */
function newestFirst(a: BookingRecord, b: BookingRecord) {
  const byDate = (b.bookingDate ?? "").localeCompare(a.bookingDate ?? "");
  return byDate !== 0 ? byDate : b.bookingId - a.bookingId;
}

/**
 * Loads every booking with its guest's name and room. Guest and room lookups
 * are best-effort: if either list fails, rows still render with IDs.
 */
export async function loadBookingRows(): Promise<BookingRow[]> {
  const [bookings, guests, rooms] = await Promise.all([
    getBookings(),
    getGuests().catch(() => [] as Guest[]),
    getRooms().catch(() => [] as ApiRoom[]),
  ]);
  const guestById = new Map(guests.map((g) => [g.guestId, g]));
  const roomById = new Map(rooms.map((r) => [r.roomId, r]));

  return [...bookings].sort(newestFirst).map((b) => ({
    bookingId: b.bookingId,
    guestId: b.guestId,
    guestName: guestName(guestById.get(b.guestId), b.guestId),
    room: roomLabel(b, roomById.get(b.roomId)),
    channel: b.channel,
    bookingDate: b.bookingDate,
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate,
    status: getStayStatus(b.checkInDate, b.checkOutDate),
  }));
}

/** Readable message for a failed admin data load. */
export function loadErrorMessage(err: unknown) {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403) {
    return "Your session doesn't have access to bookings. Log out and sign in again as a receptionist or admin.";
  }
  if (!status) {
    return "Couldn't reach the hotel system. Check the backend is running and try again.";
  }
  return err instanceof Error ? err.message : "Something went wrong loading bookings.";
}
