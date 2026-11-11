import { z } from "zod";

export const accountFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;