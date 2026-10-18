import { apiFetch } from "@/lib/api/client";

export type ApiRoomType = "SINGLE" | "DOUBLE" | "SUITE";
export type ApiRoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

// Shape returned by GET /room/all.
export interface ApiRoom {
  roomId: number;
  roomNumber: number;
  roomType: ApiRoomType;
  pricePerNight: number;
  roomStatus: ApiRoomStatus;
}

// Presentation-only room shape used by the public room pages.
export interface RoomOption {
  roomId: string;
  roomNumber: number;
  type: "STANDARD" | "DELUXE" | "SUITE";
  pricePerNight: number;
  status: "AVAILABLE" | "OCCUPIED";
}

export function getRooms() {
  return apiFetch<ApiRoom[]>("/room/all");
}
