
"use client";

import { useState } from "react";
import { PlusCircle, Users2 } from "lucide-react";
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
import { users } from "@/lib/mock-data";
import { columns } from "./components/columns";
import { DataTable } from "@/app/dashboard/clientes/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsuariosPage() {
  const [isFormOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Adicione, edite e defina permissões para sua equipe.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
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
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Usuário</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
  );
}
