
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerfilPage() {
  return (
    <div className="flex flex-col gap-8 mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e de acesso.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>
            Esses são os seus dados de identificação na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://picsum.photos/128/128" alt="Admin" data-ai-hint="person" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Button variant="outline">Alterar Foto</Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição</Label>
            <Input id="displayName" defaultValue="Admin Master" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="admin@example.com" disabled />
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="password">Alterar Senha</Label>
            <Input id="password" type="password" placeholder="Digite a nova senha" />
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
