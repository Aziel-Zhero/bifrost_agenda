
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
import type { Client } from "@/types";
import { useToast } from "@/hooks/use-toast";


export default function MeusClientesPage() {
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [myClients, setMyClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const clientData = {
        name: formData.get('name') as string,
        whatsapp: (formData.get('whatsapp') as string).replace(/\D/g, ''),
        telegram: formData.get('telegram') as string,
        admin: currentUser.name,
    };

    if (editingClient) {
        // Update logic
        const { data, error } = await supabase.from('clients').update(clientData).eq('id', editingClient.id).select().single();
        if (error) {
            toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setMyClients(prev => prev.map(c => c.id === data.id ? data : c));
            toast({ title: "Cliente Atualizado!", description: `${data.name} foi atualizado.`, className: "bg-green-100" });
        }

    } else {
        // Create logic
        const { data, error } = await supabase.from('clients').insert(clientData).select().single();
        if (error) {
            toast({ title: "Erro ao adicionar cliente", description: error.message, variant: "destructive" });
        } else if (data) {
            setMyClients(prev => [...prev, data]);
            toast({ title: "Cliente Adicionado!", description: `${data.name} foi adicionado à sua lista.`, className: "bg-green-100" });
        }
    }
    
    closeForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setWhatsapp(client.whatsapp); // Mask it for display
    setFormOpen(true);
  };

  const handleDelete = async (client: Client) => {
    // Ideally, show a confirmation dialog first
    const { error } = await supabase.from("clients").delete().eq("id", client.id);
    if (error) {
       toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive",
        });
    } else {
        setMyClients(myClients.filter(c => c.id !== client.id));
        toast({ title: "Cliente excluído com sucesso!" });
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingClient(null);
    setWhatsapp('');
  }
  
  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });


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
                <Label htmlFor="telegram">Telegram (Opcional)</Label>
                <Input id="telegram" name="telegram" placeholder="ID ou Telefone" defaultValue={editingClient?.telegram || ''} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">Salvar</Button>
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
