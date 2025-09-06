
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menuItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/meus-clientes", label: "Meus Clientes", icon: Contact },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/servicos", label: "Serviços", icon: ClipboardList },
  { href: "/dashboard/dashboards", label: "Dashboards", icon: LayoutDashboard },
  { href: "/dashboard/relatorios", label: "Histórico", icon: BookText },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {menuItems.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={cn(
                "flex items-center gap-2 transition-colors hover:text-foreground",
                pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
            >
            <item.icon className="h-5 w-5" />
            {item.label}
            </Link>
        ))}
    </nav>
  );
}
