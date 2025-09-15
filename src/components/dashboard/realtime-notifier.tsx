"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import type { Appointment } from "@/types";

type AppointmentPayload = {
  new: Appointment & { 
    clients: { name: string } | null;
    profiles: { name: string } | null;
  };
};

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
      .on<AppointmentPayload>(
        "postgres_changes",
        { 
            event: "INSERT", 
            schema: "public", 
            table: "appointments" 
        },
        async (payload) => {
          const newAppointment = payload.new;

          // Precisamos buscar o nome do admin e do cliente separadamente
          // pois o payload do INSERT não pode fazer joins complexos.
          const { data: adminProfile, error: adminError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newAppointment.admin_id)
            .single();

          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('name')
            .eq('id', newAppointment.client_id)
            .single();
          
          if (adminError || clientError) {
              console.error("Error fetching names for notification:", adminError || clientError);
              return;
          }

          const adminName = adminProfile?.name || 'Alguém';
          const clientName = client?.name || 'um novo cliente';
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                <span className="font-semibold">Novo Agendamento!</span>
              </div>
            ),
            description: `${adminName} agendou ${clientName}.`,
            duration: 10000, // 10 segundos
            className: "cursor-pointer hover:bg-muted/80",
            onClick: () => {
              router.push("/dashboard/agenda-geral");
            },
          });
        }
      )
      .subscribe();

    // Cleanup: desinscrever-se do canal quando o componente for desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, router]);

  return null; // Este componente não renderiza nada na UI
}
