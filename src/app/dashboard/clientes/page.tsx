
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, MoreHorizontal, User, Edit, Trash2 } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [whatsapp, setWhatsapp] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchUserAndClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile);
      
      const isAdmin = profile?.role === 'Heimdall' || profile?.role === 'Bifrost';
      
      let query = supabase.from('clients').select('*');

      if (!isAdmin) {
          // Asgard users see only their own clients
          query = query.eq('admin', profile?.name || user.email);
      }
      
      const { data: clientData, error: clientError } = await query;
              
      if (clientError) {
          console.error("Error fetching clients:", clientError);
          toast({ title: "Erro ao buscar clientes", description: clientError.message, variant: "destructive" });
      } else {
          setClients(clientData || []);
      }
    };
    fetchUserAndClients();
  }, [toast]);

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


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive"});
      return;
    }
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientData = {
        name: formData.get('name') as string,
        whatsapp: (formData.get('whatsapp') as string).replace(/\D/g, ''),
        telegram: formData.get('telegram') as string,
        // For Asgard users, admin is always themselves. For Admins, it's what they type.
        admin: (currentUser.role === 'Asgard' ? currentUser.name : formData.get('admin') as string) || currentUser.name,
    };

    if (editingClient) {
        // Update logic
        const { data, error } = await supabase.from('clients').update(clientData).eq('id', editingClient.id).select().single();
        if (error) {
            toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setClients(prev => prev.map(c => c.id === data.id ? data : c));
            toast({ title: "Cliente Atualizado!", description: `${data.name} foi atualizado.`, className: "bg-green-100" });
        }

    } else {
        // Create logic
        const { data, error } = await supabase.from('clients').insert(clientData).select().single();
        if (error) {
            toast({ title: "Erro ao adicionar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setClients(prev => [...prev, data]);
            toast({ title: "Cliente Adicionado!", description: `${data.name} foi adicionado à sua lista.`, className: "bg-green-100" });
        }
    }
    
    closeForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setWhatsapp(client.whatsapp || ''); // Mask it for display
    setFormOpen(true);
  };

  const handleDelete = async (client: Client) => {
    // Ideally, show a confirmation dialog first
    const { error } = await supabase.from("clients").delete().eq("id", client.id);
    if (error) {
       toast({
          title: "Erro ao excluir",
          description: "Você pode não ter permissão para excluir este cliente. Apenas o usuário designado pode excluí-lo. Erro: " + error.message,
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
    setWhatsapp('');
  }
  
  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  const isAdmin = currentUser?.role === 'Heimdall' || currentUser?.role === 'Bifrost';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Gerencie todos os clientes do estúdio." : "Gerencie os clientes que são designados a você."}
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
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Nome completo do cliente" defaultValue={editingClient?.name} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="(99) 99999-9999" value={whatsapp} onChange={handleWhatsappChange} maxLength={15} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Chat ID (Opcional)</Label>
                <Input id="telegram" name="telegram" placeholder="ID numérico do chat com o bot" defaultValue={editingClient?.telegram || ''} />
                <p className="text-xs text-muted-foreground">
                    Peça para o cliente enviar uma mensagem ao bot e use o `@userinfobot` para obter o ID.
                </p>
              </div>
               {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="admin">Usuário Designado</Label>
                    <Input
                      id="admin"
                      name="admin"
                      placeholder="Nome do admin responsável"
                      defaultValue={editingClient?.admin || currentUser?.name}
                      required
                    />
                  </div>
                )}
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
