
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Compass,
  FileText,
  Phone,
  User,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';


const AppLogo = () => (
    <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center">
            <svg
                className="w-6 h-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
            </svg>
        </div>
        <div>
            <h2 className="text-lg font-semibold text-foreground">Safety Travel</h2>
            <p className="text-xs text-muted-foreground">Women's Safety</p>
        </div>
    </div>
);

const NavMenu = () => {
  const pathname = usePathname();
  const menuItems = [
    { href: '/emergency', label: 'Emergency', icon: AlertTriangle },
    { href: '/find-route', label: 'Find Route', icon: Compass },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/contacts', label: 'Emergency Contacts', icon: Phone },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              className="group-data-[collapsible=icon]:justify-center"
            >
              <item.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">
                {item.label}
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};


const SafetyStatus = () => (
    <div className="rounded-lg bg-secondary/50 p-3">
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Status: Safe</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Last updated 2 min ago</p>
    </div>
);


export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex h-dvh bg-background">
            <Sidebar side="left" collapsible="icon" className="group-data-[collapsible=icon]:border-r">
                <SidebarHeader>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <AppLogo/>
                    </div>
                     <div className="hidden group-data-[collapsible=icon]:block mx-auto">
                        <svg
                            className="w-6 h-6 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                            d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <NavMenu/>
                </SidebarContent>
                <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                    <SafetyStatus/>
                </SidebarFooter>
            </Sidebar>

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    </SidebarProvider>
  );
}
