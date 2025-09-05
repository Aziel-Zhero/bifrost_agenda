"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Client } from "@/types";

export const columns: ColumnDef<Client>[] = [
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
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{client.name}</span>
            <span className="text-sm text-muted-foreground">{client.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "whatsapp",
    header: "WhatsApp",
  },
  {
    accessorKey: "admin",
    header: "Usuário Designado"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(client.id)}
              >
                Copiar ID do cliente
              </DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
