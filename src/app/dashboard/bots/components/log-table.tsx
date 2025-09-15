
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { GaiaLog } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusVariant: { [key: string]: string } = {
  Enviado: "bg-green-100 text-green-800",
  Falhou: "bg-red-100 text-red-800",
};

export default function GaiaLogTable() {
  const [logs, setLogs] = useState<GaiaLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("gaia_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching Gaia logs:", error);
      // You could show a toast here if you want
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Set up a polling mechanism to refresh logs every 30 seconds
    const interval = setInterval(() => {
      fetchLogs();
    }, 30000); // 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollArea className="h-72 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Enviado Para</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Carregando logs...
              </TableCell>
            </TableRow>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {new Date(log.created_at).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </TableCell>
                <TableCell className="max-w-xs truncate">{log.message_content}</TableCell>
                <TableCell>{log.sent_to}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-none text-xs",
                      log.status.startsWith("Enviado")
                        ? statusVariant["Enviado"]
                        : statusVariant["Falhou"]
                    )}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhuma notificação enviada ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
