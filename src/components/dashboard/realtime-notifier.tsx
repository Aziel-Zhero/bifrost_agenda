
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/notification-context";
import { Bell } from "lucide-react";
import type { Appointment } from "@/types";

export default function RealtimeNotifier() {
  const { toast } = useToast();
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleChanges = (payload: any) => {
      // 1. Refresh the data on the current page
      router.refresh();

      // 2. Determine the notification content based on the event type
      let toastTitle = "Atualização na Agenda!";
      let notificationTitle = "Agenda Atualizada";
      let href = "/dashboard/agenda-geral";

      if (payload.eventType === 'INSERT') {
        const clientName = payload.new.clients?.name || 'Novo agendamento';
        toastTitle = "Novo Agendamento!";
        notificationTitle = `Agendamento para ${clientName}`;
      } else if (payload.eventType === 'UPDATE') {
        toastTitle = "Agendamento Atualizado!";
        notificationTitle = `Agendamento de ${payload.new.clients?.name || 'cliente'} foi atualizado.`;
      }
      
      // 3. Show a toast
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-semibold">{toastTitle}</span>
          </div>
        ),
        description: `A agenda foi atualizada.`,
        duration: 10000,
        className: "cursor-pointer hover:bg-muted/80",
        onClick: () => {
          router.push(href);
        },
      });

      // 4. Add to the notification center
      addNotification({
        id: payload.new.id + payload.commit_timestamp,
        title: notificationTitle,
        read: false,
        timestamp: new Date(),
        href,
      });
    };

    const channel = supabase
      .channel("realtime-all-changes")
      .on(
        "postgres_changes",
        { 
            event: "*", 
            schema: "public", 
            table: "appointments",
        },
        (payload: any) => {
            // Fetch related data to enrich the payload
            const fetchEnrichedData = async () => {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, clients(name)')
                    .eq('id', payload.new.id)
                    .single();
                
                if (data) {
                    const enrichedPayload = {
                        ...payload,
                        new: { ...payload.new, clients: data.clients }
                    };
                    handleChanges(enrichedPayload);
                } else {
                    // Fallback to original payload if fetch fails
                    handleChanges(payload);
                }
            };
            fetchEnrichedData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado ao canal de tempo real!');
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, router, addNotification]);

  return null;
}
