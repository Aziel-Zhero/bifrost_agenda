
"use client";

import { useState } from "react";
import { Upload, Download, Calendar as CalendarIcon } from "lucide-react";
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
import { appointments, clients } from "@/lib/mock-data";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import type { AppointmentReport } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const appointmentReports: AppointmentReport[] = appointments
    .filter(appt => appt.status !== 'Bloqueado')
    .map(appt => {
      const client = clients.find(c => c.name === appt.clientName);
      return {
        ...appt,
        whatsapp: client?.whatsapp || 'N/A',
        telegram: client?.telegram || 'N/A'
      }
    });
  
  const filteredAppointments = appointmentReports.filter(appt => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) return true;
    if (dateRange.from && dateRange.to) {
        return appt.dateTime >= dateRange.from && appt.dateTime <= dateRange.to;
    }
    if (dateRange.from) {
        return appt.dateTime >= dateRange.from;
    }
    if (dateRange.to) {
        return appt.dateTime <= dateRange.to;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize todos os agendamentos cadastrados no sistema.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
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
          <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
          </Button>
          <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
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
