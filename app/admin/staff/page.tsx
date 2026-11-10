'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlert, Pencil, Plus, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { ErrorState, LoadingState } from '@/components/ui/state';
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
import {
  getAllManagers,
  getAllReceptionists,
  createManager,
  createReceptionist,
  updateManager,
  updateReceptionist,
  deleteManager,
  deleteReceptionist,
} from '@/lib/api/staff';
import { Manager, Receptionist } from '@/types/staff';

const staffFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  mobile: z.string().min(10, 'Enter a valid mobile number'),
  deskOrOffice: z.string().min(1, 'Required'),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;
type StaffType = 'manager' | 'receptionist';

// One shape for both tables: `extra` is the office number (managers) or desk number (receptionists).
type StaffRow = {
  staffId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  extra: string;
};

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
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

function StaffTable({
  rows,
  extraLabel,
  emptyText,
  deletingId,
  onEdit,
  onDelete,
}: {
  rows: StaffRow[];
  extraLabel: string;
  emptyText: string;
  deletingId: number | null;
  onEdit: (row: StaffRow) => void;
  onDelete: (row: StaffRow) => void;
}) {
  return (
    <Table label={`${extraLabel === 'Office' ? 'Managers' : 'Receptionists'}`}>
      <TableHeader>
        <TableRow>
          <TableHead>Staff ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>{extraLabel}</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.staffId}>
              <TableCell data-label="Staff ID" className="tabular-nums">{row.staffId}</TableCell>
              <TableCell data-label="Name" className="font-bold">
                {row.firstName} {row.lastName}
              </TableCell>
              <TableCell data-label="Email" className="break-all">{row.email}</TableCell>
              <TableCell data-label="Mobile" className="whitespace-nowrap tabular-nums">{row.mobile}</TableCell>
              <TableCell data-label={extraLabel}>{row.extra}</TableCell>
              <TableCell data-label="Actions">
                <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
                    <Pencil aria-hidden />
                    Edit
                    <span className="sr-only">{row.firstName} {row.lastName}</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === row.staffId}
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 aria-hidden />
                    {deletingId === row.staffId ? 'Deleting…' : 'Delete'}
                    <span className="sr-only">{row.firstName} {row.lastName}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function StaffPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpenFor, setFormOpenFor] = useState<StaffType | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
  });

  // Loading state is only the first load, so the page doesn't flash "Loading..." after every save or delete.
  async function loadStaff() {
    try {
      const [managerData, receptionistData] = await Promise.all([
        getAllManagers(),
        getAllReceptionists(),
      ]);
      setManagers(managerData);
      setReceptionists(receptionistData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load staff. Is the backend running on http://localhost:8080?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  function openCreateForm(type: StaffType) {
    setFormOpenFor(type);
    setEditingStaffId(null);
    setSubmitError(null);
    reset({ firstName: '', lastName: '', email: '', mobile: '', deskOrOffice: '' });
  }

  function openEditForm(type: StaffType, row: StaffRow) {
    setFormOpenFor(type);
    setEditingStaffId(row.staffId);
    setSubmitError(null);
    reset({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      mobile: row.mobile,
      deskOrOffice: row.extra,
    });
  }

  function closeForm() {
    setFormOpenFor(null);
    setEditingStaffId(null);
    setSubmitError(null);
    reset();
  }

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const base = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobile: values.mobile,
      };

      if (formOpenFor === 'manager') {
        const data = { ...base, officeNumber: values.deskOrOffice };
        if (editingStaffId === null) {
          await createManager(data);
        } else {
          await updateManager({ staffId: editingStaffId, ...data });
        }
      } else if (formOpenFor === 'receptionist') {
        const data = { ...base, deskNumber: values.deskOrOffice };
        if (editingStaffId === null) {
          await createReceptionist(data);
        } else {
          await updateReceptionist({ staffId: editingStaffId, ...data });
        }
      }

      closeForm();
      await loadStaff();
    } catch (err) {
      console.error(err);
      setSubmitError('Could not save. Check the backend is running and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(type: StaffType, row: StaffRow) {
    const confirmed = window.confirm(
      `Delete ${row.firstName} ${row.lastName}? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(row.staffId);
    setDeleteError(null);
    try {
      if (type === 'manager') {
        await deleteManager(row.staffId);
      } else {
        await deleteReceptionist(row.staffId);
      }
      await loadStaff();
    } catch (err) {
      console.error(err);
      setDeleteError('Could not delete. The record may not exist, or the backend is unreachable.');
    } finally {
      setDeletingId(null);
    }
  }

  const header = (
    <PageHeader
      title="Staff"
      description="Managers and receptionists who work at the hotel."
      className="mb-0"
    />
  );

  if (loading || error) {
    return (
      <div className="space-y-8">
        {header}
        {loading ? (
          <LoadingState label="Loading staff…" />
        ) : (
          <ErrorState
            title="Staff could not be loaded"
            message={error ?? ""}
            onRetry={() => loadStaff()}
          />
        )}
      </div>
    );
  }

  const managerRows: StaffRow[] = managers.map((m) => ({ ...m, extra: m.officeNumber }));
  const receptionistRows: StaffRow[] = receptionists.map((r) => ({ ...r, extra: r.deskNumber }));

  const isManagerForm = formOpenFor === 'manager';
  const isEditing = editingStaffId !== null;

  return (
    <div className="space-y-8">
      {header}

      {deleteError && <Alert variant="danger">{deleteError}</Alert>}

      <section aria-labelledby="managers-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="managers-title" className="text-2xl">Managers</h2>
          <Button onClick={() => openCreateForm('manager')}>
            <Plus aria-hidden />
            Add manager
          </Button>
        </div>
        <StaffTable
          rows={managerRows}
          extraLabel="Office"
          emptyText="No managers found."
          deletingId={deletingId}
          onEdit={(row) => openEditForm('manager', row)}
          onDelete={(row) => handleDelete('manager', row)}
        />
      </section>

      <section aria-labelledby="receptionists-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="receptionists-title" className="text-2xl">Receptionists</h2>
          <Button onClick={() => openCreateForm('receptionist')}>
            <Plus aria-hidden />
            Add receptionist
          </Button>
        </div>
        <StaffTable
          rows={receptionistRows}
          extraLabel="Desk"
          emptyText="No receptionists found."
          deletingId={deletingId}
          onEdit={(row) => openEditForm('receptionist', row)}
          onDelete={(row) => handleDelete('receptionist', row)}
        />
      </section>

      <Dialog
        open={formOpenFor !== null}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit' : 'New'} {isManagerForm ? 'manager' : 'receptionist'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the details below and save your changes.'
                : `Add a ${isManagerForm ? 'manager' : 'receptionist'} to the hotel's staff.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field htmlFor="firstName" label="First name" error={errors.firstName?.message}>
                <Input id="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "firstName-error" : undefined} {...register('firstName')} />
              </Field>
              <Field htmlFor="lastName" label="Last name" error={errors.lastName?.message}>
                <Input id="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "lastName-error" : undefined} {...register('lastName')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field htmlFor="email" label="Email" error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register('email')} />
              </Field>
              <Field htmlFor="mobile" label="Mobile number" error={errors.mobile?.message}>
                <Input id="mobile" type="tel" autoComplete="tel" aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? "mobile-error" : undefined} {...register('mobile')} />
              </Field>
            </div>

            <Field
              htmlFor="deskOrOffice"
              label={isManagerForm ? 'Office number' : 'Desk number'}
              error={errors.deskOrOffice?.message}
            >
              <Input
                id="deskOrOffice"
                aria-invalid={!!errors.deskOrOffice} aria-describedby={errors.deskOrOffice ? "deskOrOffice-error" : undefined}
                placeholder={isManagerForm ? 'e.g. OFF-101' : 'e.g. DESK-01'}
                {...register('deskOrOffice')}
              />
            </Field>

            {submitError && <Alert variant="danger">{submitError}</Alert>}

            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}