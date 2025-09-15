
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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


export default function Header() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

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
    
    // Admins can see everything
    if (isAdmin) return true;

    // For non-admins, they only see what is explicitly set to true.
    // If a permission is undefined or false, they don't have access.
    return currentUser.permissions[href] === true;
  };
  
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.href));
  
  // Separate profile-related items for the user dropdown
  const navMenuItems = visibleMenuItems.filter(item => item.href !== '/dashboard/perfil');
  
  // Create a separate list for what appears in the user's own profile dropdown menu.
  // All users should see "Meu Perfil". Admins see "Perfil do Studio".
  const userDropdownItems = [
    { href: "/dashboard/perfil", label: "Meu Perfil", icon: User },
  ];
  if (currentUser && (currentUser.role === 'Heimdall' || currentUser.role === 'Bifrost')) {
    userDropdownItems.push({ href: "/dashboard/perfil-studio", label: "Perfil do Studio", icon: Building });
    userDropdownItems.push({ href: "/dashboard/permissoes", label: "Permissões", icon: Shield });
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
          <SheetContent side="left">
             <SheetHeader>
                <SheetTitle className="sr-only">Menu Principal</SheetTitle>
             </SheetHeader>
             <div className="mb-4">
                <Logo />
              </div>
            <nav className="grid gap-6 text-lg font-medium">
              {[...visibleMenuItems, ...userDropdownItems.filter(item => item.href !== '/dashboard/perfil')].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-muted text-primary"
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
             <Logo isHeader />
        </div>
        
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
          </Button>
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
          <Logo isHeader />
          <Nav currentUser={currentUser} navItems={navMenuItems} />
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
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
