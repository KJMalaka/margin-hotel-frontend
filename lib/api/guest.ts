import { api } from "@/lib/api/axios";
import type { AuthUserResponse } from "@/lib/api/auth";

export interface Guest {
  guestId: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  mobile: string;
}

export interface CreateGuestRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile: string;
}

export async function findGuestByEmail(email: string): Promise<Guest> {
  const response = await api.get<Guest>(
    `/guest/findByEmail/${encodeURIComponent(email)}`
  );
  return response.data;
}

export async function createGuest(data: CreateGuestRequest): Promise<Guest> {
  const response = await api.post<Guest>("/guest/create", data);
  return response.data;
}

/** Every guest - staff only (RECEPTIONIST / ADMIN). */
export async function getGuests(): Promise<Guest[]> {
  const response = await api.get<Guest[]>("/guest/getall");
  return response.data;
}

export interface UpdateGuestRequest extends CreateGuestRequest {
  guestId: number;
}

/** Edit a guest - staff only. 400 = invalid details, 409 = blocked by a guest rule. */
export async function updateGuest(data: UpdateGuestRequest): Promise<Guest> {
  const response = await api.put<Guest>("/guest/update", data);
  return response.data;
}

/** Delete a guest - staff only. 409 when the guest has bookings or an online account. */
export async function deleteGuest(guestId: number): Promise<void> {
  await api.delete(`/guest/delete/${guestId}`);
}

export interface UpdateContactRequest {
  email: string;
  mobile: string;
}

/**
 * The logged-in guest edits their own email and mobile (the name can't be changed).
 * 400 = invalid details, 409 = email already in use.
 * Returns a fresh token because the login email may have changed.
 */
export async function updateMyContact(
  data: UpdateContactRequest
): Promise<AuthUserResponse> {
  const response = await api.put<AuthUserResponse>("/account/contact", data);
  return response.data;
}