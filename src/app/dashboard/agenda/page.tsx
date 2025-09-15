
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, User, MoreHorizontal, Check, X, Calendar as CalendarIconLucide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Appointment, AppointmentStatus, Service, Client } from "@/types";
import { cn } from "@/lib/utils";
import NewAppointmentWizard from './components/new-appointment-wizard';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/lib/supabase/client";
import { parseISO } from "date-fns";
import { notifyOnNewAppointment } from "@/app/actions";


export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {

       // Fetch current user's profile name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile, error: profileError } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching user name", profileError);
        } else {
            setCurrentUserName(profile?.name || user.email || 'Admin');
        }
        
        // Fetch Appointments only for the current user
        const { data: apptData, error: apptError } = await supabase
            .from('appointments')
            .select(`
                *,
                clients ( name ),
                services ( name )
            `)
            .eq('admin_id', user.id);

        if (apptError) {
            console.error("Error fetching appointments", apptError);
        } else {
            setAppointments(apptData as any[]);
        }

        // Fetch Clients only for the current user (or all if admin - adjust if needed)
        const clientQueryUser = profile?.name || user.email;
        if (clientQueryUser) {
          const { data: clientData, error: clientError } = await supabase.from('clients').select('*').eq('admin', clientQueryUser);
          if (clientError) console.error("Error fetching clients", clientError);
          else setClients(clientData || []);
        }


       // Fetch Services
       const { data: serviceData, error: serviceError } = await supabase.from('services').select('*');
       if (serviceError) console.error("Error fetching services", serviceError);
       else setServices(serviceData || []);

      }
    };
    fetchData();
  }, [toast]);

  const selectedDayAppointments = appointments.filter(
    (appt) =>
      date && new Date(appt.date_time).toDateString() === date.toDateString()
  );

  const statusVariant: Record<AppointmentStatus, string> = {
    Agendado: "status-agendado",
    Realizado: "status-realizado",
    Cancelado: "status-cancelado",
    Bloqueado: "status-bloqueado",
  };
  
  const handleAppointmentSuccess = async (details: { clientName: string; clientId: string; date: string; time: string; serviceName: string; serviceId: string; notes: string; }) => {
    if (!currentUserId) {
        toast({ title: "Erro de autenticação", description: "Usuário não encontrado. Por favor, faça login novamente.", variant: "destructive" });
        return;
    }
    
    const [day, month, year] = details.date.split('/');
    const [hours, minutes] = details.time.split(':');
    const newAppointmentDate = new Date(+year, +month - 1, +day, +hours, +minutes);

    const newAppointmentData = {
        client_id: details.clientId,
        service_id: details.serviceId,
        date_time: newAppointmentDate.toISOString(),
        notes: details.notes,
        status: 'Agendado' as AppointmentStatus,
        admin_id: currentUserId
    };

    const { data, error } = await supabase
        .from('appointments')
        .insert(newAppointmentData)
        .select(`*, clients (name), services (name)`)
        .single();
    
    if (error) {
        toast({
            title: "Erro ao criar agendamento!",
            description: "Verifique se todos os dados estão corretos e tente novamente.",
            variant: 'destructive'
        });
        console.error("Error creating appointment", error);
    } else if (data) {
        const newAppointment: Appointment = data as any;
        
        // Trigger notification
        notifyOnNewAppointment(newAppointment.id);

        setAppointments(prev => [...prev, newAppointment]);
        setFormOpen(false);
        toast({
          title: "Agendamento Criado!",
          description: `Cliente ${details.clientName} agendado para ${details.date} às ${details.time} com sucesso!`,
          className: 'bg-green-100 border-green-300 text-green-800'
        });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)
      .select(`*, clients (name), services (name)`)
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: `Não foi possível alterar o status: ${error.message}`,
        variant: "destructive",
      });
    } else if (data) {
      setAppointments(prev => prev.map(appt => appt.id === appointmentId ? (data as any) : appt));
      toast({
        title: "Status Atualizado!",
        description: `O agendamento foi marcado como "${newStatus}".`,
      });
    }
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
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <NewAppointmentWizard onFinish={handleAppointmentSuccess} clients={clients} services={services} currentUserName={currentUserName} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2">
           <CardContent className="p-0 flex justify-center pt-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-auto"
              locale={ptBR}
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground rounded-full",
              }}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
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
                .sort((a, b) => parseISO(a.date_time).getTime() - parseISO(b.date_time).getTime())
                .map((appt: Appointment) => (
                  <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-4">
                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                       </div>
                      <div>
                        <p className="font-semibold">{appt.clients?.name}</p>
                        <p className="text-sm text-muted-foreground">{parseISO(appt.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {appt.services?.name}</p>
                      </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('border-none text-xs', statusVariant[appt.status])}>
                          {appt.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Realizado')}>
                              <Check className="mr-2 h-4 w-4" />
                              Marcar como Realizado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Cancelado')} className="text-destructive">
                              <X className="mr-2 h-4 w-4" />
                              Marcar como Cancelado
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Agendado')}>
                              <CalendarIconLucide className="mr-2 h-4 w-4" />
                              Reverter para Agendado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
