
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/notification-context";
import { Bell, User } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Appointment, UserProfile } from "@/types";

export default function RealtimeNotifier() {
  const { toast } = useToast();
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // === Listener for Appointments ===
    const handleAppointmentChanges = (payload: RealtimePostgresChangesPayload<Appointment>) => {
      router.refresh();

      let toastTitle = "Atualização na Agenda!";
      let notificationTitle = "Agenda Atualizada";
      let href = "/dashboard/agenda-geral";

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
        onClick: () => router.push(href),
      });

      addNotification({
        id: (payload.new?.id || payload.old?.id || Date.now()) + payload.commit_timestamp,
        title: notificationTitle,
        read: false,
        timestamp: new Date(),
        href,
      });
    };

    // === Listener for Profiles ===
    const handleProfileChanges = (payload: RealtimePostgresChangesPayload<UserProfile>) => {
      router.refresh();

      const userName = (payload.new as UserProfile)?.full_name || 'Um usuário';
      const toastTitle = "Dados de Usuário Atualizados!";
      const notificationTitle = `O perfil de ${userName} foi atualizado.`;
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span className="font-semibold">{toastTitle}</span>
          </div>
        ),
        description: `As informações de um usuário foram alteradas. A página será atualizada.`,
        duration: 5000,
      });

       addNotification({
        id: (payload.new?.id || payload.old?.id || Date.now()) + payload.commit_timestamp,
        title: notificationTitle,
        read: false,
        timestamp: new Date(),
        href: '/dashboard/usuarios',
      });
    }

    // === Channel Setup ===
    const appointmentsChannel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        (payload) => handleChanges(payload as RealtimePostgresChangesPayload<Appointment>, 'appointment')
      )
      .subscribe();
      
    const profilesChannel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => handleChanges(payload as RealtimePostgresChangesPayload<UserProfile>, 'profile')
      )
      .subscribe();

    const handleChanges = (payload: RealtimePostgresChangesPayload<any>, type: 'appointment' | 'profile') => {
        if (type === 'appointment') {
            handleAppointmentChanges(payload);
        } else if (type === 'profile') {
            handleProfileChanges(payload);
        }
    }

    // === Cleanup ===
    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [toast, router, addNotification]);

  return null;
}
