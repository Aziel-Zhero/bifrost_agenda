
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { User, Calendar as CalendarIcon, DollarSign, XCircle, Users, UserPlus } from "lucide-react";
import type { Appointment, Service } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase/client';

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

const kpiIcons = {
  gains: DollarSign,
  cancellations: XCircle,
  clients: Users,
  newClients: UserPlus,
};


export default function DashboardPage() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Appointments
      const { data: apptData, error: apptError } = await supabase.from('appointments').select(`*, clients(name)`);
      if (apptError) {
        console.error("Error fetching appointments", apptError);
      } else {
        const formattedAppointments = apptData.map((appt: any) => ({
          id: appt.id,
          clientName: appt.clients.name,
          clientAvatarUrl: '',
          dateTime: new Date(appt.date_time),
          notes: appt.notes || '',
          status: appt.status,
          admin: 'Admin Master',
          serviceId: appt.service_id,
        }));
        setAppointments(formattedAppointments);
      }

      // Fetch Services
      const { data: serviceData, error: serviceError } = await supabase.from('services').select('*');
      if (serviceError) console.error("Error fetching services", serviceError);
      else setServices(serviceData || []);
      
      // Fetch total clients count
      const { count, error: countError } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      if (countError) console.error("Error fetching clients count", countError);
      else setClientsCount(count || 0);
    };
    fetchData();
  }, []);


  const filteredAppointments = useMemo(() => {
    if (!dateRange?.from) return [];
    const from = dateRange.from;
    const to = dateRange.to || from; // if no 'to', use 'from'
    
    return appointments.filter(appt => 
      isWithinInterval(appt.dateTime, { start: startOfDay(from), end: endOfDay(to) })
    );
  }, [dateRange, appointments]);

  const kpiData: Kpi[] = useMemo(() => {
    const completedInPeriod = filteredAppointments.filter(a => a.status === 'Realizado');
    
    // Previous period for comparison
    const prevMonthDate = subMonths(dateRange?.from || new Date(), 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);
    
    const prevMonthAppointments = appointments.filter(appt => 
      isWithinInterval(appt.dateTime, { start: prevMonthStart, end: prevMonthEnd }) && appt.status === 'Realizado'
    );

    const totalGains = completedInPeriod.reduce((sum, appt) => {
      const service = services.find(s => s.id === appt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    const prevMonthGains = prevMonthAppointments.reduce((sum, appt) => {
        const service = services.find(s => s.id === appt.serviceId);
        return sum + (service?.price || 0);
    }, 0);

    const totalCancellations = filteredAppointments.filter(a => a.status === 'Cancelado').length;
    
    const totalClients = clientsCount;

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const percentageChange = ((current - previous) / previous) * 100;
        return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(0)}%`;
    }

    return [
      {
        title: "Ganhos (Período)",
        value: `R$ ${totalGains.toFixed(2)}`,
        icon: kpiIcons.gains,
        change: calculateChange(totalGains, prevMonthGains),
      },
      {
        title: "Cancelamentos",
        value: `${totalCancellations}`,
        icon: kpiIcons.cancellations,
        change: "+5%", // Mocked data
      },
      {
        title: "Clientes",
        value: `${totalClients}`,
        icon: kpiIcons.clients,
        change: "+2%", // Mocked data
      },
      {
        title: "Novos Clientes (Mês)",
        value: "8",
        icon: kpiIcons.newClients,
        change: "+20%", // Mocked data
      },
    ]

  }, [filteredAppointments, appointments, services, clientsCount, dateRange]);


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
