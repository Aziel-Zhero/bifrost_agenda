
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Bot, Send } from "lucide-react";
import { FaTelegram } from "react-icons/fa";
import GaiaLogTable from "./components/log-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendTestTelegramMessage } from "@/app/actions";


export default function BotsPage() {
    const { toast } = useToast();
    const [testChatId, setTestChatId] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testChatId) {
            toast({
                title: "ID do Chat ausente",
                description: "Por favor, insira um ID de Chat do Telegram para testar.",
                variant: "destructive"
            });
            return;
        }

        setIsTesting(true);
        const { success, message } = await sendTestTelegramMessage(testChatId);
        setIsTesting(false);

        if (success) {
            toast({
                title: "Mensagem de Teste Enviada!",
                description: `Uma mensagem foi enviada para o Chat ID: ${testChatId}.`,
                className: "bg-green-100 border-green-300 text-green-800"
            });
        } else {
             toast({
                title: "Falha no Envio",
                description: `Não foi possível enviar a mensagem: ${message}`,
                variant: "destructive"
            });
        }
    };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automações e Bots</h1>
          <p className="text-muted-foreground">
            Monitore o status e a atividade dos seus bots de notificação.
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Testar Notificações da GAIA</CardTitle>
            <CardDescription>
                Envie uma mensagem de teste para qualquer ID de chat do Telegram para verificar se o serviço está funcionando.
            </CardDescription>
            </CardHeader>
            <form onSubmit={handleTestSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-chat-id">ID do Chat do Telegram</Label>
                        <Input
                            id="test-chat-id"
                            placeholder="Insira o ID do chat de destino"
                            value={testChatId}
                            onChange={(e) => setTestChatId(e.target.value)}
                        />
                         <p className="text-xs text-muted-foreground">
                            Use o bot <code className="font-mono p-1 bg-muted rounded-sm">@userinfobot</code> no Telegram para descobrir seu ID de chat.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isTesting}>
                        {isTesting ? "Enviando..." : <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem de Teste
                        </>}
                    </Button>
                </CardFooter>
            </form>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Monitor de Atividade da GAIA</CardTitle>
            <CardDescription>
                Últimas notificações enviadas pelo bot do Telegram. A lista é atualizada automaticamente.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <GaiaLogTable />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
