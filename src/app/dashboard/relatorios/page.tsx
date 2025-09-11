
"use client";

import { useState, useEffect } from "react";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import type { AppointmentReport } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function RelatoriosPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [appointmentReports, setAppointmentReports] = useState<AppointmentReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (*),
          services (*),
          profiles (name)
        `);

      if (error) {
        console.error("Error fetching reports:", error);
        return;
      }

      const reports: AppointmentReport[] = data.map((appt: any) => ({
        id: appt.id,
        clientName: appt.clients.name,
        dateTime: appt.date_time,
        notes: appt.services.name,
        status: appt.status,
        admin: appt.profiles.name,
        serviceId: appt.service_id,
        whatsapp: appt.clients.whatsapp,
        telegram: appt.clients.telegram,
        clientAvatarUrl: '', // This field is not used currently
        admin_id: appt.admin_id,
        client_id: appt.client_id,
        clients: appt.clients,
        services: appt.services,
      }));
      setAppointmentReports(reports);
    };

    fetchReports();
  }, []);
  
  const filteredAppointments = appointmentReports.filter(appt => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) return true;
    const apptDate = parseISO(appt.dateTime);
    const from = dateRange.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
    const to = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;
    
    if (from && to) {
        return apptDate >= from && apptDate <= to;
    }
    if (from) {
        return apptDate >= from;
    }
    if (to) {
        return apptDate <= to;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize e filtre todos os agendamentos do sistema.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[300px]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", {locale: ptBR})} -{" "}
                      {format(dateRange.to, "LLL dd, y", {locale: ptBR})}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", {locale: ptBR})
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Exportar Histórico
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={filteredAppointments} />
        </CardContent>
      </Card>
    </div>
  );
}
