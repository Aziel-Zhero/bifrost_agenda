
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ShieldCheck } from "lucide-react";
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
import { deleteUser, inviteUser } from "./actions";

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [isPermissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [isRoleDialogOpen, setRoleDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  
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

   const handleDeleteClick = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteAlertOpen(true);
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
    if (!newUserName || !newUserEmail) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await inviteUser({ email: newUserEmail, name: newUserName });

    if (error) {
        const errorMessage = error.message;
        console.error("Error inviting user:", errorMessage);
        
        toast({
            title: "Erro ao convidar usuário",
            description: errorMessage,
            variant: "destructive",
        });
    } else {
      await fetchUsers(); // Re-fetch users to see pending invite if applicable
      toast({
        title: "Convite Enviado!",
        description: `Um e-mail de convite foi enviado para ${newUserEmail}.`,
      });
      setNewUserName('');
      setNewUserEmail('');
      setAddFormOpen(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    const result = await deleteUser(selectedUser.id);
    
    if (result.error) {
      toast({
        title: "Erro ao remover usuário",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast({
        title: "Usuário removido",
        description: `${selectedUser.name} foi removido do sistema.`,
      });
    }

    setDeleteAlertOpen(false);
    setSelectedUser(null);
  };


  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Adicione, edite e defina permissões para sua equipe.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => router.push('/sign-up')} className="w-full sm:w-auto">
                Testar Tela de Senha
            </Button>
            <Dialog open={isAddFormOpen} onOpenChange={setAddFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Um e-mail de convite será enviado para o usuário, que poderá definir sua própria senha.
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
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setAddFormOpen(false)}>Cancelar</Button>
                    <Button type="submit">Enviar Convite</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DataTable columns={columns({ onEditPermissions: handleEditPermissions, onEditRole: handleEditRole, onDelete: handleDeleteClick })} data={users} />
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

      {selectedUser && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. O usuário <span className="font-semibold">{selectedUser.name}</span> e todos os seus dados associados serão permanentemente removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90">Confirmar Exclusão</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
