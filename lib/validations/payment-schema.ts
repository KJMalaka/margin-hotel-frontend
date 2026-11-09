import { z } from "zod";

// Front-end only: the card fields exist so the payment step feels real for
// the demo. The full card number is never sent to the backend - only the
// brand and last four digits are kept for the confirmation and receipt.

export const PAYMENT_METHODS = ["CARD", "APPLE_PAY", "GOOGLE_PAY"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "Card",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "CARD";

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "Amex",
  CARD: "Card",
};

// Test cards for the demo (same numbers the big payment providers use).
export const TEST_CARD_SUCCESS = "4242 4242 4242 4242";
export const TEST_CARD_DECLINED = "4000 0000 0000 0002";

export interface SimulatedPaymentDetails {
  method: PaymentMethod;
  brand: CardBrand;
  last4: string;
  cardholderName?: string;
  /** True when the declined test card was used - the step fails on purpose. */
  simulateDecline: boolean;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = digitsOnly(cardNumber);
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  return "CARD";
}

/** "4242424242424242" -> "4242 4242 4242 4242" while the guest types. */
export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "0829" -> "08/29" while the guest types. */
export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// Luhn checksum - catches typos the same way a real checkout would.
function passesLuhn(cardNumber: string) {
  const digits = digitsOnly(cardNumber);
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function isFutureExpiry(expiry: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  // A card is valid until the end of its expiry month.
  return year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const cardPaymentSchema = z.object({
  cardholderName: z
    .string()
    .trim()
    .min(2, "Enter the name shown on the card"),
  cardNumber: z
    .string()
    .refine((value) => digitsOnly(value).length === 16, "Card number must be 16 digits")
    .refine(passesLuhn, "This card number is not valid"),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Use the format MM/YY")
    .refine(isFutureExpiry, "This card has expired"),
  cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits"),
  saveCard: z.boolean(),
});

export type CardPaymentValues = z.infer<typeof cardPaymentSchema>;

export const cardPaymentDefaultValues: CardPaymentValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  saveCard: false,
};
