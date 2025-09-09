
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "@/types";

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.original.timestamp).toLocaleString("pt-BR");
    },
  },
  {
    id: "affectedUser", // Explicit ID for the column
    accessorKey: "payload.record.email",
    header: "Usuário Afetado",
    cell: ({ row }) => {
      const email = row.original.payload.record?.email || "N/A";
      return (
        <div className="flex items-center gap-2">
          <span>{email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "payload.message",
    header: "Ação Realizada",
     cell: ({ row }) => {
        const message = row.original.payload?.message || "Ação desconhecida";
        const action = message.split(' ')[0]; // e.g., "User" from "User deleted"
        const isDelete = action.toLowerCase().includes('delete');
        return (
            <div className="flex items-center gap-2">
                <Info className={isDelete ? "text-destructive" : "text-muted-foreground"} />
                <span>{message}</span>
            </div>
        )
     }
  },
];
