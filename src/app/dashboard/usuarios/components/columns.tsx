
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User, Shield, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

const roleVariant: Record<string, string> = {
  owner: "bg-gradient-to-r from-cyan-400 to-purple-500 text-white",
  admin: "bg-yellow-400 text-yellow-900",
  staff: "bg-blue-500 text-white",
};

type ColumnsProps = {
  onEditPermissions: (user: UserProfile) => void;
  onEditRole: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  onReinvite: (user: UserProfile) => void;
};


export const columns = ({ onEditPermissions, onEditRole, onDelete, onReinvite }: ColumnsProps): ColumnDef<UserProfile>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
                 <span className="font-medium">{row.original.name}</span>
                 <span className="text-sm text-muted-foreground">{row.original.email}</span>
            </div>
        </div>
      );
    },
  },
   {
    accessorKey: "role",
    header: "Tipo de Acesso",
    cell: ({ row }) => {
        const role = row.original.role;
        return (
            <Badge variant="outline" className={cn("border-none text-xs capitalize", roleVariant[role])}>
                 <Shield className="mr-1 h-3 w-3"/>
                 {role}
            </Badge>
        )
    }
  },
  {
    accessorKey: 'last_sign_in_at',
    header: 'Status',
    cell: ({ row }) => {
      const lastSignIn = row.original.last_sign_in_at;
      return lastSignIn ? (
        <Badge variant="secondary">Ativo</Badge>
      ) : (
        <Badge variant="outline" className="text-amber-600 border-amber-500">Pendente</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const isPending = !user.last_sign_in_at;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {isPending && (
                <DropdownMenuItem onClick={() => onReinvite(user)}>
                    <Send className="mr-2 h-4 w-4"/>
                    Reenviar Convite
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEditRole(user)}>
                Alterar Tipo de Acesso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditPermissions(user)}>
                Editar Permissões
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user)}>
                Remover Usuário
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
