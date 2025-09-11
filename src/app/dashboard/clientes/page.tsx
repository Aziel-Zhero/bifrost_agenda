
"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  PlusCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "./components/data-table";
import type { Client } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

// We can define columns directly in the page component if they are specific to it
// Or we can keep them in a separate file if they are reused
export const getColumns = (
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void
): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-medium">{client.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "whatsapp",
    header: "WhatsApp",
  },
  {
    accessorKey: "admin",
    header: "Usuário Designado",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(client)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(client)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) {
        console.error("Error fetching clients:", error);
      } else {
        setClients(data || []);
      }
    };
    fetchClients();
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
      name: formData.get("name") as string,
      whatsapp: (formData.get("whatsapp") as string).replace(/\D/g, ''),
      telegram: formData.get("telegram") as string,
      admin: formData.get("admin") as string,
    };

    if (editingClient) {
      // Update
      const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", editingClient.id)
        .select()
        .single();
      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setClients(
          clients.map((c) => (c.id === editingClient.id ? data : c))
        );
        toast({ title: "Cliente atualizado com sucesso!" });
        setFormOpen(false);
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from("clients")
        .insert(clientData)
        .select()
        .single();
      if (error) {
        toast({
          title: "Erro ao criar",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setClients([...clients, data]);
        toast({ title: "Cliente criado com sucesso!" });
        setFormOpen(false);
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setWhatsapp(client.whatsapp); // Set whatsapp state for editing
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
        setClients(clients.filter(c => c.id !== client.id));
        toast({ title: "Cliente excluído com sucesso!" });
    }
  };
  
  const columns = getColumns(handleEdit, handleDelete);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes do Studio</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes do seu negócio.
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(isOpen) => {
            setFormOpen(isOpen);
            if (!isOpen) {
              setEditingClient(null);
              setWhatsapp(''); // Reset whatsapp state
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Editar Cliente" : "Adicionar Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nome completo do cliente"
                  defaultValue={editingClient?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="(99) 99999-9999"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  maxLength={15}
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  name="telegram"
                  placeholder="ID ou usuário do Telegram"
                  defaultValue={editingClient?.telegram}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin">Usuário Designado</Label>
                <Input
                  id="admin"
                  name="admin"
                  placeholder="Nome do admin"
                  defaultValue={editingClient?.admin}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
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
