
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Combine, User, Users } from "lucide-react";
import type { RoleSettings } from "@/types";
import { menuItems as allMenuItems } from "@/components/dashboard/nav";
import { useToast } from "@/hooks/use-toast";
import { updatePermissionsByRole } from "../usuarios/actions";
import { supabase } from "@/lib/supabase/client";


const initialRoles: RoleSettings[] = [
  {
    name: "Bifrost",
    description: "Superadministrador com acesso total e irrestrito a todas as funcionalidades e configurações do sistema.",
    permissions: allMenuItems.reduce((acc, item) => ({ ...acc, [item.href]: true }), {}),
  },
  {
    name: "Heimdall",
    description: "Administrador mestre do estúdio, com visão ampla e privilegiada, podendo gerenciar todos os usuários e relatórios.",
    permissions: allMenuItems.reduce((acc, item) => ({ ...acc, [item.href]: true }), {}),
  },
  {
    name: "Asgard",
    description: "Administradores ou profissionais do estúdio. Têm acesso às ferramentas para gerenciar seus próprios clientes e agendamentos.",
    permissions: allMenuItems.reduce((acc, item) => ({
      ...acc,
      [item.href]: !['/dashboard/usuarios', '/dashboard/permissoes', '/dashboard/perfil-studio', '/dashboard/gaia-bot', '/dashboard/bots', '/dashboard/relatorios', '/dashboard/agenda-geral', '/dashboard/api'].includes(item.href)
    }), {}),
  },
  {
    name: "Midgard",
    description: "Representa a esfera dos clientes finais. Não possuem acesso ao painel de administração.",
    permissions: allMenuItems.reduce((acc, item) => ({ ...acc, [item.href]: false }), {}),
  },
];

const roleIcons: { [key: string]: React.ElementType } = {
  Bifrost: Combine,
  Heimdall: Shield,
  Asgard: Users,
  Midgard: User,
};


export default function PermissoesPage() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<RoleSettings[]>(initialRoles);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPermissionsFromUsers = async () => {
            const { data: users, error } = await supabase.from('profiles').select('role, permissions');

            if (error) {
                toast({ title: 'Erro ao buscar permissões', description: 'Não foi possível carregar as configurações atuais.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            if (users) {
                const updatedRoles = [...initialRoles].map(role => {
                    const userWithPermissions = users.find(u => u.role === role.name && u.permissions && Object.keys(u.permissions).length > 0);
                    
                    const dbPermissions = userWithPermissions ? userWithPermissions.permissions : role.permissions;
                    const completePermissions: { [key: string]: boolean } = {};
                    
                    allMenuItems.forEach(item => {
                        completePermissions[item.href] = dbPermissions[item.href] ?? role.permissions[item.href] ?? false;
                    });

                    return { ...role, permissions: completePermissions };
                });
                setRoles(updatedRoles);
            }
            setIsLoading(false);
        };

        fetchPermissionsFromUsers();
    }, [toast]);


    const handlePermissionChange = (roleName: RoleSettings['name'], href: string, value: boolean) => {
        setRoles(prevRoles => prevRoles.map(role => 
            role.name === roleName ? { ...role, permissions: { ...role.permissions, [href]: value } } : role
        ));
    };
    
    const handleSaveChanges = async (roleName: RoleSettings['name']) => {
        const roleToSave = roles.find(r => r.name === roleName);
        if (!roleToSave) return;
        
        setIsLoading(true);
        const { error } = await updatePermissionsByRole(roleName, roleToSave.permissions);
        setIsLoading(false);

        if (error) {
            toast({
                title: "Erro ao Salvar",
                description: `Não foi possível atualizar as permissões para o papel ${roleName}. ${error.message}`,
                variant: "destructive"
            });
        } else {
             toast({
                title: "Permissões Salvas!",
                description: `As permissões para o papel ${roleName} foram atualizadas. Os usuários afetados precisarão recarregar a página para ver as mudanças.`,
                className: "bg-green-100 border-green-300 text-green-800"
            });
        }
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Papéis e Permissões</h1>
          <p className="text-muted-foreground">
            Defina o que cada tipo de usuário pode acessar no sistema.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {roles.map((role) => {
            const Icon = roleIcons[role.name];
            return (
                <Card key={role.name}>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Icon className="h-7 w-7 text-primary" />
                            <CardTitle className="text-2xl">{role.name}</CardTitle>
                        </div>
                        <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                         <h4 className="font-semibold text-base pt-2">Acesso às Páginas</h4>
                         {
                            allMenuItems.map(item => (
                                <div key={item.href} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <Label htmlFor={`perm-${role.name}-${item.href}`} className="font-normal cursor-pointer">
                                            {item.label}
                                        </Label>
                                    </div>
                                    <Switch
                                        id={`perm-${role.name}-${item.href}`}
                                        checked={!!role.permissions[item.href]}
                                        onCheckedChange={(value) => handlePermissionChange(role.name, item.href, value)}
                                        disabled={isLoading || role.name === 'Bifrost' || role.name === 'Heimdall'}
                                    />
                                </div>
                            ))
                         }
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                        <Button onClick={() => handleSaveChanges(role.name)} disabled={isLoading || role.name === 'Bifrost' || role.name === 'Heimdall'}>
                            {isLoading ? 'Salvando...' : `Salvar Permissões de ${role.name}`}
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
