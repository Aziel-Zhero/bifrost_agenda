
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudioHour, StudioProfile } from "@/types";
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

const formatTime = (timeString: string) => {
    if (timeString && timeString.length > 5) {
        return timeString.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
    }
    return timeString;
}

export default function PerfilStudioPage() {
  const { toast } = useToast();
  
  const [studioProfile, setStudioProfile] = useState<Partial<StudioProfile>>({ studio_name: "Bifrost" });
  
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
    const fetchStudioProfile = async () => {
        const { data, error } = await supabase
            .from('studio_profile')
            .select('*')
            .eq('id', 1)
            .single();
        if (data) {
            setStudioProfile(data);
        } else {
            console.log("No studio profile found, using defaults. Error:", error?.message);
        }
    };

    const fetchHours = async () => {
      const { data, error } = await supabase.from('studio_hours').select('*');
      if (error) {
        console.log("Could not fetch studio hours, might be first time setup:", error.message);
      } else if (data && data.length > 0) {
        const formattedData = data.map(hour => ({
          ...hour,
          start_time: formatTime(hour.start_time),
          end_time: formatTime(hour.end_time),
        }));
        const sortedData = formattedData.sort((a, b) => a.day_of_week - b.day_of_week);
        setStudioHours(sortedData);
      }
    };
    
    fetchStudioProfile();
    fetchHours();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStudioProfile(prev => ({...prev, [id]: value}));
  }

  const handleSaveStudioProfile = async () => {
    const { error } = await supabase
        .from('studio_profile')
        .upsert({ ...studioProfile, id: 1 }, { onConflict: 'id' });
    
    if (error) {
        toast({ title: "Erro ao salvar", description: `Não foi possível salvar o perfil do estúdio: ${error.message}`, variant: "destructive" });
    } else {
        toast({ title: "Perfil do Estúdio Salvo!", description: "As informações do seu negócio foram atualizadas." });
    }
  }


  const handleHourChange = (day: number, field: 'start_time' | 'end_time' | 'is_enabled', value: string | boolean) => {
    setStudioHours(prev => 
        prev.map(hour => 
            hour.day_of_week === day ? {...hour, [field]: value} : hour
        )
    )
  }

  const handleSaveHours = async () => {
    const { data, error } = await supabase.from('studio_hours').upsert(studioHours, {
        onConflict: 'day_of_week'
    }).select();

    if (error) {
        console.error("Error saving studio hours:", error);
        toast({
            title: "Erro ao salvar!",
            description: `Não foi possível atualizar os horários de funcionamento: ${error.message}`,
            variant: "destructive"
        });
    } else if (data) {
         const formattedData = data.map(hour => ({
            ...hour,
            start_time: formatTime(hour.start_time),
            end_time: formatTime(hour.end_time),
        }));
        const sortedData = formattedData.sort((a, b) => a.day_of_week - b.day_of_week);
        setStudioHours(sortedData);
        toast({
            title: "Horários salvos!",
            description: "Seu horário de funcionamento foi atualizado.",
        });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Perfil do Studio</h1>
          <p className="text-muted-foreground">
            Defina o nome, endereço, horários e outras configurações do seu negócio.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>
                    Informações principais do seu negócio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studio_name">Nome do Studio</Label>
                    <Input id="studio_name" placeholder="Ex: Studio de Beleza da Ana" value={studioProfile.studio_name || ''} onChange={handleProfileChange} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveStudioProfile}>Salvar Configurações</Button>
                </CardFooter>
              </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Endereço do Studio</CardTitle>
                        <CardDescription>
                           Essas informações serão usadas pela GAIA para guiar seus clientes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="google_maps_url">Link do Google Maps</Label>
                            <Input id="google_maps_url" placeholder="https://maps.app.goo.gl/..." value={studioProfile.google_maps_url || ''} onChange={handleProfileChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="address_street">Rua / Avenida</Label>
                                <Input id="address_street" value={studioProfile.address_street || ''} onChange={handleProfileChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address_number">Número</Label>
                                <Input id="address_number" value={studioProfile.address_number || ''} onChange={handleProfileChange} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address_complement">Complemento</Label>
                                <Input id="address_complement" placeholder="Apto, sala, etc." value={studioProfile.address_complement || ''} onChange={handleProfileChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address_neighborhood">Bairro</Label>
                                <Input id="address_neighborhood" value={studioProfile.address_neighborhood || ''} onChange={handleProfileChange} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="address_city">Cidade</Label>
                                <Input id="address_city" value={studioProfile.address_city || ''} onChange={handleProfileChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address_state">Estado</Label>
                                <Input id="address_state" value={studioProfile.address_state || ''} onChange={handleProfileChange} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSaveStudioProfile}>Salvar Endereço</Button>
                    </CardFooter>
                </Card>

            </div>

             <div className="space-y-8">
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
            </div>
        </div>
      </div>
    </>
  );
}
