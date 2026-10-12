'use client';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navGroups } from '@/config/nav-config';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
import { Icons } from '@/components/icons/icons';
import { ToggleTheme } from '@/components/layout/toogle-theme';
import { clearSession, getSession, type AuthSession } from '@/lib/auth/session';
import { getAllManagers, getAllReceptionists } from '@/lib/api/staff';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameLoadError, setNameLoadError] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession || currentSession.role === 'USER') return;
    const staffSession = currentSession;

    async function loadName() {
      try {
        const staff =
          staffSession.role === 'ADMIN'
            ? await getAllManagers()
            : await getAllReceptionists();
        const user = staff.find(
          (member) => member.email.toLowerCase() === staffSession.email.toLowerCase()
        );

        if (user) {
          setDisplayName(`${user.firstName} ${user.lastName}`.trim());
        }
      } catch {
        setNameLoadError(true);
      }
    }

    loadName();
  }, []);

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4 px-4 py-3 font-bold'>
        Margin Hotel Admin
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible key={item.title} defaultOpen={item.isActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url}
                          className='group/collapsible'
                        >
                          {item.icon && <Icon />}
                          <span>{item.title}</span>
                          <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                <Link href={subItem.url} aria-label={subItem.title}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                      <Link href={item.url} aria-label={item.title}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className='group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4'>
        <SidebarMenu>
          {session && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={`${displayName || session.email} · ${session.role}`}
                className='h-auto min-h-12 cursor-default py-2'
                aria-label={`Logged in as ${displayName || session.email}, ${session.role}`}
              >
                <UserRound />
                <span className='flex min-w-0 flex-col items-start gap-0.5'>
                  <span className='max-w-full truncate font-medium'>
                    {displayName || session.email}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {session.role === 'ADMIN' ? 'Administrator' : 'Receptionist'}
                  </span>
                  {nameLoadError && (
                    <span className='text-xs text-destructive'>
                      Name unavailable
                    </span>
                  )}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <SidebarMenuItem>
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip='Log out'>
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </DialogTrigger>
            </SidebarMenuItem>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log out?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out of Margin Hotel Admin?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setLogoutDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant='destructive' onClick={handleLogout}>
                  Log out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarMenu>
        <ToggleTheme />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}