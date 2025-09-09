
"use client";

import { useState } from "react";
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
import { users as mockUsers } from "@/lib/mock-data";
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


export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [isPermissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleEditPermissions = (user: UserProfile) => {
    setSelectedUser(user);
    setPermissionsDialogOpen(true);
  };
  
  const handlePermissionsSave = (updatedPermissions: UserProfile['permissions']) => {
    if (selectedUser) {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, permissions: updatedPermissions } : u));
    }
    setPermissionsDialogOpen(false);
  }

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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Nome do membro da equipe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acesso</Label>
                  <Input id="email" type="email" placeholder="usuario@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Acesso</Label>
                  <Select>
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
