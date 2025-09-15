
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import type { Appointment } from "@/types";
import { notifyOnNewAppointment } from "@/app/actions";


export default function RealtimeNotifier() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Garante que o código só execute no lado do cliente
    if (typeof window === "undefined") {
      return;
    }

    const channel = supabase
      .channel("realtime-appointments")
      .on(
        "postgres_changes",
        { 
            event: "INSERT", 
            schema: "public", 
            table: "appointments" 
        },
        (payload) => {
          const newAppointment = payload.new as Appointment;
          
          // Trigger the server action to handle the notification logic securely
          if (newAppointment?.id) {
             // We don't await this so it doesn't block the UI toast notification
             notifyOnNewAppointment(newAppointment.id);
          }

          toast({
            title: (
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                <span className="font-semibold">Novo Agendamento!</span>
              </div>
            ),
            description: `Um novo horário foi agendado. Clique para ver.`,
            duration: 10000, // 10 segundos
            className: "cursor-pointer hover:bg-muted/80",
            onClick: () => {
              router.push("/dashboard/agenda-geral");
              router.refresh();
            },
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado ao canal de agendamentos em tempo real!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Erro no canal de tempo real:', err);
          toast({
            variant: 'destructive',
            title: 'Erro de Conexão',
            description: 'Não foi possível conectar ao serviço de notificações em tempo real.'
          })
        }
      });

    // Cleanup: desinscrever-se do canal quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, router]);

  return null; // Este componente não renderiza nada na UI
}
