"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  accountFormSchema,
  type AccountFormValues,
} from "@/lib/validations/account-schema";
import { findGuestByEmail, updateMyContact, type Guest } from "@/lib/api/guest";
import { getSession, saveSession } from "@/lib/auth/session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { email: "", mobile: "" },
  });
  const { reset } = form;

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "USER") {
      router.replace("/admin/dashboard");
      return;
    }
    findGuestByEmail(session.email)
            .then((g) => {
        setGuest(g);
        reset({ email: g.email, mobile: g.mobile });
        // The login response has no name, so keep it in the session for the navbar.
        if (!session.firstName || !session.lastName) {
          saveSession({
            ...session,
            firstName: g.firstName,
            lastName: g.lastName,
            mobile: g.mobile,
          });
        }
      })
      .catch(() =>
        setLoadError("We couldn't load your details. Please try again.")
      );
  }, [router, reset]);

  async function onSubmit(values: AccountFormValues) {
    if (!guest) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateMyContact(values);
      // The login email may have changed, so the old token is now stale.
      saveSession({
        jwtToken: result.jwtToken,
        email: result.email,
        role: result.role,
        firstName: guest.firstName,
        lastName: guest.lastName,
        mobile: values.mobile,
      });
      setGuest({ ...guest, email: result.email, mobile: values.mobile });
      reset({ email: result.email, mobile: values.mobile });
      setSaved(true);
    } catch (err) {
      // The backend returns plain-text error bodies (400 / 409).
      if (isAxiosError(err) && typeof err.response?.data === "string") {
        setError(err.response.data);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fullName = guest
    ? [guest.firstName, guest.middleName, guest.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <AuthShell
      title="My account"
      description="Update how the hotel can reach you."
    >
      {loadError && <Alert variant="danger">{loadError}</Alert>}
      {!guest && !loadError && (
        <p className="text-muted-foreground">Loading your details...</p>
      )}

      {guest && (
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={fullName}
                readOnly
                aria-describedby="account-name-help"
                className="cursor-not-allowed bg-muted"
              />
              <p id="account-name-help" className="text-muted-foreground">
                Your name can only be changed by hotel staff. Please contact
                the front desk.
              </p>
            </div>

            <FormField
              control={form.control}
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

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <Alert variant="danger">{error}</Alert>}
            {saved && (
              <Alert variant="success">Your details have been updated.</Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || !form.formState.isDirty}
            >
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Form>
      )}

      <Button asChild variant="ghost" className="w-full">
        <Link href="/">
          <ArrowLeft aria-hidden className="size-5" />
          Back to home
        </Link>
      </Button>
    </AuthShell>
  );
}