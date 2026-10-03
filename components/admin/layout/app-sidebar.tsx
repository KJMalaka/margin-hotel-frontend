'use client';
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
import { LogOut } from 'lucide-react';
import { Icons } from '@/components/icons/icons';
import { ToggleTheme } from '@/components/layout/toogle-theme';
import { clearSession } from '@/lib/auth/session';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip='Log out' onClick={handleLogout}>
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <ToggleTheme />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}