'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { CircleAlert, Pencil, Search, Trash2, Users } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteGuest, getGuests, updateGuest, type Guest } from '@/lib/api/guest';
import { getBookings } from '@/lib/api/booking';

// Same rules as GuestService on the backend, so most mistakes are caught before saving.
const guestFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

type GuestRow = Guest & { bookings: number };

/** The backend sends rule messages (400 / 409) as plain text - show them as-is. */
function backendMessage(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const body: unknown = err.response?.data;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }
  return fallback;
}

function Field({
  htmlFor,
  label,
  error,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="flex items-start gap-1.5 font-bold text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState<GuestRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
  });

  // Guests plus their booking count, so staff can see who has history before deleting.
  async function loadGuests() {
    try {
      const [guestData, bookingData] = await Promise.all([getGuests(), getBookings()]);
      const counts = new Map<number, number>();
      for (const booking of bookingData) {
        counts.set(booking.guestId, (counts.get(booking.guestId) ?? 0) + 1);
      }
      setGuests(
        guestData
          .map((guest) => ({ ...guest, bookings: counts.get(guest.guestId) ?? 0 }))
          .sort((a, b) => a.guestId - b.guestId)
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load guests. Is the backend running on http://localhost:8080?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function openEditForm(guest: GuestRow) {
    setEditing(guest);
    setSubmitError(null);
    setNotice(null);
    reset({
      firstName: guest.firstName,
      middleName: guest.middleName ?? '',
      lastName: guest.lastName,
      email: guest.email,
      mobile: guest.mobile,
    });
  }

  function closeForm() {
    setEditing(null);
    setSubmitError(null);
    reset();
  }

  async function onSubmit(values: GuestFormValues) {
    if (!editing) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateGuest({ guestId: editing.guestId, ...values });
      setNotice(`${values.firstName} ${values.lastName}'s details were updated.`);
      closeForm();
      await loadGuests();
    } catch (err) {
      console.error(err);
      // 409 = a guest rule, e.g. the email belongs to an online account or another guest.
      setSubmitError(
        backendMessage(err, 'Could not save. Check the backend is running and try again.')
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(guest: GuestRow) {
    const confirmed = window.confirm(
      `Delete ${guest.firstName} ${guest.lastName}? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(guest.guestId);
    setDeleteError(null);
    setNotice(null);
    try {
      await deleteGuest(guest.guestId);
      setNotice(`${guest.firstName} ${guest.lastName} was deleted.`);
      await loadGuests();
    } catch (err) {
      console.error(err);
      // 409 = the guest has bookings or an online account, so the record is kept.
      setDeleteError(
        backendMessage(err, 'Could not delete. The guest may not exist, or the backend is unreachable.')
      );
    } finally {
      setDeletingId(null);
    }
  }

  const header = (
    <PageHeader
      title="Guests"
      description="Everyone who has booked at Margin Hotel. Guests are added automatically when they book."
      className="mb-0"
    />
  );

  if (loading || error) {
    return (
      <div className="space-y-8">
        {header}
        {loading ? (
          <LoadingState label="Loading guests…" />
        ) : (
          <ErrorState
            title="Guests could not be loaded"
            message={error ?? ''}
            onRetry={() => loadGuests()}
          />
        )}
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const visibleGuests = query
    ? guests.filter((guest) =>
        [guest.firstName, guest.middleName ?? '', guest.lastName, guest.email]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : guests;
  const withBookings = guests.filter((guest) => guest.bookings > 0).length;

  return (
    <div className="space-y-6">
      {header}

      <dl className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-lg border bg-card p-4">
          <dt className="text-sm text-muted-foreground">Total guests</dt>
          <dd className="text-2xl font-bold tabular-nums">{guests.length}</dd>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <dt className="text-sm text-muted-foreground">With bookings</dt>
          <dd className="text-2xl font-bold tabular-nums">{withBookings}</dd>
        </div>
      </dl>

      {notice && <Alert variant="success">{notice}</Alert>}
      {deleteError && (
        <Alert variant="danger" title="This guest can't be deleted">
          {deleteError}
        </Alert>
      )}

      <div className="max-w-md space-y-2">
        <Label htmlFor="guest-search">Search guests</Label>
        <div className="relative">
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="guest-search"
            type="search"
            placeholder="Search by name or email"
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Guests appear here after they book on the website or are booked at the front desk."
        />
      ) : (
        <Table label="Guests">
          <TableHeader>
            <TableRow>
              <TableHead>Guest ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleGuests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No guests match &ldquo;{search}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              visibleGuests.map((guest) => (
                <TableRow key={guest.guestId}>
                  <TableCell data-label="Guest ID" className="tabular-nums">{guest.guestId}</TableCell>
                  <TableCell data-label="Name" className="font-bold">
                    {guest.firstName} {guest.middleName ? `${guest.middleName} ` : ''}{guest.lastName}
                  </TableCell>
                  <TableCell data-label="Email" className="break-all">{guest.email}</TableCell>
                  <TableCell data-label="Mobile" className="whitespace-nowrap tabular-nums">{guest.mobile}</TableCell>
                  <TableCell data-label="Bookings" className="tabular-nums">{guest.bookings}</TableCell>
                  <TableCell data-label="Actions">
                    <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                      <Button variant="secondary" size="sm" onClick={() => openEditForm(guest)}>
                        <Pencil aria-hidden />
                        Edit
                        <span className="sr-only">{guest.firstName} {guest.lastName}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === guest.guestId}
                        onClick={() => handleDelete(guest)}
                      >
                        <Trash2 aria-hidden />
                        {deletingId === guest.guestId ? 'Deleting…' : 'Delete'}
                        <span className="sr-only">{guest.firstName} {guest.lastName}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {visibleGuests.length} of {guests.length} guests. New guests are created from the
        booking form, not here.
      </p>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit guest</DialogTitle>
            <DialogDescription>
              {editing &&
                `Guest #${editing.guestId} · ${editing.bookings} ${editing.bookings === 1 ? 'booking' : 'bookings'}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field htmlFor="firstName" label="First name" error={errors.firstName?.message}>
                <Input id="firstName" autoComplete="off" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'firstName-error' : undefined} {...register('firstName')} />
              </Field>
              <Field htmlFor="middleName" label="Middle name" error={errors.middleName?.message}>
                <Input id="middleName" autoComplete="off" placeholder="Optional" {...register('middleName')} />
              </Field>
              <Field htmlFor="lastName" label="Last name" error={errors.lastName?.message}>
                <Input id="lastName" autoComplete="off" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'lastName-error' : undefined} {...register('lastName')} />
              </Field>
            </div>

            <Field
              htmlFor="email"
              label="Email"
              error={errors.email?.message}
              hint="If this guest has an online account, only they can change this email."
            >
              <Input id="email" type="email" autoComplete="off" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
            </Field>

            <Field htmlFor="mobile" label="Mobile number" error={errors.mobile?.message}>
              <Input id="mobile" type="tel" inputMode="numeric" autoComplete="off" aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? 'mobile-error' : undefined} {...register('mobile')} />
            </Field>

            {submitError && <Alert variant="danger">{submitError}</Alert>}

            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
