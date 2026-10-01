export interface NavItem {
  title: string;
  url: string;
  icon?: keyof typeof import('@/components/icons/icons').Icons;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/admin/dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Bookings', url: '/admin/bookings', icon: 'bookings' },
      { title: 'Payments', url: '/admin/payments', icon: 'payments' },
      { title: 'Invoices', url: '/admin/invoices', icon: 'invoices' },
    ],
  },
  {
    label: 'Management',
    items: [
      { title: 'Staff', url: '/admin/staff', icon: 'staff' },
    ],
  },
];