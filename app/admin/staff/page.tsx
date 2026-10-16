'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
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
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
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
    <Table>
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
            <TableCell colSpan={6} className="text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.staffId}>
              <TableCell>{row.staffId}</TableCell>
              <TableCell>
                {row.firstName} {row.lastName}
              </TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.mobile}</TableCell>
              <TableCell>{row.extra}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${row.firstName} ${row.lastName}`}
                    onClick={() => onEdit(row)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${row.firstName} ${row.lastName}`}
                    disabled={deletingId === row.staffId}
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading staff...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const managerRows: StaffRow[] = managers.map((m) => ({ ...m, extra: m.officeNumber }));
  const receptionistRows: StaffRow[] = receptionists.map((r) => ({ ...r, extra: r.deskNumber }));

  const isManagerForm = formOpenFor === 'manager';
  const isEditing = editingStaffId !== null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Staff</h1>
        <p className="text-sm text-muted-foreground">
          Managers and receptionists who work at the hotel.
        </p>
      </div>

      {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Managers</h2>
          <Button onClick={() => openCreateForm('manager')}>Add manager</Button>
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Receptionists</h2>
          <Button onClick={() => openCreateForm('receptionist')}>Add receptionist</Button>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field htmlFor="firstName" label="First name" error={errors.firstName?.message}>
                <Input id="firstName" {...register('firstName')} />
              </Field>
              <Field htmlFor="lastName" label="Last name" error={errors.lastName?.message}>
                <Input id="lastName" {...register('lastName')} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field htmlFor="email" label="Email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} />
              </Field>
              <Field htmlFor="mobile" label="Mobile number" error={errors.mobile?.message}>
                <Input id="mobile" type="tel" {...register('mobile')} />
              </Field>
            </div>

            <Field
              htmlFor="deskOrOffice"
              label={isManagerForm ? 'Office number' : 'Desk number'}
              error={errors.deskOrOffice?.message}
            >
              <Input
                id="deskOrOffice"
                placeholder={isManagerForm ? 'e.g. OFF-101' : 'e.g. DESK-01'}
                {...register('deskOrOffice')}
              />
            </Field>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}