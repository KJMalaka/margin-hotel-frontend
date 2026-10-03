import { z } from "zod";

/* ---------- Login ---------- */

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginFormDefaultValues: LoginFormValues = {
  email: "",
  password: "",
};

/* ---------- Signup step 1: check email ---------- */

export const checkEmailFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type CheckEmailFormValues = z.infer<typeof checkEmailFormSchema>;

export const checkEmailFormDefaultValues: CheckEmailFormValues = {
  email: "",
};

/* ---------- Signup step 2: registration details ---------- */
// The email is carried over from step 1, so it is not a field here.
// Rules mirror the backend (AuthService.validate): names required,
// mobile exactly 10 digits, password at least 8 characters.
// confirmPassword is frontend-only and is not sent to the backend.

export const registerFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const registerFormDefaultValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};
