import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAdminDate } from "@/lib/date-format";

const demoStats = {
  totalBookings: 47,
  guestsCurrentlyStaying: 12,
  pendingInvoices: 5,
  totalRevenue: 84250.00,
};

const recentBookings = [
  { guest: 'Thabo Nkosi', room: '204', checkIn: '2026-08-14', channel: 'ONLINE' },
  { guest: 'Sarah van der Merwe', room: '112', checkIn: '2026-08-13', channel: 'WALK_IN' },
  { guest: 'James Okafor', room: '308', checkIn: '2026-08-13', channel: 'TELEPHONIC' },
  { guest: 'Lindiwe Dlamini', room: '101', checkIn: '2026-08-12', channel: 'ONLINE' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-3xl font-bold">{demoStats.totalBookings}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Guests Currently Staying</p>
          <p className="text-3xl font-bold">{demoStats.guestsCurrentlyStaying}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Invoices</p>
          <p className="text-3xl font-bold">{demoStats.pendingInvoices}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Revenue (This Month)</p>
          <p className="text-3xl font-bold">R{demoStats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Recent Bookings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Channel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBookings.map((booking) => (
            <TableRow key={`${booking.guest}-${booking.checkIn}`}>
              <TableCell>{booking.guest}</TableCell>
              <TableCell>{booking.room}</TableCell>
              <TableCell>{formatAdminDate(booking.checkIn)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{booking.channel}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}