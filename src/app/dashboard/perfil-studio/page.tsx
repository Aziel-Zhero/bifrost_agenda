
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

export default function PerfilStudioPage() {
  return (
    <div className="flex flex-col gap-8 mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perfil do Studio</h1>
          <p className="text-muted-foreground">
            Defina o nome do seu negócio, metas e configurações.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configurações e Metas</CardTitle>
          <CardDescription>
            As informações aqui definirão as métricas no seu dashboard e as notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studioName">Nome do Studio</Label>
            <Input id="studioName" placeholder="Ex: Studio de Beleza da Ana" defaultValue="Bifrost" />
          </div>

          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Metas Mensais</CardTitle>
                <CardDescription>Defina seus objetivos para acompanhar no dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="monthlyGoal">Meta de Ganhos (R$)</Label>
                    <Input id="monthlyGoal" type="number" placeholder="Ex: 5000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clientsGoal">Meta de Clientes Atendidos</Label>
                    <Input id="clientsGoal" type="number" placeholder="Ex: 50" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="newClientsGoal">Meta de Novos Clientes</Label>
                    <Input id="newClientsGoal" type="number" placeholder="Ex: 10" />
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
                <CardTitle className="text-lg">Notificações</CardTitle>
                <CardDescription>Ative ou desative as notificações para clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                   <div className="flex items-center gap-3">
                        <FaWhatsapp className="h-6 w-6 text-green-500"/>
                        <div>
                            <Label htmlFor="whatsapp-notifications" className="font-semibold">WhatsApp</Label>
                            <p className="text-xs text-muted-foreground">Notificações de agendamento e lembretes.</p>
                        </div>
                   </div>
                   <Switch id="whatsapp-notifications" defaultChecked/>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                   <div className="flex items-center gap-3">
                        <FaTelegram className="h-6 w-6 text-blue-500"/>
                         <div>
                            <Label htmlFor="telegram-notifications" className="font-semibold">Telegram</Label>
                            <p className="text-xs text-muted-foreground">Notificações de agendamento e lembretes.</p>
                        </div>
                   </div>
                   <Switch id="telegram-notifications" />
                </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
