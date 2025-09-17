
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Clipboard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ApiIntegration } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [makeIntegration, setMakeIntegration] = useState<Partial<ApiIntegration>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);

   useEffect(() => {
    // Define a URL do webhook baseada no ambiente
    if (typeof window !== 'undefined') {
        const currentUrl = window.location.origin;
        setWebhookUrl(`${currentUrl}/api/telegram`);
    }

    const fetchIntegrations = async () => {
      const { data, error } = await supabase.from('api_integrations').select('*');
      if (error) {
        toast({ title: 'Erro ao buscar integrações', description: error.message, variant: 'destructive' });
      } else {
        setIntegrations(data || []);
        const make = data.find(i => i.name === 'Make.com');
        if (make) {
          setMakeIntegration(make);
        }
      }
    };
    fetchIntegrations();
  }, [toast]);

  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMakeIntegration(prev => ({ ...prev, [id]: value }));
  };

  const handleMakeSave = async () => {
    const { error } = await supabase.from('api_integrations').upsert(
      { ...makeIntegration, name: 'Make.com' },
      { onConflict: 'name' }
    );
    if (error) {
      toast({ title: 'Erro ao salvar integração', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Integração com Make.com salva!' });
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "URL copiada para a área de transferência!" });
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrações de API</h1>
          <p className="text-muted-foreground">
            Gerencie suas chaves e conecte o sistema a outras plataformas.
          </p>
        </div>
      </div>
      
       <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                 <CardHeader>
                    <CardTitle>Webhook da GAIA (Telegram)</CardTitle>
                    <CardDescription>
                       Para a GAIA responder no Telegram, configure esta URL nas configurações do seu bot através do <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline font-semibold">BotFather</a>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <div className="flex items-center gap-2">
                        <Input id="webhook-url" value={webhookUrl} readOnly />
                        <Button variant="outline" size="icon" onClick={copyToClipboard}>
                           {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        No Telegram, envie o comando <code className="font-mono p-1 bg-muted rounded-sm">/setwebhook</code> para o BotFather, selecione seu bot e então cole esta URL.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Integração com Make.com</CardTitle>
                    <CardDescription>
                    Conecte-se a um webhook do Make.com para automatizar fluxos de trabalho quando eventos ocorrerem no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="webhook_url">URL do Webhook</Label>
                    <Input id="webhook_url" placeholder="https://hook.us1.make.com/..." value={makeIntegration.webhook_url || ''} onChange={handleMakeChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="api_key">Chave de API (Header: x-make-apikey)</Label>
                        <div className="relative">
                            <Input id="api_key" type={showApiKey ? 'text' : 'password'} placeholder="Sua chave de API do Make.com" value={makeIntegration.api_key || ''} onChange={handleMakeChange} />
                            <Button variant="ghost" size="icon" type="button" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowApiKey(prev => !prev)}>
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleMakeSave}>Salvar Integração</Button>
                </CardFooter>
            </Card>
        </div>

    </div>
  );
}
