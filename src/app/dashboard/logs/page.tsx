
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { supabase } from "@/lib/supabase/client";
import type { AuditLog } from "@/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      // Fetch logs from the audit.log table
      const { data, error } = await supabase
        .from("log")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Error fetching audit logs:", error);
      } else {
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          payload: log.payload,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(formattedLogs);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
        <p className="text-muted-foreground">
          Acompanhe os eventos importantes que acontecem no sistema.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={logs} />
        </CardContent>
      </Card>
    </div>
  );
}

    