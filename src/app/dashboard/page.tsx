
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  isSameDay,
  isSameWeek,
  isSameMonth,
  parseISO,
} from "date-fns";
import {
  Card,
  CardContent,
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
import type { Appointment, AppointmentStatus, StudioProfile } from "@/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

type Period = "day" | "week" | "month";

export default function DashboardRedirectPage() {
  const [period, setPeriod] = useState<Period>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [studioName, setStudioName] = useState("");
  const [userName, setUserName] = useState("Usuário");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch user's name
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        setUserName(profile?.name || user.email?.split('@')[0] || 'Usuário');

        // Fetch appointments for the current user
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select(`
            id,
            date_time,
            notes,
            status,
            clients ( name ),
            services ( name )
          `)
          .eq('admin_id', user.id);

        if (appointmentError) {
          console.error("Error fetching appointments:", appointmentError);
        } else {
          setAppointments(appointmentData as any[] || []);
        }
      }

       // Fetch studio profile name
      const { data: studioData, error: studioError } = await supabase
        .from('studio_profile')
        .select('studio_name')
        .eq('id', 1)
        .single();
      
      if (studioData && studioData.studio_name) {
          setStudioName(studioData.studio_name);
      } else if (studioError) {
          console.log("Could not fetch studio name, using default. Error: ", studioError.message);
      }
    };

    fetchUserData();
  }, []);

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
      .filter((appt) => appt.date_time && checkFunction(parseISO(appt.date_time)))
      .sort((a, b) => parseISO(a.date_time).getTime() - parseISO(b.date_time).getTime());
  }, [period, appointments]);

  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "status-agendado",
    Realizado: "status-realizado",
    Cancelado: "status-cancelado",
    Bloqueado: "status-bloqueado",
    Reagendado: 'status-reagendado',
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
  
  const welcomeMessage = `Olá, ${userName}${studioName ? ` ${studioName}` : ''}!`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
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
                 {period !== 'day' && <TableHead>Data</TableHead>}
                 {period === 'day' && <TableHead>Observações</TableHead>}
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      {parseISO(appt.date_time).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{appt.clients?.name || 'N/A'}</TableCell>
                    <TableCell>{appt.services?.name || appt.notes}</TableCell>
                     {period !== 'day' && (
                        <TableCell>
                            {parseISO(appt.date_time).toLocaleDateString("pt-BR")}
                        </TableCell>
                    )}
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
                  <TableCell colSpan={5} className="h-24 text-center">
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
