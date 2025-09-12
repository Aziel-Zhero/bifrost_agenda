
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

export default function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();

    const [invitedUser, setInvitedUser] = useState<User | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    const [nameInput, setNameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        // This listener is crucial. It waits for the Supabase client to process
        // the token from the URL hash and establish a session.
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                 // The 'USER_UPDATED' event is often triggered after the initial session is set from the invite link.
                 // 'SIGNED_IN' can also be relevant. We listen for when a user object becomes available.
                if (session?.user && (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION")) {
                    // We found the authenticated user from the invite link. Store it.
                    setInvitedUser(session.user);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleVerification = () => {
        setVerificationError('');
        if (!invitedUser) {
            setVerificationError("Convite inválido ou expirado. Por favor, tente abrir o link do e-mail novamente.");
            return;
        }

        // Normalize inputs for comparison
        const isEmailMatch = emailInput.trim().toLowerCase() === invitedUser.email?.toLowerCase();
        const isNameMatch = nameInput.trim().toLowerCase() === invitedUser.user_metadata.full_name?.toLowerCase();
        
        if (isEmailMatch && isNameMatch) {
            setIsVerified(true);
            toast({
                title: "Usuário verificado!",
                description: "Agora você pode definir sua senha.",
            })
        } else {
            setVerificationError("O nome ou e-mail não corresponde ao convite. Verifique os dados e tente novamente.");
        }
    }

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
            {!isVerified ? (
                 <>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input 
                            id="name" 
                            value={nameInput} 
                            onChange={e => setNameInput(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    {verificationError && <p className="text-sm text-destructive">{verificationError}</p>}
                    <Button type="button" className="w-full" onClick={handleVerification} disabled={!nameInput || !emailInput}>
                       Verificar Identidade
                    </Button>
                 </>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="verified-name">Nome</Label>
                        <Input id="verified-name" value={invitedUser?.user_metadata.full_name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="verified-email">Email</Label>
                        <Input id="verified-email" type="email" value={invitedUser?.email || ''} disabled />
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
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
                    </Button>
                </>
            )}
        </form>
    );
}
