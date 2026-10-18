import { api } from "@/lib/api/axios";

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
