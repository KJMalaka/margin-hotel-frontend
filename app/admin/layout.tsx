import AppSidebar from '@/components/admin/layout/app-sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "RECEPTIONIST"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur sm:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <span className="text-lg font-bold">Margin Hotel management</span>
          </header>
          {/* SidebarInset is the <main> landmark; this is the skip-link target. */}
          <div id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 sm:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}