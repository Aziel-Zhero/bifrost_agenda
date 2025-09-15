
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import type { AuditLog } from "@/types";
import { getAuditLogs } from "../usuarios/actions";
import { useToast } from "@/hooks/use-toast";


export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await getAuditLogs();

      if (error) {
        toast({
          title: "Erro ao buscar logs",
          description: "Não foi possível carregar os logs de auditoria. " + error.message,
          variant: "destructive",
        });
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [toast]);

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
          {loading ? (
             <div className="flex justify-center items-center h-48">
                <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
