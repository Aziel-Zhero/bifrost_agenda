
"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudioHour } from "@/types";
import { supabase } from "@/lib/supabase/client";

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const generateTimeOptions = () => {
    const options = [];
    for (let h = 5; h <= 23; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            options.push(time);
        }
    }
    return options;
}

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

  const [studioHours, setStudioHours] = useState<Omit<StudioHour, 'id' | 'created_at'>[]>([
    { day_of_week: 0, start_time: "09:00", end_time: "18:00", is_enabled: false },
    { day_of_week: 1, start_time: "09:00", end_time: "18:00", is_enabled: true },
    { day_of_week: 2, start_time: "09:00", end_time: "18:00", is_enabled: true },
    { day_of_week: 3, start_time: "09:00", end_time: "18:00", is_enabled: true },
    { day_of_week: 4, start_time: "09:00", end_time: "18:00", is_enabled: true },
    { day_of_week: 5, start_time: "09:00", end_time: "18:00", is_enabled: true },
    { day_of_week: 6, start_time: "09:00", end_time: "18:00", is_enabled: false },
  ]);
  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const fetchHours = async () => {
      const { data, error } = await supabase.from('studio_hours').select('*');
      if (error) {
        // This is not a critical error if the table doesn't exist yet.
        // The default state will be used.
        console.log("Could not fetch studio hours, might be first time setup:", error.message);
      } else if (data && data.length > 0) {
        // Sort data to ensure it matches the weekDays array order
        const sortedData = data.sort((a, b) => a.day_of_week - b.day_of_week);
        setStudioHours(sortedData);
      }
    };
    fetchHours();
  }, []);

  const handleHourChange = (day: number, field: 'start_time' | 'end_time' | 'is_enabled', value: string | boolean) => {
    setStudioHours(prev => 
        prev.map(hour => 
            hour.day_of_week === day ? {...hour, [field]: value} : hour
        )
    )
  }

  const handleSaveHours = async () => {
    // Using upsert to either insert a new row or update an existing one based on day_of_week
    const { error } = await supabase.from('studio_hours').upsert(studioHours, {
        onConflict: 'day_of_week'
    });

    if (error) {
        console.error("Error saving studio hours:", error);
        toast({
            title: "Erro ao salvar!",
            description: "Não foi possível atualizar os horários de funcionamento.",
            variant: "destructive"
        });
    } else {
        toast({
            title: "Horários salvos!",
            description: "Seu horário de funcionamento foi atualizado.",
        });
    }
  }

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
                <CardTitle className="text-lg">Horários de Funcionamento</CardTitle>
                <CardDescription>Defina quando o estúdio está aberto para agendamentos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {studioHours.map(hour => (
                    <div key={hour.day_of_week} className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center space-x-2">
                             <Switch
                                id={`enabled-${hour.day_of_week}`}
                                checked={hour.is_enabled}
                                onCheckedChange={(value) => handleHourChange(hour.day_of_week, 'is_enabled', value)}
                             />
                             <Label htmlFor={`enabled-${hour.day_of_week}`} className="flex-1">{weekDays[hour.day_of_week]}</Label>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                           <Select value={hour.start_time} onValueChange={(value) => handleHourChange(hour.day_of_week, 'start_time', value)} disabled={!hour.is_enabled}>
                               <SelectTrigger><SelectValue/></SelectTrigger>
                               <SelectContent>
                                   {timeOptions.map(t => <SelectItem key={`start-${t}`} value={t}>{t}</SelectItem>)}
                               </SelectContent>
                           </Select>
                            <Select value={hour.end_time} onValueChange={(value) => handleHourChange(hour.day_of_week, 'end_time', value)} disabled={!hour.is_enabled}>
                               <SelectTrigger><SelectValue/></SelectTrigger>
                               <SelectContent>
                                   {timeOptions.map(t => <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>)}
                               </SelectContent>
                           </Select>
                        </div>
                    </div>
                ))}
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleSaveHours}>Salvar Horários</Button>
            </CardFooter>
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
