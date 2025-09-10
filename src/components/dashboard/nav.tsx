
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  CalendarDays,
  BookText,
  Contact,
  ClipboardList,
  Globe,
  Users2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

export const menuItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/meus-clientes", label: "Meus Clientes", icon: Contact },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/agenda-geral", label: "Agenda Geral", icon: Globe },
  { href: "/dashboard/servicos", label: "Serviços", icon: ClipboardList },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users2 },
  { href: "/dashboard/dashboards", label: "Dashboards", icon: LayoutDashboard },
  { href: "/dashboard/relatorios", label: "Histórico", icon: BookText },
  { href: "/dashboard/logs", label: "Logs", icon: ShieldCheck },
];

interface NavProps {
  currentUser: UserProfile;
}

export default function Nav({ currentUser }: NavProps) {
  const pathname = usePathname();
  
  const visibleMenuItems = menuItems.filter(item => {
    // Heimdall and Bifrost see everything
    if (currentUser.role === 'Heimdall' || currentUser.role === 'Bifrost') {
      return true;
    }
    // For other roles, check permissions. If a permission is explicitly false, hide it. Otherwise, show.
    return currentUser.permissions[item.href] !== false;
  });

  return (
    <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {visibleMenuItems.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                "flex items-center gap-2 transition-colors hover:text-white",
                pathname === item.href
                ? "text-white"
                : "text-white/70"
            )}
            >
            <item.icon className="h-5 w-5" />
            {item.label}
            </Link>
        ))}
    </nav>
  );
}
