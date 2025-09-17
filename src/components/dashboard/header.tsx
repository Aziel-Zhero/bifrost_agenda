
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  LogOut,
  PanelLeft,
  Users,
  Shield,
  Building,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Nav, { menuItems } from "./nav";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import { useNotifications } from "@/contexts/notification-context";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
          const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
              console.error("Error fetching user profile:", error);
              // Set a fallback user if profile doesn't exist yet but auth user does
              setCurrentUser({
                id: user.id,
                name: user.email?.split('@')[0] || 'Usuário',
                email: user.email || 'Não encontrado',
                role: 'Asgard', // Default role
                permissions: {}
              });
          } else if (profile) {
              // On first login via invite, role might be null in DB, use default 'Asgard'
              if (!profile.role) {
                profile.role = 'Asgard';
              }
              setCurrentUser(profile);
          } else {
             // Profile not found, create a temporary one for display
             setCurrentUser({
                id: user.id,
                name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuário',
                email: user.email || 'Não encontrado',
                role: 'Asgard',
                permissions: {},
              });
          }
      }
    };
    fetchUser();
  }, []);
  
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const hasPermission = (href: string) => {
    if (!currentUser) return false;
    const isAdmin = currentUser.role === 'Heimdall' || currentUser.role === 'Bifrost';
    
    if (isAdmin) return true;

    return currentUser.permissions[href] === true;
  };
  
  const visibleNavItems = menuItems.filter(item => hasPermission(item.href));
  
  const userDropdownItems = [
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
  ];

  const handleNotificationClick = (notificationId: string, href?: string) => {
    markAsRead(notificationId);
    if(href) {
        router.push(href);
    }
  }


  if (!currentUser) {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-center gap-4 border-b bg-gradient-to-r from-cyan-400 to-purple-500 px-4 md:px-6">
             <div className="h-6 w-24 animate-pulse rounded-md bg-white/20" />
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 md:px-6">
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between w-full">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 hover:bg-white/10">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Abrir menu de navegação</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="menu-glass p-0 text-white border-none"
          >
             <SheetHeader className="p-6">
                <SheetTitle className="sr-only">Menu Principal</SheetTitle>
             </SheetHeader>
             <div className="mb-4 px-6">
                <Logo isHeader title="Bifrost" />
              </div>
            <nav className="grid gap-6 text-lg font-medium p-6">
              {[...visibleNavItems, ...userDropdownItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white",
                    pathname === item.href && "bg-white/10 text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="absolute left-1/2 -translate-x-1/2">
             <Logo isHeader title="Bifrost" />
        </div>
        
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />}
                    <span className="sr-only">Notificações</span>
                </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                    <DropdownMenuItem key={notif.id} onClick={() => handleNotificationClick(notif.id, notif.href)} className={cn("flex items-start gap-2", !notif.read && "font-bold")}>
                        <div className="flex-shrink-0 pt-1">
                           {!notif.read && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm leading-tight">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: ptBR })}
                            </p>
                        </div>
                    </DropdownMenuItem>
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full hover:bg-white/10 focus-visible:ring-white">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} data-ai-hint="person" />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
               {userDropdownItems.map(item => (
                 <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
               ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => supabase.auth.signOut()} asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex w-full items-center gap-6">
        <div className="flex items-center gap-6">
          <Logo isHeader title="Bifrost" />
          <Nav currentUser={currentUser} navItems={visibleNavItems} />
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />}
                    <span className="sr-only">Notificações</span>
                </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                    <DropdownMenuItem key={notif.id} onSelect={() => handleNotificationClick(notif.id, notif.href)} className={cn("flex items-start gap-2 cursor-pointer", !notif.read && "font-semibold")}>
                        <div className="flex-shrink-0 pt-1">
                           {!notif.read && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm leading-tight">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: ptBR })}
                            </p>
                        </div>
                    </DropdownMenuItem>
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>
                )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full hover:bg-white/10 focus-visible:ring-white">
                <Avatar>
                  <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} data-ai-hint="person" />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userDropdownItems.map(item => (
                 <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
               ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => supabase.auth.signOut()} asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
    

    
