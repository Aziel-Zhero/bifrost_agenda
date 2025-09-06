
"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import OverviewChart from "@/components/dashboard/overview-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointments, services, kpiIcons } from "@/lib/mock-data";
import { User, Calendar as CalendarIcon } from "lucide-react";
import type { Client } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';

type ClientRanking = {
  clientName: string;
  count: number;
};

type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
};

export default function DashboardPage() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const filteredAppointments = useMemo(() => {
    if (!dateRange?.from) return [];
    const from = dateRange.from;
    const to = dateRange.to || from; // if no 'to', use 'from'
    
    return appointments.filter(appt => 
      isWithinInterval(appt.dateTime, { start: startOfDay(from), end: endOfDay(to) })
    );
  }, [dateRange]);

  const kpiData: Kpi[] = useMemo(() => {
    const completedInPeriod = filteredAppointments.filter(a => a.status === 'Realizado');
    const totalGains = completedInPeriod.reduce((sum, appt) => {
      const service = services.find(s => s.id === appt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    const totalCancellations = filteredAppointments.filter(a => a.status === 'Cancelado').length;
    
    const uniqueClientNames = new Set(appointments.map(a => a.clientName));
    const totalClients = uniqueClientNames.size;

    return [
      {
        title: "Ganhos (Período)",
        value: `R$ ${totalGains.toFixed(2)}`,
        icon: kpiIcons.gains,
      },
      {
        title: "Cancelamentos",
        value: `${totalCancellations}`,
        icon: kpiIcons.cancellations,
      },
      {
        title: "Clientes",
        value: `${totalClients}`,
        icon: kpiIcons.clients,
      },
      {
        title: "Novos Clientes (Mês)",
        value: "8",
        icon: kpiIcons.newClients,
        change: "+20%",
      },
    ]

  }, [filteredAppointments]);


  const getTopClients = (): ClientRanking[] => {
    const clientCounts = appointments
      .filter(appt => appt.status === 'Realizado')
      .reduce((acc, appt) => {
        acc[appt.clientName] = (acc[appt.clientName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(clientCounts)
      .map(([clientName, count]) => ({ clientName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };
  
  const topClients = getTopClients();

  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meu Dashboard</h1>
          <p className="text-muted-foreground">
            Suas métricas e visão geral do desempenho.
          </p>
        </div>
         <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
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
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <StatsCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            change={kpi.change}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Sua produtividade nos últimos meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-8">
             <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>Quem mais marcou presença até o momento.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Agendamentos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((client) => (
                      <TableRow key={client.clientName}>
                        <TableCell>
                           <div className="flex items-center gap-3">
                             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="font-medium">{client.clientName}</p>
                           </div>
                        </TableCell>
                         <TableCell className="text-right">
                           <span className="font-bold text-lg">{client.count}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
