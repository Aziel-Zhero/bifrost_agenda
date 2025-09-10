
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
import type { AuditLog } from "@/types";

// Mock data to prevent app from crashing due to Supabase permissions.
// This should be replaced with a secure server-side fetch when environment is ready.
const getMockLogs = (): AuditLog[] => [
    {
        id: '1',
        payload: {
            message: 'User created',
            record: { email: 'new.user@example.com' }
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
        id: '2',
        payload: {
            message: 'User deleted',
            record: { email: 'old.user@example.com' }
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
     {
        id: '3',
        payload: {
            message: 'Client inserted',
            record: { email: 'client1@example.com' }
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
];


export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Using mock data because the audit.log table in Supabase's audit schema
    // is not accessible from the client-side by default due to RLS policies.
    // This avoids the "Error fetching audit logs" error.
    setLogs(getMockLogs());
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
