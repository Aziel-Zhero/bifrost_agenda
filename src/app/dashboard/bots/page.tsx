
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle } from "lucide-react";
import { FaTelegram } from "react-icons/fa";

export default function BotsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automações e Bots</h1>
          <p className="text-muted-foreground">
            Monitore o status dos seus bots de notificação.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaTelegram className="h-8 w-8 text-blue-500" />
                <CardTitle>GAIA (Telegram)</CardTitle>
              </div>
              <Badge variant="outline" className="border-green-500 bg-green-100 text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            </div>
            <CardDescription className="pt-2">
              Este bot está configurado para enviar notificações de agendamentos e lembretes via Telegram. Atualmente em fase de testes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Funcionalidades:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Notifica a equipe sobre novos agendamentos.</li>
                    <li>Envia confirmação imediata para clientes com Telegram cadastrado.</li>
                </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50">
             <CardContent className="text-center p-6">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Bot do WhatsApp</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Em breve. Integre com o WhatsApp para alcançar ainda mais clientes.
                </p>
             </CardContent>
        </Card>
      </div>
    </div>
  );
}
