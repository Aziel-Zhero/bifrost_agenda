
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  const [isRoleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserProfile['role'] | ''>('');
  
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | ''>('');
  
  const { toast } = useToast();


  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
    } else if (data) {
      const usersWithPermissions = data.map(u => ({...u, permissions: u.permissions || {}}))
      setUsers(usersWithPermissions);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditPermissions = (user: UserProfile) => {
    setSelectedUser(user);
    setPermissionsDialogOpen(true);
  };
  
  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setRoleDialogOpen(true);
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
  
  const handleRoleSave = async () => {
    if (selectedUser && selectedRole) {
        const { error } = await supabase
            .from('profiles')
            .update({ role: selectedRole })
            .eq('id', selectedUser.id);
        
        if (error) {
            toast({
              title: "Erro ao salvar",
              description: "Não foi possível atualizar o cargo do usuário.",
              variant: "destructive",
            });
            console.error('Error updating role:', error);
        } else {
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: selectedRole } : u));
            toast({
              title: "Sucesso!",
              description: `O cargo de ${selectedUser.name} foi atualizado para ${selectedRole}.`,
            });
        }
    }
    setRoleDialogOpen(false);
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

    const { data, error } = await supabase.auth.signUp({
      email: newUserEmail,
      // The form does not have a password field, so we use a default one.
      // In a real application, you'd want to send an invitation link instead.
      password: 'password',
      options: {
        data: {
          full_name: newUserName,
          role: newUserRole,
        },
      },
    });

    if (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    } else if (data.user) {
      // The trigger will create the profile. We just need to refresh the user list.
      await fetchUsers();
      toast({
        title: "Usuário Adicionado!",
        description: `${newUserName} foi adicionado. A senha inicial é 'password'.`,
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
                <DialogDescription>
                  O usuário será criado com uma senha padrão ('password') e deverá alterá-la no primeiro acesso.
                </DialogDescription>
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
            <DataTable columns={columns({ onEditPermissions: handleEditPermissions, onEditRole: handleEditRole })} data={users} />
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

      {selectedUser && (
        <Dialog open={isRoleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Tipo de Acesso</DialogTitle>
                    <DialogDescription>
                        Alterando o cargo de <span className="font-semibold">{selectedUser.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Label htmlFor="edit-role">Cargo</Label>
                     <Select value={selectedRole} onValueChange={(value: UserProfile['role']) => setSelectedRole(value)}>
                      <SelectTrigger id="edit-role">
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
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleRoleSave}>Salvar Alteração</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
