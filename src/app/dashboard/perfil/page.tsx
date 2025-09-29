
"use client";

import { useState, useRef, useEffect } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";


export default function PerfilPage() {
  const { toast } = useToast();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setAuthUser(user);
            setEmail(user.email || '');

            const initialName = user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuário';
            setDisplayName(initialName);

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            
            if (error && error.code === 'PGRST116') {
                // Profile does not exist yet, will be created on first update.
                console.log('Profile does not exist, it will be created on first update.');
            } else if (error) {
                console.error("Error fetching profile:", error.message);
                 toast({
                  title: 'Erro ao buscar perfil',
                  description: error.message,
                  variant: 'destructive'
                });
            } else if (profile) {
                setDisplayName(profile.full_name);
            }
        }
    };
    fetchUserData();
  }, [toast]);

  const handleSaveChanges = async () => {
    if (!authUser) return;
    setIsSaving(true);

    try {
        const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: authUser.id, full_name: displayName, email: authUser.email }, { onConflict: 'id' })
            .select()
            .single();
        
        if (profileError) throw profileError;

        if (updatedProfile) {
            setDisplayName(updatedProfile.full_name);
        }

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                throw new Error('As novas senhas não correspondem.');
            }
            if (newPassword.length < 6) {
                throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
            }
            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });

            if (passwordError) throw passwordError;
        }
        
        toast({ title: 'Sucesso!', description: 'Seu perfil foi atualizado.', className: 'bg-green-100 border-green-300 text-green-800'});
        setNewPassword('');
        setCurrentPassword('');
        setConfirmPassword('');
    } catch(error: any) {
        toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <>
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
                <AvatarImage src={'/placeholder-avatar.png'} alt={displayName} data-ai-hint="person" />
                <AvatarFallback>{displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{displayName}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            
             <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium">Alterar Senha</h4>
                 <div className="space-y-2 relative">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input 
                        id="newPassword" 
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="Deixe em branco para não alterar" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        />
                     <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowNewPassword(prev => !prev)}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                 <div className="space-y-2 relative">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirme a nova senha" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        />
                     <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

