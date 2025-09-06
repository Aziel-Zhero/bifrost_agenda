
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { format } from "date-fns";

export default function PerfilStudioPage() {
  const { toast } = useToast();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [studioName, setStudioName] = useState("Bifrost");
  const [goals, setGoals] = useState({
    monthlyGoal: "500",
    clientsGoal: "32",
    newClientsGoal: "25",
  });
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setGoals(prev => ({...prev, [id]: value}));
  }
  
  const handleSaveGoals = () => {
    // This function will be called after all confirmations
    setIsEditingGoals(false);
    toast({
      title: "Sucesso!",
      description: "Suas metas foram salvas.",
      className: 'bg-green-100 border-green-300 text-green-800'
    });
  };

  const handleExportAndSave = () => {
    const today = format(new Date(), 'ddMMyyyy');
    const filename = `${studioName.replace(/\s/g, '')}_${today}.csv`;
    
    // Mocked dashboard data for export
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyData = months.slice(0, new Date().getMonth() + 1).map(month => ({
        month,
        gains: (Math.random() * 2000 + 7000).toFixed(2),
        cancellations: Math.floor(Math.random() * 5 + 10),
        totalClients: Math.floor(Math.random() * 10 + 40),
        newClients: Math.floor(Math.random() * 5 + 15)
    }));

    const totals = {
        gains: monthlyData.reduce((sum, data) => sum + parseFloat(data.gains), 0).toFixed(2),
        cancellations: monthlyData.reduce((sum, data) => sum + data.cancellations, 0),
        totalClients: monthlyData.reduce((sum, data) => sum + data.totalClients, 0),
        newClients: monthlyData.reduce((sum, data) => sum + data.newClients, 0)
    };

    let csvContent = "data:text/csv;charset=utf-8," 
      + "Mês,Ganhos (R$),Cancelamentos,Clientes Atendidos,Novos Clientes\n";
    
    monthlyData.forEach(data => {
        csvContent += `${data.month},${data.gains},${data.cancellations},${data.totalClients},${data.newClients}\n`;
    });

    csvContent += `Total,${totals.gains},${totals.cancellations},${totals.totalClients},${totals.newClients}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleSaveGoals();
    setExportOpen(false);
  }

  const handleInitialSaveClick = () => {
    setConfirmOpen(true);
  };
  
  const handleCancelEdit = () => {
    // Here you might want to reset `goals` to their original state if they were fetched
    setIsEditingGoals(false);
  }

  return (
    <>
      <div className="flex flex-col gap-8 mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Perfil do Studio</h1>
            <p className="text-muted-foreground">
              Defina o nome do seu negócio, metas e configurações.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Informações principais do seu negócio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="studioName">Nome do Studio</Label>
                <Input id="studioName" placeholder="Ex: Studio de Beleza da Ana" value={studioName} onChange={e => setStudioName(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-lg">Metas Mensais</CardTitle>
                <CardDescription>Defina seus objetivos para acompanhar no dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="monthlyGoal">Meta de Ganhos (R$)</Label>
                    <Input id="monthlyGoal" type="number" value={goals.monthlyGoal} onChange={handleGoalChange} disabled={!isEditingGoals} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clientsGoal">Meta de Clientes Atendidos</Label>
                    <Input id="clientsGoal" type="number" value={goals.clientsGoal} onChange={handleGoalChange} disabled={!isEditingGoals} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newClientsGoal">Meta de Novos Clientes</Label>
                    <Input id="newClientsGoal" type="number" value={goals.newClientsGoal} onChange={handleGoalChange} disabled={!isEditingGoals} />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                  {!isEditingGoals ? (
                      <Button onClick={() => setIsEditingGoals(true)}>Alterar Metas</Button>
                  ) : (
                      <>
                          <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                          <Button onClick={handleInitialSaveClick}>Salvar Metas</Button>
                      </>
                  )}
            </CardFooter>
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
                            <Label htmlFor="whatsapp-notifications" className="font-semibold cursor-pointer">WhatsApp</Label>
                            <p className="text-xs text-muted-foreground">Notificações de agendamento e lembretes.</p>
                        </div>
                  </div>
                  <Switch id="whatsapp-notifications" defaultChecked/>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                        <FaTelegram className="h-6 w-6 text-blue-500"/>
                        <div>
                            <Label htmlFor="telegram-notifications" className="font-semibold cursor-pointer">Telegram</Label>
                            <p className="text-xs text-muted-foreground">Notificações de agendamento e lembretes.</p>
                        </div>
                  </div>
                  <Switch id="telegram-notifications" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* First Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Alterar suas metas irá recalcular as métricas de desempenho no seu dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmOpen(false); setExportOpen(true); }}>Sim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Confirmation Dialog (Export) */}
      <AlertDialog open={isExportOpen} onOpenChange={setExportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar Relatório Atual?</AlertDialogTitle>
            <AlertDialogDescription>
               Recomendamos exportar os dados atuais para manter um histórico. O arquivo CSV conterá os dados de desempenho mensais, de janeiro até a data atual, com um total consolidado no final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => { setExportOpen(false); handleSaveGoals(); }}>
              Salvar sem Exportar
            </Button>
            <AlertDialogAction onClick={handleExportAndSave}>Exportar Dados e Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
