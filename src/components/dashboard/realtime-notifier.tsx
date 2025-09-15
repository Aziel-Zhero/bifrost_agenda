
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import type { Appointment } from "@/types";


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
          // A notificação para Telegram agora é chamada diretamente na criação do agendamento.
          // Este componente foca apenas em notificar o usuário na tela (UI).
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
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
