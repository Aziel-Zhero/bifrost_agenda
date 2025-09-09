
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
import type { UserProfile } from "@/types";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditPermissionsDialog from "./components/edit-permissions-dialog";
import { menuItems } from "@/components/dashboard/nav";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";


export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [isPermissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserProfile['role'] | ''>('');
  const { toast } = useToast();


  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching users:', error);
      } else if (data) {
        const usersWithPermissions = data.map(u => ({...u, permissions: u.permissions || {}}))
        setUsers(usersWithPermissions);
      }
    };
    fetchUsers();
  }, []);

  const handleEditPermissions = (user: UserProfile) => {
    setSelectedUser(user);
    setPermissionsDialogOpen(true);
  };
  
  const handlePermissionsSave = async (updatedPermissions: UserProfile['permissions']) => {
    if (selectedUser) {
        const { error } = await supabase
          .from('profiles')
          .update({ permissions: updatedPermissions })
          .eq('id', selectedUser.id)

        if (error) {
            toast({
              title: "Erro ao salvar",
              description: "Não foi possível atualizar as permissões.",
              variant: "destructive",
            });
            console.error('Error updating permissions:', error);
        } else {
             setUsers(users.map(u => u.id === selectedUser.id ? { ...u, permissions: updatedPermissions } : u));
             toast({
              title: "Sucesso!",
              description: "Permissões do usuário atualizadas.",
            });
        }
    }
    setPermissionsDialogOpen(false);
  };
  
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // This is a simplified user creation. In a real-world scenario,
    // you would use Supabase Auth to create the user, which would give you a secure ID.
    // Then you would insert into the 'profiles' table with that ID.
    // For this prototype, we'll insert directly. This will not create an authenticated user.
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ name: newUserName, email: newUserEmail, role: newUserRole, permissions: {} }])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    } else if (data) {
      setUsers([...users, data]);
      toast({
        title: "Usuário Adicionado!",
        description: `${newUserName} foi adicionado com sucesso.`,
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('');
      setAddFormOpen(false);
    }
  };


  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Adicione, edite e defina permissões para sua equipe.
            </p>
          </div>
          <Dialog open={isAddFormOpen} onOpenChange={setAddFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Nome do membro da equipe" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acesso</Label>
                  <Input id="email" type="email" placeholder="usuario@email.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Acesso</Label>
                  <Select value={newUserRole} onValueChange={(value: UserProfile['role']) => setNewUserRole(value)}>
                      <SelectTrigger id="role">
                          <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Midgard">Midgard</SelectItem>
                          <SelectItem value="Asgard">Asgard</SelectItem>
                          <SelectItem value="Heimdall">Heimdall</SelectItem>
                          <SelectItem value="Bifrost">Bifrost</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setAddFormOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Usuário</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable columns={columns({ onEditPermissions: handleEditPermissions })} data={users} />
          </CardContent>
        </Card>
      </div>
      
      {selectedUser && (
        <EditPermissionsDialog
          isOpen={isPermissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          user={selectedUser}
          menuItems={menuItems}
          onSave={handlePermissionsSave}
        />
      )}
    </>
  );
}
