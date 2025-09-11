
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
import { User, Calendar as CalendarIcon, DollarSign, XCircle, Users, UserPlus, CircleDollarSign, ShieldAlert } from "lucide-react";
import type { Appointment, Service } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, subMonths, parseISO, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase/client';
import { useMediaQuery } from '@/hooks/use-media-query';

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

type OverviewData = {
    name: string;
    total: number;
}

// Redefine the type to match the Supabase query result
type AppointmentWithDetails = Appointment & {
    clients: {
        name: string;
        created_at: string;
    } | null;
    services: Service | null;
}


const kpiIcons = {
  gains: DollarSign,
  losses: CircleDollarSign,
  cancellations: ShieldAlert,
  clients: Users,
  newClients: UserPlus,
};


export default function DashboardPage() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  });

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Appointments with nested client and service data
      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select(`*, clients ( name, created_at ), services ( * )`);
      
      if (apptError) {
        console.error("Error fetching appointments:", apptError.message);
      } else {
        setAppointments(apptData as any[] || []);
        
        // Extract unique services from the appointments
         const allServices = (apptData as any[]).map((appt: any) => appt.services).filter(Boolean);
         const uniqueServices = allServices.reduce((acc: Service[], current: Service) => {
            if (!acc.some(item => item.id === current.id)) {
                acc.push(current);
            }
            return acc;
        }, []);
        setServices(uniqueServices);
      }
    };
    fetchData();
  }, []);


  const filteredAppointments = useMemo(() => {
    if (!dateRange?.from) return [];
    const from = dateRange.from;
    const to = dateRange.to || from; // if no 'to', use 'from'
    
    return appointments.filter(appt => 
      isWithinInterval(parseISO(appt.dateTime), { start: startOfDay(from), end: endOfDay(to) })
    );
  }, [dateRange, appointments]);

  const kpiData: Kpi[] = useMemo(() => {
    const from = dateRange?.from;
    if (!from) return [];
    
    const completedInPeriod = filteredAppointments.filter(a => a.status === 'Realizado');
    const cancelledInPeriod = filteredAppointments.filter(a => a.status === 'Cancelado');

    const prevMonthDate = subMonths(from, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);
    
    const prevMonthAppointments = appointments.filter(appt => 
      isWithinInterval(parseISO(appt.dateTime), { start: prevMonthStart, end: prevMonthEnd }) && appt.status === 'Realizado'
    );

    const totalGains = completedInPeriod.reduce((sum, appt) => {
      return sum + (appt.services?.price || 0);
    }, 0);

    const totalLosses = cancelledInPeriod.reduce((sum, appt) => {
      return sum + (appt.services?.price || 0);
    }, 0);

    const prevMonthGains = prevMonthAppointments.reduce((sum, appt) => {
        return sum + (appt.services?.price || 0);
    }, 0);
    
    const totalClients = new Set(completedInPeriod.map(a => a.clients?.name)).size;
    
    const newClientsInPeriod = new Set(
        filteredAppointments
            .filter(appt => {
                if (!dateRange?.from || !appt.clients?.created_at) return false;
                const clientCreationDate = parseISO(appt.clients.created_at);
                const fromDate = startOfDay(dateRange.from);
                const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                return isWithinInterval(clientCreationDate, { start: fromDate, end: toDate });
            })
            .map(appt => appt.clients?.name)
    ).size;


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
        title: "Perdas (Cancelado)",
        value: `R$ ${totalLosses.toFixed(2)}`,
        icon: kpiIcons.losses,
      },
       {
        title: "Cancelamentos",
        value: `${cancelledInPeriod.length}`,
        icon: kpiIcons.cancellations,
      },
      {
        title: "Clientes Atendidos",
        value: `${totalClients}`,
        icon: kpiIcons.clients,
      },
      {
        title: "Novos Clientes",
        value: `${newClientsInPeriod}`,
        icon: kpiIcons.newClients,
      },
    ]

  }, [filteredAppointments, appointments, services, dateRange]);


  const getTopClients = (): ClientRanking[] => {
    const clientCounts = appointments
      .filter(appt => appt.status === 'Realizado' && appt.clients?.name)
      .reduce((acc, appt) => {
        const clientName = appt.clients!.name;
        acc[clientName] = (acc[clientName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(clientCounts)
      .map(([clientName, count]) => ({ clientName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const overviewData = useMemo(() => {
    const monthlyGains: {[key: string]: number} = {};
    const completedAppointments = appointments.filter(a => a.status === 'Realizado');

    completedAppointments.forEach(appt => {
        const monthKey = format(parseISO(appt.dateTime), 'yyyy-MM');
        const price = appt.services?.price || 0;
        monthlyGains[monthKey] = (monthlyGains[monthKey] || 0) + price;
    });

    const data: OverviewData[] = [];
    const monthsToShow = isMobile ? 6 : 12;
    const startingMonth = isMobile ? subMonths(startOfMonth(today), monthsToShow - 1) : startOfMonth(new Date(today.getFullYear(), 0, 1));
    
    for (let i = 0; i < monthsToShow; i++) {
        const monthDate = addMonths(startingMonth, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthName = format(monthDate, 'MMM', { locale: ptBR });
        
        data.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            total: monthlyGains[monthKey] || 0,
        });
    }

    return data;
  }, [appointments, today, isMobile]);
  
  const topClients = getTopClients();

  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Dashboard</h1>
          <p className="text-muted-foreground">
            Suas métricas e visão geral do desempenho.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            As métricas de ganhos e perdas são atualizadas diariamente após a meia-noite.
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <CardDescription>Ganhos mensais com agendamentos realizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart data={overviewData} />
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

    