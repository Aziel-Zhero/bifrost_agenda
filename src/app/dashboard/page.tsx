"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { appointments } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardRedirectPage() {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setToday(new Date());
  }, []);

  const todayAppointments = appointments.filter(
    (appt) =>
      appt.dateTime.getDate() === today.getDate() &&
      appt.dateTime.getMonth() === today.getMonth() &&
      appt.dateTime.getFullYear() === today.getFullYear()
  );

  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "bg-blue-100 text-blue-800",
    Realizado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
    Bloqueado: "bg-gray-200 text-gray-800",
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home - Make-off do Dia</h1>
          <p className="text-muted-foreground">
            Acompanhe os agendamentos de hoje:{" "}
            {today.toLocaleDateString("pt-BR", {
              dateStyle: "long",
            })}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {todayAppointments.length > 0 ? (
          todayAppointments
            .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
            .map((appt: Appointment) => (
              <Card key={appt.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  {appt.status !== 'Bloqueado' && (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={appt.clientAvatarUrl} alt={appt.clientName} data-ai-hint="person" />
                      <AvatarFallback>{appt.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold">
                      {appt.clientName}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {appt.dateTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{appt.notes}</p>
                   <Badge
                      variant="outline"
                      className={cn("w-full justify-center border-none text-xs", statusVariant[appt.status])}
                    >
                      {appt.status}
                    </Badge>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-20">
             <Card className="max-w-md mx-auto">
              <CardContent className="p-10">
                <p className="text-lg">Nenhum agendamento para hoje.</p>
                <p>Aproveite o dia para planejar a semana!</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
