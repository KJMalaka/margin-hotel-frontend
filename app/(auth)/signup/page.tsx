"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  checkEmailFormSchema,
  checkEmailFormDefaultValues,
  registerFormSchema,
  registerFormDefaultValues,
  type CheckEmailFormValues,
  type RegisterFormValues,
} from "@/lib/validations/auth-schema";
import { checkEmail, register } from "@/lib/api/auth";
import { saveSession } from "@/lib/auth/session";

type Step = "email" | "details";

// The backend returns plain-text error bodies (e.g. "An account with this
// email already exists"), so read err.response.data directly.
function getErrorMessage(err: unknown): string {
  if (isAxiosError(err) && typeof err.response?.data === "string") {
    return err.response.data;
  }
  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [returningGuest, setReturningGuest] = useState(false);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm<CheckEmailFormValues>({
    resolver: zodResolver(checkEmailFormSchema),
    defaultValues: checkEmailFormDefaultValues,
  });

  const detailsForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: registerFormDefaultValues,
  });

  async function onCheckEmail(values: CheckEmailFormValues) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await checkEmail(values.email);
      setEmail(values.email);
      setReturningGuest(result.emailExists);
      setLastVisitDate(result.lastVisitDate);
      setStep("details");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onRegister(values: RegisterFormValues) {
    setSubmitting(true);
    setError(null);
    try {
      // confirmPassword is frontend-only, so send the fields explicitly.
      const result = await register({
        email,
        firstName: values.firstName,
        lastName: values.lastName,
        mobile: values.mobile,
        password: values.password,
      });
      saveSession({
        ...result,
        firstName: values.firstName,
        lastName: values.lastName,
        mobile: values.mobile,
      });
      // Public signup always creates a USER account.
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function goBackToEmail() {
    setError(null);
    setStep("email");
  }

  const formattedLastVisit = lastVisitDate
    ? new Date(`${lastVisitDate}T00:00:00`).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AuthShell
      title="Create an account"
      description={
        step === "email"
          ? "Enter your email to get started."
          : "Tell us a little about yourself."
      }
    >

        {step === "email" && (
          <Form {...emailForm}>
            <form
              method="post"
              noValidate
              onSubmit={emailForm.handleSubmit(onCheckEmail)}
              className="space-y-5"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <Alert variant="danger">{error}</Alert>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Checking..." : "Continue"}
              </Button>
            </form>
          </Form>
        )}

        {step === "details" && (
          <Form {...detailsForm}>
            <form
              method="post"
              noValidate
              onSubmit={detailsForm.handleSubmit(onRegister)}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md bg-muted px-3 py-2">
                <span className="min-w-0 break-all">
                  Creating an account for <strong>{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={goBackToEmail}
                  className="inline-flex min-h-tap shrink-0 items-center font-bold text-primary underline underline-offset-4 hover:no-underline"
                >
                  Change
                </button>
              </div>

              {returningGuest && (
                <Alert variant="info" title="Welcome back!">
                  {formattedLastVisit
                    ? ` Your last stay with us was on ${formattedLastVisit}.`
                    : ""}{" "}
                  The details you enter below will update your guest record.
                </Alert>
              )}

              <FormField
                control={detailsForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <Alert variant="danger">{error}</Alert>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        )}

        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="inline-flex min-h-tap items-center font-bold text-primary underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </Link>
        </p>
    </AuthShell>
  );
}