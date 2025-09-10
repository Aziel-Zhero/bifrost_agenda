
"use client";

import { useState, useEffect } from "react";
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
import type { Appointment, AppointmentStatus, Service, Client, StudioHour } from "@/types";
import { cn } from "@/lib/utils";
import NewAppointmentWizard from './components/new-appointment-wizard';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/lib/supabase/client";


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
        const { data: profile, error } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user name", error);
        } else {
            setCurrentUserName(profile?.name || user.email || 'Admin');
        }
      }


      // Fetch Appointments
      const { data: apptData, error: apptError } = await supabase.from('appointments').select(`
        *,
        clients ( name ),
        services ( name )
      `);
      if (apptError) {
        console.error("Error fetching appointments", apptError);
      } else {
        const formattedAppointments = apptData.map((appt: any) => ({
          id: appt.id,
          clientName: appt.clients.name,
          clientAvatarUrl: '',
          dateTime: new Date(appt.date_time),
          notes: appt.services.name,
          status: appt.status,
          admin: 'Admin Master',
          serviceId: appt.service_id,
        }));
        setAppointments(formattedAppointments);
      }

       // Fetch Clients
      const { data: clientData, error: clientError } = await supabase.from('clients').select('*');
      if (clientError) console.error("Error fetching clients", clientError);
      else setClients(clientData || []);

       // Fetch Services
      const { data: serviceData, error: serviceError } = await supabase.from('services').select('*');
      if (serviceError) console.error("Error fetching services", serviceError);
      else setServices(serviceData || []);

    };
    fetchData();
  }, []);

  const selectedDayAppointments = appointments.filter(
    (appt) =>
      date && appt.dateTime.toDateString() === date.toDateString()
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
        const newAppointment: Appointment = {
          id: data.id,
          clientName: data.clients.name,
          clientAvatarUrl: '', // Or a default one
          dateTime: new Date(data.date_time),
          notes: data.services.name,
          status: 'Agendado',
          admin: currentUserName, // Set current user's name
          serviceId: data.service_id,
        };

        setAppointments(prev => [...prev, newAppointment]);
        setFormOpen(false);
        toast({
          title: "Agendamento Criado!",
          description: `Cliente ${details.clientName} agendado para ${details.date} às ${details.time} com sucesso!`,
          className: 'bg-green-100 border-green-300 text-green-800'
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
