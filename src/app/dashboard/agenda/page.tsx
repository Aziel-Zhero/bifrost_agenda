
"use client";

import { useState } from "react";
import { PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { appointments as mockAppointments } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";
import NewAppointmentWizard from './components/new-appointment-wizard';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ptBR } from 'date-fns/locale';

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isFormOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const selectedDayAppointments = appointments.filter(
    (appt) =>
      date && appt.dateTime.toDateString() === date.toDateString()
  );

  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "bg-blue-100 text-blue-800",
    Realizado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
    Bloqueado: "bg-gray-200 text-gray-800",
  };
  
  const handleAppointmentSuccess = (details: { clientName: string; date: string; time: string; serviceName: string; }) => {
    const [day, month, year] = details.date.split('/');
    const [hours, minutes] = details.time.split(':');
    const newAppointmentDate = new Date(+year, +month - 1, +day, +hours, +minutes);

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      clientName: details.clientName,
      clientAvatarUrl: '', // Or a default one
      dateTime: newAppointmentDate,
      notes: details.serviceName,
      status: 'Agendado',
      admin: 'Admin Master', // Assuming current user
    };

    setAppointments(prev => [...prev, newAppointment]);
    setFormOpen(false);
    toast({
      title: "Agendamento Criado!",
      description: `Cliente ${details.clientName} agendado para ${details.date} às ${details.time} com sucesso!`,
      className: 'bg-green-100 border-green-300 text-green-800'
    });
  };


  return (
    <>
    <Toaster />
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px]">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <NewAppointmentWizard onFinish={handleAppointmentSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              locale={ptBR}
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Agendamentos para{" "}
              {date?.toLocaleDateString("pt-BR", { dateStyle: "long" }) || "Nenhum dia selecionado"}
            </CardTitle>
            <CardDescription>
              {selectedDayAppointments.length} agendamento(s) neste dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments
                .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                .map((appt: Appointment) => (
                  <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-4">
                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                       </div>
                      <div>
                        <p className="font-semibold">{appt.clientName}</p>
                        <p className="text-sm text-muted-foreground">{appt.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {appt.notes}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('border-none text-xs', statusVariant[appt.status])}>
                      {appt.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Nenhum agendamento para este dia.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
