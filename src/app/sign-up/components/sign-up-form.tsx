"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import type { Session, User } from "@supabase/supabase-js";

export default function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                   if (session?.user) {
                     setUser(session.user);
                   }
                } else if (event === "SIGNED_IN") {
                    // This handles the case after the user is already signed in via the invite link.
                    // The initial session might be set here.
                    if (session?.user) {
                       setUser(session.user);
                    }
                }
            }
        );

        // Also check immediately in case the session is already active
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };
        checkInitialSession();


        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);
    

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

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            toast({
                title: "Erro ao definir senha",
                description: updateError.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Cadastro Finalizado!",
                description: "Sua senha foi definida com sucesso. Você será redirecionado.",
                className: "bg-green-100 border-green-300 text-green-800"
            });
            router.push('/dashboard');
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={user?.user_metadata.full_name || ''} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
                {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
            </Button>
        </form>
    );
}
