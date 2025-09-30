
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
import { User, Calendar as CalendarIcon, Users, UserPlus, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import type { Appointment, Service, UserProfile } from "@/types";
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
  iconColor: string;
  change?: string;
};

type OverviewData = {
    name: string;
    total: number;
}

// Redefine the type to match the Supabase query result
type AppointmentWithDetails = Appointment & {
    clients: {
        full_name: string;
    } | null;
    services: Service | null;
}


const kpiIcons = {
  gains: TrendingUp,
  losses: TrendingDown,
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
  const [allUserAppointments, setAllUserAppointments] = useState<AppointmentWithDetails[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser(profile);

        // Fetch Appointments only for the current user
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select(`*, clients ( full_name ), services ( * )`)
          .eq('admin_id', user.id);
        
        if (apptError) {
          console.error("Error fetching user appointments:", apptError.message);
        } else {
          const userAppointments = apptData as any[] || [];
          setAppointments(userAppointments);
          setAllUserAppointments(userAppointments);
        }
      }
    };
    fetchData();
  }, []);


  const filteredAppointments = useMemo(() => {
    if (!dateRange?.from) return [];
    const from = dateRange.from;
    const to = dateRange.to || from; // if no 'to', use 'from'
    
    return allUserAppointments.filter(appt => 
      appt.date_time && isWithinInterval(parseISO(appt.date_time), { start: startOfDay(from), end: endOfDay(to) })
    );
  }, [dateRange, allUserAppointments]);

  const previousPeriodData = useMemo(() => {
    const from = dateRange?.from;
    if (!from || !allUserAppointments.length) {
      return { prevGains: 0, prevLosses: 0, prevCancellations: 0, prevClients: 0, prevNewClients: 0 };
    }

    const prevMonthDate = subMonths(from, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    const prevMonthAppointments = allUserAppointments.filter(appt =>
      appt.date_time && isWithinInterval(parseISO(appt.date_time), { start: prevMonthStart, end: prevMonthEnd })
    );
    const prevMonthCompleted = prevMonthAppointments.filter(a => a.status === 'Realizado');
    const prevMonthCancelled = prevMonthAppointments.filter(a => a.status === 'Cancelado');
    const prevGains = prevMonthCompleted.reduce((sum, appt) => sum + (appt.services?.price || 0), 0);
    const prevLosses = prevMonthCancelled.reduce((sum, appt) => sum + (appt.services?.price || 0), 0);

    const prevPeriodClients = new Set(prevMonthCompleted.map(a => a.client_id));
    const clientsBeforePrevPeriod = new Set(
        allUserAppointments
            .filter(a => a.date_time && parseISO(a.date_time) < prevMonthStart)
            .map(a => a.client_id)
    );
    const newClientsInPrevPeriod = new Set(
        [...prevPeriodClients].filter(clientId => !clientsBeforePrevPeriod.has(clientId))
    );

    return {
      prevGains,
      prevLosses,
      prevCancellations: prevMonthCancelled.length,
      prevClients: prevPeriodClients.size,
      prevNewClients: newClientsInPrevPeriod.size,
    };
  }, [dateRange, allUserAppointments]);

  const kpiData: Kpi[] = useMemo(() => {
    const from = dateRange?.from;
    
    // Always return a structure for the cards, even if zeroed out.
    const defaultKpis: Kpi[] = [
      { title: "Ganhos (Período)", value: "R$ 0.00", icon: kpiIcons.gains, iconColor: "text-green-500", change: '0%' },
      { title: "Perdas (Cancelado)", value: "R$ 0.00", icon: kpiIcons.losses, iconColor: "text-yellow-500", change: '0%' },
      { title: "Cancelamentos", value: "0", icon: kpiIcons.cancellations, iconColor: "text-red-500", change: '0%' },
      { title: "Clientes Atendidos", value: "0", icon: kpiIcons.clients, iconColor: "text-purple-500", change: '0%' },
      { title: "Novos Clientes", value: "0", icon: kpiIcons.newClients, iconColor: "text-blue-500", change: '0%' },
    ];

    if (!from || !currentUser || !filteredAppointments) {
      return defaultKpis;
    }

    const { prevGains, prevLosses, prevCancellations, prevClients, prevNewClients } = previousPeriodData;

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        if (current === previous) return "0%";
        const percentageChange = ((current - previous) / previous) * 100;
        return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(0)}%`;
    }

    // Current period data
    const completedInPeriod = filteredAppointments.filter(a => a.status === 'Realizado');
    const cancelledInPeriod = filteredAppointments.filter(a => a.status === 'Cancelado');
    const totalGains = completedInPeriod.reduce((sum, appt) => sum + (appt.services?.price || 0), 0);
    const totalLosses = cancelledInPeriod.reduce((sum, appt) => sum + (appt.services?.price || 0), 0);
    
    // New Client Calculation
    const clientsInPeriod = new Set(completedInPeriod.map(a => a.client_id));
    const clientsBeforePeriod = new Set(
        allUserAppointments
            .filter(a => a.date_time && parseISO(a.date_time) < startOfDay(from))
            .map(a => a.client_id)
    );
    const newClientsInPeriod = new Set(
        [...clientsInPeriod].filter(clientId => !clientsBeforePeriod.has(clientId))
    );

    return [
      {
        title: "Ganhos (Período)",
        value: `R$ ${totalGains.toFixed(2)}`,
        icon: kpiIcons.gains,
        iconColor: "text-green-500",
        change: calculateChange(totalGains, prevGains),
      },
       {
        title: "Perdas (Cancelado)",
        value: `R$ ${totalLosses.toFixed(2)}`,
        icon: kpiIcons.losses,
        iconColor: "text-yellow-500",
        change: calculateChange(totalLosses, prevLosses),
      },
       {
        title: "Cancelamentos",
        value: `${cancelledInPeriod.length}`,
        icon: kpiIcons.cancellations,
        iconColor: "text-red-500",
        change: calculateChange(cancelledInPeriod.length, prevCancellations),
      },
      {
        title: "Clientes Atendidos",
        value: `${clientsInPeriod.size}`,
        icon: kpiIcons.clients,
        iconColor: "text-purple-500",
        change: calculateChange(clientsInPeriod.size, prevClients),
      },
      {
        title: "Novos Clientes",
        value: `${newClientsInPeriod.size}`,
        icon: kpiIcons.newClients,
        iconColor: "text-blue-500",
        change: calculateChange(newClientsInPeriod.size, prevNewClients),
      },
    ]

  }, [filteredAppointments, allUserAppointments, dateRange, currentUser, previousPeriodData]);


  const getTopClients = (): ClientRanking[] => {
    const clientCounts = allUserAppointments
      .filter(appt => appt.status === 'Realizado' && appt.clients?.full_name)
      .reduce((acc, appt) => {
        const clientName = appt.clients!.full_name;
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
    const completedAppointments = allUserAppointments.filter(a => a.status === 'Realizado');

    completedAppointments.forEach(appt => {
        if (appt.date_time && appt.services) {
            const monthKey = format(parseISO(appt.date_time), 'yyyy-MM');
            const price = appt.services?.price || 0;
            monthlyGains[monthKey] = (monthlyGains[monthKey] || 0) + price;
        }
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
  }, [allUserAppointments, today, isMobile]);
  
  const topClients = getTopClients();

  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiData.map((kpi) => (
          <StatsCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
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
                <CardDescription>Quem mais marcou presença com você.</CardDescription>
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
