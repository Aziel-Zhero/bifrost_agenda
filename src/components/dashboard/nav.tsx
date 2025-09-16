
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
  User,
  Building,
  Bot,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

export const menuItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard/clientes", label: "Clientes", icon: Contact },
  { href: "/dashboard/servicos", label: "Serviços", icon: ClipboardList },
  { href: "/dashboard/agenda-geral", label: "Agenda Geral", icon: Globe },
  { href: "/dashboard/perfil-studio", label: "Perfil do Studio", icon: Building },
  { href: "/dashboard/dashboards", label: "Dashboards", icon: LayoutDashboard },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BookText },
  { href: "/dashboard/usuarios", label: "Usuários", icon: Users2 },
  { href: "/dashboard/permissoes", label: "Permissões", icon: Shield },
  { href: "/dashboard/bots", label: "Bots", icon: Bot },
  { href: "/dashboard/logs", label: "Logs", icon: ShieldCheck },
];

interface NavProps {
  currentUser: UserProfile;
  navItems: typeof menuItems;
}

export default function Nav({ currentUser, navItems }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {navItems.map((item) => (
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
