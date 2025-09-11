
"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { columns } from "./components/columns";
import { DataTable } from "@/app/dashboard/clientes/components/data-table";
import { supabase } from "@/lib/supabase/client";
import type { Client } from "@/types";
import { useToast } from "@/hooks/use-toast";


export default function MeusClientesPage() {
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [myClients, setMyClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const fetchUserAndClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
          setCurrentUser({ ...user, name: profile?.name || user.email });
          
          const { data, error } = await supabase
              .from('clients')
              .select('*')
              .eq('admin', profile?.name || user.email);
              
          if (error) {
              console.error("Error fetching clients:", error);
          } else {
              setMyClients(data || []);
          }
      }
    };
    fetchUserAndClients();
  }, []);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyNums = value.replace(/\D/g, '');
    let masked = '';
    if (onlyNums.length > 0) {
      masked = `(${onlyNums.substring(0, 2)}`;
    }
    if (onlyNums.length > 2) {
      masked += `) ${onlyNums.substring(2, 7)}`;
    }
    if (onlyNums.length > 7) {
      masked += `-${onlyNums.substring(7, 11)}`;
    }
    setWhatsapp(masked);
  };


  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newClient = {
        name: formData.get('name') as string,
        whatsapp: (formData.get('whatsapp') as string).replace(/\D/g, ''),
        telegram: formData.get('telegram') as string,
        admin: currentUser.name,
    };

    const { data, error } = await supabase.from('clients').insert(newClient).select().single();

    if (error) {
        toast({ title: "Erro ao adicionar cliente", description: error.message, variant: "destructive" });
    } else if (data) {
        setMyClients(prev => [...prev, data]);
        toast({ title: "Cliente Adicionado!", description: `${data.name} foi adicionado à sua lista.`, className: "bg-green-100" });
        setFormOpen(false);
        setWhatsapp(''); // Reset whatsapp state
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes que são designados a você.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={isOpen => {
          setFormOpen(isOpen);
          if (!isOpen) {
            setWhatsapp('');
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Nome completo do cliente" required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="(99) 99999-9999" value={whatsapp} onChange={handleWhatsappChange} maxLength={15} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input id="telegram" name="telegram" placeholder="ID ou Telefone" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">Salvar Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={myClients} />
        </CardContent>
      </Card>
    </div>
  );
}
