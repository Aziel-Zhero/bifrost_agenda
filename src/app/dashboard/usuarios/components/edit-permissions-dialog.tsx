
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { UserProfile } from "@/types";
import { menuItems } from "@/components/dashboard/nav";
import { Shield } from "lucide-react";


interface EditPermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile | null;
  menuItems: typeof menuItems;
  onSave: (permissions: UserProfile['permissions']) => void;
}

export default function EditPermissionsDialog({
  isOpen,
  onOpenChange,
  user,
  menuItems: navItems,
  onSave,
}: EditPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserProfile['permissions']>({});

  useEffect(() => {
    if (user) {
        const initialPermissions = { ...user.permissions };
        let needsUpdate = false;
        
        navItems.forEach(item => {
            if (typeof initialPermissions[item.href] === 'undefined') {
                initialPermissions[item.href] = (user.role === 'Heimdall' || user.role === 'Bifrost');
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            setPermissions(initialPermissions);
        } else {
            setPermissions(user.permissions || initialPermissions);
        }
    }
  }, [user, navItems]);

  if (!user) {
    return null;
  }

  const handlePermissionChange = (href: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [href]: value }));
  };

  const isHeimdall = user.role === 'Heimdall';

  const handleSave = () => {
    onSave(permissions);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Permissões</DialogTitle>
          <DialogDescription>
            Defina quais seções do painel o usuário pode acessar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
            </div>

            <Separator />

            <div className="space-y-4 mt-4">
                {isHeimdall && (
                    <div className="text-sm text-center text-muted-foreground bg-muted p-3 rounded-md">
                        <p>O cargo <strong>Heimdall</strong> é o guardião e possui acesso irrestrito a todas as áreas do sistema.</p>
                    </div>
                )}
                {navItems.map(item => (
                    <div key={item.href} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-primary" />
                            <Label htmlFor={`perm-${item.href}`} className="font-semibold cursor-pointer">
                                {item.label}
                            </Label>
                        </div>
                        <Switch
                            id={`perm-${item.href}`}
                            checked={isHeimdall || !!permissions[item.href]}
                            onCheckedChange={(value) => handlePermissionChange(item.href, value)}
                            disabled={isHeimdall}
                        />
                    </div>
                ))}
            </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Permissões</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
