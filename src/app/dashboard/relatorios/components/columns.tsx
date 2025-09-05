"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, User } from "lucide-react";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

import { Button } from "@/components/ui/button";

import type { AppointmentReport } from "@/types";

export const columns: ColumnDef<AppointmentReport>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.clientName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "whatsapp",
    header: "WhatsApp",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FaWhatsapp className="text-green-500" />
          {row.original.whatsapp}
        </div>
      );
    },
  },
    {
    accessorKey: "telegram",
    header: "Telegram",
    cell: ({ row }) => {
      const telegram = row.original.telegram;
      if (!telegram) return "N/A";
      return (
        <div className="flex items-center gap-2">
          <FaTelegram className="text-blue-500" />
          {telegram}
        </div>
      );
    },
  },
  {
    accessorKey: "dateTime",
    header: "Data Agendada",
     cell: ({ row }) => {
      return row.original.dateTime.toLocaleDateString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    }
  },
  {
    accessorKey: "notes",
    header: "Serviço"
  },
  {
    accessorKey: "admin",
    header: "Agendado por"
  },
];
