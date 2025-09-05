"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  CalendarDays,
  Users,
  BookText,
  Contact,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const menuItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/meus-clientes", label: "Meus Clientes", icon: Contact },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Lista de Clientes Geral", icon: Users },
  { href: "/dashboard/dashboards", label: "Dashboards", icon: LayoutDashboard },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BookText },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
