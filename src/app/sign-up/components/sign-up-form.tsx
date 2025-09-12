
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

export default function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

     useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const sessionUser = session?.user;
                setUser(sessionUser || null);

                if (sessionUser) {
                    // Fetch the user's profile to check their status
                    const { data: userProfile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', sessionUser.id)
                        .single();
                    
                    if (profileError) {
                        setError("Não foi possível encontrar um perfil válido para este convite.");
                        setProfile(null);
                    } else {
                        setProfile(userProfile);
                        // If user is already active, they shouldn't be on this page
                        if (userProfile.status === 'active') {
                            setError("Sua conta já está ativa. Você pode fazer login.");
                            setTimeout(() => router.push('/'), 3000);
                        }
                    }
                } else {
                  setError("Convite inválido ou expirado. Por favor, solicite um novo convite.");
                }
                setIsLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("As senhas não correspondem.");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setIsSubmitting(true);

        // 1. Update the user's password
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            toast({
                title: "Erro ao definir senha",
                description: updateError.message,
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        // 2. Update the profile status from 'pending' to 'active'
        if (user) {
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ status: 'active' })
                .eq('id', user.id);
            
            if (profileUpdateError) {
                 setError("Sua senha foi definida, mas houve um erro ao ativar seu perfil. Contate o suporte.");
                 toast({ title: "Erro ao ativar perfil", description: profileUpdateError.message, variant: "destructive" });
                 setIsSubmitting(false);
                 return;
            }
        }

        // 3. Success
        toast({
            title: "Cadastro Finalizado!",
            description: "Sua senha foi definida com sucesso. Você será redirecionado.",
            className: "bg-green-100 border-green-300 text-green-800"
        });
        router.push('/dashboard');
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="text-center text-muted-foreground">Verificando convite...</div>
    }

    if (error) {
        return <p className="text-sm text-center text-destructive">{error}</p>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <>
                <div className="space-y-2">
                    <Label htmlFor="verified-name">Nome</Label>
                    <Input id="verified-name" value={profile?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="verified-email">Email</Label>
                    <Input id="verified-email" type="email" value={profile?.email || ''} disabled />
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Crie sua senha"
                        autoFocus
                    />
                     <Button variant="ghost" size="icon" type="button" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowPassword(prev => !prev)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="space-y-2 relative">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirme sua nova senha"
                    />
                     <Button variant="ghost" size="icon" type="button" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowConfirmPassword(prev => !prev)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                </Button>
            </>
        </form>
    );
}
