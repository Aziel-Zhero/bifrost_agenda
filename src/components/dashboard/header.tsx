
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  LogOut,
  Settings,
  PanelLeft,
  User,
  Building,
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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
          const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

          if (error) {
              console.error("Error fetching user profile:", error);
              // Set a fallback user if profile doesn't exist yet
              setCurrentUser({
                id: user.id,
                name: user.email?.split('@')[0] || 'Usuário',
                email: user.email || 'Não encontrado',
                role: 'Midgard', // Default role
                permissions: {}
              });
          } else {
              setCurrentUser(profile);
          }
      } else {
         // Fallback for logged out state or initial load
          setCurrentUser({
            id: 'fallback-id',
            name: 'Visitante',
            email: '',
            role: 'Midgard',
            permissions: {}
          });
      }
    };
    fetchUser();
  }, []);

  const visibleMenuItems = currentUser 
    ? menuItems.filter(item => currentUser.permissions[item.href] || currentUser.role === 'Heimdall' || currentUser.role === 'Bifrost')
    : [];

  if (!currentUser) {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-cyan-400 to-purple-500 px-4 md:px-6">
            {/* Render a loading state or a skeleton header */}
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 md:px-6">
      <div className="flex w-full items-center gap-6">
        <div className="flex items-center gap-6">
          <Logo isHeader />
          <div className="hidden md:block">
            <Nav currentUser={currentUser} />
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden hover:bg-white/10">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
             <div className="mb-4">
                <Logo />
              </div>
            <nav className="grid gap-6 text-lg font-medium">
              {visibleMenuItems.map((item) => (
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
        
        <div className="flex flex-1 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full hover:bg-white/10 focus-visible:ring-white">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/32/32" alt={currentUser.name} data-ai-hint="person" />
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
               <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/dashboard/perfil-studio">
                    <Building className="mr-2 h-4 w-4" />
                    Perfil do Studio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
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
