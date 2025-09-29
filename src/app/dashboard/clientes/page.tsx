
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
import { getColumns } from "./components/columns";
import { DataTable } from "@/app/dashboard/clientes/components/data-table";
import { supabase } from "@/lib/supabase/client";
import type { Client, UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ClientesPage() {
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [phone, setPhone] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchUserAndClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile as any);
      
      const { data: clientData, error: clientError } = await supabase.from('clients').select('*');
              
      if (clientError) {
          console.error("Error fetching clients:", clientError);
          toast({ title: "Erro ao buscar clientes", description: clientError.message, variant: "destructive" });
      } else {
          setClients(clientData || []);
      }
    };
    fetchUserAndClients();
  }, [toast]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setPhone(masked);
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive"});
      return;
    }
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientData = {
        full_name: formData.get('name') as string,
        phone: (formData.get('phone') as string).replace(/\D/g, ''),
        telegram: formData.get('telegram') as string,
        email: formData.get('email') as string,
    };

    if (editingClient) {
        // Update logic
        const { data, error } = await supabase.from('clients').update(clientData).eq('id', editingClient.id).select().single();
        if (error) {
            toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setClients(prev => prev.map(c => c.id === data.id ? data : c));
            toast({ title: "Cliente Atualizado!", description: `${data.full_name} foi atualizado.`, className: "bg-green-100" });
        }

    } else {
        // Create logic
        const { data, error } = await supabase.from('clients').insert(clientData).select().single();
        if (error) {
            toast({ title: "Erro ao adicionar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setClients(prev => [...prev, data]);
            toast({ title: "Cliente Adicionado!", description: `${data.full_name} foi adicionado à sua lista.`, className: "bg-green-100" });
        }
    }
    
    closeForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setPhone(client.phone || ''); // Mask it for display
    setFormOpen(true);
  };

  const handleDelete = async (client: Client) => {
    // Ideally, show a confirmation dialog first
    const { error } = await supabase.from("clients").delete().eq("id", client.id);
    if (error) {
       toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o cliente. Erro: " + error.message,
          variant: "destructive",
        });
    } else {
        setClients(clients.filter(c => c.id !== client.id));
        toast({ title: "Cliente excluído com sucesso!" });
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingClient(null);
    setPhone('');
  }
  
  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  const isAdmin = currentUser?.role === 'Heimdall' || currentUser?.role === 'Bifrost';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes do estúdio.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={isOpen => {
          if (!isOpen) closeForm();
          else setFormOpen(true);
        }}>
          <DialogTrigger asChild>
             <Button onClick={() => { setEditingClient(null); setFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar' : 'Adicionar'} Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" placeholder="Nome completo do cliente" defaultValue={editingClient?.full_name} required/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="email@cliente.com" defaultValue={editingClient?.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" name="phone" placeholder="(99) 99999-9999" value={phone} onChange={handlePhoneChange} maxLength={15} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Chat ID (Opcional)</Label>
                <Input id="telegram" name="telegram" placeholder="ID numérico do chat com o bot" defaultValue={editingClient?.telegram || ''} />
                <p className="text-xs text-muted-foreground">
                    Peça para o cliente enviar uma mensagem ao bot e use o `@userinfobot` para obter o ID.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={clients} />
        </CardContent>
      </Card>
    </div>
  );
}

    