import type { RoomOption } from "@/lib/api/rooms";

// Display label for each RoomOption["type"] value from the backend contract.
export const ROOM_TYPE_LABELS: Record<RoomOption["type"], string> = {
  STANDARD: "Standard Room",
  DELUXE: "Deluxe Room",
  SUITE: "Suite",
};

// The public room pages use this presentation data for descriptions and
// imagery. Guest booking options and prices are loaded from the backend room
// endpoint so bookings use database room IDs and current room status.
export interface Room extends RoomOption {
  capacity: number;
  imageUrl: string;
  description: string;
}

// Presentation-only demo content; this list is not used for guest checkout.
export const roomList: Room[] = [
  {
    roomId: "R001",
    roomNumber: 101,
    type: "STANDARD",
    pricePerNight: 1250,
    status: "AVAILABLE",
    capacity: 1,
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    description:
      "A cosy, well-lit room built for solo travellers. Enjoy a comfortable queen bed, a work desk, and everything you need for a relaxed stay in the heart of the city.",
  },
  {
    roomId: "R002",
    roomNumber: 102,
    type: "STANDARD",
    pricePerNight: 1650,
    status: "AVAILABLE",
    capacity: 2,
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
    description:
      "Ideal for couples or friends travelling together, this room pairs two plush beds with a bright sitting area and an en-suite bathroom.",
  },
  {
    roomId: "R003",
    roomNumber: 201,
    type: "DELUXE",
    pricePerNight: 2100,
    status: "AVAILABLE",
    capacity: 2,
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    description:
      "Upgraded linens, a private balcony, and extra space make this deluxe room a favourite for business travellers and couples alike.",
  },
  {
    roomId: "R004",
    roomNumber: 202,
    type: "DELUXE",
    pricePerNight: 2350,
    status: "OCCUPIED",
    capacity: 2,
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    description:
      "A spacious deluxe room with premium finishes, a soaking tub, and city views. Currently occupied - check back soon or browse our other rooms.",
  },
  {
    roomId: "R005",
    roomNumber: 301,
    type: "SUITE",
    pricePerNight: 3200,
    status: "AVAILABLE",
    capacity: 4,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description:
      "A generous two-room suite with a separate lounge, perfect for families. Sleeps up to four guests with space to spread out and relax together.",
  },
  {
    roomId: "R006",
    roomNumber: 501,
    type: "SUITE",
    pricePerNight: 7800,
    status: "OCCUPIED",
    capacity: 4,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description:
      "Our most luxurious suite, featuring a private lounge, dining area, and panoramic views. Currently unavailable - enquire about upcoming dates.",
  },
];

export function getRoomById(roomId: string): Room | undefined {
  return roomList.find((room) => room.roomId === roomId);
}
