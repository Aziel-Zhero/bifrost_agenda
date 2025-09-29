
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
import { Shield, Users, Star, User } from "lucide-react";
import type { Role, RoleSettings, UserProfile } from "@/types";
import { menuItems as allMenuItems } from "@/components/dashboard/nav";
import { useToast } from "@/hooks/use-toast";
import { updatePermissionsByRole } from "../usuarios/actions";
import { supabase } from "@/lib/supabase/client";

// This maps the UI-facing mythological roles to the database-level technical roles.
const roleMapToDb: Record<Role, 'owner' | 'admin' | 'staff'> = {
    Bifrost: 'owner',
    Heimdall: 'admin',
    Asgard: 'staff',
    Midgard: 'staff',
};

const initialRoles: RoleSettings[] = [
  {
    name: "Bifrost",
    description: "Superadministrador (Owner). Acesso total e irrestrito, não pode ser modificado.",
    permissions: allMenuItems.reduce((acc, item) => ({ ...acc, [item.href]: true }), {}),
  },
  {
    name: "Heimdall",
    description: "Administrador mestre (Admin). Acesso total e irrestrito, não pode ser modificado.",
    permissions: allMenuItems.reduce((acc, item) => ({ ...acc, [item.href]: true }), {}),
  },
  {
    name: "Asgard",
    description: "Profissional do estúdio (Staff). Gerencia seus próprios agendamentos e clientes.",
    permissions: allMenuItems.reduce((acc, item) => ({
      ...acc,
      [item.href]: !['/dashboard/usuarios', '/dashboard/permissoes', '/dashboard/perfil-studio', '/dashboard/bots', '/dashboard/relatorios', '/dashboard/agenda-geral'].includes(item.href)
    }), {}),
  },
   {
    name: "Midgard",
    description: "Representa os clientes (Staff). Acesso limitado, com permissões idênticas a Asgard.",
    permissions: allMenuItems.reduce((acc, item) => ({
      ...acc,
      [item.href]: !['/dashboard/usuarios', '/dashboard/permissoes', '/dashboard/perfil-studio', '/dashboard/bots', '/dashboard/relatorios', '/dashboard/agenda-geral'].includes(item.href)
    }), {}),
  },
];

const roleIcons: { [key: string]: React.ElementType } = {
  Bifrost: Star,
  Heimdall: Shield,
  Asgard: Users,
  Midgard: User,
};


export default function PermissoesPage() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<RoleSettings[]>(initialRoles);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPermissionsFromDB = async () => {
            // Fetch a representative user for each role to get the stored permissions
            const dbRoles: ('owner' | 'admin' | 'staff')[] = ['owner', 'admin', 'staff'];
            const { data: users, error } = await supabase.from('profiles').select('role, permissions').in('role', dbRoles);

            if (error) {
                toast({ title: 'Erro ao buscar permissões', description: 'Não foi possível carregar as configurações atuais.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            if (users) {
                const dbPermissionsMap = new Map();
                users.forEach(u => {
                    // Store the first non-empty permission set found for each role
                    if (u.role && !dbPermissionsMap.has(u.role) && u.permissions && Object.keys(u.permissions).length > 0) {
                        dbPermissionsMap.set(u.role, u.permissions);
                    }
                });

                const updatedRoles = initialRoles.map(role => {
                    const dbRole = roleMapToDb[role.name];
                    const dbPermissions = dbPermissionsMap.get(dbRole);
                    
                    const finalPermissions: { [key: string]: boolean } = {};
                    allMenuItems.forEach(item => {
                        // Use DB permission if available, otherwise fall back to the initial default for that role
                        finalPermissions[item.href] = dbPermissions?.[item.href] ?? role.permissions[item.href] ?? false;
                    });
                    
                    return { ...role, permissions: finalPermissions };
                });
                setRoles(updatedRoles);
            }
            setIsLoading(false);
        };

        fetchPermissionsFromDB();
    }, [toast]);


    const handlePermissionChange = (roleName: RoleSettings['name'], href: string, value: boolean) => {
        setRoles(prevRoles => prevRoles.map(role => {
            if (role.name === roleName) {
                const newPermissions = { ...role.permissions, [href]: value };
                // If Midgard is being changed, Asgard should match, and vice-versa
                if (roleName === 'Asgard') {
                    const midgardRole = prevRoles.find(r => r.name === 'Midgard');
                    if (midgardRole) midgardRole.permissions = newPermissions;
                } else if (roleName === 'Midgard') {
                     const asgardRole = prevRoles.find(r => r.name === 'Asgard');
                    if (asgardRole) asgardRole.permissions = newPermissions;
                }
                return { ...role, permissions: newPermissions };
            }
            return role;
        }));
    };
    
    const handleSaveChanges = async (roleName: RoleSettings['name']) => {
        const roleToSave = roles.find(r => r.name === roleName);
        if (!roleToSave) return;
        
        setIsLoading(true);
        // The server action handles the mapping from mythological to DB role
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
             // Refetch to confirm changes
             // await fetchPermissionsFromDB();
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
            const isSuperAdmin = role.name === 'Bifrost' || role.name === 'Heimdall';
            return (
                <Card key={role.name}>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Icon className="h-7 w-7 text-primary" />
                            <CardTitle className="text-2xl capitalize">{role.name}</CardTitle>
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
                                        disabled={isLoading || isSuperAdmin}
                                    />
                                </div>
                            ))
                         }
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6">
                        <Button onClick={() => handleSaveChanges(role.name)} disabled={isLoading || isSuperAdmin}>
                            {isLoading ? 'Salvando...' : `Salvar Permissões`}
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
