"use client";

import { useState, useMemo } from "react";
import {
  isSameDay,
  isSameWeek,
  isSameMonth,
  startOfDay,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { appointments } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";

type Period = "day" | "week" | "month";

export default function DashboardRedirectPage() {
  const [period, setPeriod] = useState<Period>("day");
  const today = useMemo(() => new Date(), []);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let checkFunction: (date: Date) => boolean;

    switch (period) {
      case "week":
        checkFunction = (date) => isSameWeek(date, now, { weekStartsOn: 1 });
        break;
      case "month":
        checkFunction = (date) => isSameMonth(date, now);
        break;
      case "day":
      default:
        checkFunction = (date) => isSameDay(date, now);
        break;
    }
    
    return appointments
      .filter((appt) => checkFunction(appt.dateTime))
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }, [period]);

  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "bg-blue-100 text-blue-800",
    Realizado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
    Bloqueado: "bg-gray-200 text-gray-800",
  };

  const getPeriodTitle = () => {
    switch (period) {
      case 'day':
        return `Agendamentos para hoje, ${today.toLocaleDateString("pt-BR", { dateStyle: "long" })}`;
      case 'week':
        return "Agendamentos da semana";
      case 'month':
        return "Agendamentos do mês";
      default:
        return "Agendamentos";
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Make-off do Período</h1>
          <p className="text-muted-foreground">{getPeriodTitle()}</p>
        </div>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="day">Hoje</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                 {period === 'day' && <TableHead>Observações</TableHead>}
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      {appt.dateTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{appt.clientName}</TableCell>
                    <TableCell>{appt.notes}</TableCell>
                     {period === 'day' && <TableCell>{appt.notes}</TableCell>}
                    <TableCell className="text-right">
                       <Badge
                        variant="outline"
                        className={cn("border-none text-xs", statusVariant[appt.status])}
                      >
                        {appt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={period === 'day' ? 5 : 4} className="h-24 text-center">
                    Nenhum agendamento para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
