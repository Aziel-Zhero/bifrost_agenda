
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { GaiaMessageTemplate } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, Send } from "lucide-react";
import GaiaLogTable from "./components/log-table";
import { Input } from "@/components/ui/input";
import { sendTestTemplateMessage } from "@/app/actions";
import { Separator } from "@/components/ui/separator";

type TestState = {
    chatId: string;
    isTesting: boolean;
};

export default function BotsPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<GaiaMessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testStates, setTestStates] = useState<{[key: number]: TestState}>({});

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("gaia_message_templates")
        .select("*")
        .order("id");

      if (error) {
        toast({
          title: "Erro ao carregar modelos",
          description: "Não foi possível buscar as configurações da GAIA.",
          variant: "destructive",
        });
      } else {
        setTemplates(data || []);
        // Initialize test states
        const initialStates: {[key: number]: TestState} = {};
        data?.forEach(t => {
            initialStates[t.id] = { chatId: '', isTesting: false };
        });
        setTestStates(initialStates);
      }
      setIsLoading(false);
    };

    fetchTemplates();
  }, [toast]);

  const handleTemplateChange = (id: number, newTemplate: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, template: newTemplate } : t))
    );
  };

  const handleEnabledChange = (id: number, isEnabled: boolean) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_enabled: isEnabled } : t))
    );
  };

  const handleSave = async (template: GaiaMessageTemplate) => {
    const { error } = await supabase
      .from("gaia_message_templates")
      .update({ template: template.template, is_enabled: template.is_enabled })
      .eq("id", template.id);

    if (error) {
      toast({
        title: "Erro ao Salvar",
        description: `Não foi possível salvar o modelo: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Modelo Salvo!",
        description: "A mensagem da GAIA foi atualizada com sucesso.",
        className: "bg-green-100 border-green-300 text-green-800",
      });
    }
  };

  const handleTestSubmit = async (template: GaiaMessageTemplate) => {
      const state = testStates[template.id];
      if (!state || !state.chatId) {
          toast({
              title: "ID do Chat ausente",
              description: "Por favor, insira um ID de Chat do Telegram para testar.",
              variant: "destructive"
          });
          return;
      }
      
      setTestStates(prev => ({ ...prev, [template.id]: { ...state, isTesting: true }}));

      const { success, message } = await sendTestTemplateMessage(template.template, state.chatId);
      
      setTestStates(prev => ({ ...prev, [template.id]: { ...state, isTesting: false }}));


      if (success) {
          toast({
              title: "Mensagem de Teste Enviada!",
              description: `Uma mensagem foi enviada para o Chat ID: ${state.chatId}.`,
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
  
  const handleTestChatIdChange = (templateId: number, value: string) => {
    setTestStates(prev => ({
        ...prev,
        [templateId]: { ...prev[templateId], chatId: value }
    }));
  }

  const placeholders = [
    { name: "{{clientName}}", desc: "Nome do cliente" },
    { name: "{{adminName}}", desc: "Nome do profissional" },
    { name: "{{serviceName}}", desc: "Nome do serviço" },
    { name: "{{dateTime}}", desc: "Data e hora completas" },
    { name: "{{time}}", desc: "Apenas a hora" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel da GAIA</h1>
          <p className="text-muted-foreground">
            Personalize e monitore as mensagens que sua assistente enviará.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Placeholders Disponíveis</CardTitle>
            <CardDescription>
              Use estas variáveis em seus textos. Elas serão substituídas
              automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {placeholders.map((p) => (
              <div key={p.name} className="flex justify-between items-center text-sm">
                <code className="font-mono p-1 bg-muted rounded-sm text-primary">
                  {p.name}
                </code>
                <span className="text-muted-foreground">{p.desc}</span>
              </div>
            ))}
             <div className="pt-4 text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                <p>O Telegram suporta formatação <a href="https://core.telegram.org/bots/api#markdown-style" target="_blank" rel="noopener noreferrer" className="underline">Markdown</a> para negrito, itálico, etc.</p>
            </div>
             <div className="pt-4 text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                <p>Use o bot <code className="font-mono p-1 bg-muted rounded-sm">@userinfobot</code> no Telegram para obter o ID do seu chat de teste.</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 xl:col-span-2 space-y-6">
            {isLoading && <p className="text-muted-foreground">Carregando modelos...</p>}
            {templates.map((template) => {
                const testState = testStates[template.id] || { chatId: '', isTesting: false };
                return (
                    <Card key={template.id}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{template.description}</CardTitle>
                                <Switch
                                    checked={template.is_enabled}
                                    onCheckedChange={(value) => handleEnabledChange(template.id, value)}
                                />
                            </div>
                            <CardDescription>
                                Gatilho: <code className="text-xs">{template.event_type}</code>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor={`template-${template.id}`} className="sr-only">
                                Modelo da Mensagem
                            </Label>
                            <Textarea
                                id={`template-${template.id}`}
                                value={template.template}
                                onChange={(e) => handleTemplateChange(template.id, e.target.value)}
                                className="min-h-[150px] font-mono text-sm"
                                disabled={!template.is_enabled}
                            />
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-4">
                            <Separator />
                             <div className="space-y-2">
                                <Label htmlFor={`test-chat-id-${template.id}`} className="text-sm font-medium">Testar Envio</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id={`test-chat-id-${template.id}`}
                                        placeholder="ID do Chat para Teste"
                                        value={testState.chatId}
                                        onChange={(e) => handleTestChatIdChange(template.id, e.target.value)}
                                        disabled={!template.is_enabled}
                                    />
                                    <Button onClick={() => handleTestSubmit(template)} disabled={!template.is_enabled || testState.isTesting} variant="secondary">
                                        {testState.isTesting ? 'Enviando...' : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button onClick={() => handleSave(template)} disabled={!template.is_enabled} className="w-full">
                                Salvar Mensagem
                            </Button>
                        </CardFooter>
                    </Card>
                )})}
        </div>
      </div>
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
  );
}
