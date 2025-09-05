
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { recentAppointments, kpiData, appointments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";
import { User } from "lucide-react";

type ClientRanking = {
  clientName: string;
  count: number;
};

export default function DashboardPage() {
  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "bg-blue-100 text-blue-800",
    Realizado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
    Bloqueado: "bg-gray-200 text-gray-800",
  };

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
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Dashboard</h1>
          <p className="text-muted-foreground">
            Suas métricas e visão geral do desempenho.
          </p>
        </div>
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
            <CardDescription>Produtividade por Admin no último mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{appointment.clientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.dateTime.toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn("border-none", statusVariant[appointment.status])}
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>Quem mais marcou presença.</CardDescription>
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
