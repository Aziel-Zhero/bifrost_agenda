
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/notification-context";
import { Bell } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Appointment } from "@/types";

export default function RealtimeNotifier() {
  const { toast } = useToast();
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleChanges = (payload: RealtimePostgresChangesPayload<Appointment>) => {
      // 1. Refresh the data on the current page
      router.refresh();

      // 2. Determine the notification content based on the event type
      let toastTitle = "Atualização na Agenda!";
      let notificationTitle = "Agenda Atualizada";
      let href = "/dashboard/agenda-geral";

      // Since we don't have the enriched data here anymore, we make the message more generic.
      // The enrichment happens on the page itself via router.refresh().
      if (payload.eventType === 'INSERT') {
        toastTitle = "Novo Agendamento!";
        notificationTitle = `Um novo agendamento foi criado.`;
      } else if (payload.eventType === 'UPDATE') {
        toastTitle = "Agendamento Atualizado!";
        notificationTitle = `Um agendamento foi atualizado.`;
      } else if (payload.eventType === 'DELETE') {
        toastTitle = "Agendamento Removido!";
        notificationTitle = `Um agendamento foi removido da agenda.`;
      }
      
      // 3. Show a toast
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-semibold">{toastTitle}</span>
          </div>
        ),
        description: `A agenda foi atualizada. Clique para ver.`,
        duration: 10000,
        className: "cursor-pointer hover:bg-muted/80",
        onClick: () => {
          router.push(href);
        },
      });

      // 4. Add to the notification center
      addNotification({
        id: (payload.new?.id || payload.old?.id || Date.now()) + payload.commit_timestamp,
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
        (payload) => {
            // The payload here is of type RealtimePostgresChangesPayload<{[key: string]: any;}>
            // We cast it to the type we expect.
            handleChanges(payload as RealtimePostgresChangesPayload<Appointment>);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Conectado ao canal de tempo real!');
        }
        if (status === 'CLOSED' || status === 'TIMED_OUT') {
            console.log('Canal de tempo real desconectado. Tentando reconectar...');
        }
        if (status === 'CHANNEL_ERROR') {
          const errorMessage = err?.message || 'A conexão foi interrompida.';
          toast({
            variant: 'destructive',
            title: 'Conexão em Tempo Real Interrompida',
            description: `Não foi possível manter a conexão para atualizações ao vivo. ${errorMessage}`
          })
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, router, addNotification]);

  return null;
}
